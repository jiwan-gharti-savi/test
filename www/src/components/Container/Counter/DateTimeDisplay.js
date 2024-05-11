import React from 'react';
import './Counter.css';

const DateTimeDisplay = ({ value, type, isDanger }) => {
  const formattedValue = value < 10 ? `0${value}` : value;
  return (
    <div className={type == "Mins" &&  value == 0 ? 'countdown mins' : 'countdown'}>
      <p>{formattedValue}</p>
      <span>{type}</span>
    </div>
  );
};

export default DateTimeDisplay;
