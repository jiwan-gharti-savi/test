import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col } from "reactstrap";
import "./Home.scss";
import Abstract from "../fallbackContainer/abstract/abstract";
import CountdownTimer from "../Counter/CountdownTimer";

import info from "../../assets/icons/info_white.svg";

const InventionClaimInput = ({
  charLength,
  invention,
  claims,
  searchHandler,
  inputClaimHandler,
  additionalProps,
  uploadRefrenceFiles,
  isDraftClaimAccess,
  activeTab,
  key,
}) => {

  const [textareaHeights, setTextareaHeights] = useState({
    claims: '100px',
    invention: '100px',
    // Add more textareas as needed
  });

  const textAreaRefs = {
    claims: useRef(null),
    invention: useRef(null),
    // Initialize more refs as needed
  };

  let wordLimt = 3000;
  if (additionalProps.project?.config?.wordLimt) {
    wordLimt = parseInt(additionalProps.project.config.wordLimt);
  }


  const handleTextareaResize = (event) => {
    const { name, scrollHeight } = event.target;
    updateTextareaHeight(name, scrollHeight);
  };

  const updateTextareaHeight = (name, scrollHeight) => {
    const minHeight = parseInt(textareaHeights[name], 10) || 150;
    const newHeight = `${Math.max(minHeight, scrollHeight)}px`;
    setTextareaHeights(prevHeights => ({
      ...prevHeights,
      [name]: newHeight
    }));
  };


  useEffect(()=>{
    if(claims.trim().length === 0){
      setTextareaHeights(prevHeights => ({
        ...prevHeights,
        'claims': '100px'
      }));
    }if(invention.trim().length === 0){
      setTextareaHeights(prevHeights => ({
        ...prevHeights,
        'invention': '100px'
      }));
    }

  },[claims,invention])

  return (
    <Row className="gap-4">
      <>
        {isDraftClaimAccess && activeTab === "draftPatent" && (
          <>
            <Col lg={12}>
              <div className="home-input-box-heading">
                <span>Claims</span>
              </div>
              <div className="textarea-cont">
                <textarea
                  name = 'claims'
                  style={{ height: textareaHeights.claims, resize: "revert-layer", }}
                  className="home-textarea-containers home-textarea-claims"
                  type="text"
                  placeholder="Enter your Claims"
                  onChange={(event) => inputClaimHandler(event.target.value)}
                  value={claims}
                  onInput={handleTextareaResize}
                ></textarea>
              </div>
            </Col>
          </>
        )}

        <Col>
          <div className="home-input-box-heading">
            <span>
              {activeTab === "draftClaims"
                ? "Derived From Input"
                : "Invention (optional)"}{" "}
            </span>
            <div className="input-char">
              <span>{`${charLength}`}</span>
              <span>{`/${wordLimt}`}</span>
              {additionalProps?.isInputExceed && (
                <div className="caution-container">
                  <p className="caution caution-width">
                    {" "}
                    <img className="home-page-info" src={info} /> Too many
                    words. The limit is {wordLimt} words.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="textarea-cont">
            <>
              <textarea
                name = 'invention'
                style={{ height: textareaHeights.invention, resize: "revert-layer", }}
                className="home-textarea-containers home-textarea-invention"
                type="text"
                placeholder={
                  activeTab === "draftClaims"
                    ? ""
                    : "Enter your Invention"
                }
                onChange={(event) => searchHandler(event.target.value)}
                value={invention}
                onInput={handleTextareaResize}
              ></textarea>
            </>
          </div>
        </Col>
      </>
    </Row>
  );
};

export default InventionClaimInput;
