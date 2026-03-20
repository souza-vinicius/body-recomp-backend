"use client";

import React, { useEffect, useState } from 'react';
import { loadDashboardData } from '@/lib/api/dashboard';
import { GoalSummaryCard } from '@/components/domain/dashboard/goal-summary-card';
import { KpiCards } from '@/components/domain/dashboard/kpi-cards';
import { NoGoalPanel } from '@/components/domain/dashboard/no-goal-panel';
import { QuickActions } from '@/components/domain/dashboard/quick-actions';
import { LoadingState } from '@/components/feedback/loading-state';
import { ErrorState } from '@/components/feedback/error-state';
import { DashboardStore } from '@/lib/state/dashboard-store';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [data, setData] = useState<{ goal: any; trends: any } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const needsRefresh = DashboardStore((state) => state.needsRefresh);
  const markRefreshed = DashboardStore((state) => state.markRefreshed);

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
          setError(err.message || 'Failed to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [needsRefresh, markRefreshed]);

  if (loading && !data) return <LoadingState message="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="page-header">
        <p className="text-sm font-medium text-primary-600">{getGreeting()} 👋</p>
        <h1 className="page-title">Dashboard</h1>
      </div>
      
      {!data?.goal ? (
        <NoGoalPanel />
      ) : (
        <>
          <GoalSummaryCard goal={data.goal} />
          {data.trends && <KpiCards trends={data.trends} />}
          <QuickActions />
        </>
      )}
    </div>
  );
}
