import React, { useState, useEffect } from 'react';


const FlagSelector = () => {
  const [flag, setFlag] = useState("usFlag");

  useEffect(() => {
    const userLocale = navigator.language || navigator.languages[0];
    const isEuropean = userLocale.includes('-') && userLocale.split('-')[1] === 'EU';
    console.log("LANGUAGE",userLocale,isEuropean);
    setFlag(isEuropean ? "euFlag" : "usFlag");
  }, []);

  return (
    <div>
      {/* <img src={flag} alt="Flag" /> */}
      {flag}
    </div>
  );
};

export default FlagSelector;