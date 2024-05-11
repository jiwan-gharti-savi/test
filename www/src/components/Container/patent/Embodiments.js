import React from "react";
import classes from "./patentDetails.module.css";
import Mermaid from "../FlowChart/Mermaid";
import { Container, Row, Col } from "reactstrap";
import download_thin from "../../assets/icons/download_thin.svg";
import apiServices from "../../../services/apiServices";
import info from "../../assets/icons/info_orange.svg";
import CountdownTimer from "../Counter/CountdownTimer";
import Abstract from "../fallbackContainer/abstract/abstract";
import preview_icon from "../../assets/icons/zoom.svg";
import { connect } from "react-redux";
import { incrementDiaCount, resetDiaCount } from "../../../store/action";
import axios from "axios";
import "./Embodiment.css";
import copy from "../../assets/icons/copy.svg";
import tick from "../../assets/icons/tick.png";

class Embodiments extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      retryType: "",

      flowEmbodimentdata: "",
      flowEmbodimentRetry: false,
      flowEmbodimentDescriptionretry: false,
      flowEmbodimentDescriptionLongMessage: "",
      flowEmbodimentDescriptionShortMessage: "",
      flowEmbodimentLongMessage: "",
      flowEmbodimentShortMessage: "",
      flowEmbodimentAvailable: true,
      flowEmbodimentloading: true,
      generatingFlowEmbodiment: false,
      flowEmbodimentDescriptionLoading: false,

      blockEmbodimentdata: "",
      blockEmbodimentRetry: false,
      blockEmbodimentDescriptionretry: false,
      blockEmbodimentDescriptionLongMessage: "",
      blockEmbodimentDescriptionShortMessage: "",
      blockEmbodimentLongMessage: "",
      blockEmbodimentShortMessage: "",
      blockEmbodimentAvailable: true,
      blockEmbodimentLoading: true,
      generatingBlockEmbodiment: false,
      blockEmbodimentDescriptionLoading: false,
      activeType: null,
    };
    this.apisTokens = {};
    this.section1Ref = React.createRef();
  }

  // componentWillMount = () => {
  //   this.getStoredEmbodiments();
  // };

  shouldComponentUpdate = (nextProps, nextState) => {
    return !(
      nextState.retryType === this.state.retryType &&
      nextProps.loadDiagramApis === this.props.loadDiagramApis &&
      nextProps.regenerateClaimSectionHistoryId ===
        this.props.regenerateClaimSectionHistoryId &&
      nextProps.enableExporting === this.props.enableExporting &&
      nextState.flowEmbodimentdata === this.state.flowEmbodimentdata &&
      nextState.flowEmbodimentRetry === this.state.flowEmbodimentRetry &&
      nextState.flowEmbodimentDescriptionretry ===
        this.state.flowEmbodimentDescriptionretry &&
      nextState.flowEmbodimentDescriptionLongMessage ===
        this.state.flowEmbodimentDescriptionLongMessage &&
      nextState.flowEmbodimentDescriptionShortMessage ===
        this.state.flowEmbodimentDescriptionShortMessage &&
      nextState.flowEmbodimentLongMessage ===
        this.state.flowEmbodimentLongMessage &&
      nextState.flowEmbodimentShortMessage ===
        this.state.flowEmbodimentShortMessage &&
      nextState.flowEmbodimentAvailable ===
        this.state.flowEmbodimentAvailable &&
      nextState.flowEmbodimentloading === this.state.flowEmbodimentloading &&
      nextState.generatingFlowEmbodiment ===
        this.state.generatingFlowEmbodiment &&
      nextState.flowEmbodimentDescriptionLoading ===
        this.state.flowEmbodimentDescriptionLoading &&
      nextState.blockEmbodimentdata === this.state.blockEmbodimentdata &&
      nextState.blockEmbodimentRetry === this.state.blockEmbodimentRetry &&
      nextState.blockEmbodimentDescriptionretry ===
        this.state.blockEmbodimentDescriptionretry &&
      nextState.blockEmbodimentDescriptionLongMessage ===
        this.state.blockEmbodimentDescriptionLongMessage &&
      nextState.blockEmbodimentDescriptionShortMessage ===
        this.state.blockEmbodimentDescriptionShortMessage &&
      nextState.blockEmbodimentLongMessage ===
        this.state.blockEmbodimentLongMessage &&
      nextState.blockEmbodimentShortMessage ===
        this.state.blockEmbodimentShortMessage &&
      nextState.blockEmbodimentAvailable ===
        this.state.blockEmbodimentAvailable &&
      nextState.blockEmbodimentLoading === this.state.blockEmbodimentLoading &&
      nextState.generatingBlockEmbodiment ===
        this.state.generatingBlockEmbodiment &&
      nextState.blockEmbodimentDescriptionLoading ===
        this.state.blockEmbodimentDescriptionLoading &&
      nextProps.callEmbodiments === this.props.callEmbodiments &&
      nextState.activeType === this.state.activeType &&
      nextProps.showEmbodiments === this.props.showEmbodiments
    );
  };

  componentDidUpdate = async (prevProps, prevState) => {
    if (this.props.callEmbodiments && !prevProps.callEmbodiments) {
      this.loadStoredDataFromDataBase();
    }
    if (
      prevState.generatingFlowEmbodiment !==
        this.state.generatingFlowEmbodiment ||
      prevState.generatingBlockEmbodiment !==
        this.state.generatingBlockEmbodiment
    ) {
      if (
        this.state.generatingFlowEmbodiment ||
        this.state.generatingBlockEmbodiment
      ) {
        this.props.generatingEmbodimentshandler(true);
      } else {
        this.props.generatingEmbodimentshandler(false);
      }
    }
  };

  componentWillUnmount() {
    if (this.apisTokens) {
      Object.keys(this.apisTokens).map((key) => {
        this.apisTokens[key].cancel();
      });
    }
    this.props.resetDiaCount();
  }

  loadStoredDataFromDataBase = async () => {
    this.getStoredEmbodimentFlowChart();
    this.props.flowEmbodimenthandler(true);
    // this.props.blockEmbodimenthandler(true);
    // this.getStoredEmbodimentBlockDiagram();
  };

  getStoredData = async (type) => {
    try {
      let payLoad = {
        claim_section_history_id: this.props.selectedClaimVersionId,
      };

      return await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.[type],
        payLoad
      );
    } catch (e) {
      console.log(e);
    }
  };

  getStoredEmbodimentFlowChart = async () => {
    try {
      this.setState(
        { flowEmbodimentloading: true, flowEmbodimentAvailable: true },
        () =>
          this.props.diagramLoadingHandler(
            "isFlowEmbLoading",
            this.state.flowEmbodimentloading,
            this.state.flowEmbodimentRetry
          )
      );
      let storedEmbodiments = await this.getStoredData(
        "select_embodiments_flowchart_figures_clm"
      );
      if (
        storedEmbodiments?.status === "Success" &&
        storedEmbodiments?.["response"]?.length == 0
      ) {
        this.getEmbodimentFlowChart();
        return;
      } else if (
        storedEmbodiments.status === "Success" &&
        storedEmbodiments?.["response"][0]?.["is_error"] === "Success"
      ) {
        this.setState(
          {
            flowEmbodimentdata: {
              text: storedEmbodiments?.["response"][0]?.["text"],
              list_of_figures:
                storedEmbodiments?.["response"][0]?.["list_of_figures"],
            },
            flowEmbodimentRetry: false,
            flowEmbodimentAvailable:
              storedEmbodiments?.["response"][0]?.["diagram_available"] ||
              false,
          },
          () => {
            this.getStoredEmbodimentsFlowchartDescription();
            this.props.flowEmbodimenthandler(
              this.state.flowEmbodimentAvailable
            );
            if (this.state.flowEmbodimentAvailable) {
              this.countDiagrams();
            }
          }
        );
      } else {
        this.setState(
          {
            flowEmbodimentloading: false,
            flowEmbodimentRetry: true,
            flowEmbodimentShortMessage:
              storedEmbodiments?.["response"][0]?.["message"],
            flowEmbodimentLongMessage:
              storedEmbodiments?.["response"][0]?.["message_long"],
          },
          () =>
            this.props.diagramLoadingHandler(
              "stopEmbodimentLoading",
              this.state.flowEmbodimentloading,
              this.state.flowEmbodimentRetry
            )
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  getStoredEmbodimentsFlowchartDescription = async () => {
    try {
      if (!this.state.flowEmbodimentloading) {
        this.setState({ flowEmbodimentloading: true }, () =>
          this.props.diagramLoadingHandler(
            "isFlowEmbLoading",
            this.state.flowEmbodimentloading,
            this.state.flowEmbodimentRetry
          )
        );
      }
      let storedEmbodiments = await this.getStoredData(
        "select_embodiments_flowchart_description_figures_clm"
      );
      if (
        storedEmbodiments.status === "Success" &&
        storedEmbodiments?.["response"]?.length == 0
      ) {
        this.getEmbodimentsFlowchartDescription();
        return;
      } else if (
        storedEmbodiments.status === "Success" &&
        storedEmbodiments?.["response"][0]?.["is_error"] === "Success"
      ) {
        let prevData = this.state.flowEmbodimentdata;
        let updatedData = {
          ...prevData,
          detailed_description_figures:
            storedEmbodiments?.["response"][0]?.[
              "detailed_description_figures"
            ],
        };
        this.setState(
          {
            flowEmbodimentdata: updatedData,
            flowEmbodimentDescriptionretry: false,
            flowEmbodimentloading: false,
          },
          () => {
            this.getStoredEmbodimentBlockDiagram();
            this.props.blockEmbodimenthandler(true);
            this.props.diagramLoadingHandler(
              "isFlowEmbLoading",
              this.state.flowEmbodimentloading,
              this.state.flowEmbodimentRetry
            );
          }
        );
      } else {
        this.setState(
          {
            flowEmbodimentloading: false,
            flowEmbodimentDescriptionretry: true,
            flowEmbodimentDescriptionShortMessage:
              storedEmbodiments?.["response"][0]?.["message"],
            flowEmbodimentDescriptionLongMessage:
              storedEmbodiments?.["response"][0]?.["message_long"],
          },
          () =>
            this.props.diagramLoadingHandler(
              "isFlowEmbLoading",
              this.state.flowEmbodimentloading,
              this.state.flowEmbodimentRetry
            )
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  getStoredEmbodimentBlockDiagram = async () => {
    try {
      this.setState(
        {
          blockEmbodimentLoading: true,
          blockEmbodimentAvailable: true,
        },
        () =>
          this.props.diagramLoadingHandler(
            "isBlockEmbLoading",
            this.state.blockEmbodimentLoading,
            this.state.blockEmbodimentRetry
          )
      );
      let storedEmbodiments = await this.getStoredData(
        "select_embodiments_block_diagram_clm"
      );
      if (
        storedEmbodiments.status === "Success" &&
        storedEmbodiments?.["response"]?.length == 0
      ) {
        this.getEmbodimentBlockDia();
        return;
      } else if (
        storedEmbodiments.status === "Success" &&
        storedEmbodiments?.["response"][0]?.["is_error"] === "Success"
      ) {
        this.setState(
          {
            blockEmbodimentdata: {
              list_of_figures:
                storedEmbodiments?.["response"][0]?.["list_of_figures"],
              text: storedEmbodiments?.["response"][0]?.["text"],
            },
            blockEmbodimentRetry: false,
            blockEmbodimentAvailable:
              storedEmbodiments?.["response"][0]?.["diagram_available"] ||
              false,
          },
          () => {
            this.getStoredEmbodimentsBlockDiaDescription();
            this.props.blockEmbodimenthandler(
              this.state.blockEmbodimentAvailable
            );
            if (this.state.blockEmbodimentAvailable) {
              this.countDiagrams();
            }
          }
        );
      } else {
        this.setState(
          {
            blockEmbodimentLoading: false,
            blockEmbodimentRetry: true,
            blockEmbodimentShortMessage:
              storedEmbodiments?.["response"][0]?.["message"],
            blockEmbodimentLongMessage:
              storedEmbodiments?.["response"][0]?.["message_long"],
          },
          () =>
            this.props.diagramLoadingHandler(
              "isBlockEmbLoading",
              this.state.blockEmbodimentLoading,
              this.state.blockEmbodimentRetry
            )
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  getStoredEmbodimentsBlockDiaDescription = async () => {
    try {
      if (!this.state.blockEmbodimentLoading) {
        this.setState({ blockEmbodimentLoading: true }, () =>
          this.props.diagramLoadingHandler(
            "isBlockEmbLoading",
            this.state.blockEmbodimentLoading,
            this.state.blockEmbodimentRetry
          )
        );
      }
      let storedEmbodiments = await this.getStoredData(
        "select_embodiments_block_diagram_description_clm"
      );
      if (
        storedEmbodiments.status === "Success" &&
        storedEmbodiments?.["response"]?.length == 0
      ) {
        this.getEmbodimentsBlockDiaDescription();
        return;
      } else if (
        storedEmbodiments.status === "Success" &&
        storedEmbodiments?.["response"][0]?.["is_error"] === "Success"
      ) {
        let data = this.state.blockEmbodimentdata;
        let updatedData = {
          ...data,
          detailed_description_figures:
            storedEmbodiments?.["response"][0]?.[
              "detailed_description_figures"
            ],
        };
        this.setState(
          {
            blockEmbodimentdata: updatedData,
            blockEmbodimentDescriptionretry: false,
            blockEmbodimentLoading: false,
          },
          () =>
            this.props.diagramLoadingHandler(
              "isBlockEmbLoading",
              this.state.blockEmbodimentLoading,
              this.state.blockEmbodimentRetry
            )
        );
      } else {
        this.setState(
          {
            blockEmbodimentLoading: false,
            blockEmbodimentDescriptionretry: true,
            blockEmbodimentDescriptionShortMessage:
              storedEmbodiments?.["response"][0]?.["message"],
            blockEmbodimentDescriptionLongMessage:
              storedEmbodiments?.["response"][0]?.["message_long"],
          },
          () =>
            this.props.diagramLoadingHandler(
              "isBlockEmbLoading",
              this.state.blockEmbodimentLoading,
              this.state.blockEmbodimentRetry
            )
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  getDatafromGPT = async (type, section_history_id) => {
    try {
      if (this.apisTokens[type]) {
        this.apisTokens[type].cancel();
      }
      this.apisTokens[type] = axios.CancelToken.source();
      let payLoad = {
        invention: this.props.inputValDataBase,
        project_id: this.props?.match?.params?.id,
        project_history_id: this.props.projectHistoryId,
        redraft: false,
        claim_section_history_id: this.props.selectedClaimVersionId,
        regenerate_claim_section_history_id:
          +this.props.regenerateClaimSectionHistoryId,
        section_history_id,
      };

      return await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.[type],
        payLoad,
        this.apisTokens[type]?.token
      );
    } catch (e) {
      console.log(e);
    }
  };

  getEmbodimentFlowChart = async () => {
    this.setState(
      {
        generatingFlowEmbodiment: true,
        flowEmbodimentloading: true,
      },
      () =>
        this.props.diagramLoadingHandler(
          "isFlowEmbLoading",
          this.state.flowEmbodimentloading,
          this.state.flowEmbodimentRetry
        )
    );
    try {
      let generateEmbodiments = await this.getDatafromGPT(
        "embodiments_flowchart_figures"
      );

      if (generateEmbodiments.status == "Success") {
        this.getEmbodimentsFlowchartDescription();
      } else {
        this.setState(
          {
            flowEmbodimentloading: false,
            generatingFlowEmbodiment: false,
            flowEmbodimentRetry: true,
            flowEmbodimentShortMessage: generateEmbodiments.message,
            flowEmbodimentLongMessage: generateEmbodiments.message_long,
            retryType: "getEmbodimentFlowChart",
          },
          () =>
            this.props.diagramLoadingHandler(
              "stopEmbodimentLoading",
              this.state.flowEmbodimentloading,
              this.state.flowEmbodimentRetry
            )
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  getEmbodimentsFlowchartDescription = async (retry) => {
    if (!this.state.generatingFlowEmbodiment && !retry) {
      this.setState({ generatingFlowEmbodiment: true });
    }
    if (retry) {
      this.setState({ flowEmbodimentDescriptionLoading: true });
    } else {
      this.setState({ flowEmbodimentloading: true }, () =>
        this.props.diagramLoadingHandler(
          "isFlowEmbLoading",
          this.state.flowEmbodimentloading,
          this.state.flowEmbodimentRetry
        )
      );
    }
    try {
      let getEmbodimentsDescription = await this.getDatafromGPT(
        "embodiments_flowchart_description_figures"
      );

      if (getEmbodimentsDescription.status === "Success") {
        this.setState(
          {
            generatingFlowEmbodiment: false,
            flowEmbodimentDescriptionLoading: false,
          },
          () => {
            this.getStoredEmbodimentFlowChart();
          }
        );
      } else {
        this.setState(
          {
            flowEmbodimentDescriptionLoading: false,
            retryType: "getEmbodimentsFlowchartDescription",
            generatingFlowEmbodiment: false,
            flowEmbodimentloading: false,
          },
          () => {
            this.props.diagramLoadingHandler(
              "isFlowEmbLoading",
              this.state.flowEmbodimentloading,
              this.state.flowEmbodimentRetry
            );
            this.getStoredEmbodimentFlowChart();
          }
        );
      }
      this.props.checkForDownloadButtonhandler();
      this.setState({ generatingFlowEmbodiment: false });
    } catch (e) {
      console.log(e);
    }
  };

  getEmbodimentBlockDia = async () => {
    this.setState(
      {
        generatingBlockEmbodiment: true,
        blockEmbodimentLoading: true,
      },
      () =>
        this.props.diagramLoadingHandler(
          "isBlockEmbLoading",
          this.state.blockEmbodimentLoading,
          this.state.blockEmbodimentRetry
        )
    );
    try {
      let getEmbodimentsDescription = await this.getDatafromGPT(
        "embodiments_block_diagram"
      );

      if (getEmbodimentsDescription.status === "Success") {
        this.setState({ generatingBlockEmbodiment: false }, () => {
          this.getEmbodimentsBlockDiaDescription();
        });
      } else {
        this.setState(
          {
            blockEmbodimentLoading: false,
            blockEmbodimentRetry: true,
            blockEmbodimentShortMessage: getEmbodimentsDescription.message,
            blockEmbodimentLongMessage: getEmbodimentsDescription.message_long,
            retryType: "getEmbodimentBlockDia",
            generatingBlockEmbodiment: false,
            blockEmbodimentLoading: false,
          },
          () =>
            this.props.diagramLoadingHandler(
              "isBlockEmbLoading",
              this.state.blockEmbodimentLoading,
              this.state.blockEmbodimentRetry
            )
        );
      }
      this.setState({ generatingBlockEmbodiment: false });
      this.props.checkForDownloadButtonhandler();
    } catch (e) {
      console.log(e);
    }
  };

  getEmbodimentsBlockDiaDescription = async (retry) => {
    if (!this.state.generatingBlockEmbodiment && !retry) {
      this.setState({ generatingBlockEmbodiment: true });
    }
    if (retry) {
      this.setState({ blockEmbodimentDescriptionLoading: true });
    } else {
      this.setState({ blockEmbodimentLoading: true }, () =>
        this.props.diagramLoadingHandler(
          "isBlockEmbLoading",
          this.state.blockEmbodimentLoading,
          this.state.blockEmbodimentRetry
        )
      );
    }
    try {
      let getEmbodimentsDescription = await this.getDatafromGPT(
        "embodiments_block_diagram_description"
      );

      if (getEmbodimentsDescription.status === "Success") {
        this.setState(
          {
            generatingBlockEmbodiment: false,
            blockEmbodimentDescriptionLoading: false,
          },
          () => {
            this.getStoredEmbodimentBlockDiagram();
          }
        );
      } else {
        this.setState(
          {
            blockEmbodimentDescriptionLoading: false,
            generatingBlockEmbodiment: false,
            blockEmbodimentLoading: false,
            retryType: "getEmbodimentsBlockDiaDescription",
          },
          () => {
            this.getStoredEmbodimentBlockDiagram();
            this.props.diagramLoadingHandler(
              "isBlockEmbLoading",
              this.state.blockEmbodimentLoading,
              this.state.blockEmbodimentRetry
            );
          }
        );
      }
      this.setState({ generatingBlockEmbodiment: false });
      this.props.checkForDownloadButtonhandler();
    } catch (e) {
      console.log(e);
    }
  };

  countDiagrams = () => {
    this.props.incrementDiaCount();
  };

  copyToClipBoard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (this.state.activeType === type) {
      this.setState({ activeType: null });
    } else {
      this.setState({ activeType: type });
    }

    setTimeout(() => {
      this.setState({ activeType: null });
    }, 1000);
  };

  copyElement = (type, title) => {
    return (
      <div
        onClick={() =>
          this.copyToClipBoard(JSON.stringify(type), JSON.stringify(type))
        }
        className={classes.copyCont}
      >
        {" "}
        <img
          src={this.state.activeType === JSON.stringify(type) ? tick : copy}
        />
        {this.state.activeType === JSON.stringify(type)
          ? "Copied " + title
          : "Copy " + title}
      </div>
    );
  };

  render() {
    const { embodimentsRef } = this.props;
    return (
      this.props.regenerateClaimSectionHistoryId &&
      this.props.showEmbodiments &&
       (
        <>
          {this.state.flowEmbodimentAvailable && (
            <>
              {this.state.flowEmbodimentloading ? (
                <Row className={classes.contenetContainer}>
                  {" "}
                  <h2
                    ref={embodimentsRef.flowEmbodimentsRef}
                    className={classes.patentDetailHeading}
                  >
                    Additional Embodiments{" "}
                  </h2>
                  {this.state.generatingFlowEmbodiment ? (
                    <CountdownTimer
                      targetDate={
                        this.props.project.expectedTimeout
                          .embodiments_flowchart_figures
                      }
                      sectionType={"FlowEmbodiments"}
                    />
                  ) : (
                    <Abstract />
                  )}
                </Row>
              ) : this.state.flowEmbodimentRetry ? (
                <Row className={classes.contenetContainer}>
                  <h2
                    ref={embodimentsRef.flowEmbodimentsRef}
                    className={classes.patentDetailHeading}
                  >
                    Additional Embodiments{" "}
                  </h2>

                  <Col className={`${classes.content}`}>
                    <div className={classes.cautionContentCont}>
                      <span className={classes.cautionContent}>
                        {" "}
                        <img className={classes.info} src={info} />
                        {this.state.flowEmbodimentShortMessage}
                        <span className={classes.overlayText}>
                          {this.state.flowEmbodimentLongMessage}
                        </span>
                      </span>
                      <span
                        style={{
                          backgroundColor: "#FF7E57",
                          border: "0px",
                        }}
                        className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
                        onClick={() => this.getEmbodimentFlowChart()}
                      >
                        <span className="version-title">Retry</span>
                      </span>
                    </div>
                  </Col>
                </Row>
              ) : (
                <>
                  <Row className={classes.contenetContainer}>
                    <h2
                      ref={embodimentsRef.flowEmbodimentsRef}
                      className={classes.patentDetailHeading}
                    >
                      Additional Embodiments{" "}
                    </h2>

                    <Col className={`${classes.content}`}>
                      <div>
                        <p className={classes.subHeading}>Brief Description</p>
                      </div>
                      {this.state.flowEmbodimentdata?.list_of_figures && (
                        <>
                          {this.copyElement(
                            this.state.flowEmbodimentdata?.list_of_figures,
                            "Brief Description"
                          )}
                          <pre className={classes.pre}>
                            {this.state.flowEmbodimentdata?.list_of_figures}
                          </pre>
                        </>
                      )}

                      <div className="border-bottom"></div>
                    </Col>
                  </Row>
                  <Row
                    className={`${classes.contenetContainer} ${classes.embodimentsSection}`}
                  >
                    <Col
                      className={`${classes.content}`}
                      lg={6}
                      xs={12}
                      md={12}
                      sm={12}
                    >
                      <div>
                        <p className={classes.subHeading}>Diagram</p>
                        {this.state.flowEmbodimentdata?.text && (
                          <div className={classes.flowChartImgCont}>
                            <div
                              onClick={(e) =>
                                this.props.previewHandler(
                                  null,
                                  e,
                                  this.state.flowEmbodimentdata?.text,
                                  "flow",
                                  "extra_flowchart1"
                                )
                              }
                              className="preview-button-cont"
                            >
                              <img src={preview_icon} alt="preview" />
                              Zoom
                            </div>

                            <Mermaid
                              {...this.props}
                              preContent={this.state.flowEmbodimentdata?.text}
                              projectId={this.props.match?.params?.id}
                              inventionTitle={this.props.inventionTitle}
                              diagramType={"flow"}
                              embodiment={true}
                              embodimentType={"extra_flowchart1"}
                            />
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col className={`${classes.content}`}>
                      <div>
                        <p className={classes.subHeading}>
                          Detailed Description Of Figure
                        </p>
                        {this.state.flowEmbodimentDescriptionLoading ? (
                          <span className="embodiment-abstract">
                            <Abstract />
                            <Abstract />
                            <Abstract />
                          </span>
                        ) : this.state.flowEmbodimentDescriptionretry ? (
                          <Col className={`${classes.content}`}>
                            <div className={classes.cautionContentCont}>
                              <span className={classes.cautionContent}>
                                {" "}
                                <img className={classes.info} src={info} />
                                {
                                  this.state
                                    .flowEmbodimentDescriptionShortMessage
                                }
                                <span className={classes.overlayText}>
                                  {
                                    this.state
                                      .flowEmbodimentDescriptionLongMessage
                                  }
                                </span>
                              </span>
                              <span
                                style={{
                                  backgroundColor: "#FF7E57",
                                  border: "0px",
                                }}
                                className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
                                onClick={() =>
                                  this.getEmbodimentsFlowchartDescription(true)
                                }
                              >
                                <span className="version-title">Retry</span>
                              </span>
                            </div>
                          </Col>
                        ) : (
                          <>
                            {this.copyElement(
                              this.state.flowEmbodimentdata
                                ?.detailed_description_figures,
                              "Detailed Description Of Figure"
                            )}
                            <pre className={classes.pre}>
                              {
                                this.state.flowEmbodimentdata
                                  ?.detailed_description_figures
                              }
                            </pre>
                          </>
                        )}
                      </div>
                    </Col>
                  </Row>
                </>
              )}
            </>
          )}
          {this.state.blockEmbodimentAvailable &&
          !this.state.flowEmbodimentRetry &&
            (
              <>
                {this.state.blockEmbodimentLoading ? (
                  <Row className={classes.contenetContainer}>
                    {" "}
                    <h2
                      ref={embodimentsRef.blockEmbodimentRef}
                      className={classes.patentDetailHeading}
                    >
                       {!this.state.flowEmbodimentAvailable ? "Additional Embodiments" : ""}
                    </h2>
                    {this.state.generatingBlockEmbodiment ? (
                      <CountdownTimer
                        targetDate={
                          this.props.project.expectedTimeout
                            .embodiments_block_diagram
                        }
                        sectionType={"BlockEmbodiments"}
                      />
                    ) : (
                      <span className="blockEmbAbstract" >
                         <Abstract />
                      </span>
                    )}
                  </Row>
                ) : this.state.blockEmbodimentRetry ? (
                  <Row className={classes.contenetContainer}>
                    <h2
                      ref={embodimentsRef.blockEmbodimentRef}
                      className={classes.patentDetailHeading}
                    >
                      {!this.state.flowEmbodimentAvailable ? "Additional Embodiments" : ""}
                    </h2>

                    <Col className={`${classes.content}`}>
                      <div className={classes.cautionContentCont}>
                        <span className={classes.cautionContent}>
                          {" "}
                          <img className={classes.info} src={info} />
                          {this.state.blockEmbodimentShortMessage}
                          <span className={classes.overlayText}>
                            {this.state.blockEmbodimentLongMessage}
                          </span>
                        </span>
                        <span
                          style={{
                            backgroundColor: "#FF7E57",
                            border: "0px",
                          }}
                          className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
                          onClick={() => this.getEmbodimentBlockDia()}
                        >
                          <span className="version-title">Retry</span>
                        </span>
                      </div>
                    </Col>
                  </Row>
                ) : (
                  <>
                    <Row className={classes.contenetContainer}>
                      <h2
                        ref={embodimentsRef.blockEmbodimentRef}
                        className={classes.patentDetailHeading}
                      >
                        {!this.state.flowEmbodimentAvailable ? "Additional Embodiments" : ""}
                      </h2>

                      <Col className={`${classes.content}`}>
                        <div>
                          <p className={classes.subHeading}>
                            Brief Description
                          </p>
                        </div>
                        <>
                          {this.copyElement(
                            this.state?.blockEmbodimentdata?.list_of_figures,
                            "Brief Description"
                          )}
                          <pre className={classes.pre}>
                            {this.state?.blockEmbodimentdata?.list_of_figures}
                          </pre>
                        </>
                        <div className="border-bottom"></div>
                      </Col>
                    </Row>
                    <Row
                      className={`${classes.contenetContainer} ${classes.embodimentsSection}`}
                    >
                      <Col
                        className={`${classes.content}`}
                        lg={6}
                        xs={12}
                        md={12}
                        sm={12}
                      >
                        <div>
                          <p className={classes.subHeading}>Diagram</p>
                          {this.state.blockEmbodimentdata?.text && (
                            <div className={classes.flowChartImgCont}>
                              <div
                                onClick={(e) =>
                                  this.props.previewHandler(
                                    null,
                                    e,
                                    this.state.blockEmbodimentdata?.text,
                                    "block",
                                    "extra_blockdiagram1"
                                  )
                                }
                                className="preview-button-cont"
                              >
                                <img src={preview_icon} alt="preview" />
                                Zoom
                              </div>

                              <Mermaid
                                {...this.props}
                                preContent={
                                  this.state.blockEmbodimentdata?.text
                                }
                                projectId={this.props.match?.params?.id}
                                inventionTitle={this.props.inventionTitle}
                                embodiment={true}
                                diagramType={"block"}
                                embodimentType={"extra_blockdiagram1"}
                              />
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col className={`${classes.content}`}>
                        <div>
                          <p className={classes.subHeading}>
                            Detailed Description Of Figure
                          </p>
                          {this.state.blockEmbodimentDescriptionLoading ? (
                            <span className="embodiment-abstract">
                              <Abstract />
                              <Abstract />
                              <Abstract />
                            </span>
                          ) : this.state.blockEmbodimentDescriptionretry ? (
                            <Col className={`${classes.content}`}>
                              <div className={classes.cautionContentCont}>
                                <span className={classes.cautionContent}>
                                  {" "}
                                  <img className={classes.info} src={info} />
                                  {
                                    this.state
                                      .blockEmbodimentDescriptionShortMessage
                                  }
                                  <span className={classes.overlayText}>
                                    {
                                      this.state
                                        .blockEmbodimentDescriptionLongMessage
                                    }
                                  </span>
                                </span>
                                <span
                                  style={{
                                    backgroundColor: "#FF7E57",
                                    border: "0px",
                                  }}
                                  className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
                                  onClick={() =>
                                    this.getEmbodimentsBlockDiaDescription(true)
                                  }
                                >
                                  <span className="version-title">Retry</span>
                                </span>
                              </div>
                            </Col>
                          ) : (
                            <>
                              {this.copyElement(
                                this.state?.blockEmbodimentdata
                                  ?.detailed_description_figures,
                                "Detailed Description Of Figure"
                              )}
                              <pre className={classes.pre}>
                                {
                                  this.state?.blockEmbodimentdata
                                    ?.detailed_description_figures
                                }
                              </pre>
                            </>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </>
                )}
              </>
            )}
        </>
      )
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    incrementDiaCount: (data) => dispatch(incrementDiaCount(data)),
    resetDiaCount: (data) => dispatch(resetDiaCount(data)),
  };
};

export default connect(null, mapDispatchToProps)(Embodiments);
