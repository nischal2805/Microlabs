'use client';

import { useState, useEffect } from 'react';
import { Reminder } from '@/lib/types';
import { Bell, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReminderSystem() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    type: 'medicine',
    title: '',
    description: '',
    time: '08:00',
    frequency: 'daily',
    start_date: new Date().toISOString().split('T')[0],
    enabled: true,
  });

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('reminders');
    if (stored) {
      try {
        setReminders(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load reminders:', e);
      }
    }

    // Check for due reminders every minute
    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      
      reminders.forEach((reminder) => {
        if (reminder.enabled && reminder.time === currentTime) {
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Reminder: ${reminder.title}`, {
              body: reminder.description,
              icon: '/icon.png',
            });
          }
          toast.success(`⏰ Reminder: ${reminder.title}`, {
            duration: 5000,
          });
        }
      });
    };

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [reminders]);

  const saveToLocalStorage = (updatedReminders: Reminder[]) => {
    localStorage.setItem('reminders', JSON.stringify(updatedReminders));
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const addReminder = () => {
    if (!newReminder.title?.trim()) {
      toast.error('Please enter a reminder title');
      return;
    }

    const reminder: Reminder = {
      id: Date.now().toString(),
      type: newReminder.type as 'medicine' | 'diet' | 'checkup' | 'temperature',
      title: newReminder.title,
      description: newReminder.description || '',
      time: newReminder.time || '08:00',
      frequency: newReminder.frequency as 'once' | 'daily' | 'twice_daily' | 'thrice_daily' | 'weekly',
      start_date: newReminder.start_date || new Date().toISOString().split('T')[0],
      end_date: newReminder.end_date,
      enabled: true,
    };

    const updated = [...reminders, reminder];
    setReminders(updated);
    saveToLocalStorage(updated);
    setShowForm(false);
    setNewReminder({
      type: 'medicine',
      title: '',
      description: '',
      time: '08:00',
      frequency: 'daily',
      start_date: new Date().toISOString().split('T')[0],
      enabled: true,
    });
    toast.success('Reminder added successfully');
    requestNotificationPermission();
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    saveToLocalStorage(updated);
    toast.success('Reminder deleted');
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map((r) =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setReminders(updated);
    saveToLocalStorage(updated);
  };

  const getReminderIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      medicine: '💊',
      diet: '🍽️',
      checkup: '🏥',
      temperature: '🌡️',
    };
    return icons[type] || '🔔';
  };

  const getFrequencyText = (frequency: string) => {
    const texts: { [key: string]: string } = {
      once: 'One time',
      daily: 'Every day',
      twice_daily: 'Twice a day',
      thrice_daily: 'Three times a day',
      weekly: 'Weekly',
    };
    return texts[frequency] || frequency;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="text-purple-600" size={28} />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reminders</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
        >
          <Plus size={20} />
          Add Reminder
        </button>
      </div>

      {/* Add Reminder Form */}
      {showForm && (
        <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">New Reminder</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={newReminder.type}
                  onChange={(e) => setNewReminder({ ...newReminder, type: e.target.value as 'medicine' | 'diet' | 'checkup' | 'temperature' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                >
                  <option value="medicine">Medicine</option>
                  <option value="diet">Diet/Meal</option>
                  <option value="checkup">Check-up</option>
                  <option value="temperature">Temperature Check</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                <select
                  value={newReminder.frequency}
                  onChange={(e) => setNewReminder({ ...newReminder, frequency: e.target.value as 'once' | 'daily' | 'twice_daily' | 'thrice_daily' | 'weekly' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                >
                  <option value="once">One time</option>
                  <option value="daily">Daily</option>
                  <option value="twice_daily">Twice daily</option>
                  <option value="thrice_daily">Three times daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
            <input
              type="text"
              placeholder="Reminder title (e.g., Take Paracetamol)"
              value={newReminder.title}
              onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
            />
            <textarea
              placeholder="Description (optional)"
              value={newReminder.description}
              onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
              rows={2}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Time</label>
                <input
                  type="time"
                  value={newReminder.time}
                  onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newReminder.start_date}
                  onChange={(e) => setNewReminder({ ...newReminder, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addReminder}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
              >
                Save Reminder
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-700 dark:text-white rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No reminders set. Click &quot;Add Reminder&quot; to create one!
          </p>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg border-2 ${
                reminder.enabled
                  ? 'bg-white dark:bg-gray-700 border-purple-200 dark:border-purple-800'
                  : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{getReminderIcon(reminder.type)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{reminder.title}</h3>
                    {reminder.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{reminder.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {reminder.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {getFrequencyText(reminder.frequency)}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs uppercase font-semibold">
                        {reminder.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className={`px-3 py-1 rounded text-sm font-semibold ${
                      reminder.enabled
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {reminder.enabled ? 'Active' : 'Disabled'}
                  </button>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Delete reminder"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Notification Permission Info */}
      {'Notification' in window && Notification.permission === 'default' && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Tip:</strong> Enable browser notifications to receive reminders even when you&apos;re not on this page.
          </p>
        </div>
      )}
    </div>
  );
}
