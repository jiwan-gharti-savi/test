import React, { useState } from "react";
import Select from "react-select";

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

const Filters = (props) => {
  const [selectedOption, setSelectedOption] = useState(null);

  const selectHandler = (data) =>{
    setSelectedOption(data.value)
  }
  console.log("setSelectedOption",selectedOption);

  return (
    <div className="App">
      <Select
        defaultValue={selectedOption}
        onChange={selectHandler}
        options={props.options}
        placeholder = {props.placeholder}
        isMulti
        className = {props.classes}
      />
    </div>
  );
};

export default Filters;
