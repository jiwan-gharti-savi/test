import React, { useEffect } from "react";
import "./Home.scss";
import right_arrow_icon from "../../assets/icons/arrow_submit.svg";
import MyButton from "../../Elements/MyButton/MyButton";



function DraftButton({ isInputExceed, solCharLengthExceed, patentLanguage, claims, submitHandler, languageHandler ,uploadRefrenceFiles, activeTab}) {
  return (
    <MyButton
      disabled={isInputExceed || solCharLengthExceed || uploadRefrenceFiles }
      className="create-button"
      onClick={() => submitHandler("claims", patentLanguage)}
    >
      {activeTab === "draftPatent" ? "Draft Patent" : "Draft Claims"}
      <span onClick={(e) => languageHandler(e, "us")}
            className={patentLanguage === "us" ? "home-selected-language-button" : "home-language-button"}
            title="Select US patent style">
        US
      </span>
      <span onClick={(e) => languageHandler(e, "eu")}
            className={patentLanguage === "eu" ? "home-selected-language-button" : "home-language-button"}
            title="Select EU patent style">
        EP
      </span>
      <span className="arrow-block">
        <img src={right_arrow_icon} className="right_arrow_icon" alt="arrow-icon" />
      </span>
    </MyButton>
  );
}

export default DraftButton;
