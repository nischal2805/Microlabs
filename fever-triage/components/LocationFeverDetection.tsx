'use client';

import { useState } from 'react';
import { MapPin, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { LocationData, LocationFeverStats } from '@/lib/types';
import { getLocationFeverStats } from '@/lib/api';
import toast from 'react-hot-toast';

export default function LocationFeverDetection() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<LocationFeverStats | null>(null);

  const getLocation = () => {
    setIsLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            location_name: 'Current Location',
          };
          setLocation(locationData);
          
          // Fetch fever statistics for this location
          try {
            const feverStats = await getLocationFeverStats(
              locationData.latitude,
              locationData.longitude,
              10
            );
            setStats(feverStats);
            toast.success('Location detected successfully');
          } catch (error) {
            console.error('Failed to fetch fever stats:', error);
            toast.error('Could not fetch area fever statistics');
          }
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Could not access location. Please enable location services.');
          setIsLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
      setIsLoading(false);
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200';
      case 'elevated':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200';
      default:
        return 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200';
    }
  };

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />;
      case 'elevated':
        return <Info className="text-yellow-600 dark:text-yellow-400" size={32} />;
      default:
        return <CheckCircle className="text-green-600 dark:text-green-400" size={32} />;
    }
  };

  const getAlertMessage = (level: string) => {
    switch (level) {
      case 'high':
        return 'High fever activity detected in your area. Take extra precautions and monitor your health closely.';
      case 'elevated':
        return 'Elevated fever cases in your area. Stay vigilant and practice good hygiene.';
      default:
        return 'Normal fever activity in your area. Continue following standard health practices.';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="text-blue-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Location-Based Fever Detection</h2>
      </div>

      <div className="space-y-4">
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300">
          Check fever activity levels in your area to stay informed about potential health risks in your community.
        </p>

        {/* Get Location Button */}
        {!location && (
          <button
            onClick={getLocation}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Detecting Location...
              </>
            ) : (
              <>
                <MapPin size={20} />
                Detect My Location
              </>
            )}
          </button>
        )}

        {/* Location Info */}
        {location && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">Your Location</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {location.location_name || 'Current Location'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Lat: {location.latitude.toFixed(4)}, Long: {location.longitude.toFixed(4)}
                </p>
              </div>
              <button
                onClick={getLocation}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm font-semibold hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Fever Statistics */}
        {stats && (
          <div className={`p-6 border-l-4 rounded-lg ${getAlertColor(stats.alert_level)}`}>
            <div className="flex items-start gap-4">
              {getAlertIcon(stats.alert_level)}
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-2">
                  {stats.alert_level === 'high' ? '⚠️ High Alert' : 
                   stats.alert_level === 'elevated' ? '⚡ Elevated Alert' : 
                   '✅ All Clear'}
                </h3>
                <p className="mb-3">{getAlertMessage(stats.alert_level)}</p>
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    <strong>Reported Cases:</strong> {stats.fever_count}
                  </span>
                  <span>
                    <strong>Area:</strong> {stats.location_name} (within 10km)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>🔒 Privacy:</strong> Your location is only used to show local health statistics and is not stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
