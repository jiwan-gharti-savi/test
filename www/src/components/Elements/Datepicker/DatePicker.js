import React, { useState } from "react";
import "./DatePicker.css";


class DatePicker extends React.Component {
  state = {
    startDate: "",
    endDate: "",
  };

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  render() {
    const { startDate, endDate } = this.state;
    return (
      <div>
        {/* <label>From:</label> */}
        <input
        className="custom-date-picker"
          type="date"
        //   name="startDate"
          value={startDate}
          onChange={this.handleChange}
        />
        {/* <label>To:</label>
        <input
          type="date"
          name="endDate"
          value={endDate}
          onChange={this.handleChange}
        /> */}
      </div>
    );
  }
}

export default DatePicker;