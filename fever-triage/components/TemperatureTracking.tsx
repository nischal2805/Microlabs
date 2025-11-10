'use client';

import { useState, useEffect } from 'react';
import { TemperatureEntry } from '@/lib/types';
import { Thermometer, Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TemperatureTracking() {
  const [entries, setEntries] = useState<TemperatureEntry[]>([]);
  const [newTemp, setNewTemp] = useState<number>(98.6);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('temperature_history');
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load temperature history:', e);
      }
    }
  }, []);

  const saveToLocalStorage = (updatedEntries: TemperatureEntry[]) => {
    localStorage.setItem('temperature_history', JSON.stringify(updatedEntries));
  };

  const addEntry = () => {
    if (newTemp < 95 || newTemp > 110) {
      toast.error('Please enter a valid temperature (95-110°F)');
      return;
    }

    const entry: TemperatureEntry = {
      timestamp: new Date().toISOString(),
      temperature: newTemp,
      notes: notes || undefined,
    };

    const updated = [entry, ...entries];
    setEntries(updated);
    saveToLocalStorage(updated);
    setNewTemp(98.6);
    setNotes('');
    toast.success('Temperature recorded');
  };

  const deleteEntry = (index: number) => {
    const updated = entries.filter((_, i) => i !== index);
    setEntries(updated);
    saveToLocalStorage(updated);
    toast.success('Entry deleted');
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 103) return 'text-red-600 dark:text-red-400';
    if (temp >= 101) return 'text-orange-600 dark:text-orange-400';
    if (temp >= 99) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getTrend = () => {
    if (entries.length < 2) return null;
    const latest = entries[0].temperature;
    const previous = entries[1].temperature;
    return latest > previous ? 'up' : latest < previous ? 'down' : 'stable';
  };

  const getAverageTemp = () => {
    if (entries.length === 0) return 0;
    const sum = entries.reduce((acc, entry) => acc + entry.temperature, 0);
    return (sum / entries.length).toFixed(1);
  };

  const trend = getTrend();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Thermometer className="text-red-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Temperature Tracking</h2>
      </div>

      {/* Statistics */}
      {entries.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Latest</p>
            <p className={`text-2xl font-bold ${getTemperatureColor(entries[0].temperature)}`}>
              {entries[0].temperature.toFixed(1)}°F
            </p>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Average</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{getAverageTemp()}°F</p>
          </div>
          {trend && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Trend</p>
              <div className="flex items-center gap-2">
                {trend === 'up' ? (
                  <>
                    <TrendingUp className="text-red-500" size={24} />
                    <span className="text-lg font-bold text-red-500">Rising</span>
                  </>
                ) : trend === 'down' ? (
                  <>
                    <TrendingDown className="text-green-500" size={24} />
                    <span className="text-lg font-bold text-green-500">Falling</span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-500">Stable</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add New Entry Form */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Record Temperature</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Temperature (°F)</label>
            <input
              type="number"
              step="0.1"
              value={newTemp}
              onChange={(e) => setNewTemp(parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
            <input
              type="text"
              placeholder="Time of day, symptoms, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg"
            />
          </div>
        </div>
        <button
          onClick={addEntry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          <Plus size={20} />
          Record Temperature
        </button>
      </div>

      {/* Entry List */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No temperature readings yet. Record your first reading above!
          </p>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-2xl font-bold ${getTemperatureColor(entry.temperature)}`}>
                    {entry.temperature.toFixed(1)}°F
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(entry.timestamp)}</span>
                </div>
                {entry.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-300">{entry.notes}</p>
                )}
              </div>
              <button
                onClick={() => deleteEntry(index)}
                className="text-red-500 hover:text-red-700 p-2"
                title="Delete entry"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
