import React, { Component } from "react";
import Modal from "react-modal";
import "../Prompt//getPrompt.css"
import close_icon from "../../assets/icons/cancel.svg";
import axios from "axios";
import { connect } from "react-redux";
import { toggleClaimsEditModal } from "../../../store/action";
import "./generateClaimsOverlay.css";
class ClaimsOverlay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showOverlay: false,
      modalIsOpen: false,
      textareaValue: "",
      solTextVal:"",
      initialVal:"",
      isOpen: false,
      selectedOption: ''
    };
    // this.handleClick = this.handleClick.bind(this);
    // this.handleTextareaChange = this.handleTextareaChange.bind(this);
    // this.handleButtonClick = this.handleButtonClick.bind(this);
    this.closeModal = this.closeModal.bind(this);
    // this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
  }

  closeModal() {
    this.props.toggalClaimsOverlay();
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

  handleSolChange =(e) =>
  {
    let promptTextAreaValue = e;
    this.setState({
      solTextVal: promptTextAreaValue,
    });
  }

  handleButtonClick = () => {
    this.closeModal();
   this.props.claimsGenaratehandler(this.state.selectedOption);

  };


  toggleDropdown = () => {
    this.setState(prevState => ({
      isOpen: !prevState.isOpen
    }));
  }

  selectOption = (option) => {
    this.setState({
      selectedOption: option,
      isOpen: false
    });
  }


  render() {
    const { textareaValue } = this.state;
    const options = ['Option 1', 'Option 2', 'Option 3', 'Option 4', 'Option 5', 'Option 6', 'Option 7', 'Option 8', 'Option 9', 'Option 10', 'Option 11', 'Option 12'];

    return (
      <div>
        <Modal
          isOpen={this.props.isOpen}
          className="react-modal prompt-model patent-detail-modal"
          onRequestClose={this.handleSave}
          appElement={document.getElementById("root")}
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
              
                <div>
                  <span>
                    <div className="prompt-title heading-underline">Generate Claims</div>
                  </span>
                </div>
              

              <div className="claims-gen-cont">
                <div className="drop-down-cont">
                  <span className="content-heading" >Select Prior art Patent</span>
                  {/* dropdown */}
                  <div className="dropdown">
                    <button className="dropbtn" onClick={this.toggleDropdown}>
                      {this.state.selectedOption.pn || "Select Prior-art patent"}
                    </button>
                    {this.state.isOpen && (
                      <div className="dropdown-content">
                        {this.props.priorArtData.map((data, index) => (
                          <div
                            key={index}
                            onClick={() => this.selectOption(data)}
                          >
                           <span>#{index+1}</span> {data.pn}
                           {/* <div>{data.title}</div> */}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="or-cont" >
                    <span>(OR)</span>
                </div>
                <div className="input-box-cont">
                  <span className="content-heading" >Enter patent number</span>
                  <input className="input-box"  type="text"></input>
                </div>
              </div>

              <div className="generate-button-section home-generate">
                {/* <button className="generate-button" onClick={this.handleSave}>
                  Cancel
                </button> */}
                <div></div>
                <button
                  className={"generate-button "}
                  onClick={this.handleButtonClick}
                  // disabled={true}
                >
                  Generate Claims
                </button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    // project: state.projectData,
      isOpen: state.genrateClaimsModalRed.isOpen,
  };
};

const mapDispatchToProps = (dispatch) =>
{
  return{
    toggalClaimsOverlay : () => dispatch(toggleClaimsEditModal())
  }
}

export default connect(mapStateToProps,mapDispatchToProps) (ClaimsOverlay);
