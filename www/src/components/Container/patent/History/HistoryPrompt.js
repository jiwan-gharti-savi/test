import { Container, Row, Col } from "reactstrap";
import "./HistoryPrompt.scss";
import MyButton from "../../../Elements/MyButton/MyButton";

import React, { Component, useState } from "react";
import Modal from "react-modal";
import cancel_icon from "../../../assets/icons/cancel.svg";
import info from "../../../assets/icons/info_white.svg";
import arrow from "../../../assets/icons/arrow_submit.svg";
import { connect } from "react-redux";
import { limitExceed, inLimit, toggleModal } from "../../../../store/action";
import { useSelector, useDispatch } from "react-redux";

const HistoryPrompt = (props) => {
  var wordLimitPrompt = 3000;
  const [charLength, setCharLength] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [promptTextAreaValue, setPromptTextAreaValue] = useState("");
  const [isInputExceed, setIsInputExceed] = useState(false);

//   const isInputExceed = useSelector(
//     (state) => state.inputLimitReducer.limitExceed
//   );


var wordLimitPrompt = 3000;
  const handleTextareaChange = (e) => {
    var text = e;
    setPromptTextAreaValue(text)
    function countWords(str) {
      str = str.trim();
      return str.split(/\s+/).length;
    }

    if (props.project?.config?.wordLimitPrompt) {
      wordLimitPrompt = parseInt(props.project.config.wordLimitPrompt);
    }

    let wordCount = countWords(text);
    if (text) {
      setCharLength(wordCount)
    } else {
      setCharLength(0)
    }

    if (wordCount > wordLimitPrompt) {
      setIsInputExceed(true);
    } else {
      setIsInputExceed(false)
    }
    // if (wordCount <= wordLimitPrompt) {
    //   setCharLength(wordCount)
    // }
    // else if (wordCount >= wordLimitPrompt) {
    //   setCharLength(wordLimitPrompt)
    // }
  };

  const generateClickHandler = () => {
    const final_prompt_text =
      promptTextAreaValue === ""
        ? props.promptObj?.['prompt']?.['content']
        : promptTextAreaValue;
    props.sample(final_prompt_text);
    setPromptTextAreaValue("");
    setCharLength(0);
    props.updateActiveTabHandler("history-tab")
  };


  return (
    <Container fluid>
      <Row>
        <Col lg={12} className="history-prompt-textarea-container">
          <textarea
           onChange={(e) => handleTextareaChange(e.target.value)} 
           value={promptTextAreaValue}
           ></textarea>
          <div>
            <div className="history-prompt-input-char-prompt">
              <span>{`${charLength}`}</span>
              <span>{`/${props.project.config.wordLimitPrompt ? props.project.config.wordLimitPrompt : wordLimitPrompt}`}</span>
            </div>
            {isInputExceed && (
              <div
                className="history-prompt-caution-container"
                style={{ marginLeft: "0px" }}
              >
                {" "}
                <p className="history-prompt-caution">
                  {" "}
                  <img className="info" src={info} /> Too many Characters. The
                  limit is {props.project.config.wordLimitPrompt ? props.project.config.wordLimitPrompt : wordLimitPrompt} words.
                </p>
              </div>
            )}
          </div>
        </Col>
        <Col className="history-prompt-button-container">
          <MyButton
            text="Clear"
            className="clear-button"
            // onClick={this.handleSave}
          />
          <MyButton
            text="Generate"
            className="generate-button"
            disabled={
              isInputExceed ||
              promptTextAreaValue.trim().length <= 0
            }
            onClick={generateClickHandler}
            rightImage={arrow}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default HistoryPrompt;