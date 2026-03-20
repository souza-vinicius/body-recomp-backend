import React from 'react';
import { Apple, CheckCircle2 } from 'lucide-react';

interface DietPlanPanelProps {
  dietPlan: any;
}

const parseGuidelines = (text: string) => {
  if (!text) return null;
  const sections = text.split('\n\n');
  
  return sections.map((section, idx) => {
    const lines = section.split('\n');
    let hasContent = false;
    
    const renderedLines = lines.map((line, lineIdx) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      hasContent = true;
      
      // Full line Bold -> Heading
      if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        const headingText = trimmed.replace(/\*\*/g, '').replace(/:$/, '');
        return (
          <h4 key={lineIdx} className="font-bold text-surface-900 border-b border-surface-100 pb-1 mb-2 mt-4 first:mt-0 opacity-90 text-[13px] uppercase tracking-wide">
            {headingText}
          </h4>
        );
      } 
      // Unordered list item
      else if (trimmed.startsWith('- ')) {
        const itemText = trimmed.substring(2);
        
        // Sometimes the backend uses "Label: Value" in bullets, let's bold the label if it exists
        const colonIndex = itemText.indexOf(':');
        
        let content;
        if (colonIndex !== -1 && colonIndex < 20) {
          const label = itemText.substring(0, colonIndex + 1);
          const value = itemText.substring(colonIndex + 1);
          content = <><span className="font-semibold text-surface-800">{label}</span>{value}</>;
        } else {
          content = itemText;
        }

        return (
          <div key={lineIdx} className="flex gap-2.5 mb-2 ml-1 items-start">
            <CheckCircle2 size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
            <span className="text-surface-600 leading-snug">{content}</span>
          </div>
        );
      } 
      // Normal paragraph
      else {
        return <p key={lineIdx} className="text-surface-600 mb-2 leading-relaxed">{trimmed}</p>;
      }
    });

    if (!hasContent) return null;

    return (
      <div key={idx} className="mb-6 last:mb-0">
        {renderedLines}
      </div>
    );
  });
};

export function DietPlanPanel({ dietPlan }: DietPlanPanelProps) {
  if (!dietPlan) {
    return <div className="card p-6 text-surface-400 text-sm">No diet plan available.</div>;
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 bg-gradient-dark flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center">
            <Apple size={16} className="text-green-400" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase">Diet Plan</h3>
        </div>
      </div>
      
      <div className="p-0 flex flex-col divide-y divide-surface-100">
        {/* Macro Overview */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Calories', value: `${dietPlan.daily_calorie_target}`, unit: 'kcal' },
            { label: 'Protein', value: `${dietPlan.protein_grams}`, unit: 'g' },
            { label: 'Carbs', value: `${dietPlan.carbs_grams}`, unit: 'g' },
            { label: 'Fat', value: `${dietPlan.fat_grams}`, unit: 'g' },
          ].map(row => (
            <div key={row.label} className="p-4 bg-surface-50 rounded-xl border border-surface-100 text-center flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-surface-400 uppercase tracking-widest block mb-1">{row.label}</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-surface-900">{row.value}</span>
                <span className="text-xs font-medium text-surface-500">{row.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Guidelines */}
        {dietPlan.guidelines && (
          <div className="p-6 bg-surface-50/30">
            <div className="text-sm">
              {parseGuidelines(dietPlan.guidelines)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
