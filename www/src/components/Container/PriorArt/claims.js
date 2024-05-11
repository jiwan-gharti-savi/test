import React, { Component } from "react";
import axios from "axios";
import back_icon from "../../assets/icons/back.svg";
import { Link } from "react-router-dom";
import classes from "../patent/patentDetails.module.css";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import apiServices from "../../../services/apiServices";
import Abstract from "../fallbackContainer/abstract/abstract";
import info from "../../assets/icons/info_orange.svg";
import Prompt from "../patent/patentDetailsPrompt";

class Claims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValDataBase: "",
      claims: "",
      claimsErrorMessage: "",
      claimsLongErrorMessage: "",
      claimsLoading: true,
    };
  }

  componentWillMount() {
    if (!this.props.match?.params?.new) {
        this.checkUserAccessToProject();
    } else {
      this.get_invention_title();
      this.getClaims();
    }
  }

  getClaims = async () => {
    this.setState({ claimsErrorMessage: "",claimsLoading: true });
    try {
      const url_id = this.props.match?.params?.id;
      // let sectionData = await axios.post(
      //   this.props.project?.api_config?.endpoints?.select_one_section,
      //   {
      //     project_id: url_id,
      //   }
      // );

      let sectionData = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_one_section,
        {
          project_id: url_id,
        }
      )

      const isClaims = (arr) => {
        let added = "";
        arr.forEach((data)=>
        {
          if(data.section_type == "Claims" && data.is_error == "Success")
          {
            added = data["text"];
          }
        })
        return added;
      };

      let addedClaims = isClaims(sectionData.response);

      if (addedClaims) {
        this.setState({ claims: addedClaims, claimsLoading: false });
      } else {
        // let project_data = await axios.post(
        //   this.props.project?.api_config?.endpoints?.get_invention_title,
        //   {
        //     project_id: url_id,
        //   }
        // );

        let project_data = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.get_invention_title,
          {
            project_id: url_id,
          }
        )

        let inputValDataBase =
          project_data["response"]["invention_title"];
        let apiData = {
          data: inputValDataBase,
          project_id: url_id,
        };
        // let getClaims = await axios.post(
        //   this.props.project?.api_config?.endpoints?.get_claims,
        //   apiData
        // );

        let getClaims = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.get_claims,
          apiData
          )

        if (getClaims.status == "Error") {
          this.setState({
            claimsErrorMessage: getClaims["message"],
            claimsLoading: false,
            claimsLongErrorMessage: getClaims["message_long"],
          });
        } else {
          this.setState({
            claims: getClaims.response,
            claimsLoading: false,
          });
        }
      }
    } catch (e) {
      console.log(e);
      this.setState({
        claimsErrorMessage: "Failed to create.",
        claimsLoading: false,
        claimsLongErrorMessage: "Failed to create. Please try again. Thank you.",
      });
    }
  };

  get_invention_title = async () => {
    window.scrollTo(0, 0);
    this.childComponentMounted = true;
    const url_id = this.props.match?.params?.id;

    try {
      // let inputVal = await axios.post(
      //   this.props.project?.api_config?.endpoints?.get_invention_title,
      //   {
      //     project_id: url_id,
      //   }
      // );

      let inputVal = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.get_invention_title,
        {
          project_id: url_id,
        }
      )

      this.setState(
        { inputValDataBase: inputVal["response"]["invention_title"] }
      );
    } catch (e) {
      console.log(e);
    }
  };

  checkUserAccessToProject = async () => {
    let data = {
      sysuser_id: localStorage.getItem("user_id"),
      id: localStorage.getItem("user_id"),
      project_id: this.props.match?.params?.id,
    };

    var response = await apiServices.getData(
      "post",
      this.props.project?.api_config?.endpoints?.check_user_access_to_project,
      data
    );
    if (response["status"] === "Error") {
      // let toastData = this.props.project?.config?.toasterStyle;
      // toastData["autoClose"] = response["message_time"];
      // toast.info(response["message"], toastData);
      this.props.history.push("/home");
    } else {
      this.get_invention_title();
      //   this.get_data();
    }
  };

  retryModule = () => {
    return (
      <div className={classes.cautionContentCont}>
        <span className={classes.cautionContent}>
          {" "}
          <img className={classes.info} src={info} />
          {this.state.claimsErrorMessage}
          <span className={classes.overlayText}>
            {this.state.claimsLongErrorMessage}
          </span>
        </span>
        <span
          style={{
            backgroundColor: "#FF7E57",
            border: "0px",
          }}
          className="hs-version-num selected_version regen-button edit-section-btn"
          onClick={() => this.getClaims()}
        >
          <span className="version-title">Retry</span>
        </span>
      </div>
    );
  };

  editModule = (type, text) => {
    const url_id = this.props.match?.params?.id;
    return (
      <div className={classes.editContainer}>
        {/* <img src = {copy} onClick={() => this.copyToClipBoard(text)} >Copy</img> */}
        <Link
          className={classes.linkTag}
          to={`/patentDetails/${url_id}/edit/${"Claims"}`}
        >
          <div className="edit-section-btn">
            <span
              className="hs-version-num selected_version regen-button edit-section-btn"
              // onClick={() => this.callChildFunction()}
            >
              <span className="version-title">Edit</span>
            </span>
          </div>
        </Link>
      </div>
    );
  };

  handleButtonClick = () => {
    this.props.history.push(
      "/patentDetails/" + this.props.match?.params?.id + "/true"
    );
  };

  render() {
    return (
      <div>
        <header className="title-header">
          <div className="left-nav">
            <Link
              to={"/priorArt/" + this.props.match?.params?.id + "/true"}
              id="home-link"
              className="nav-link-style"
            >
              <div
                style={{ textDecorationLine: "none" }}
                className="left-nav-cont"
              >
                <img src={back_icon} alt="back" />
                <span>Back</span>
              </div>
            </Link>
          </div>

          <div className="right-nav">
            <div className="title-nav">
              <div className="div-element">
                <p>{this.state.inputValDataBase}</p>
              </div>
            </div>
          </div>
        </header>

        <main className={classes.main}>
          {/* <div className={classes.left}>
            <History />
          </div> */}

          <div className={classes.right}>
            <div className={classes.block}>
              <div>
                {this.state.claimsLoading ? (
                  <div className={classes.contenetContainer}>
                    {" "}
                    <h2 className={classes.patentDetailHeading}>Claims</h2>
                    <Abstract />
                  </div>
                ) : (
                  <div className={classes.contenetContainer}>
                    {" "}
                    <h2 className={classes.patentDetailHeading}>Claims</h2>
                    <div className={classes.content}>
                      {" "}
                      {this.state.claimsErrorMessage
                        ? this.retryModule()
                        : this.editModule()}
                      <pre className={classes.pre}>{this.state.claims}</pre>
                    </div>
                    {/* {key == "Title" && <hr />}{" "} */}
                    <div>
                      {this.state.claims && <button
                        style={{ float: "right", marginTop: "20px" }}
                        className="next-button"
                        onClick={this.handleButtonClick}
                        disabled={!this.state.claims}
                      >
                        Next
                      </button>}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* <Prompt
                sample={this.sample}
                text={this.state.inputValDataBase}
                ref={this.childRef}
              ></Prompt> */}
          </div>
        </main>
        <div></div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    project: state.projectData,
    //   isOpen: state.modalReducer.retryOverlay,
  };
};

export default connect(mapStateToProps, null)(Claims);
