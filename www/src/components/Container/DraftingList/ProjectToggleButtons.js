// ProjectToggleButtons.js

import "./drafting.css";
import archiveIcon from "../../assets/icons/archives.svg";
import archiveIconWhite from "../../assets/icons/archives_white.svg";
import activeIcon from "../../assets/icons/recent_projects.svg";
import activeIconWhite from "../../assets/icons/recent_projects_white.svg";
import cross from "../../assets/icons/cross-grey.svg";


import React from "react";
import MyButton from "../../Elements/MyButton/MyButton";

const ProjectToggleButtons = ({ projectType, selectedProjectsHandler, searchTerm, handleSearchChange, clearSearchTerm }) => {
  return (
    <div className="search-bar-container">
    <div className="search-box">
      <p>My Projects</p>
    </div>
    <div className="toggling-projects-btns">
    <div className="search-box">
    <input
        className="search-textbox"
        type="text"
        placeholder="Search Projects"
        onChange={(e) => handleSearchChange(e)}
        value = {searchTerm}
      />

     {searchTerm && <img onClick={clearSearchTerm} className="project-search-cancel-button" src={cross} alt="cross" />}
      </div>
      <MyButton
        className={`project-btn ${
          projectType === "active"
            ? " selected-project-button"
            : "unselected-button"
        }`}
        onClick={() => selectedProjectsHandler("active")}
        leftImageClass= "right-image"
      >
        <span>
        Active
        </span>
        <span>
        <img src={ projectType === "active" ? activeIconWhite : activeIcon } />
        </span>
       
      </MyButton>

      <MyButton
        // text="Inactive Projects"
        // leftImage={
        //   this.state.projectType === "inactive"
        //     ? archiveIcon : archiveIcon
        // }
        className={`project-btn ${
          projectType === "inactive"
            ? " selected-project-button"
            : "unselected-button"
        }`}
        onClick={() => selectedProjectsHandler("inactive")}
      >
        Archive
        <img src={ projectType === "active" ? archiveIcon : archiveIconWhite} />
      </MyButton>
    </div>
  </div>
  );
};

export default ProjectToggleButtons;
