import React from "react";
import DateTimeDisplay from "./DateTimeDisplay";
import { useCountdown } from "./hooks/useCountdown";
import "./Counter.css";
import Abstract from "../fallbackContainer/abstract/abstract";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

const ExpiredNotice = () => {
  return (
    <div className="expired-notice">
      <span>Expired!!!</span>
      <p>Please select a future date and time.</p>
    </div>
  );
};

const ShowCounter = ({
  days,
  hours,
  minutes,
  seconds,
  revise,
  sectionType,
  abstractCount = 4
}) => {
  return (
    <div className="counter-container">
      <div className="counter-abstracts-container">
        {Array.from({length:abstractCount},(_,index)=>
         <Abstract key={index} />
      )}
      </div>
      <>
        <div className="show-counter">
          <div className="countdown-link">
            {/* <DateTimeDisplay value={days} type={'Days'} isDanger={days <= 3} />
        <p>:</p>
        <DateTimeDisplay value={hours} type={'Hours'} isDanger={false} />
        <p>:</p> */}
            <DateTimeDisplay 
            value={minutes} 
            type={"Mins"} 
            isDanger={false} />
            <p className={minutes == 0 ? "mins" : ""}>:</p>
            <DateTimeDisplay
              value={seconds}
              type={"Seconds"}
              isDanger={false}
            />
          </div>
          <div
            className={`counter-tag-line ${
              revise ? " counter-tag-line--top" : ""
            }`}
          >
            {/* {revise ? (
              <p>
                Your Patience is Appreciated: New Estimated{" "}
                <span>{sectionType}</span> Generation Time
              </p>
            ) : (
              <p>
                 <span>{sectionType}</span> 
              </p>
            )} */}
            <p>
              <span>{sectionType}</span>
            </p>
          </div>
        </div>
      </>
    </div>
  );
};

const CountdownTimer = ({ targetDate, sectionType , abstractCount}) => {
  const [days, hours, minutes, seconds, revise] = useCountdown(targetDate);
  const timerMessages = useSelector((state) => state.projectData.timerMessages);
  const [messageIndex, setIndex] = useState(0);
  const [countSeconds, setSeconds] = useState(0);

  let count = 0;
  let incremetTime = targetDate / timerMessages?.[sectionType]?.length;
  useEffect(() => {
    let ID = setInterval(() => {
      if (count === timerMessages?.[sectionType]?.length - 1) {
        setIndex(0);
        count = 0;
      } else {
        setIndex((prevIndex) => prevIndex + 1);
        count++;
      }
    }, incremetTime);
  
    return () => clearInterval(ID);
  }, []);

  if (("days + hours + minutes + seconds <= 0", false)) {
    return <ExpiredNotice />;
  } else {
    return (
      <ShowCounter
        days={days}
        hours={hours}
        minutes={minutes}
        seconds={seconds}
        revise={revise}
        sectionType={timerMessages?.[sectionType]?.[messageIndex]}
        abstractCount = {abstractCount}
      />
    );
  }
};

export default CountdownTimer;
