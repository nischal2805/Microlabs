'use client';

import { TriageOutput } from '@/lib/types';
import { formatTimestamp } from '@/lib/utils';
import SeverityBadge from './SeverityBadge';
import DiagnosisCard from './DiagnosisCard';
import RedFlagsAlert from './RedFlagsAlert';
import { 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  Printer, 
  Share2, 
  MapPin,
  Heart,
  Droplets,
  Moon,
  Thermometer,
  Info
} from 'lucide-react';
import { useState } from 'react';

interface ResultsDisplayProps {
  result: TriageOutput;
  onNewAssessment: () => void;
}

export default function ResultsDisplay({ result, onNewAssessment }: ResultsDisplayProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const timestamp = formatTimestamp(new Date());

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const summary = `Fever Triage Assessment\nSeverity: ${result.severity}\nRecommendation: ${result.recommended_action}\nTimeline: ${result.follow_up_timeline}`;
    if (navigator.share) {
      navigator.share({ text: summary });
    } else {
      navigator.clipboard.writeText(summary);
      alert('Assessment summary copied to clipboard!');
    }
  };

  const handleFindCare = () => {
    const query = result.severity === 'CRITICAL' || result.severity === 'HIGH' 
      ? 'emergency room near me' 
      : 'urgent care near me';
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Severity Banner */}
      <SeverityBadge severity={result.severity} confidence={result.confidence} />
      
      <p className="text-sm text-gray-500 text-center">
        Assessment completed at {timestamp}
      </p>

      {/* Recommended Action Card */}
      <div className={`rounded-xl shadow-lg p-6 ${
        result.severity === 'CRITICAL' 
          ? 'bg-red-50 border-2 border-red-500 animate-pulse' 
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${
            result.severity === 'CRITICAL' ? 'bg-red-100' :
            result.severity === 'HIGH' ? 'bg-orange-100' :
            result.severity === 'MEDIUM' ? 'bg-yellow-100' :
            'bg-green-100'
          }`}>
            <AlertCircle className={`${
              result.severity === 'CRITICAL' ? 'text-red-600' :
              result.severity === 'HIGH' ? 'text-orange-600' :
              result.severity === 'MEDIUM' ? 'text-yellow-600' :
              'text-green-600'
            }`} size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {result.severity === 'CRITICAL' ? '🚨 SEEK EMERGENCY CARE NOW' : 'Recommended Action'}
            </h3>
            <p className="text-gray-700 mb-3 text-lg">{result.recommended_action}</p>
            
            {result.time_sensitive && (
              <div className="flex items-center gap-2 text-orange-700 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                <Clock size={18} />
                <span className="text-sm font-semibold">Time-Sensitive: {result.follow_up_timeline}</span>
              </div>
            )}
            
            {!result.time_sensitive && (
              <div className="flex items-center gap-2 text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">
                <Clock size={18} />
                <span className="text-sm">Follow-up timeline: {result.follow_up_timeline}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Red Flags Alert */}
      <RedFlagsAlert redFlags={result.red_flags} />

      {/* Possible Diagnoses */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Possible Diagnoses</h3>
        <div className="space-y-3">
          {result.diagnosis_suggestions.map((diagnosis, index) => (
            <DiagnosisCard key={index} diagnosis={diagnosis} index={index} />
          ))}
        </div>
      </div>

      {/* Clinical Explanation */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full flex items-center justify-between text-left"
        >
          <h3 className="text-xl font-bold text-gray-900">Clinical Explanation</h3>
          <Info className="text-gray-400" size={24} />
        </button>
        
        {showExplanation && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-gray-700 leading-relaxed">{result.explanation}</p>
          </div>
        )}
      </div>

      {/* Home Care Recommendations (for LOW/MEDIUM severity) */}
      {(result.severity === 'LOW' || result.severity === 'MEDIUM') && (
        <div className="bg-blue-50 rounded-xl shadow-lg p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Home Care Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Droplets className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-blue-900">Stay Hydrated</h4>
                <p className="text-sm text-blue-700">Drink plenty of water, clear broths, or electrolyte solutions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Moon className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-blue-900">Get Rest</h4>
                <p className="text-sm text-blue-700">Allow your body to recover with adequate sleep</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Thermometer className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-blue-900">Monitor Temperature</h4>
                <p className="text-sm text-blue-700">Check temperature regularly and track changes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Heart className="text-blue-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="font-semibold text-blue-900">OTC Medications</h4>
                <p className="text-sm text-blue-700">Consider acetaminophen or ibuprofen for fever and pain</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* What to Watch For */}
      <div className="bg-yellow-50 rounded-xl shadow-lg p-6 border border-yellow-200">
        <h3 className="text-xl font-bold text-yellow-900 mb-3">⚠️ Seek Immediate Care If:</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-yellow-800">
            <span className="font-bold">•</span>
            <span className="text-sm">Temperature rises above 105°F or drops below 95°F</span>
          </li>
          <li className="flex items-start gap-2 text-yellow-800">
            <span className="font-bold">•</span>
            <span className="text-sm">Difficulty breathing or shortness of breath develops</span>
          </li>
          <li className="flex items-start gap-2 text-yellow-800">
            <span className="font-bold">•</span>
            <span className="text-sm">Confusion, disorientation, or altered consciousness occurs</span>
          </li>
          <li className="flex items-start gap-2 text-yellow-800">
            <span className="font-bold">•</span>
            <span className="text-sm">Severe or persistent vomiting prevents fluid intake</span>
          </li>
          <li className="flex items-start gap-2 text-yellow-800">
            <span className="font-bold">•</span>
            <span className="text-sm">Symptoms worsen or don't improve within the expected timeline</span>
          </li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <button
          onClick={onNewAssessment}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          <RefreshCw size={18} />
          New Assessment
        </button>
        
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
        >
          <Printer size={18} />
          Print Report
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
        >
          <Share2 size={18} />
          Share
        </button>
        
        <button
          onClick={handleFindCare}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
        >
          <MapPin size={18} />
          Find Care
        </button>
      </div>
    </div>
  );
}
