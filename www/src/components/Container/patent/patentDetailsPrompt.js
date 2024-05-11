import React, { Component } from "react";
import Modal from "react-modal";
import "../Prompt//getPrompt.css"
import close_icon from "../../assets/icons/cancel.svg";
import axios from "axios";
import { connect } from "react-redux";
import { togglePatentEditModal } from "../../../store/action";
import MyButton from "../../Elements/MyButton/MyButton";
import { Container, Row, Col } from "reactstrap";

class OverlayButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOverlay: false,
      modalIsOpen: false,
      textareaValue: "",
      initialVal:"",
    };
    // this.handleClick = this.handleClick.bind(this);
    // this.handleTextareaChange = this.handleTextareaChange.bind(this);
    // this.handleButtonClick = this.handleButtonClick.bind(this);
    this.closeModal = this.closeModal.bind(this);
    // this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  closeModal() {
    this.props.toggleOverlay();
  }


  handleSave(event) {
    this.closeModal();
  }

  // handleClick() {
  //   this.setState((prevState) => ({
  //     modalIsOpen: !prevState.modalIsOpen,
  //   }));
  // }

  static getDerivedStateFromProps(props, state) {
    if (props.text !== state.initialVal) {
      return {
        textareaValue: props.text ? props.text : "",
        initialVal : props.text ? props.text : ""
      };
    }
    return null; // No change to state
  }


  save() {
    this.props.sample("hello");
  }

  CallApi = async (text) => {
    this.props.addUserId(localStorage.getItem("user_id"));
    let user_id = localStorage.getItem("user_id");
  };

  handleProbChange = (e) => {
    let promptTextAreaValue = e;
    this.setState({
      textareaValue: promptTextAreaValue,
    });
  };



  handleButtonClick = () => {
    // this.props.sample(
    //   this.state.textareaValue ? this.state.textareaValue : this.props.text
    // );
    this.props.regenrate(this.state.textareaValue);
    this.props.toggleOverlay();
  };

  render() {
    const { textareaValue } = this.state;
    return (
      <Container>
        <Modal
          isOpen={this.props.isOpen}
          className="react-modal prompt-model patent-detail-modal"
          onRequestClose={this.handleSave}
          appElement={document.getElementById('root')}
        >
          <div className="prompt-main-container">
            <button
              type="button"
              className="PromptButton"
              onClick={this.handleSave}
            >
              <img src={close_icon} alt="close_icon" className="close_icon" />
            </button>
            <div>
              {
                <div>
                  <span>
                    <div className="prompt-title">Prompt</div>
                  </span>
                  <span className="text-area-cont" >
                    <textarea
                    placeholder="Enter your Invention"
                      type="text"
                      className="prompt-edit-text-box patent-text-area"
                      value={
                        this.state.textareaValue
                      }
                      onChange={(e) =>
                        this.handleProbChange(e.target.value)
                      }
                    />
                  </span>
                </div>
              }
              <Row>
                
        
              <Col>
              <div className="generate-button-section home-generate">
                {/* <button className="clear-button" onClick={this.handleSave}>
                  Cancel
                </button>
                <button
                  className={"generate-button "}
                  onClick={this.handleButtonClick}
                  // disabled={true}
                >
                  Generate
                </button> */}
                <MyButton 
                    className="clear-button"
                    onClick={this.handleSave}
                    text={" Cancel"}
                  />
                  <MyButton 
                    className="generate-button"
                    onClick={this.handleButtonClick}
                    text={ `${this.props?.type == 'claims' ? "Save" : "Generate"}` }
                    // disabled={true}
                  />

              </div>
              </Col>
              </Row>
            </div>
          </div>
        </Modal>
      </Container>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    // project: state.projectData,
      isOpen: state.patentEditModalRed.isOpen,
  };
};

const mapDispatchToProps = (dispatch) =>
{
  return{
    toggleOverlay: () => dispatch(togglePatentEditModal()),
  }
}

export default connect(mapStateToProps,mapDispatchToProps) (OverlayButton);
