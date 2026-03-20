'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { getProgressHistory } from '@/lib/api/progress';
import { getTrends, getActiveGoal } from '@/lib/api/goals';
import { sessionStorage } from '@/lib/auth/session-storage';
import { ApiError } from '@/lib/api/types';
import { LoadingState } from '@/components/feedback/loading-state';
import { ErrorState } from '@/components/feedback/error-state';
import { ProgressHistoryList } from '@/components/domain/history/progress-history-list';
import { TrendSummaryCards } from '@/components/domain/history/trend-summary-cards';
import { BodyFatTrendChart } from '@/components/charts/body-fat-trend-chart';
import { InsufficientDataPanel } from '@/components/domain/history/insufficient-data-panel';

export default function HistoryPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
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
        setError('No active goal found.');
        return;
      }

      const [historyRes, trendsRes] = await Promise.all([
        getProgressHistory(goalId),
        getTrends(goalId).catch(() => null)
      ]);

      const sortedEntries = (Array.isArray(historyRes) ? historyRes : []).sort(
        (a: any, b: any) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
      );
      setEntries(sortedEntries);
      setTrends(trendsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingState message="Loading history..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const hasEnoughData = entries.length > 1;

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <Clock size={22} className="text-primary-500" />
          <h1 className="page-title">Your Progress</h1>
        </div>
        <p className="page-subtitle mt-1">Review your journey and trends.</p>
      </div>

      {!hasEnoughData ? (
        <InsufficientDataPanel />
      ) : (
        <>
          <TrendSummaryCards trends={trends} />
          <BodyFatTrendChart entries={entries} />
        </>
      )}

      <ProgressHistoryList
        entries={entries}
        onEntryUpdated={() => loadData()}
      />
    </div>
  );
}

