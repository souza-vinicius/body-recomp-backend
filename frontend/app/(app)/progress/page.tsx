'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Plus } from 'lucide-react';
import { getProgressHistory } from '@/lib/api/progress';
import { getTrends, getActiveGoal } from '@/lib/api/goals';
import { sessionStorage } from '@/lib/auth/session-storage';
import { ApiError } from '@/lib/api/types';
import { LoadingState } from '@/components/feedback/loading-state';
import { EmptyState } from '@/components/feedback/empty-state';
import { TrendSummaryCards } from '@/components/domain/history/trend-summary-cards';
import { BodyFatTrendChart } from '@/components/charts/body-fat-trend-chart';
import { ProgressHistoryList } from '@/components/domain/history/progress-history-list';

export default function ProgressPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasGoal, setHasGoal] = useState(true);

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
            if (err instanceof ApiError && err.status === 404) {
              setHasGoal(false);
              return;
            }
            console.error('Failed to fetch active goal', err);
          }
        }
        if (!goalId) {
          setHasGoal(false);
          return;
        }

        const [historyRes, trendsRes] = await Promise.all([
          getProgressHistory(goalId),
          getTrends(goalId).catch(() => null),
        ]);

        const sortedEntries = (Array.isArray(historyRes) ? historyRes : []).sort(
          (a: any, b: any) =>
            new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
        );
        setEntries(sortedEntries);
        setTrends(trendsRes);
      } catch (err: any) {
        setError(err.message || 'Failed to load progress');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <LoadingState message="Loading progress..." />;
  if (error) return <div className="text-red-500 p-4 rounded-xl bg-red-50 text-sm">{error}</div>;

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <div className="flex items-center gap-2">
            <TrendingUp size={22} className="text-primary-500" />
            <h1 className="page-title">Progress</h1>
          </div>
          <p className="page-subtitle mt-1">
            Track your body recomposition journey.
          </p>
        </div>
        {hasGoal && (
          <Link
            href="/progress/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-primary text-white text-sm font-semibold rounded-xl shadow-card hover:shadow-glow-orange transition-all duration-200 active:scale-[0.98]"
          >
            <Plus size={16} />
            Log
          </Link>
        )}
      </div>

      {!hasGoal ? (
        <EmptyState
          title="No Active Goal"
          description="Set up a goal first to start tracking your progress."
          action={
            <Link
              href="/setup"
              className="inline-flex items-center px-5 py-2.5 bg-gradient-primary text-white text-sm font-semibold rounded-xl hover:shadow-glow-orange transition-all duration-200 active:scale-[0.98]"
            >
              Set Up Goal
            </Link>
          }
        />
      ) : entries.length === 0 ? (
        <EmptyState
          title="No Progress Yet"
          description="Log your first weekly measurement to start tracking your journey."
          action={
            <Link
              href="/progress/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-primary text-white text-sm font-semibold rounded-xl hover:shadow-glow-orange transition-all duration-200 active:scale-[0.98]"
            >
              <Plus size={16} />
              Log First Entry
            </Link>
          }
        />
      ) : (
        <>
          <TrendSummaryCards trends={trends} />
          <BodyFatTrendChart entries={entries} />
          <ProgressHistoryList
            entries={entries}
            onEntryUpdated={() => window.location.reload()}
          />
        </>
      )}
    </div>
  );
}
