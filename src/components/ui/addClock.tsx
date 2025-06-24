import React, { useState } from 'react';

const AddClock = () => {
    const [selectedTime, setSelectedTime] = useState('');

    const handleTimeChange = (event) => {
        setSelectedTime(event.target.value);
    };

    return (
        <div className="time-picker-container">
            <label htmlFor="time-input">Select Birth Time:</label>
            <input
                type="time"
                id="time-input"
                value={selectedTime}
                onChange={handleTimeChange}
                className="time-input"
                required
            />
            <p>Selected time: {selectedTime}</p>
        </div>
    );
};

export default AddClock;