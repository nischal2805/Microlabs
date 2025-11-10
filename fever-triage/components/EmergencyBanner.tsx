'use client';

import { Phone } from 'lucide-react';

export default function EmergencyBanner() {
  return (
    <div className="bg-red-600 text-white py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm font-semibold">
        <span className="text-lg">🚨</span>
        <span>MEDICAL EMERGENCY?</span>
        <a 
          href="tel:911" 
          className="flex items-center gap-1 hover:underline ml-2"
        >
          <Phone size={16} />
          <span>CALL 911 IMMEDIATELY</span>
        </a>
      </div>
    </div>
  );
}
