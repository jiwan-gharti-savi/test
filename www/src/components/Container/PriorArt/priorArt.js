import React, { Component } from "react";
import axios from "axios";
import { Container, Row, Col } from 'reactstrap';
import back_icon from "../../assets/icons/back.svg";
import { Link } from "react-router-dom";
import classes from "./priorArt.module.css";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import apiServices from "../../../services/apiServices";
import Prompt from "../patent/patentDetailsPrompt";
import MyButton from "../../Elements/MyButton/MyButton";

import {
  togglePatentEditModal,
  toggleClaimsEditModal,
} from "../../../store/action";
import ClaimsOverlay from "./generateClaimsOverlay";
import History from "../patent/History";
import LoadingScreen from "../../LoadingScreen/loadingScreen";
import Abstract from "../fallbackContainer/abstract/abstract";
import white_arrow from "../../assets/icons/arrow_submit.svg";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import date_icon from "../../assets/icons/date.svg";
import assignee_icon from "../../assets/icons/assignee.svg";

class PriorArt extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValDataBase: "",
      checkedBoxes: [],
      priorArtData: [],
      allPriorArtData: [],
      latestIndex: 0,
      isLoading: false,
      selectedPriorArt: "",
      loadingGenrate: false,
      pageNumber: 1,
    };

    this.apisTokens = {};
  }

  componentWillMount() {
    if (!this.props.match?.params?.new) {
      this.checkUserAccessToProject();
    } else {
      this.get_invention_title();
    }
  }

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
        { inputValDataBase: inputVal["response"]["invention_title"] },
        () => this.prior_art_value()
      );
    } catch (e) {
      console.log(e);
    }
  };

  // @select_project_history, will load data from database if already present
  // else, regenrateHandler( ) will generate new
  prior_art_value = async () => {
    try {
      let historyData = {
        project_id: this.props.match?.params?.id,
        request_page: this.state.pageNumber,
      };
      let select_project_history = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_project_history,
        historyData
      );
      if (select_project_history.response[0]["prior_art_analysis"] == null) {
        this.regenrateHandler(this.state.inputValDataBase);
      } else {
        this.setState({
          priorArtData: select_project_history.response[0]["prior_art_analysis"],
          allPriorArtData: select_project_history.response,
          inputValDataBase:
            select_project_history.response[0]["invention_title"],
          selectedPriorArt: select_project_history.response[0],
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  checkUserAccessToProject = async () => {
    let data = {
      id: localStorage.getItem("user_id"),
      project_id: this.props?.match?.params?.id,
      role_id : localStorage.getItem("role_id")
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
      // this.get_data();
    }
  };

  checkUserAccessToProject = async () => {
    let data = {
      id: localStorage.getItem("user_id"),
      project_id: this.props?.match?.params?.id,
      role_id : localStorage.getItem("role_id")
    };

    var response = await apiServices.getData(
      "post",
      this.props.project?.api_config?.endpoints?.check_user_access_to_project,
      data
    );
    if (response["status"] === "Error") {
      let toastData = this.props.project?.config?.toasterStyle;
      toastData["autoClose"] = response["message_time"];
      toast.info(response["message"], toastData);
      this.props.history.push("/home");
    } else {
      this.get_invention_title();
      //   this.get_data();
    }
  };

  handleCheckboxChange = (e, index) => {
    const { checkedBoxes } = this.state;
    const isChecked = e.target.checked;

    if (isChecked) {
      // Add the index to checkedBoxes if not already present
      if (checkedBoxes.length < 3) {
        this.setState((prevState) => ({
          checkedBoxes: [...prevState.checkedBoxes, index],
        }));
      } else {
        e.target.checked = false; // Uncheck the checkbox
      }
    } else {
      // Remove the index from checkedBoxes if present
      this.setState((prevState) => ({
        checkedBoxes: prevState.checkedBoxes.filter((i) => i !== index),
      }));
    }
  };

  genrateHandler = async () => {
    try {
      this.setState({ loadingGenrate: true });
      let data = {
        invention_title: this.state.selectedPriorArt["invention_title"],
        project_history_id: this.state.selectedPriorArt["project_history_id"],
        project_id: this.state.selectedPriorArt["project_id"],
      };
      let updateInvention = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.update_invention,
        data
      );
      this.props.history.push(
        "/patentDetails/" + this.props.match?.params?.id + "/edit" + "/Claims/"
      );
    } catch (e) {
      console.log(e);
    }
    this.setState({ loadingGenrate: false });
  };

  openPrompt = () => {
    this.props.toggleOverlay();
  };

  regenrateHandler = async (text) => {
    this.setState({ isLoading: true });
    let data = {
      invention_title: text,
      project_id: this.props.match?.params?.id,
      // is_inserted:false
    };
    let historyData = {
      project_id: this.props.match?.params?.id,
      request_page: this.state.pageNumber,
    };

    try {
      //to get prior art from ai

      if (this.apisTokens.priorArtData) {
        this.apisTokens["priorArtData"].cancel();
      }
      this.apisTokens["priorArtData"] = axios.CancelToken.source();

      let prior_art_value = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.prior_art,
        data,
        this.apisTokens["priorArtData"].token
      );

      // to store the prior art in the history section

      if (this.apisTokens.projectHistory) {
        this.apisTokens["projectHistory"].cancel();
      }
      this.apisTokens["projectHistory"] = axios.CancelToken.source();
      // let project_history_response = await apiServices.getData(
      //   "post",
      //   this.props.project?.api_config?.endpoints?.insert_project_history_data,
      //   data,
      //   this.apisTokens["projectHistory"].token
      // );

      // to get prior art from history section

      if (this.apisTokens.selectHistory) {
        this.apisTokens["selectHistory"].cancel();
      }
      this.apisTokens["selectHistory"] = axios.CancelToken.source();
      let select_project_history = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_project_history,
        historyData,
        this.apisTokens["selectHistory"].token
      );
      this.setState({
        priorArtData: select_project_history.response[0].prior_art,
        allPriorArtData: select_project_history.response,
        latestIndex: select_project_history.response.length - 1,
      });
    } catch (e) {}
    this.setState({ isLoading: false });
  };

  claimsGenaratehandler = (data) => {
    this.props.history.push(
      "/patentDetails/" +
        this.props.match?.params?.id +
        "/edit" +
        "/Claims/" +
        data.pn
    );
  };

  historyClickHandler = (data) => {
    this.setState({
      priorArtData: data["prior_art_analysis"],
      inputValDataBase: data["invention_title"],
      selectedPriorArt: data,
    });
  };

  retryHandler = (data) => {
    this.regenrateHandler(data["invention_title"]);
  };

  loadMoreHandler = () => {
    this.setState(
      (prev) => ({ pageNumber: prev + 1 }),
      () => this.regenrateHandler(this.state.inputValDataBase)
    );
  };

  render() {
    const { priorArtData } = this.state;

    if (this.state.loadingGenrate) {
      return <LoadingScreen />;
    }

    const percentage = 66;

    // Can use browser detection logic here to determine this instead
    const needDominantBaselineFix = true;

    return (
      <Container>
        <header className="title-header">
          <div className="left-nav">
            <Link to="/" id="home-link" className="nav-link-style">
              <div
                style={{ textDecorationLine: "none" }}
                className="left-nav-cont"
              >
                <img src={back_icon} alt="back" />
                <span>Home</span>
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
          <div className={classes.rightSide}>
            <div className={classes.editInvention}>
              <span
                className="hs-version-num selected_version regen-button"
                onClick={() => this.openPrompt()}
              >
                <span className="version-title">Edit</span>
              </span>
            </div>
          </div>
        </header>
        <div className={classes.buttonCont}>
          
          <button className="edit-invention " onClick={() => this.openPrompt()}>
            Modify Invention
          </button>
          <button className="next-button" onClick={this.genrateHandler}>
            Draft Claims
            <img className={classes.genImage} src={white_arrow} />
          </button>
        </div>
        <main className={classes.main}>
          {/* <div className={classes.left}>
            <History
              data={this.state.allPriorArtData}
              historyClickHandler={this.historyClickHandler}
              latestIndex={this.state.latestIndex}
              isLoading={this.state.isLoading}
              retryHandler={this.retryHandler}
            />
          </div> */}
          <div className={classes.right}>
            {this.state.isLoading ? (
              <>
                <Abstract />
                <Abstract />
                <Abstract />
                <Abstract />
                <Abstract />
                <Abstract />
                <Abstract />
              </>
            ) : (
              <div className={classes.container}>
                <>
                  {priorArtData?.map((data, index) => {
                    return (
                      <div className={classes.column} key={index}>
                        <div className={classes.contentCont}>
                          <div></div>
                          <div className={classes.checkboxCont}>
                            <div>
                              <span>#</span>
                              <span>
                                {index + 1} {data.pn}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className={classes.topCont}>
                              <div className={classes.progressCont}>
                                <CircularProgressbarWithChildren
                                  value={Math.ceil(data.similarity_score)}
                                  styles={buildStyles({
                                    trailColor: "transparent",
                                    pathColor: "#7CB343",
                                  })}
                                >
                                  {/* Put any JSX content in here that you'd like. It'll be vertically and horizonally centered. */}
                                  <div className={classes.barContent}>
                                    <strong>{Math.ceil(data.similarity_score)}%</strong>{" "}
                                    <span>Similar</span>
                                  </div>
                                </CircularProgressbarWithChildren>
                              </div>
                              <div className={classes.detailCont}>
                                <div className={classes.titleCont}>
                                  <span> Title: </span>
                                  <span>{data.title}</span>
                                </div>
                                <div className={classes.explainCont}>
                                  <div>{data.explanation}</div>
                                </div>
                              </div>
                            </div>
                            <div className={classes.footerCont}>
                              <div className={classes.rightDetailCont}>
                                <div className={classes.assigineeCont}>
                                  <img src={assignee_icon} />
                                  <span>Assiginee:</span>
                                  <span>{data.co}</span>
                                </div>
                                <div>
                                  <div>
                                    <div className={classes.scoreCont}>
                                      <span>Dolcera Score:</span>
                                      <span>{data.dolcera_score}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
                {/* <button className="next-button" onClick={this.loadMoreHandler}>
                  Load more
                  <img className={classes.genImage} src={white_arrow} />
                </button> */}
              </div>
            )}
          </div>
        </main>

        <Prompt
          // sample={this.sample}
          text={this.state.inputValDataBase}
          // ref={this.childRef}
          regenrate={this.regenrateHandler}
        ></Prompt>
        <ClaimsOverlay
          priorArtData={priorArtData}
          projectId={this.props.match?.params?.id}
          claimsGenaratehandler={this.claimsGenaratehandler}
        />
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    project: state.projectData,
    //   isOpen: state.modalReducer.retryOverlay,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleOverlay: () => dispatch(togglePatentEditModal()),
    toggalClaimsOverlay: () => dispatch(toggleClaimsEditModal()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PriorArt);
