import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

interface DatePickerComponentProps {
  selectedDate: string | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  required?: boolean;
}

const DatePickerComponent: React.FC<DatePickerComponentProps> = ({
  selectedDate,
  onChange,
  placeholder = 'Select date',
  required = false,
}) => {
  return (
    <div className="relative w-full">
      <style jsx global>{`
        /* Input */
        .react-datepicker-wrapper {
          width: 100%;
          max-width: 100%;
        }
        .react-datepicker__input-container {
          width: 100%;
          max-width: 100%;
          position: relative;
        }
        .react-datepicker__input-container input {
          width: 100%;
          max-width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
          background-color: rgba(255, 255, 255, 0.8);
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          font-size: 0.875rem;
          color: #111827;
          transition: all 0.3s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .dark .react-datepicker__input-container input {
          border-color: #374151;
          background-color: rgba(31, 41, 55, 0.8);
          color: #ffffff;
        }
        .react-datepicker__input-container input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
        }
        .dark .react-datepicker__input-container input:focus {
          border-color: #818cf8;
          box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.4);
        }

        /* Popper dropdown full width */
        .react-datepicker-popper {
          width: 100% !important;
          max-width: 100% !important;
          inset: auto !important;
          transform: none !important;
        }

        /* Calendar container */
        .react-datepicker {
            width: 100% !important;
            max-width: 100% !important;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
            font-size: 0.875rem;
            display: flex; /* Ensure flex layout for internal alignment */
            flex-direction: column;
        }
        .dark .react-datepicker {
            border-color: #374151;
            background-color: #1f2937;
            color: #ffffff;
        }

        /* Header full width */
        .react-datepicker__header {
          display: flex;
          justify-content: space-between; /* arrows left/right */
          align-items: center;
          width: 100%;
          max-width: 100%;
          left: 0;
          right: 0;
          background-color: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
          padding: 0.5rem 2rem;
        }
        .dark .react-datepicker__header {
          background-color: #2d3748;
          border-bottom: 1px solid #4b5563;
        }

        .react-datepicker__current-month {
          font-weight: 600;
          font-size: 1rem;
          text-align: center;
          flex: 1; /* take remaining space */
        }

        .react-datepicker__navigation--previous {
          left: 0;
        }
        .react-datepicker__navigation--next {
          right: 0;
        }

        /* Weekday names row */
        .react-datepicker__day-names {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          margin: 0.25rem 0;
          width: 100%;
        }
        .react-datepicker__day-name {
          font-weight: 600;
          padding: 0.75rem 1.9rem;
        }

        /* Days grid */
        .react-datepicker__month {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 0;
            width: 100% !important; /* Ensure full width */
            max-width: 100% !important;
            padding: 0.5rem; /* Adjusted padding for consistency */
            box-sizing: border-box; /* Ensure padding doesn't affect width */
        }
        .react-datepicker__week {
          display: contents;
        }
        .react-datepicker__day {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 3rem;
          padding: 0 1.9rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
        }

        /* Selected + hover states */
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #6366f1;
          color: #ffffff;
        }
        .dark .react-datepicker__day--selected,
        .dark .react-datepicker__day--keyboard-selected {
          background-color: #818cf8;
        }
        .react-datepicker__day:hover {
          background-color: #e5e7eb;
        }
        .dark .react-datepicker__day:hover {
          background-color: #4b5563;
        }

        /* Calendar icon */
        .calendar-icon {
          position: absolute;
          top: 50%;
          left: 0.75rem;
          transform: translateY(-50%);
          color: #6b7280;
        }
        .dark .calendar-icon {
          color: #9ca3af;
        }
      `}</style>

      <div className="relative w-full max-w-full">
        <Calendar className="calendar-icon h-5 w-5 cursor-pointer" />
        <DatePicker
          selected={selectedDate ? new Date(selectedDate) : null}
          onChange={(date) => onChange(date)}
          dateFormat="yyyy-MM-dd"
          className="w-full max-w-full"
          placeholderText={placeholder}
          required={required}
          showPopperArrow={false}
          popperClassName="w-full max-w-full"
          calendarClassName="w-full max-w-full"
        />
      </div>
    </div>
  );
};

export default DatePickerComponent;