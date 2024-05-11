// NoProjectDataMessage.js
import React from 'react';

import "./drafting.css";
import no_data_image from "../../assets/icons/not_create.svg";
const NoProjectDataMessage = ({ projectType }) => {
  return (
    <div className="no-project-data-container">
      <div className="no_project_data_title">
        <span>{`Hey, looks like you have no ${projectType} projects yet.`}</span>
      </div>
      <img src={no_data_image} alt="no_project_data_image" className="no_project_data_image" />
    </div>
  );
};

export default NoProjectDataMessage;
