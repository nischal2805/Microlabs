'use client';

import { useState } from 'react';
import { TriageInput } from '@/lib/types';
import { getTemperatureColor, celsiusToFahrenheit, fahrenheitToCelsius, getAgeGroup } from '@/lib/utils';
import DemoCases from './DemoCases';
import { DemoCase } from '@/lib/types';

interface SymptomFormProps {
  onSubmit: (data: TriageInput) => void;
  isLoading: boolean;
}

const symptomCategories = {
  Respiratory: {
    color: 'blue',
    symptoms: [
      'Cough (dry)',
      'Cough (with phlegm)',
      'Sore throat',
      'Difficulty breathing',
      'Shortness of breath',
      'Chest pain with breathing',
    ],
  },
  Systemic: {
    color: 'purple',
    symptoms: [
      'Headache',
      'Body aches',
      'Chills',
      'Fatigue',
      'Dizziness',
      'Weakness',
    ],
  },
  Gastrointestinal: {
    color: 'green',
    symptoms: [
      'Nausea',
      'Vomiting',
      'Diarrhea',
      'Abdominal pain',
      'Loss of appetite',
    ],
  },
  Neurological: {
    color: 'orange',
    symptoms: [
      'Confusion',
      'Stiff neck',
      'Sensitivity to light',
      'Altered consciousness',
    ],
  },
  Other: {
    color: 'gray',
    symptoms: [
      'Rash',
      'Rapid heartbeat',
      'Ear pain',
      'Joint pain',
      'Loss of taste/smell',
      'Night sweats',
      'Runny nose',
    ],
  },
};

export default function SymptomForm({ onSubmit, isLoading }: SymptomFormProps) {
  const [temperature, setTemperature] = useState<number>(98.6);
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [durationHours, setDurationHours] = useState<number>(24);
  const [age, setAge] = useState<number>(30);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<string>('');

  const handleTempUnitToggle = () => {
    if (tempUnit === 'F') {
      setTemperature(parseFloat(fahrenheitToCelsius(temperature).toFixed(1)));
      setTempUnit('C');
    } else {
      setTemperature(parseFloat(celsiusToFahrenheit(temperature).toFixed(1)));
      setTempUnit('F');
    }
  };

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleDemoCase = (demoCase: DemoCase) => {
    setTemperature(demoCase.temperature);
    setTempUnit('F');
    setDurationHours(demoCase.duration_hours);
    setAge(demoCase.age);
    setSelectedSymptoms(demoCase.symptoms);
    setMedicalHistory(demoCase.medical_history || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert temperature to Fahrenheit if needed
    const tempInF = tempUnit === 'C' ? celsiusToFahrenheit(temperature) : temperature;
    
    const data: TriageInput = {
      temperature: tempInF,
      duration_hours: durationHours,
      symptoms: selectedSymptoms,
      age: age,
      medical_history: medicalHistory || undefined,
    };
    
    onSubmit(data);
  };

  const isFormValid = selectedSymptoms.length > 0 && temperature > 0 && age > 0 && durationHours > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Patient Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Temperature
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className={`flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${getTemperatureColor(tempUnit === 'F' ? temperature : celsiusToFahrenheit(temperature))}`}
                required
              />
              <button
                type="button"
                onClick={handleTempUnitToggle}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
              >
                °{tempUnit}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Normal: 97.0-99.0°F</p>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Age
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="0"
              max="120"
            />
            <p className="text-xs text-gray-500 mt-1">Age Group: {getAgeGroup(age)}</p>
          </div>

          {/* Duration */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fever Duration (hours)
            </label>
            <input
              type="number"
              value={durationHours}
              onChange={(e) => setDurationHours(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              min="1"
              max="720"
            />
            <p className="text-xs text-gray-500 mt-1">
              {durationHours < 24 ? `${durationHours} hours` : `${Math.floor(durationHours / 24)} day(s)`}
            </p>
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900">Select All Symptoms</h3>
          <p className="text-sm text-gray-600 mt-1">
            {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(symptomCategories).map(([category, { color, symptoms }]) => (
            <div key={category}>
              <h4 className={`text-sm font-semibold text-${color}-700 mb-3`}>{category}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {symptoms.map((symptom) => (
                  <label
                    key={symptom}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSymptoms.includes(symptom)
                        ? `border-${color}-500 bg-${color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSymptoms.includes(symptom)}
                      onChange={() => handleSymptomToggle(symptom)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{symptom}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical History */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Medical History (Optional)
        </label>
        <textarea
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value.slice(0, 500))}
          placeholder="Any chronic conditions, medications, allergies, or relevant medical history..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">
          {medicalHistory.length}/500 characters
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Examples: Diabetes, asthma, immunocompromised, recent surgery, pregnant, etc.
        </p>
      </div>

      {/* Demo Cases */}
      <DemoCases onSelectCase={handleDemoCase} />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isLoading}
        className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
          isFormValid && !isLoading
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            AI is analyzing...
          </span>
        ) : (
          'Analyze Symptoms'
        )}
      </button>

      {!isFormValid && (
        <p className="text-sm text-red-600 text-center">
          Please select at least one symptom to continue
        </p>
      )}
    </form>
  );
}
