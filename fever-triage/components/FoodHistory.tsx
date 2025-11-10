'use client';

import { useState, useEffect } from 'react';
import { FoodEntry } from '@/lib/types';
import { Utensils, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FoodHistory() {
  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [newEntry, setNewEntry] = useState<Partial<FoodEntry>>({
    meal_type: 'breakfast',
    description: '',
    notes: '',
  });

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('food_history');
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load food history:', e);
      }
    }
  }, []);

  const saveToLocalStorage = (updatedEntries: FoodEntry[]) => {
    localStorage.setItem('food_history', JSON.stringify(updatedEntries));
  };

  const addEntry = () => {
    if (!newEntry.description?.trim()) {
      toast.error('Please enter food description');
      return;
    }

    const entry: FoodEntry = {
      timestamp: new Date().toISOString(),
      meal_type: newEntry.meal_type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      description: newEntry.description,
      notes: newEntry.notes,
    };

    const updated = [entry, ...entries];
    setEntries(updated);
    saveToLocalStorage(updated);
    setNewEntry({ meal_type: 'breakfast', description: '', notes: '' });
    toast.success('Food entry added');
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Utensils className="text-green-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Food History</h2>
      </div>

      {/* Add New Entry Form */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Add New Meal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <select
            value={newEntry.meal_type}
            onChange={(e) => setNewEntry({ ...newEntry, meal_type: e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack' })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
          <input
            type="text"
            placeholder="What did you eat?"
            value={newEntry.description}
            onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg"
          />
        </div>
        <input
          type="text"
          placeholder="Notes (optional)"
          value={newEntry.notes}
          onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white rounded-lg mb-3"
        />
        <button
          onClick={addEntry}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
        >
          <Plus size={20} />
          Add Entry
        </button>
      </div>

      {/* Entry List */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No food entries yet. Add your first meal above!
          </p>
        ) : (
          entries.map((entry, index) => (
            <div
              key={index}
              className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs font-semibold uppercase">
                    {entry.meal_type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(entry.timestamp)}</span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white">{entry.description}</p>
                {entry.notes && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{entry.notes}</p>
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
