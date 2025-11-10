'use client';

import { Activity } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Activity className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">AI Fever Triage System</h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">Intelligent Medical Assessment</p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
