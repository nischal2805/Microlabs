'use client';

import { DemoCase } from '@/lib/types';

interface DemoCasesProps {
  onSelectCase: (demoCase: DemoCase) => void;
}

const demoCases: DemoCase[] = [
  {
    name: 'Common Cold',
    icon: '🤧',
    temperature: 99.8,
    duration_hours: 24,
    age: 28,
    symptoms: ['Sore throat', 'Fatigue', 'Runny nose'],
  },
  {
    name: 'Flu',
    icon: '🤒',
    temperature: 102.5,
    duration_hours: 18,
    age: 45,
    symptoms: ['Body aches', 'Chills', 'Headache', 'Cough (dry)'],
  },
  {
    name: 'Pneumonia',
    icon: '🫁',
    temperature: 103.8,
    duration_hours: 48,
    age: 67,
    symptoms: ['Chest pain with breathing', 'Cough (with phlegm)', 'Difficulty breathing', 'Fatigue'],
    medical_history: 'COPD, smoker for 30 years',
  },
  {
    name: 'Critical',
    icon: '🚨',
    temperature: 105.0,
    duration_hours: 8,
    age: 55,
    symptoms: ['Confusion', 'Rapid heartbeat', 'Chills', 'Difficulty breathing', 'Altered consciousness'],
  },
];

export default function DemoCases({ onSelectCase }: DemoCasesProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Try a Sample Case:</h3>
      <div className="flex flex-wrap gap-2">
        {demoCases.map((demoCase, index) => (
          <button
            key={index}
            onClick={() => onSelectCase(demoCase)}
            className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-sm font-medium transition-colors border border-blue-200 hover:border-blue-300"
          >
            <span className="mr-2">{demoCase.icon}</span>
            {demoCase.name}
          </button>
        ))}
      </div>
    </div>
  );
}
