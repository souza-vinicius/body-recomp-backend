'use client';

import React, { useState } from 'react';
import { X, Save, Calendar, Percent, Ruler, Scale } from 'lucide-react';
import { SubmitButton } from '@/components/forms/submit-button';
import { TextField } from '@/components/forms/text-field';

interface EditProgressModalProps {
  entry: {
    id: string;
    goal_id: string;
    measurement_id: string;
    week_number: number;
    weight_kg: number;
    body_fat_percentage: number;
    notes?: string | null;
    logged_at: string;
    measurement?: {
      waist_cm?: number | null;
      neck_cm?: number | null;
      hip_cm?: number | null;
    };
  };
  onSave: (entryId: string, measurementId: string, data: {
    notes?: string;
    logged_at?: string;
    weight_kg?: number;
    waist_cm?: number;
    neck_cm?: number;
    hip_cm?: number;
  }) => Promise<void>;
  onClose: () => void;
}

function toDateString(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export function EditProgressModal({ entry, onSave, onClose }: EditProgressModalProps) {
  const [notes, setNotes] = useState(entry.notes || '');
  const [weightKg, setWeightKg] = useState(String(entry.weight_kg));
  const [entryDate, setEntryDate] = useState(toDateString(entry.logged_at));
  
  const [waistCm, setWaistCm] = useState(entry.measurement?.waist_cm ? String(entry.measurement.waist_cm) : '');
  const [neckCm, setNeckCm] = useState(entry.measurement?.neck_cm ? String(entry.measurement.neck_cm) : '');
  const [hipCm, setHipCm] = useState(entry.measurement?.hip_cm ? String(entry.measurement.hip_cm) : '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalDate = toDateString(entry.logged_at);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const updates: Record<string, any> = {};

      // Notes
      updates.notes = notes || undefined;

      // Date change
      if (entryDate !== originalDate) {
        updates.logged_at = new Date(entryDate + 'T12:00:00').toISOString();
      }

      // Weight
      const w = parseFloat(weightKg);
      if (!isNaN(w) && w !== entry.weight_kg) {
        updates.weight_kg = w;
      }

      // Circumferences
      if (waistCm.trim()) {
        const v = parseFloat(waistCm);
        if (!isNaN(v)) updates.waist_cm = v;
      }
      if (neckCm.trim()) {
        const v = parseFloat(neckCm);
        if (!isNaN(v)) updates.neck_cm = v;
      }
      if (hipCm.trim()) {
        const v = parseFloat(hipCm);
        if (!isNaN(v)) updates.hip_cm = v;
      }

      await onSave(entry.id, entry.measurement_id, updates);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl shadow-elevated animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white z-10 px-6 pt-6 pb-3 border-b border-surface-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-surface-900">Edit Entry</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-50 text-surface-400 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface-50 rounded-xl p-3 text-center">
              <Calendar size={14} className="text-surface-400 mx-auto mb-1" />
              <span className="text-xs text-surface-400 block">Week</span>
              <span className="text-sm font-bold text-surface-900">{entry.week_number}</span>
            </div>
            <div className="bg-surface-50 rounded-xl p-3 text-center">
              <Scale size={14} className="text-surface-400 mx-auto mb-1" />
              <span className="text-xs text-surface-400 block">Weight</span>
              <span className="text-sm font-bold text-surface-900">{entry.weight_kg} kg</span>
            </div>
            <div className="bg-primary-50 rounded-xl p-3 text-center">
              <Percent size={14} className="text-primary-500 mx-auto mb-1" />
              <span className="text-xs text-primary-500 block">Body Fat</span>
              <span className="text-sm font-bold text-primary-700">{entry.body_fat_percentage}%</span>
            </div>
          </div>

          {/* Entry date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-date" className="text-sm font-semibold text-surface-700">Entry Date</label>
            <input
              id="edit-date"
              type="date"
              value={entryDate}
              onChange={e => setEntryDate(e.target.value)}
              className="px-3.5 py-2.5 text-sm bg-white border-2 border-surface-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-0 focus:border-primary-500 hover:border-surface-300"
            />
          </div>

          {/* Weight */}
          <TextField
            label="Weight (kg)"
            type="number"
            step="0.1"
            value={weightKg}
            onChange={e => setWeightKg(e.target.value)}
          />

          {/* Measurements */}
          <div className="space-y-3 p-4 bg-surface-50 rounded-xl border border-surface-100">
            <h4 className="flex items-center gap-2 text-sm font-bold text-surface-900">
              <Ruler size={16} className="text-primary-500" />
              Circumference Measurements
            </h4>
            <p className="text-xs text-surface-400">Leave blank to keep current values. Body fat will be recalculated.</p>
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Waist (cm)"
                type="number"
                step="0.1"
                value={waistCm}
                onChange={e => setWaistCm(e.target.value)}
              />
              <TextField
                label="Neck (cm)"
                type="number"
                step="0.1"
                value={neckCm}
                onChange={e => setNeckCm(e.target.value)}
              />
            </div>
            <TextField
              label="Hip (cm) - Female only"
              type="number"
              step="0.1"
              value={hipCm}
              onChange={e => setHipCm(e.target.value)}
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-notes" className="text-sm font-semibold text-surface-700">Notes</label>
            <textarea
              id="edit-notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              maxLength={1000}
              className="px-3.5 py-2.5 text-sm bg-white border-2 border-surface-200 rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-0 focus:border-primary-500 hover:border-surface-300 placeholder:text-surface-300 resize-none"
              placeholder="How did you feel this week?"
            />
            <span className="text-xs text-surface-300 text-right">{notes.length}/1000</span>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-xl border border-red-100 font-medium">{error}</div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold text-surface-600 border-2 border-surface-200 rounded-xl hover:bg-surface-50 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <SubmitButton isLoading={isLoading} onClick={handleSave} className="flex-1 gap-2">
              <Save size={16} />
              Save
            </SubmitButton>
          </div>
        </div>
      </div>
    </div>
  );
}
