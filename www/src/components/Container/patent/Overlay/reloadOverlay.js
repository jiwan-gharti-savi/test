import React from "react";
import Modal from "react-modal";
import "./reloadOverlay.css";
import info from "../../../assets/icons/info_orange.svg";
import arrow from "../../../assets/icons/arrow_submit.svg";
import cross from "../../../assets/icons/cross.svg";
import close_icon from "../../../assets/icons/close_new_orange.svg";
import { toggleRetryOverlay, closeOverlay } from "../../../../store/action";
import { connect } from "react-redux";

class ReloadOverlay extends React.Component {
  constructor(props) {
    super(props);
  }

  closeOverLayHandler = () => {
    this.props.toggleOverlay();
  }

  retryApis = () => {
    this.props.retry();
    this.props.toggleOverlay();
  }

  componentWillUnmount() {
    this.props.closeOverlay();
    document.body.style.overflow = "unset";
  }

  closeModal = () => {
    this.props.toggleOverlay();
  }


  render() {

    if (this.props.isOpen) {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    }
    else{
      document.body.style.overflow = "unset";
    }

    return (
      <Modal
        // onRequestClose={this.closeOverLayHandler}
        className="reload-overlay-modal"
        isOpen={this.props.isOpen}
        appElement={document.getElementById('root')}
      >
        <div className="overlay-content-container">
          <p>
            {" "}
            <img src={info} /> Failed to load data
          </p>
          <img src={close_icon} className="occ-close-overloaded" onClick={this.closeModal} />
          <span>Please Retry</span>
          {/* <span> Sorry about that!</span> */}

          <span
            onClick={this.retryApis}
            className={`hs-version-num selected_version regen-button p_retry retry-button retry-hover`}
          >
            <span className="version-title">Retry</span>

            <span className="arrow-block">
              <img src={arrow} className="right_arrow_icon" alt="arrow-icon" />
            </span>
          </span>
        </div>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isOpen: state.modalReducer.retryOverlay,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleOverlay: () => dispatch(toggleRetryOverlay()),
    closeOverlay: () => dispatch(closeOverlay())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ReloadOverlay);
