'use client';

import { AlertTriangle } from 'lucide-react';

interface RedFlagsAlertProps {
  redFlags: string[];
}

export default function RedFlagsAlert({ redFlags }: RedFlagsAlertProps) {
  if (!redFlags || redFlags.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-800 mb-2">
            ⚠️ Warning Signs Detected
          </h3>
          <p className="text-sm text-red-700 mb-3">
            These symptoms require immediate medical attention:
          </p>
          <ul className="space-y-2">
            {redFlags.map((flag, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600 font-bold">•</span>
                <span className="text-sm text-red-800 font-medium">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
