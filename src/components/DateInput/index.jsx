import React, { useState } from 'react';
import Calendar from '../Calendar';
import './DateInput.css';

const DateInput = () => {
  const [showCalendar, setShowCalendar] = useState(true);

  return (
    <div className="DateInputContainer">
      <div className="DateInputWrapper">
        <div className="DateInputLabel">

        </div>
        <div className="DateInputDisplay">
            Jul 22, 2020
        </div>
      </div>
      <div className="DateInputCalendar">
        {showCalendar && <Calendar />}
      </div>
    </div>
  );
};

export default DateInput;
