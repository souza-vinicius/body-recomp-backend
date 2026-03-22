'use client';

import React, { useState } from 'react';
import { Droplet, Sun, Moon, Zap, Pencil } from 'lucide-react';
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
    data: any
  ) => {
    const goalId = sessionStorage.getGoalId();
    if (!goalId) throw new Error('No active goal');

    const { notes, logged_at, ...measurementFields } = data;

    const hasMeasurementChanges = Object.keys(measurementFields).length > 0;
    if (hasMeasurementChanges) {
      await updateMeasurement(measurementId, measurementFields);
    }

    const progressUpdate: Record<string, any> = {};
    if (notes !== undefined) progressUpdate.notes = notes;
    if (logged_at) progressUpdate.logged_at = logged_at;

    await updateProgressEntry(goalId, entryId, progressUpdate);

    if (onEntryUpdated) {
      onEntryUpdated();
    }
  };

  // Assign random lifestyle icon for aesthetics since we might not have all context
  const getIcon = (idx: number) => {
     const i = idx % 4;
     if (i === 0) return <Droplet size={16} className="text-primary-500" />;
     if (i === 1) return <Sun size={16} className="text-primary-500" />;
     if (i === 2) return <Zap size={16} className="text-primary-500" />;
     return <Moon size={16} className="text-primary-500" />;
  };

  return (
    <>
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-lg font-bold tracking-tight text-white">{t('title')}</h4>
        </div>
        <div className="space-y-3">
          {entries.map((entry: any, index: number) => {
            const weight = Number(entry.weight_kg) || 0;
            const bf = Number(entry.body_fat_percentage) || 0;
            const diff = index < entries.length - 1 ? (weight - entries[index+1].weight_kg) : 0;
            
            return (
              <div
                key={entry.id}
                className="bg-surface-50 rounded-xl p-4 flex items-center justify-between group hover:bg-surface-100 transition-colors border border-white/5 relative"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-surface-100 border border-white/5 flex items-center justify-center flex-shrink-0">
                    {getIcon(index)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase">
                      {format.dateTime(new Date(entry.logged_at), { month: 'short', day: 'numeric'})}
                    </p>
                    <p className="text-[10px] text-surface-400 uppercase tracking-wider truncate max-w-[150px]">
                      {entry.notes || 'Logged Entry'}
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-lg font-bold text-white leading-none flex items-end gap-1">
                     {format.number(bf, { maximumFractionDigits: 1 })}<span className="text-sm mb-[2px]">%</span>
                  </p>
                  <p className={`text-[10px] font-bold ${diff < 0 ? 'text-primary-500' : diff > 0 ? 'text-surface-400' : 'text-surface-500'}`}>
                    {diff > 0 ? '+' : ''}{diff !== 0 ? format.number(diff, { maximumFractionDigits: 1 }) : '0'} kg
                  </p>
                </div>
                
                <button
                  onClick={() => setEditingEntry(entry)}
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-surface-50/80 backdrop-blur-sm transition-opacity rounded-xl"
                  title={t('edit_entry')}
                >
                  <div className="bg-primary-500 text-black px-4 py-2 rounded-full flex items-center gap-2 font-bold text-xs uppercase tracking-widest shadow-glow-orange">
                    <Pencil size={12} /> Edit
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </section>

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

