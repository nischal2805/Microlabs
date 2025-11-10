'use client';

import { getSeverityColor } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  className?: string;
}

export default function SeverityBadge({ severity, confidence, className = '' }: SeverityBadgeProps) {
  const colors = getSeverityColor(severity);
  
  const severityLabels = {
    LOW: 'Low Risk',
    MEDIUM: 'Moderate Risk',
    HIGH: 'High Risk',
    CRITICAL: 'CRITICAL - Urgent Care Needed'
  };

  return (
    <div className={`${colors.bg} border-l-4 ${colors.border} p-6 rounded-lg ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{colors.icon}</span>
          <div>
            <h2 className={`text-2xl font-bold ${colors.text}`}>
              {severityLabels[severity]}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Assessment Confidence: {(confidence * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
