"""Progress tracking service for monitoring goal progress over time.

Handles progress entry creation, trend analysis, and adjustment suggestions.
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.enums import GoalStatus, GoalType
from src.models.goal import Goal
from src.models.measurement import BodyMeasurement
from src.models.progress import ProgressEntry
from src.schemas.progress import TrendsResponse


class ProgressService:
    """Service for managing progress tracking and analysis."""

    def __init__(self, db: AsyncSession):
        """Initialize progress service.

        Args:
            db: Database session
        """
        self.db = db

    async def check_bulking_ceiling(
        self,
        current_bf: Decimal,
        ceiling_bf: Decimal,
        goal: Goal
    ) -> tuple[Optional[str], bool]:
        """Check if approaching or at bulking ceiling.

        Args:
            current_bf: Current body fat percentage
            ceiling_bf: Ceiling body fat percentage
            goal: Goal being tracked

        Returns:
            Tuple of (warning_message, should_complete_goal)
        """
        diff = float(ceiling_bf - current_bf)

        # At or above ceiling → complete goal
        if diff <= 0:
            return "Ceiling reached - bulking goal complete!", True

        # Within 1% of ceiling → warning
        if diff < 1.0:
            return (
                f"Approaching ceiling! Only {diff:.1f}% remaining. "
                f"Consider transitioning to maintenance or cutting.",
                False
            )

        return None, False

    async def check_bulking_rate(
        self,
        previous_bf: Decimal,
        current_bf: Decimal,
        weeks: int
    ) -> Optional[str]:
        """Check if gaining body fat too fast during bulk.

        Args:
            previous_bf: Previous body fat percentage
            current_bf: Current body fat percentage
            weeks: Number of weeks between measurements

        Returns:
            Warning message if gaining too fast, None otherwise
        """
        if weeks <= 0:
            return None

        rate = float(current_bf - previous_bf) / weeks

        # Alert if gaining more than 0.5% body fat per week
        if rate > 0.5:
            return (
                f"Gaining body fat too quickly ({rate:.2f}%/week). "
                f"Ideal bulk rate is 0.1-0.3%/week. Consider reducing caloric surplus."
            )

        return None

    async def log_progress(
        self,
        goal_id: UUID,
        measurement_id: UUID,
        notes: Optional[str] = None
    ) -> ProgressEntry:
        """Log a new progress entry for a goal.

        Args:
            goal_id: Goal to log progress for
            measurement_id: New measurement to log
            notes: Optional user notes

        Returns:
            Created progress entry

        Raises:
            ValueError: If measurement too soon (< 7 days), invalid goal, etc.
        """
        # Fetch goal with relationships
        goal_result = await self.db.execute(
            select(Goal)
            .options(
                selectinload(Goal.initial_measurement),
                selectinload(Goal.progress_entries)
            )
            .where(Goal.id == goal_id)
        )
        goal = goal_result.scalar_one_or_none()

        if not goal:
            raise ValueError(f"Goal {goal_id} not found")

        if goal.status != GoalStatus.ACTIVE:
            raise ValueError(f"Goal {goal_id} is not active")

        # Fetch new measurement
        measurement_result = await self.db.execute(
            select(BodyMeasurement).where(BodyMeasurement.id == measurement_id)
        )
        measurement = measurement_result.scalar_one_or_none()

        if not measurement:
            raise ValueError(f"Measurement {measurement_id} not found")

        # Check measurement belongs to same user
        if measurement.user_id != goal.user_id:
            raise ValueError("Measurement does not belong to goal's user")

        # Determine week number and validate timing
        week_number = len(goal.progress_entries) + 1

        # Get most recent measurement date
        if goal.progress_entries:
            last_entry = max(
                goal.progress_entries,
                key=lambda e: e.logged_at
            )
            last_measurement_result = await self.db.execute(
                select(BodyMeasurement).where(
                    BodyMeasurement.id == last_entry.measurement_id
                )
            )
            last_measurement = last_measurement_result.scalar_one()

            days_since_last = (
                measurement.measured_at - last_measurement.measured_at
            ).days

            if days_since_last < 7:
                raise ValueError(
                    f"Must wait at least 7 days between progress entries "
                    f"(only {days_since_last} days since last entry)"
                )

            # Calculate changes from previous entry
            body_fat_change = (
                measurement.calculated_body_fat_percentage -
                last_measurement.calculated_body_fat_percentage
            )
            weight_change = measurement.weight_kg - last_measurement.weight_kg
        else:
            # First progress entry - compare to initial measurement
            days_since_start = (
                measurement.measured_at -
                goal.initial_measurement.measured_at
            ).days

            if days_since_start < 7:
                raise ValueError(
                    f"Must wait at least 7 days after goal start "
                    f"(only {days_since_start} days since goal started)"
                )

            body_fat_change = (
                measurement.calculated_body_fat_percentage -
                goal.initial_measurement.calculated_body_fat_percentage
            )
            weight_change = (
                measurement.weight_kg - goal.initial_measurement.weight_kg
            )

        # Determine if on track based on goal type and expected rate
        is_on_track = self._calculate_on_track_status(
            goal=goal,
            body_fat_change=body_fat_change,
            weeks_elapsed=week_number
        )

        # Check for bulking-specific warnings and goal completion
        ceiling_warning = None
        rate_warning = None
        should_complete = False

        if goal.goal_type == GoalType.BULKING:
            # Check ceiling
            if goal.ceiling_body_fat_percentage:
                ceiling_warning, should_complete = await self.check_bulking_ceiling(
                    current_bf=measurement.calculated_body_fat_percentage,
                    ceiling_bf=goal.ceiling_body_fat_percentage,
                    goal=goal
                )

            # Check rate (only if we have previous measurement)
            if goal.progress_entries:
                last_entry = max(
                    goal.progress_entries,
                    key=lambda e: e.logged_at
                )
                last_measurement_result = await self.db.execute(
                    select(BodyMeasurement).where(
                        BodyMeasurement.id == last_entry.measurement_id
                    )
                )
                last_measurement = last_measurement_result.scalar_one()

                weeks_between = (
                    measurement.measured_at - last_measurement.measured_at
                ).days // 7

                rate_warning = await self.check_bulking_rate(
                    previous_bf=last_measurement.calculated_body_fat_percentage,
                    current_bf=measurement.calculated_body_fat_percentage,
                    weeks=max(1, weeks_between)
                )

        # Create progress entry
        progress_entry = ProgressEntry(
            goal_id=goal_id,
            measurement_id=measurement_id,
            week_number=week_number,
            body_fat_percentage=measurement.calculated_body_fat_percentage,
            weight_kg=measurement.weight_kg,
            body_fat_change=body_fat_change,
            weight_change_kg=weight_change,
            is_on_track=is_on_track,
            notes=notes,
            logged_at=datetime.utcnow()
        )

        self.db.add(progress_entry)

        # Complete goal if ceiling reached
        if should_complete:
            goal.status = GoalStatus.COMPLETED
            goal.completed_at = datetime.utcnow()
            self.db.add(goal)

        await self.db.commit()
        await self.db.refresh(progress_entry)

        # Attach warnings to progress entry for response
        # Note: These are transient attributes for API response
        # Not stored in database (can be recalculated from data)
        progress_entry.ceiling_warning = ceiling_warning  # type: ignore
        progress_entry.rate_warning = rate_warning  # type: ignore

        return progress_entry

    def _calculate_on_track_status(
        self,
        goal: Goal,
        body_fat_change: Decimal,
        weeks_elapsed: int
    ) -> bool:
        """Calculate if progress is on track.

        Args:
            goal: Goal being tracked
            body_fat_change: Change in body fat % from previous entry
            weeks_elapsed: Number of weeks since goal start

        Returns:
            True if progress meets expected rate
        """
        if goal.goal_type == GoalType.CUTTING:
            # Expect 0.5-1% body fat loss per week for cutting
            expected_min_loss = Decimal("0.4") * weeks_elapsed
            expected_max_loss = Decimal("1.2") * weeks_elapsed

            total_loss = (
                goal.initial_measurement.calculated_body_fat_percentage -
                (goal.initial_measurement.calculated_body_fat_percentage + body_fat_change)
            )

            # On track if within expected range (negative = loss)
            return expected_min_loss <= abs(total_loss) <= expected_max_loss
        else:
            # Bulking - expect slow body fat increase (0.2-0.5% per week)
            expected_min_gain = Decimal("0.1") * weeks_elapsed
            expected_max_gain = Decimal("0.6") * weeks_elapsed

            total_gain = body_fat_change

            return expected_min_gain <= total_gain <= expected_max_gain

    async def calculate_progress_percentage(
        self,
        goal_id: UUID
    ) -> Decimal:
        """Calculate progress percentage toward goal.

        Args:
            goal_id: Goal to calculate progress for

        Returns:
            Progress percentage (0-100)
        """
        goal_result = await self.db.execute(
            select(Goal)
            .options(
                selectinload(Goal.initial_measurement),
                selectinload(Goal.progress_entries)
            )
            .where(Goal.id == goal_id)
        )
        goal = goal_result.scalar_one_or_none()

        if not goal:
            raise ValueError(f"Goal {goal_id} not found")

        if not goal.progress_entries:
            return Decimal("0.0")

        # Get current body fat from latest progress entry
        latest_entry = max(goal.progress_entries, key=lambda e: e.week_number)
        current_bf = latest_entry.body_fat_percentage

        initial_bf = goal.initial_measurement.calculated_body_fat_percentage

        if goal.goal_type == GoalType.CUTTING:
            target_bf = goal.target_body_fat_percentage
            if not target_bf:
                return Decimal("0.0")

            # Progress = (initial - current) / (initial - target) * 100
            progress = (
                (initial_bf - current_bf) /
                (initial_bf - target_bf)
            ) * Decimal("100")
        else:
            # Bulking - progress toward ceiling
            ceiling_bf = goal.ceiling_body_fat_percentage
            if not ceiling_bf:
                return Decimal("0.0")

            progress = (
                (current_bf - initial_bf) /
                (ceiling_bf - initial_bf)
            ) * Decimal("100")

        # Clamp to 0-100 range
        return max(Decimal("0.0"), min(Decimal("100.0"), progress))

    async def get_trends(self, goal_id: UUID) -> TrendsResponse:
        """Get progress trends and analysis for a goal.

        Args:
            goal_id: Goal to analyze

        Returns:
            Trends analysis with recommendations
        """
        goal_result = await self.db.execute(
            select(Goal)
            .options(
                selectinload(Goal.initial_measurement),
                selectinload(Goal.progress_entries)
            )
            .where(Goal.id == goal_id)
        )
        goal = goal_result.scalar_one_or_none()

        if not goal:
            raise ValueError(f"Goal {goal_id} not found")

        progress_entries = sorted(
            goal.progress_entries,
            key=lambda e: e.week_number
        )

        if len(progress_entries) < 2:
            # Insufficient data for trend analysis
            return TrendsResponse(
                goal_id=goal_id,
                progress_percentage=Decimal("0.0"),
                weeks_elapsed=len(progress_entries),
                is_on_track=False,
                weekly_bf_change_avg=Decimal("0.0"),
                weekly_weight_change_avg=Decimal("0.0"),
                trend="insufficient_data",
                adjustment_suggestion=None,
                estimated_weeks_remaining=goal.estimated_weeks_to_goal
            )

        # Calculate averages
        total_bf_change = sum(e.body_fat_change for e in progress_entries)
        total_weight_change = sum(e.weight_change_kg for e in progress_entries)
        weeks_elapsed = len(progress_entries)

        weekly_bf_change_avg = total_bf_change / weeks_elapsed
        weekly_weight_change_avg = total_weight_change / weeks_elapsed

        # Calculate progress percentage
        progress_pct = await self.calculate_progress_percentage(goal_id)

        # Determine overall on-track status
        on_track_count = sum(1 for e in progress_entries if e.is_on_track)
        is_on_track = on_track_count / weeks_elapsed >= 0.6  # 60% on track

        # Classify trend
        trend = self._classify_trend(
            progress_entries=progress_entries,
            goal_type=goal.goal_type
        )

        # Generate adjustment suggestion
        adjustment = self._suggest_adjustments(
            goal=goal,
            trend=trend,
            is_on_track=is_on_track,
            weekly_bf_change_avg=weekly_bf_change_avg
        )

        # Estimate weeks remaining
        estimated_weeks = self._estimate_weeks_remaining(
            goal=goal,
            current_bf=progress_entries[-1].body_fat_percentage,
            weekly_bf_change_avg=weekly_bf_change_avg
        )

        return TrendsResponse(
            goal_id=goal_id,
            progress_percentage=progress_pct,
            weeks_elapsed=weeks_elapsed,
            is_on_track=is_on_track,
            weekly_bf_change_avg=weekly_bf_change_avg,
            weekly_weight_change_avg=weekly_weight_change_avg,
            trend=trend,
            adjustment_suggestion=adjustment,
            estimated_weeks_remaining=estimated_weeks
        )

    def _classify_trend(
        self,
        progress_entries: list[ProgressEntry],
        goal_type: GoalType
    ) -> str:
        """Classify overall progress trend.

        Args:
            progress_entries: List of progress entries (sorted by week)
            goal_type: Cutting or bulking

        Returns:
            Trend classification: 'improving', 'plateau', or 'worsening'
        """
        if len(progress_entries) < 3:
            return "insufficient_data"

        # Look at last 3 entries to determine trend
        recent_entries = progress_entries[-3:]
        changes = [e.body_fat_change for e in recent_entries]

        if goal_type == GoalType.CUTTING:
            # For cutting, negative changes are good (losing fat)
            avg_change = sum(changes) / len(changes)

            if avg_change < Decimal("-0.4"):  # Good loss rate
                return "improving"
            elif avg_change > Decimal("-0.2"):  # Slow or no loss
                return "plateau"
            else:
                return "improving"  # Moderate loss
        else:
            # For bulking, positive changes are expected
            avg_change = sum(changes) / len(changes)

            if Decimal("0.2") <= avg_change <= Decimal("0.5"):
                return "improving"
            elif avg_change < Decimal("0.1"):
                return "plateau"
            elif avg_change > Decimal("0.6"):
                return "worsening"  # Too much fat gain
            else:
                return "improving"

    def _suggest_adjustments(
        self,
        goal: Goal,
        trend: str,
        is_on_track: bool,
        weekly_bf_change_avg: Decimal
    ) -> Optional[str]:
        """Generate adjustment suggestions based on progress.

        Args:
            goal: Goal being tracked
            trend: Trend classification
            is_on_track: Overall on-track status
            weekly_bf_change_avg: Average weekly body fat change

        Returns:
            Adjustment suggestion or None
        """
        if trend == "insufficient_data":
            return "Keep logging weekly measurements to track progress"

        if goal.goal_type == GoalType.CUTTING:
            if trend == "improving" and is_on_track:
                return "Maintain current plan - excellent progress!"
            elif trend == "plateau":
                return (
                    "Progress has slowed. Consider increasing daily deficit "
                    "by 100-200 calories or adding 1-2 cardio sessions per week."
                )
            elif not is_on_track and weekly_bf_change_avg > Decimal("-0.3"):
                return (
                    "Progress slower than expected. Verify calorie tracking "
                    "accuracy and consider increasing training volume."
                )
            elif weekly_bf_change_avg < Decimal("-1.0"):
                return (
                    "Progress faster than expected - you may be losing muscle. "
                    "Consider reducing deficit by 100-200 calories."
                )
            else:
                return "Progress is steady - keep up the good work!"
        else:
            # Bulking suggestions
            if trend == "improving" and is_on_track:
                return "Maintain current plan - lean gaining on track!"
            elif trend == "plateau":
                return (
                    "Weight gain has stalled. Consider increasing daily surplus "
                    "by 100-200 calories."
                )
            elif trend == "worsening":
                return (
                    "Gaining fat too quickly. Consider reducing daily surplus "
                    "by 100-200 calories to stay lean."
                )
            else:
                return "Progress is steady - continue current approach!"

    def _estimate_weeks_remaining(
        self,
        goal: Goal,
        current_bf: Decimal,
        weekly_bf_change_avg: Decimal
    ) -> Optional[int]:
        """Estimate weeks remaining to reach goal.

        Args:
            goal: Goal being tracked
            current_bf: Current body fat percentage
            weekly_bf_change_avg: Average weekly change rate

        Returns:
            Estimated weeks remaining or None if not calculable
        """
        if weekly_bf_change_avg == 0:
            return None

        if goal.goal_type == GoalType.CUTTING:
            target_bf = goal.target_body_fat_percentage
            if not target_bf:
                return None

            remaining_bf = current_bf - target_bf

            if remaining_bf <= 0:
                return 0  # Goal already reached

            # Divide remaining by average weekly loss (use absolute value)
            weeks = remaining_bf / abs(weekly_bf_change_avg)
        else:
            ceiling_bf = goal.ceiling_body_fat_percentage
            if not ceiling_bf:
                return None

            remaining_bf = ceiling_bf - current_bf

            if remaining_bf <= 0:
                return 0  # Goal already reached

            weeks = remaining_bf / weekly_bf_change_avg

        return int(weeks) if weeks > 0 else 0
