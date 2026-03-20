'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell } from 'lucide-react';
import { submitProgress } from '@/lib/api/progress';
import { getActiveGoal } from '@/lib/api/goals';
import { sessionStorage } from '@/lib/auth/session-storage';
import { ApiError } from '@/lib/api/types';
import { ProgressEntryForm } from '@/components/domain/progress/progress-entry-form';
import { ProgressSubmitFeedback } from '@/components/domain/progress/progress-submit-feedback';
import { CeilingAlert } from '@/components/domain/progress/ceiling-alert';
import { LoadingState } from '@/components/feedback/loading-state';
import { useProgressDraftStore } from '@/lib/state/progress-draft-store';
import { DashboardStore } from '@/lib/state/dashboard-store';

async function resolveGoalId(): Promise<string | null> {
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
  return goalId;
}

export default function NewProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [goalId, setGoalId] = useState<string | null>(null);
  const [goalLoading, setGoalLoading] = useState(true);

  const currentBodyFat = 15.2;

  useEffect(() => {
    resolveGoalId().then((id) => {
      if (!id) setError('No active goal found. Please set a goal first.');
      setGoalId(id);
      setGoalLoading(false);
    });
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      const id = goalId ?? await resolveGoalId();
      if (!id) {
        throw new Error('No active goal found. Please set a goal first.');
      }

      const entry = await submitProgress(id, data);

      useProgressDraftStore.getState().clearDraft();
      DashboardStore.getState().invalidate();

      // Map ProgressEntryResponse to the shape ProgressSubmitFeedback expects
      setSuccessData({
        weekly_weight_diff: entry.weight_kg ?? 0,
        fat_mass_diff: entry.body_fat_percentage ?? 0,
        is_on_track: true,
        warnings: [],
        entry,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="py-8 animate-scale-in">
        <ProgressSubmitFeedback summary={successData} onClose={() => router.push('/dashboard')} />
      </div>
    );
  }

  if (goalLoading) {
    return <LoadingState message="Loading..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div className="page-header">
        <div className="flex items-center gap-2">
          <Dumbbell size={22} className="text-primary-500" />
          <h1 className="page-title">Log Weekly Progress</h1>
        </div>
        <p className="page-subtitle mt-1">Consistency is the key to body recomposition.</p>
      </div>

      <CeilingAlert currentBodyFat={currentBodyFat} />

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-sm font-medium">
          {error}
        </div>
      )}

      <ProgressEntryForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
}
