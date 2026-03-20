import React from 'react';
import { Dumbbell, Activity, Moon, Clock, Flame, Repeat } from 'lucide-react';

interface TrainingPlanPanelProps {
  trainingPlan: any;
}

export function TrainingPlanPanel({ trainingPlan }: TrainingPlanPanelProps) {
  if (!trainingPlan) {
    return <div className="card p-6 text-surface-400 text-sm">No training plan available.</div>;
  }

  const details = trainingPlan.plan_details;

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 bg-gradient-dark flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
            <Dumbbell size={16} className="text-primary-400" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">Training Plan</h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-surface-400 block">Frequency</span>
          <span className="font-bold text-white">{trainingPlan.workout_frequency}x <span className="font-normal text-surface-400 text-xs">/ week</span></span>
        </div>
      </div>
      
      <div className="p-0 flex flex-col divide-y divide-surface-100">
        
        {/* Strength Training */}
        {details?.strength_training && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell size={18} className="text-primary-600" />
              <h4 className="font-bold text-surface-900">Strength Training</h4>
              <span className="ml-auto text-xs font-semibold bg-primary-50 text-primary-700 px-2 py-1 rounded-md">
                {details.strength_training.frequency}x / week
              </span>
            </div>
            
            <p className="text-sm text-surface-600 mb-5">{details.strength_training.description}</p>
            
            {details.strength_training.exercises && (
              <div className="space-y-2 mb-5">
                {details.strength_training.exercises.map((ex: any, i: number) => (
                  <div key={i} className="flex gap-4 p-3 bg-surface-50 rounded-xl border border-surface-100 items-center justify-between hover:border-surface-200 transition-colors">
                    <span className="font-semibold text-sm text-surface-800 flex-1">{ex.name}</span>
                    <div className="flex items-center gap-4 text-xs font-medium text-surface-500">
                      <span className="flex items-center gap-1.5 w-16" title="Sets"><Repeat size={14} className="text-surface-400" /> {ex.sets}</span>
                      <span className="flex items-center gap-1.5 w-16" title="Reps"><Flame size={14} className="text-surface-400" /> {ex.reps}</span>
                      <span className="flex items-center gap-1.5 w-20 justify-end" title="Rest"><Clock size={14} className="text-surface-400" /> {ex.rest}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-3 bg-surface-50/50 p-4 rounded-xl">
              <div>
                <span className="text-xs font-bold text-surface-900 block mb-1">Progression</span>
                <p className="text-xs text-surface-600 leading-relaxed">{details.strength_training.progression}</p>
              </div>
              {details.strength_training.notes && (
                <div>
                  <span className="text-xs font-bold text-surface-900 block mb-1">Notes</span>
                  <p className="text-xs text-surface-600 leading-relaxed">{details.strength_training.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cardio */}
        {details?.cardio && details.cardio.frequency > 0 && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={18} className="text-blue-500" />
              <h4 className="font-bold text-surface-900">Cardio</h4>
              <span className="ml-auto text-xs font-semibold bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                {details.cardio.frequency}x / week
              </span>
            </div>
            
            <p className="text-sm text-surface-600 mb-5">{details.cardio.description}</p>
            
            {details.cardio.activities && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {details.cardio.activities.map((act: any, i: number) => (
                  <div key={i} className="p-4 bg-surface-50 rounded-xl border border-surface-100 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm text-surface-800">{act.type}</span>
                      <span className="text-xs font-medium text-surface-500 flex items-center gap-1"><Clock size={12}/>{act.duration}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-surface-400">Intensity: </span>
                      <span className="font-medium text-surface-700">{act.intensity}</span>
                    </div>
                    <div className="text-xs mt-1">
                      <span className="text-surface-400 block mb-1">Examples:</span>
                      <span className="text-surface-600 italic">"{act.examples}"</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {details.cardio.notes && (
              <div className="bg-surface-50/50 p-3 rounded-lg">
                <p className="text-xs text-surface-600 leading-relaxed"><span className="font-bold text-surface-900">Notes:</span> {details.cardio.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Recovery */}
        {details?.recovery && (
          <div className="p-6 bg-surface-50/30">
            <div className="flex items-center gap-2 mb-4">
              <Moon size={18} className="text-indigo-500" />
              <h4 className="font-bold text-surface-900">Recovery</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-white rounded-xl border border-surface-100 shadow-sm text-center">
                <span className="text-xs font-semibold text-surface-400 block mb-1 uppercase tracking-wider">Rest Days</span>
                <span className="text-xl font-black text-surface-900">{details.recovery.rest_days} <span className="text-xs font-medium text-surface-400">/ week</span></span>
              </div>
              <div className="p-4 bg-white rounded-xl border border-surface-100 shadow-sm text-center">
                <span className="text-xs font-semibold text-surface-400 block mb-1 uppercase tracking-wider">Sleep Target</span>
                <span className="text-xl font-black text-surface-900">{details.recovery.sleep_target.split(' ')[0]} <span className="text-xs font-medium text-surface-400">hours</span></span>
              </div>
            </div>
            
            {details.recovery.notes && (
              <p className="text-xs text-surface-600 leading-relaxed text-center"><span className="font-bold text-surface-900">Focus:</span> {details.recovery.notes}</p>
            )}
          </div>
        )}

        {/* General Notes Fallback */}
        {trainingPlan.notes && (
          <div className="p-6">
            <div className="p-4 bg-primary-50 rounded-xl text-sm text-primary-800 border border-primary-100">
              <span className="font-bold block mb-1">Plan Notes</span>
              {trainingPlan.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
