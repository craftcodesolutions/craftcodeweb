import React from 'react';
import { Clock } from 'lucide-react';

interface TimeSelectorProps {
  selectedTime: string;
  onChange: (time: string) => void;
  placeholder?: string;
  required?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  selectedTime,
  onChange,
  placeholder = 'Select time',
  required = false,
}) => {
  // Generate time options (15-minute intervals)
  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        options.push({ value: timeString, label: displayTime });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className="relative w-full">
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <select
          value={selectedTime}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-gray-400 focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-200 appearance-none cursor-pointer"
        >
          <option value="" disabled className="bg-slate-800 text-gray-400">
            {placeholder}
          </option>
          {timeOptions.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
              className="bg-slate-800 text-white"
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      <style jsx>{`
        select::-webkit-scrollbar {
          width: 8px;
        }
        select::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }
        select::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }
        select::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};

export default TimeSelector;
