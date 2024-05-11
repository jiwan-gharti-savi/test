import React from "react";
import { Container, Row, Col } from "reactstrap";
import "./InventionDisclosure.scss";
import MyButton from "../../Elements/MyButton/MyButton";
import white_arrow from "../../assets/icons/arrow_submit.svg";
import blue_arrow from "../../assets/icons/blue_arrow_submit.svg";
import cancel from "../../assets/icons/cancel.svg";
import Abstract from "../fallbackContainer/abstract/abstract";
import BlinkingCursor from "../../LoadingScreen/BlinkingCursor";
import streamApi from "../../../services/streamApi";
import CountryFilter from "../../Elements/CountryFilter/CountryFilter";
import apiServices from "../../../services/apiServices";

class InventionDisclosure extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inventionLoading: false,
      claimsLoading: false,
      generatingClaims: false,
      generatingInvention: false,
      claim: "",
      invention: "",
      isFilter: false,
    };
    this.controller = {};
  }

  componentDidMount() {
    this.getClaims();
    this.getInvention();
  }

  componentWillUnmount() {
    if (this.controller) {
      Object.keys(this.controller).map((keys) => {
        this.controller[keys].abort();
      });
    }
  }

  getClaims = async (type) => {
    this.setState({
      claimsLoading: true,
    });
    if (this.controller["claim"]) {
      this.controller["claim"].abort();
    }
    this.controller[this.props.editText] = new AbortController();

    try {
      let apiData = {
        project_id: this.props.projectId,
      };

      let streamComplete = false;
      let streamretry = false;
      let streamShortMessage = "";
      let streamLongMessage = "";

      const callBack = ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        streamretry = retry;
        streamShortMessage = shortMessage ? shortMessage : "";
        streamLongMessage = longMessage ? longMessage : "";

        if (
          content?.invention_disclosure_claim &&
          Object.keys(content).length > 0
        ) {
          this.setState({
            claim: content?.invention_disclosure_claim,
            claimsLoading: false,
            generatingClaims: true,
          });
        }
        streamComplete = isFinish;
      };

      await streamApi.getData(
        "post",
        this.props.project?.api_config?.endpoints?.invention_disclosure_claim,
        apiData,
        this.controller[this.props.editText].signal,
        callBack
      );

      if (streamretry === true) {
      } else if (streamComplete) {
        this.setState({
          generatingClaims: false,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  getInvention = async (type) => {
    this.setState({
      inventionLoading: true,
    });
    if (this.controller["invention"]) {
      this.controller["invention"].abort();
    }
    this.controller[this.props.editText] = new AbortController();

    try {
      let apiData = {
        project_id: this.props.projectId,
      };

      let streamComplete = false;
      let streamretry = false;
      let streamShortMessage = "";
      let streamLongMessage = "";

      const callBack = ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        streamretry = retry;
        streamShortMessage = shortMessage ? shortMessage : "";
        streamLongMessage = longMessage ? longMessage : "";

        if (
          content?.invention_disclosure_invention &&
          Object.keys(content).length > 0
        ) {
          this.setState({
            invention: content?.invention_disclosure_invention,
            inventionLoading: false,
            generatingInvention: true,
          });
        }
        streamComplete = isFinish;
      };

      await streamApi.getData(
        "post",
        this.props.project?.api_config?.endpoints
          ?.invention_disclosure_invention,
        apiData,
        this.controller[this.props.editText].signal,
        callBack
      );

      if (streamretry === true) {
      } else if (streamComplete) {
        this.setState({
          generatingInvention: false,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  editClaimhandler = (e) => {
    e.preventDefault();
    this.setState({ claim: e.target.value });
  };

  inventionChangeHandler = (e) => {
    e.preventDefault();
    this.setState({ invention: e.target.value });
  };

  filterToggleHandler = () => {
    this.setState({ isFilter: !this.state.isFilter });
  };

  updateDisclosureHandler = async (type) => {
    console.log("updateDisclosureHandler");
    try {
      let payload = {
        project_id: this.props.projectId,
        project_section_history_id: this.props.sectionHistoryId,
        section_history_id: this.props.sectionHistoryId,
        invention_title: this.state.invention,
        claim_invention: this.state.claim,
        claims_style: this.props.patentLanguage,
        is_inserted: true,
        project_type: type,
        user_id: localStorage.getItem("user_id"),
      };

      console.log("payload==>", payload);

      let isInserted = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.insert_project_data,
        payload
      );

      if (type === "claims") {
        this.props.navigateHandler(this.props.projectId, "claims");
      } else {
        this.props.navigateHandler(this.props.projectId, "prior_art");
      }
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    return (
      <Container fluid className="invention-disclosure-container">
        <Row>
          <Col className="d-flex flex-row gap-5 justify-content-between mb-3 invention-container-header-container">
            <span className="ml-2">Invention Disclosure</span>
            <img src={cancel} onClick={() => this.props.disclosureHandler()} />
          </Col>
        </Row>
        {this.props.disclosureInvention && (
          <Row>
            <Col>
              <div className="invention-disclosure-title">
                <span>Invention</span>
              </div>
              {this.state.inventionLoading ? (
                <div className="invention-disclosure-invention-textarea  invention-disclosure-invention-abstract-container">
                  <Abstract />
                  <Abstract />
                </div>
              ) : this.state.generatingInvention ? (
                <div className="invention-disclosure-invention-textarea invention-disclosure-generating-data ">
                  <pre className="invention-disclosure-pre-tag invention-disclosure-invention-pre-tag">
                    {" "}
                    {this.state.invention} <BlinkingCursor />
                  </pre>
                </div>
              ) : (
                <textarea
                  className="invention-disclosure-invention-textarea"
                  value={this.state.invention}
                  onChange={(e) => this.inventionChangeHandler(e)}
                />
              )}
            </Col>
          </Row>
        )}
        {this.props.disclosureClaim && (
          <Row className="mt-3">
            <Col>
              <div className="invention-disclosure-title">
                {" "}
                <span>Claim</span>{" "}
              </div>
              {this.state.claimsLoading ? (
                <div className="invention-disclosure-invention-textarea  invention-disclosure-invention-abstract-container">
                  <Abstract />
                  <Abstract />
                </div>
              ) : this.state.generatingClaims ? (
                <div className="invention-disclosure-invention-textarea invention-disclosure-generating-data ">
                  <pre className="invention-disclosure-pre-tag">
                    {this.state.claim}
                    <BlinkingCursor />
                  </pre>
                </div>
              ) : (
                <textarea
                  className="invention-disclosure-claim-textarea"
                  value={this.state.claim}
                  onChange={(e) => this.editClaimhandler(e)}
                />
              )}
            </Col>
          </Row>
        )}
        <Row>
          <Col className="d-flex flex-row gap-2 justify-content-end mt-2">
            <MyButton
              className={`hs-version-num prompt-button prompt-button-new regen-button  right_hover_image  prompt-button-top`}
              text={"Cancel"}
              //   rightImage={white_arrow}
              rightImageClass="custom-right-icon"
              //   rightHoverImage={blue_arrow}
              onClick={() => this.props.disclosureHandler()}
            />
            <MyButton
              className={`hs-version-num prompt-button prompt-button-new regen-button  right_hover_image  prompt-button-top`}
              text={this.props.disclosureClaim ? "View Claims" : "Draft Claims"}
              rightImage={white_arrow}
              rightImageClass="custom-right-icon"
              rightHoverImage={blue_arrow}
              onClick={() => this.updateDisclosureHandler("claims")}
            />
            <div className="explore-prior-art-cont">
              <MyButton
                className={`hs-version-num prompt-button prompt-button-new regen-button  right_hover_image  prompt-button-top`}
                text={"Explore Prior Art"}
                rightImage={white_arrow}
                rightImageClass="custom-right-icon"
                rightHoverImage={blue_arrow}
                onClick={() => this.filterToggleHandler()}
              />
              {this.state.isFilter && (
                <CountryFilter
                  updateDisclosureHandler={() =>
                    this.updateDisclosureHandler("prior-art")
                  }
                  handleCountrySelector={this.props.handleCountrySelector}
                  handleDateChangeHandler={this.props.handleDateChangeHandler}
                  selectedDateTypeHandler={this.props.dateTypeHandler}
                  {...this.props}
                  cancelFilterHandler={this.filterToggleHandler}
                  dateType={this.props.dateType}
                  style={{ top: "-230px" }}
                  type={"inventionDisclosure"}
                />
              )}
            </div>
          </Col>
        </Row>
      </Container>
    );
  }
}
export default InventionDisclosure;
