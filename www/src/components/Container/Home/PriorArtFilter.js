import React, { useEffect } from "react";;
import "./Home.scss";

import CountryFilter from "../../Elements/CountryFilter/CountryFilter";

function PriorArtFilter(props) {
  const { explorePriorArtHandler, handleCountrySelector, handleDateChangeHandler, dateTypeHandler, filterToggleHandler, patentKeywordsHandler, dateType, patentStatus, patentKeywords, selectedCountries, stateHandler } = props;
  return (
    <div className="home-prior-artfilter-outer-container">
      <CountryFilter
        {...props}
        explorePriorArtHandler={explorePriorArtHandler}
        handleCountrySelector={handleCountrySelector}
        handleDateChangeHandler={handleDateChangeHandler}
        selectedDateTypeHandler={dateTypeHandler}
        cancelFilterHandler={filterToggleHandler}
        patentKeywordsHandler={patentKeywordsHandler}
        dateType={dateType}
        patentStatus={patentStatus}
        patentKeywords={patentKeywords}
        selectedCountries={selectedCountries}
        stateHandler={stateHandler}
      />
    </div>
  );
}

export default PriorArtFilter;
