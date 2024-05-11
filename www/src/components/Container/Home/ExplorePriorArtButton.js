import React, { useEffect } from "react";
import right_arrow_icon from "../../assets/icons/arrow_submit.svg";
import "./Home.scss";
import MyButton from "../../Elements/MyButton/MyButton";


function ExplorePriorArtButton({ isInputExceed, solCharLengthExceed, filterToggleHandler, uploadRefrenceFiles }) {
  return (
    <MyButton
      disabled={isInputExceed || solCharLengthExceed || uploadRefrenceFiles}
      className="create-button explore-prior-art explore-prior-art-button prior-art-button-firefox-fix"
      onClick={filterToggleHandler}
      id="explore-prior-art-button"
    >
      Explore Prior Art
      <span className="arrow-block">
        <img src={right_arrow_icon} className="right_arrow_icon" alt="arrow-icon" />
      </span>
    </MyButton>
  );
}

export default ExplorePriorArtButton;
