import React, { useEffect, useState } from 'react';
import './BlinkingCursor.css';


const BlinkingCursor = () => {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setShowCursor((prevShowCursor) => !prevShowCursor);
    }, 500); // Adjust the blinking speed as needed

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return <span className="dot"></span>;
};

export default BlinkingCursor;