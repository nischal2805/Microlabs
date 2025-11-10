'use client';

import { DiagnosisSuggestion } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface DiagnosisCardProps {
  diagnosis: DiagnosisSuggestion;
  index: number;
}

export default function DiagnosisCard({ diagnosis, index }: DiagnosisCardProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg font-semibold text-gray-700">#{index + 1}</span>
          <div className="text-left flex-1">
            <h4 className="font-semibold text-gray-900">{diagnosis.condition}</h4>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${diagnosis.probability * 100}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 font-medium">
                {(diagnosis.probability * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-gray-400" size={20} />
        ) : (
          <ChevronDown className="text-gray-400" size={20} />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-700">{diagnosis.reasoning}</p>
        </div>
      )}
    </div>
  );
}
