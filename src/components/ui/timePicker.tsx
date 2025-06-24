import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const TimePicker = ({ value, onChange, onClose }) => {
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [selectedSecond, setSelectedSecond] = useState('00'); // Added seconds
  const [selectedPeriod, setSelectedPeriod] = useState('AM');

  // Parse existing time value when component mounts
  useEffect(() => {
    if (value) {
      const [hours, minutes, seconds = '00'] = value.split(':');
      const hour24 = parseInt(hours);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? 'PM' : 'AM';
      
      setSelectedHour(hour12.toString().padStart(2, '0'));
      setSelectedMinute(minutes);
      setSelectedSecond(seconds);
      setSelectedPeriod(period);
    }
  }, [value]);

  const handleTimeSelect = () => {
    // Convert 12-hour format to 24-hour format
    let hour24 = parseInt(selectedHour);
    if (selectedPeriod === 'AM' && hour24 === 12) {
      hour24 = 0;
    } else if (selectedPeriod === 'PM' && hour24 !== 12) {
      hour24 += 12;
    }
    
    // Include seconds in the time string
    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute}:${selectedSecond}`;
    onChange(timeString);
    onClose();
  };

  // Generate hour options (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  
  // Generate minute options (00-59)
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
  
  // Generate second options (00-59)
  const seconds = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border relative z-[60]">
      <div className="flex flex-col space-y-4">
        <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Time
        </div>
        
        <div className="flex justify-center space-x-2 items-end">
          {/* Hour Selector */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500 mb-1">Hour</label>
            <select 
              value={selectedHour}
              onChange={(e) => setSelectedHour(e.target.value)}
              className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-[70]"
              style={{ zIndex: 70 }}
            >
              {hours.map(hour => (
                <option key={hour} value={hour}>{hour}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <span className="text-lg font-bold">:</span>
          </div>

          {/* Minute Selector */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500 mb-1">Minute</label>
            <select 
              value={selectedMinute}
              onChange={(e) => setSelectedMinute(e.target.value)}
              className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-[70]"
              style={{ zIndex: 70 }}
            >
              {minutes.map(minute => (
                <option key={minute} value={minute}>{minute}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <span className="text-lg font-bold">:</span>
          </div>

          {/* Second Selector */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500 mb-1">Second</label>
            <select 
              value={selectedSecond}
              onChange={(e) => setSelectedSecond(e.target.value)}
              className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-[70]"
              style={{ zIndex: 70 }}
            >
              {seconds.map(second => (
                <option key={second} value={second}>{second}</option>
              ))}
            </select>
          </div>

          {/* AM/PM Selector */}
          <div className="flex flex-col items-center">
            <label className="text-xs text-gray-500 mb-1">Period</label>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-16 h-10 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-[70]"
              style={{ zIndex: 70 }}
            >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleTimeSelect}
            className="px-4 bg-blue-600 hover:bg-blue-700"
          >
            Select
          </Button>
        </div>
      </div>
    </div>
  );
};

TimePicker.displayName = "TimePicker"

export default TimePicker;