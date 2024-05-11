import React, { Component } from "react";
import Modal from "react-modal";
// import "./getPrompt.css";
import "./getPrompt.css";
//import close_icon from "../components/assets/icons/close_new.svg";
import cancel_icon from "../../assets/icons/cancel.svg";
import info from "../../assets/icons/info_white.svg";
import { connect } from "react-redux";
import { limitExceed, inLimit, toggleModal } from "../../../store/action";

import { Col, Container, Row } from "reactstrap";
import MyButton from "../../Elements/MyButton/MyButton";

class OverlayButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOverlay: false,
      promptTextAreaValue: "",
      promptTextAreaInitalValue: "",
      charLength: 0
    };
    this.handleTextareaChange = this.handleTextareaChange.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.promptObj !== state.promptTextAreaInitalValue) {
      function countWords(str) {
        str = str.trim();
        return str.split(/\s+/).length;
      }
      let wordCount;
      if (props.promptObj && props.promptObj['prompt'].length > 0) {
        wordCount = countWords(props.promptObj['prompt']);
      } else {
        wordCount = 0;
      }

      return {
        promptTextAreaValue: props.promptObj ? props.promptObj['prompt'] : "",
        promptTextAreaInitalValue: props.promptObj,
        charLength: wordCount
      };
    }
    return null; // No change to state
  }
  closeModal() {
    this.props.togglingModal();
    this.props.inputInLimit();
  }

  handleChange(event) {
    this.setState({ inputValue: event.target.value });
  }

  handleSave(event) {
    this.closeModal();
  }
  componentDidMount() {
    this.props.inputInLimit();
  }


  handleTextareaChange = (e) => {
    var promptTextAreaValue = e;
    this.setState({ promptTextAreaValue: promptTextAreaValue });
    function countWords(str) {
      str = str.trim();
      return str.split(/\s+/).length;
    }

    var wordLimitPrompt = 3000;
    if (this.props.project?.config?.wordLimitPrompt) {
      wordLimitPrompt = parseInt(this.props.project.config.wordLimitPrompt);
    }

    let wordCount = countWords(promptTextAreaValue);
    if (promptTextAreaValue) {
      this.setState({ charLength: wordCount })
    } else {
      this.setState({ charLength: 0 })
    }

    if (wordCount > wordLimitPrompt) {
      this.props.inputExceed();
    } else {
      this.props.inputInLimit();
    }
    if (wordCount <= wordLimitPrompt) {
      this.setState({ charLength: wordCount })
    }
    else if (wordCount >= wordLimitPrompt) {
      this.setState({ charLength: wordLimitPrompt })
    }
  };

  handleButtonClick = () => {
    const final_prompt_text =
      this.state.promptTextAreaValue === ""
        ? this.props.promptObj?.['prompt']?.['content']
        : this.state.promptTextAreaValue;
    this.props.sample(final_prompt_text);
    this.closeModal();
    this.setState({promptTextAreaValue : ""});
  };

  // componentWillMount()
  // {
  //   window.scroll({ top: 0, left: 0, behavior: 'instant' });
  //   console.log("mount")
  // }
  render() {
    const link = window.location.href;
    const parts = link.split("/");
    const { promptObj } = this.props;
    const { promptTextAreaValue } = this.state;

    var wordLimitPrompt = 3000;
    if (this.props.project?.config?.wordLimitPrompt) {
      wordLimitPrompt = parseInt(this.props.project.config.wordLimitPrompt);
    }

    return (
      <Container>
        <Modal
          isOpen={this.props.modalIsOpen}
          className="react-modal prompt-model"
          onRequestClose={this.handleSave}
          appElement={document.getElementById('root')}
        >
          <div className="prompt-main-container">
            {/* <button
              type="button"
              className="PromptButton"
              onClick={this.handleSave}
            >
              <img src={cancel_icon} alt="close_icon" className="close_icon" />
            </button> */}

            <MyButton
              type="button"
              className="PromptButton"
              onClick={this.handleSave}
              rightImage={cancel_icon}
              rightImageClass="close_icon"
            />

            <div className="prompt-cont" >
              <div>
                <span>
                  <div className="prompt-title">Prompt</div>
                </span>
                <span className="textarea-span">
                  <div className="div-bar" ></div>
                  <span className="prompt-version" >Version #{`${this.props.version}`}</span>
                  <textarea
                    type="text"
                    className="prompt-edit-text-box"
                    // defaultValue={promptObj}
                    value={promptTextAreaValue}
                    onChange={(e) => this.handleTextareaChange(e.target.value)}
                  // onChange={(event) => this.handleTextareaChange(event)}
                  />
                </span>
              </div>

              <Row className="generate-button-section">
                <div>
                  <div className="input-char-prompt">
                    <span>{`${this.state.charLength}`}</span><span>{`/${wordLimitPrompt}`}</span>
                  </div>
                  {this.props.isInputExceed && (
                    <div
                      className="caution-container"
                      style={{ marginLeft: "0px" }}
                    >
                      {" "}
                      <p className="caution">
                        {" "}
                        <img className="info" src={info} /> Too many Characters.
                        The limit is {wordLimitPrompt} words.
                      </p>
                    </div>
                  )}
                </div>
                <Col className="button-options">
                  <MyButton
                    text="Cancel"
                    className="clear-button"
                    onClick={this.handleSave}
                  />
                  <MyButton
                    text="Generate"
                    className="generate-button"
                    disabled={this.props.isInputExceed || this.state.promptTextAreaValue.trim().length<=0}
                    onClick={this.handleButtonClick}
                  />
                </Col>
              </Row>
            </div>
          </div>
        </Modal>
      </Container>
      // )
      // )
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isInputExceed: state.inputLimitReducer.limitExceed,
    modalIsOpen: state.modalReducer.isOpen,
    project: state.projectData,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    inputExceed: (data) => dispatch(limitExceed()),
    inputInLimit: (data) => dispatch(inLimit()),
    togglingModal: () => dispatch(toggleModal()),
  };
};

