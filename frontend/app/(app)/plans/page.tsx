'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { getTrainingPlan, getDietPlan } from '@/lib/api/plans';
import { getActiveGoal } from '@/lib/api/goals';
import { sessionStorage } from '@/lib/auth/session-storage';
import { ApiError } from '@/lib/api/types';
import { LoadingState } from '@/components/feedback/loading-state';
import { ErrorState } from '@/components/feedback/error-state';
import { TrainingPlanPanel } from '@/components/domain/plans/training-plan-panel';
import { DietPlanPanel } from '@/components/domain/plans/diet-plan-panel';
import { MacroTargets } from '@/components/domain/plans/macro-targets';

export default function PlansPage() {
  const [trainingPlan, setTrainingPlan] = useState<any>(null);
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        let goalId = sessionStorage.getGoalId();
        if (!goalId) {
          try {
            const active = await getActiveGoal();
            if (active?.id) {
              sessionStorage.setGoalId(active.id);
              goalId = active.id;
            }
          } catch (err) {
            if (!(err instanceof ApiError && err.status === 404)) {
              console.error('Failed to fetch active goal', err);
            }
          }
        }

        if (!goalId) {
          setError('No active goal found. Please set a goal first.');
          return;
        }

        const [training, diet] = await Promise.allSettled([
          getTrainingPlan(goalId),
          getDietPlan(goalId),
        ]);

        setTrainingPlan(training.status === 'fulfilled' ? training.value : null);
        setDietPlan(diet.status === 'fulfilled' ? diet.value : null);
      } catch (err: any) {
        setError(err.message || 'Failed to load plans');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState message="Loading your plan..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const hasAnyPlan = trainingPlan || dietPlan;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <ClipboardList size={22} className="text-primary-500" />
          <h1 className="page-title">Your Recomp Plan</h1>
        </div>
        <p className="page-subtitle mt-1">AI-generated recommendations based on your current goal.</p>
      </div>

      {!hasAnyPlan ? (
        <div className="card p-8 text-center">
          <p className="text-surface-400 text-sm">Your plan is still being generated or is unavailable.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 border-2 border-surface-200 rounded-xl text-sm font-semibold text-surface-600 hover:border-surface-300 hover:bg-surface-50 transition-all active:scale-[0.98]"
          >
            <RefreshCw size={14} />
            Check Again
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {dietPlan && <MacroTargets dietPlan={dietPlan} />}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TrainingPlanPanel trainingPlan={trainingPlan} />
            <DietPlanPanel dietPlan={dietPlan} />
          </div>
        </div>
      )}
    </div>
  );
}
