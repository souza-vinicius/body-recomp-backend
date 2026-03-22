'use client';

import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('History');
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
        setError(t('no_goal_found'));
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
      setError(err.message || t('error_loading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <LoadingState message={t('loading')} />;
  if (error) return <ErrorState message={error} onRetry={() => loadData()} />;

  const hasEnoughData = entries.length > 1;

  const currentBodyFat = entries.length > 0 ? entries[0].body_fat_percentage : 0;
  let bfChange = 0;
  if (entries.length > 1) {
    // compare with an entry from roughly a month ago, or oldest if less than a month
    const oldestIdx = Math.min(entries.length - 1, 4);
    bfChange = currentBodyFat - entries[oldestIdx].body_fat_percentage;
  }

  return (
    <div className="space-y-8 animate-slide-up pb-32">
      {hasEnoughData && (
      <section className="mb-8 pt-4">
        <label className="font-bold text-xs uppercase tracking-[0.2em] text-surface-400 mb-2 block">
          {t('title') || 'Current Status'}
        </label>
        <div className="flex items-baseline gap-2">
          <h2 className="font-bold text-6xl tracking-tight text-white editorial-kerning">
            {currentBodyFat}<span className="text-primary-500 text-3xl">%</span>
          </h2>
          {bfChange !== 0 && (
            <div className={`flex items-center mb-1 ${bfChange < 0 ? 'text-primary-500' : 'text-surface-400'}`}>
              <span className="text-sm font-bold tracking-wide">
                {bfChange > 0 ? '+' : ''}{bfChange.toFixed(1)}% {t('subtitle') || 'trend'}
              </span>
            </div>
          )}
        </div>
      </section>
      )}

      {!hasEnoughData ? (
        <InsufficientDataPanel />
      ) : (
        <>
          <BodyFatTrendChart entries={entries} />
          <TrendSummaryCards trends={trends} />
        </>
      )}

      <ProgressHistoryList
        entries={entries}
        onEntryUpdated={() => loadData()}
      />
    </div>
  );
}


