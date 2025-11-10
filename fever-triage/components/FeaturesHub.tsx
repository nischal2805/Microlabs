'use client';

import { useState } from 'react';
import { Activity, Utensils, Thermometer, MapPin, Bell, ArrowLeft } from 'lucide-react';
import FoodHistory from './FoodHistory';
import TemperatureTracking from './TemperatureTracking';
import LocationFeverDetection from './LocationFeverDetection';
import ReminderSystem from './ReminderSystem';

type FeatureView = 'menu' | 'food' | 'temperature' | 'location' | 'reminders';

export default function FeaturesHub() {
  const [currentView, setCurrentView] = useState<FeatureView>('menu');

  const features = [
    {
      id: 'food' as FeatureView,
      title: 'Food History',
      description: 'Track your daily meals and dietary habits',
      icon: Utensils,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
    },
    {
      id: 'temperature' as FeatureView,
      title: 'Temperature Tracking',
      description: 'Monitor your temperature over time',
      icon: Thermometer,
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600',
    },
    {
      id: 'location' as FeatureView,
      title: 'Fever Detection',
      description: 'Check fever activity in your area',
      icon: MapPin,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
    },
    {
      id: 'reminders' as FeatureView,
      title: 'Reminders',
      description: 'Set medicine and diet reminders',
      icon: Bell,
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600',
    },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'food':
        return <FoodHistory />;
      case 'temperature':
        return <TemperatureTracking />;
      case 'location':
        return <LocationFeverDetection />;
      case 'reminders':
        return <ReminderSystem />;
      default:
        return null;
    }
  };

  if (currentView !== 'menu') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setCurrentView('menu')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-semibold transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Features
        </button>
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-blue-600" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Health Features</h2>
          <p className="text-gray-600 dark:text-gray-300">Track and manage your health data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <button
              key={feature.id}
              onClick={() => setCurrentView(feature.id)}
              className={`${feature.color} ${feature.hoverColor} text-white rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105 text-left`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                  <Icon size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm opacity-90">{feature.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>📱 Villager-Friendly Features:</strong> These features are designed to be accessible and easy to use,
          with voice support and simple interfaces. All data is stored locally on your device for privacy.
        </p>
      </div>
    </div>
  );
}
