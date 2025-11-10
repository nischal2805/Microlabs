// Utility functions and helpers

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9;
}

export function getTemperatureColor(tempF: number): string {
  if (tempF < 99) return 'text-green-600';
  if (tempF < 101) return 'text-yellow-600';
  if (tempF < 103) return 'text-orange-600';
  return 'text-red-600';
}

export function getSeverityColor(severity: string): {
  bg: string;
  text: string;
  border: string;
  icon: string;
} {
  switch (severity) {
    case 'LOW':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-500',
        icon: '🟢'
      };
    case 'MEDIUM':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-500',
        icon: '🟡'
      };
    case 'HIGH':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-500',
        icon: '🟠'
      };
    case 'CRITICAL':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-500',
        icon: '🔴'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-500',
        icon: '⚪'
      };
  }
}

export function getAgeGroup(age: number): string {
  if (age < 1) return 'Infant';
  if (age <= 12) return 'Child';
  if (age <= 17) return 'Teen';
  if (age <= 64) return 'Adult';
  return 'Senior';
}

export function formatDuration(hours: number): string {
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  if (remainingHours === 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  return `${days} day${days !== 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
}

export function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
