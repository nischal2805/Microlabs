'use client';

import { useState } from 'react';
import { TriageInput, TriageOutput } from '@/lib/types';
import { triageAssessment } from '@/lib/api';
import SymptomForm from '@/components/SymptomForm';
import ResultsDisplay from '@/components/ResultsDisplay';
import ChatInterface from '@/components/ChatInterface';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TriageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);

  const handleSubmit = async (data: TriageInput) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await triageAssessment(data);
      setResult(response);
      toast.success('Assessment completed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Triage assessment error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAssessment = () => {
    setResult(null);
    setError(null);
    setShowChat(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 text-white rounded-2xl p-8 mb-6 shadow-xl">
          <h1 className="text-4xl font-bold mb-3">AI-Powered Fever Triage System</h1>
          <p className="text-lg opacity-90">
            Get instant, intelligent medical assessment for fever-related symptoms
          </p>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-lg text-left">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-yellow-900 dark:text-yellow-100 mb-1">⚠️ IMPORTANT MEDICAL DISCLAIMER</h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This AI tool provides educational information only and is NOT a substitute for professional medical 
                advice, diagnosis, or treatment. Always seek the advice of your physician or qualified health provider 
                with any questions about a medical condition. If you have a medical emergency, call 911 or visit the 
                nearest emergency department immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!result ? (
        <>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" size={20} />
                <div>
                  <h4 className="font-semibold text-red-900 dark:text-red-100">Error</h4>
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}
          <SymptomForm onSubmit={handleSubmit} isLoading={isLoading} />
        </>
      ) : (
        <>
          <ResultsDisplay result={result} onNewAssessment={handleNewAssessment} onOpenChat={() => setShowChat(true)} />
          {showChat && <ChatInterface triageResult={result} onClose={() => setShowChat(false)} />}
        </>
      )}
    </div>
  );
}

