'use client';

import React, { useState } from 'react';
import { Calendar, Scale, Pencil } from 'lucide-react';
import { useTranslations, useFormatter } from 'next-intl';
import { EditProgressModal } from '@/components/domain/progress/edit-progress-modal';
import { updateProgressEntry } from '@/lib/api/progress';
import { updateMeasurement } from '@/lib/api/measurements';
import { sessionStorage } from '@/lib/auth/session-storage';

interface ProgressHistoryListProps {
  entries: any[];
  onEntryUpdated?: () => void;
}

export function ProgressHistoryList({ entries, onEntryUpdated }: ProgressHistoryListProps) {
  const t = useTranslations('Progress.RecentLogs');
  const format = useFormatter();
  const [editingEntry, setEditingEntry] = useState<any | null>(null);

  if (!entries || entries.length === 0) {
    return <p className="text-surface-400 italic text-center py-6 text-sm">{t('no_history')}</p>;
  }

  const handleSave = async (
    entryId: string,
    measurementId: string,
    data: {
      notes?: string;
      logged_at?: string;
      weight_kg?: number;
      waist_cm?: number;
      neck_cm?: number;
      hip_cm?: number;
    }
  ) => {
    const goalId = sessionStorage.getGoalId();
    if (!goalId) throw new Error('No active goal');

    const { notes, logged_at, ...measurementFields } = data;

    // Update measurement fields if any were changed
    const hasMeasurementChanges = Object.keys(measurementFields).length > 0;
    if (hasMeasurementChanges) {
      await updateMeasurement(measurementId, measurementFields);
    }

    // Update progress entry (notes + date)
    const progressUpdate: Record<string, any> = {};
    if (notes !== undefined) progressUpdate.notes = notes;
    if (logged_at) progressUpdate.logged_at = logged_at;

    await updateProgressEntry(goalId, entryId, progressUpdate);

    if (onEntryUpdated) {
      onEntryUpdated();
    }
  };

  return (
    <>
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest">{t('title')}</h3>
        <div className="space-y-2">
          {entries.map((entry: any, index: number) => {
            const weight = Number(entry.weight_kg) || 0;
            const bf = Number(entry.body_fat_percentage) || 0;
            const fatMass = weight * (bf / 100);
            const leanMass = weight - fatMass;

            return (
            <div
              key={entry.id}
              className="card p-4 flex justify-between items-center hover:shadow-card-hover"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center flex-shrink-0">
                  <Calendar size={16} className="text-surface-400" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-surface-900 text-sm">
                    {format.dateTime(new Date(entry.logged_at), {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="text-[11px] text-surface-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 font-medium text-surface-600">
                      <Scale size={12} />
                      {format.number(weight, { maximumFractionDigits: 1 })} kg
                    </span>
                    <span className="text-surface-200">•</span>
                    <span className="font-semibold text-primary-600">{format.number(bf, { maximumFractionDigits: 1 })}% BF</span>
                    <span className="text-surface-200">•</span>
                    <span className="text-surface-500" title={t('fat_mass_label')}>{format.number(fatMass, { maximumFractionDigits: 1 })}kg {t('fat')}</span>
                    <span className="text-surface-200">•</span>
                    <span className="text-surface-500" title={t('lean_mass_label')}>{format.number(leanMass, { maximumFractionDigits: 1 })}kg {t('lean')}</span>
                  </div>
                  {entry.notes && (
                    <div className="text-xs text-surface-300 truncate mt-0.5 max-w-[200px]" title={entry.notes}>
                      {entry.notes}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setEditingEntry(entry)}
                className="p-2 rounded-xl text-surface-300 hover:text-primary-600 hover:bg-primary-50 transition-all flex-shrink-0"
                title={t('edit_entry')}
              >
                <Pencil size={16} />
              </button>
            </div>
            );
          })}
        </div>
      </div>

      {editingEntry && (
        <EditProgressModal
          entry={editingEntry}
          onSave={handleSave}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </>
  );
}

