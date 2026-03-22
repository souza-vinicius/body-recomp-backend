import React from 'react';
import { Flame, Beef, Wheat, Droplets } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MacroTargetsProps {
  dietPlan: any;
}

export function MacroTargets({ dietPlan }: MacroTargetsProps) {
  const t = useTranslations('Plans.DailyTargets');
  
  if (!dietPlan) return null;

  const macros = [
    { label: t('calories'), value: dietPlan.daily_calorie_target, unit: t('calories_unit'), icon: Flame, bg: 'bg-surface-50', iconColor: 'text-primary-400', textColor: 'text-white' },
    { label: t('protein'), value: dietPlan.protein_grams, unit: t('grams_unit'), icon: Beef, bg: 'bg-red-950/20', iconColor: 'text-red-400', textColor: 'text-red-100' },
    { label: t('carbs'), value: dietPlan.carbs_grams, unit: t('grams_unit'), icon: Wheat, bg: 'bg-amber-950/20', iconColor: 'text-amber-400', textColor: 'text-amber-100' },
    { label: t('fats'), value: dietPlan.fat_grams, unit: t('grams_unit'), icon: Droplets, bg: 'bg-blue-950/20', iconColor: 'text-blue-400', textColor: 'text-blue-100' },
  ];

  return (
    <div className="card p-6">
      <h3 className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-4">{t('title')}</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {macros.map(macro => {
          const Icon = macro.icon;
          return (
            <div key={macro.label} className={`p-4 rounded-xl text-center ${macro.bg}`}>
              <Icon size={20} className={`${macro.iconColor} mx-auto mb-2`} />
              <span className={`text-xl font-black block ${macro.textColor}`}>
                {macro.value || '--'}
              </span>
              <span className={`text-xs font-medium block mt-0.5 opacity-60 ${macro.textColor}`}>
                {macro.unit}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider block mt-1 opacity-40 ${macro.textColor}`}>
                {macro.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

