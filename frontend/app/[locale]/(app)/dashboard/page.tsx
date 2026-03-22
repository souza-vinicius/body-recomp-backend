"use client";

import React, { useEffect, useState } from 'react';
import { loadDashboardData } from '@/lib/api/dashboard';
import { GoalSummaryCard } from '@/components/domain/dashboard/goal-summary-card';
import { KpiCards } from '@/components/domain/dashboard/kpi-cards';
import { NoGoalPanel } from '@/components/domain/dashboard/no-goal-panel';
import { QuickActions } from '@/components/domain/dashboard/quick-actions';
import { RecommendedWorkout } from '@/components/domain/dashboard/recommended-workout';
import { LoadingState } from '@/components/feedback/loading-state';
import { ErrorState } from '@/components/feedback/error-state';
import { DashboardStore } from '@/lib/state/dashboard-store';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const [data, setData] = useState<{ goal: any; trends: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const needsRefresh = DashboardStore((state) => state.needsRefresh);
  const markRefreshed = DashboardStore((state) => state.markRefreshed);
  const t = useTranslations('Dashboard');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await loadDashboardData();
        setData(res);
        if (needsRefresh) markRefreshed();
      } catch (err: any) {
        if (err.status === 404) {
          setData(null);
        } else {
          setError(err.message || t('error_loading'));
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [needsRefresh, markRefreshed, t]);

  const hour = new Date().getHours();
  let greetingKey = 'greeting_evening';
  if (hour < 12) greetingKey = 'greeting_morning';
  else if (hour < 18) greetingKey = 'greeting_afternoon';

  if (loading && !data) return <LoadingState message={t('loading')} />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="animate-slide-up pb-32">
      <div className="flex items-center gap-3 mb-10 mt-2">
        <h1 className="font-bold text-xl tracking-tight text-primary-500">
           {t(greetingKey)}
        </h1>
      </div>
      
      {!data?.goal ? (
        <NoGoalPanel />
      ) : (
        <div className="space-y-10">
          <GoalSummaryCard goal={data.goal} />
          {data.trends && <KpiCards trends={data.trends} />}
          <QuickActions />
          <RecommendedWorkout />
        </div>
      )}
    </div>
  );
}
