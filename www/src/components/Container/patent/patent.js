import React, { Component } from "react";
import { Link } from "react-router-dom";

class patent extends Component {


  render() {

  const dateString = this.props.date;
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = date.getMonth() + 1; 
  const day = date.getDate(); // 22
  const hours = date.getHours(); 
  const minutes = date.getMinutes(); 
  const ampm = hours >= 12 ? 'PM' : 'AM'; 
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;

    return (
      <div className="patent">
        <Link to={`/patentDetails/${this.props.Id}`}>
          <span>  <h6>{this.props.Title}</h6>
          </span>
        </Link>
        <h6> {formattedDate} </h6>
      </div>
    );
  }
}

export default patent;