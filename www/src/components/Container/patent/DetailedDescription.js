import React, { Component } from "react";
import Abstract from "../fallbackContainer/abstract/abstract";
import { Container, Row, Col } from "reactstrap";
import apiServices from "../../../services/apiServices";
import streamApi from "../../../services/streamApi.js";
import classes from "./patentDetails.module.css";
import BlinkingCursor from "../../LoadingScreen/BlinkingCursor.js";
import CountdownTimer from "../Counter/CountdownTimer.js";
import info from "../../assets/icons/info_orange.svg";
import copy from "../../assets/icons/copy.svg";
import tick from "../../assets/icons/tick.png";

export default class DetailedDescription extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeType: null,

      separateDetailedDescriptionLoading: true,
      separateDetailedDescriptionFiguresContent: "",
      callingSeparateDetailedDescription: false,
      loadingSeparateDetailedDescription: true,
      genarateSeparateDetailedDescription: false,
      separateDetailedDescriptionFiguresContent: "",
      separateDetailedDescriptionSectionHistoryId: "",
      separateDetailedDescriptionRetry: false,
      seprateDetailedDescriptionShortMessage: "",
      seprateDetailedDescriptionLongMessage: "",
      separateDetailedDescriptionStreaming: false,
      isSeprateDetailedDescriptionAvailable: true,
    };
    this.controller = {};
  }

  // getSeparateStoredDetailedDescription = () => {};

  // getSeparateDetailedDescription = () => {};

  retryHandler = () => {
    if (this.props.flowChartDetailedDescriptionRetry) {
      this.props.flowChartDetailedDescriptionHandler();
    }
    if (this.props.blockDiaDetailedDescriptionRetry) {
      this.props.blockDiaDetailedDescriptionHandler();
    }
    if (this.props.detailedDescriptionRetry) {
      this.props.extraDetailedDescriptionRetryFromSeparateDetailedDescriptionHandler();
    }
    if (this.props.detailedDescriptionCommonRetry) {
      this.props.extraDetailedDescriptionCommonHandler();
    }
    if (this.state.separateDetailedDescriptionRetry) {
      this.getSeparateDetailedDescription();
    }
  };

  mapErrorMessages = (prevProps, prevState) => {
    if (
      prevProps.flowChartDetailedDescriptionShortMessage !=
        this.props.flowChartDetailedDescriptionShortMessage ||
      prevProps.flowChartDetailedDescriptionLongMessage !=
        this.props.flowChartDetailedDescriptionLongMessage
    ) {
      this.setState({
        seprateDetailedDescriptionShortMessage:
          this.props.flowChartDetailedDescriptionShortMessage,
        seprateDetailedDescriptionLongMessage:
          this.props.flowChartDetailedDescriptionLongMessage,
      });
    }

    if (
      prevProps.blockDetailedDescriptionShortMessage !=
        this.props.blockDetailedDescriptionShortMessage ||
      prevProps.blockDetailedDescriptionLongMessage !=
        this.props.blockDetailedDescriptionLongMessage
    ) {
      this.setState({
        seprateDetailedDescriptionShortMessage:
          this.props.blockDetailedDescriptionShortMessage,
        seprateDetailedDescriptionLongMessage:
          this.props.blockDetailedDescriptionLongMessage,
      });
    }

    if (
      prevProps.detailedDescriptionShortMessage !=
        this.props.detailedDescriptionShortMessage ||
      prevProps.detailedDescriptionLongMessage !=
        this.props.detailedDescriptionLongMessage
    ) {
      this.setState({
        seprateDetailedDescriptionShortMessage:
          this.props.detailedDescriptionShortMessage,
        seprateDetailedDescriptionLongMessage:
          this.props.detailedDescriptionLongMessage,
      });
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    this.extraDetailedDescriptionFormsectionhistory(prevProps, prevState);
    this.mapErrorMessages(prevProps, prevState);
  };

  separateDetailedDescriptionConnectingToParent = () => {
    try {
      if (this.state.separateDetailedDescriptionStreaming) {
        this.props.separateDetailedDescriptionConnectingToParentHandler(
          "separateDetailedDescriptionStreaming",
          true
        );
      } else {
        this.props.separateDetailedDescriptionConnectingToParentHandler(
          "separateDetailedDescriptionStreaming",
          false
        );
      }

      if (this.state.separateDetailedDescriptionRetry) {
        this.props.separateDetailedDescriptionConnectingToParentHandler(
          "separateDetailedDescriptionRetry",
          true
        );
      } else {
        this.props.separateDetailedDescriptionConnectingToParentHandler(
          "separateDetailedDescriptionRetry",
          false
        );
      }

      if (this.state.isSeprateDetailedDescriptionAvailable) {
        this.props.separateDetailedDescriptionConnectingToParentHandler(
          "isSeprateDetailedDescriptionAvailable",
          true
        );
      } else {
        this.props.separateDetailedDescriptionConnectingToParentHandler(
          "isSeprateDetailedDescriptionAvailable",
          false
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  getSeparateDetailedDescription = async (sectionHistoryId, retry = false) => {
    try {
      this.setState(
        {
          separateDetailedDescriptionRetry: false,
          callingSeparateDetailedDescription: true,
          separateDetailedDescriptionLoading: true,
          genarateSeparateDetailedDescription: true,
          separateDetailedDescriptionStreaming: true,
        },
        () => {
          this.separateDetailedDescriptionConnectingToParent();
        }
      );

      if (this.controller["separateDetailedDescription"]) {
        this.controller["separateDetailedDescription"].abort();
      }
      this.controller["separateDetailedDescription"] = new AbortController();

      const callBack = ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (content) {
          this.setState({
            separateDetailedDescriptionLoading: false,
            separateDetailedDescriptionFiguresContent: content,
            callingSeparateDetailedDescription: false,
          });
        }
        if (isFinish) {
          this.setState({ separateDetailedDescriptionStreaming: false }, () => {
            this.separateDetailedDescriptionConnectingToParent();
          });
          if (retry) {
            this.setState(
              {
                separateDetailedDescriptionRetry: true,
                seprateDetailedDescriptionShortMessage: shortMessage,
                seprateDetailedDescriptionLongMessage: longMessage,
              },
              () => {
                this.separateDetailedDescriptionConnectingToParent();
              }
            );

            this.setState({ separateDetailedDescriptionFiguresContent: "" });
            return;
          } else {
            this.getStoredSeparateDetailedDescription("detailedDescription");
            this.setState(
              {
                callingSeparateDetailedDescription: false,
                separateDetailedDescriptionLoading: false,
              },
              () => {
                this.separateDetailedDescriptionConnectingToParent();
              }
            );
          }
        }
      };

      let payLoad = {
        data: this.props.inputValDataBase,
        project_id: this.props?.match?.params?.id,
        project_history_id: this.props.projectHistoryId,
        redraft: false,
        claim_section_history_id: this.props.selectedClaimVersionId,
        regenerate_claim_section_history_id:
          this.props.regenerateClaimSectionHistoryId,
      };
      if (this.state.separateDetailedDescriptionSectionHistoryId) {
        payLoad["section_history_id"] =
          this.state.separateDetailedDescriptionSectionHistoryId;
      }

      await streamApi.getData(
        "post",
        this.props.project?.api_config?.endpoints
          ?.separate_detailed_description,
        payLoad,
        this.controller["separateDetailedDescription"].signal,
        callBack
      );
    } catch (e) {
      console.log(e);
    }
  };

  getStoredSeparateDetailedDescription = async (callType) => {
    try {
      this.props.checkForDownloadButtonhandler(
        false,
        "totalDetailedDescription"
      );

      let storedSeprateDetailedDescription = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints
          ?.select_separate_detailed_description,
        {
          claim_section_history_id: this.props.selectedClaimVersionId,
        }
      );

      if (callType == "initialLoad") {
        this.setState({ separateDetailedDescriptionLoading: false,
          isSeprateDetailedDescriptionAvailable : true });
      }

      if (
        storedSeprateDetailedDescription.status == "Success" &&
        storedSeprateDetailedDescription.response &&
        storedSeprateDetailedDescription.response.length == 0
      ) {
        this.getSeparateDetailedDescription();
        return;
      } else if (
        storedSeprateDetailedDescription.status == "Success" &&
        storedSeprateDetailedDescription?.response &&
        storedSeprateDetailedDescription?.response?.length > 0 &&
        !storedSeprateDetailedDescription.response[0]?.["diagram_available"]
      ) {
        this.setState(
          {
            separateDetailedDescriptionLoading: false,
            isSeprateDetailedDescriptionAvailable:
              storedSeprateDetailedDescription.response[0]?.[
                "diagram_available"
              ] || false,
            genarateSeparateDetailedDescription: false,
            separateDetailedDescriptionRetry: false,
            separateDetailedDescriptionStreaming: false,
          },
          () => {
            this.separateDetailedDescriptionConnectingToParent();
          }
        );
      }

      if (
        (storedSeprateDetailedDescription.response[0]?.["is_dd_error"] !==
          "Success" ||
          storedSeprateDetailedDescription.response[0]?.["is_error"] !==
            "Success") &&
        callType == "detailedDescription"
      ) {
        if (this.props?.project?.config?.multiRetry) {
          const sectionHistoryId =
            storedSeprateDetailedDescription?.response?.[0]?.[
              "section_history_id"
            ] || this.state.separateDetailedDescriptionSectionHistoryId;

          this.setState(
            {
              separateDetailedDescriptionSectionHistoryId: sectionHistoryId,
            },
            () => {
              this.getSeparateDetailedDescription();
            }
          );
        } else {
          this.setState(
            {
              separateDetailedDescriptionRetry: true,
              separateDetailedDescriptionLoading: false,
              separateDetailedDescriptionSectionHistoryId:
                storedSeprateDetailedDescription.response[0][
                  "section_history_id"
                ],
              seprateDetailedDescriptionShortMessage:
                storedSeprateDetailedDescription.response[0].message_dd,
              seprateDetailedDescriptionLongMessage:
                storedSeprateDetailedDescription.response[0].message_dd_long,
              separateDetailedDescriptionFiguresContent:
                storedSeprateDetailedDescription.response[0][
                  "detailed_description_figures"
                ],
              detailedDescriptionAvailable:
                storedSeprateDetailedDescription.response[0]?.[
                  "diagram_available"
                ] || false,
            },
            () => {
              this.separateDetailedDescriptionConnectingToParent();
            }
          );
        }
      } else if (
        storedSeprateDetailedDescription.response[0]?.["is_dd_error"] ===
          "Success" &&
        callType == "detailedDescription"
      ) {
        this.setState(
          {
            separateDetailedDescriptionRetry: false,
            separateDetailedDescriptionLoading: false,
            separateDetailedDescriptionSectionHistoryId:
              storedSeprateDetailedDescription.response[0][
                "section_history_id"
              ],
            detailedDescriptionAvailable:
              storedSeprateDetailedDescription.response[0]?.[
                "diagram_available"
              ] || false,
          },
          () => {
            this.separateDetailedDescriptionConnectingToParent();
          }
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  extraDetailedDescriptionFormsectionhistory = (prevProps, prevState) => {
    if (
      prevProps.flowChartDetailedDescriptionSucess !==
        this.props.flowChartDetailedDescriptionSucess ||
      prevProps.blockDetailedDescriptionSuccess !==
        this.props.blockDetailedDescriptionSuccess ||
      prevProps.detailedDescriptionSuccess !==
        this.props.detailedDescriptionSuccess
    ) {
      if (
        this.props.flowChartDetailedDescriptionSucess &&
        this.props.blockDetailedDescriptionSuccess &&
        this.props.detailedDescriptionSuccess
      ) {
        if (!this.props.separateDetailedDescriptionData) {
          this.getStoredSeparateDetailedDescription();
          // this.props.setGetStoredFlowChart();
        } else {
          this.setState({ separateDetailedDescriptionLoading: false });

          if (
            this.props.separateDetailedDescriptionData &&
            !this.props.separateDetailedDescriptionData?.["diagram_available"]
          ) {
            this.setState(
              {
                isSeprateDetailedDescriptionAvailable:
                  this.props.separateDetailedDescriptionData?.[
                    "diagram_available"
                  ] || false,
                separateDetailedDescriptionLoading: false,
                generateDetailedDescription: false,
                detailedDescriptionRetry: false,
                streamingDetailedDescription: false,
              },
              () => {
                this.separateDetailedDescriptionConnectingToParent();
              }
            );
            return;
          }
          if (
            this.props.separateDetailedDescriptionData?.["is_error"] ===
              "Success" &&
            this.props.separateDetailedDescriptionData?.["is_dd_error"] ===
              "Success"
          ) {
            this.setState(
              {
                separateDetailedDescriptionFiguresContent:
                  this.props.separateDetailedDescriptionData
                    ?.detailed_description_figures,
                separateDetailedDescriptionLoading: false,
                isSeprateDetailedDescriptionAvailable : true
              },
              () => {
                this.separateDetailedDescriptionConnectingToParent();
              }
            );
          } else {
            this.setState(
              {
                separateDetailedDescriptionRetry: true,
                separateDetailedDescriptionLoading: false,
                separateDetailedDescriptionSectionHistoryId:
                  this.props.separateDetailedDescriptionData?.[
                    "section_history_id"
                  ],
                separateDetailedDescriptionFiguresContent: this.props
                  .separateDetailedDescriptionData?.detailed_description_figures
                  ? this.props.separateDetailedDescriptionData
                      ?.detailed_description_figures
                  : "",
                seprateDetailedDescriptionShortMessage:
                  this.props.separateDetailedDescriptionData?.message,
                seprateDetailedDescriptionLongMessage:
                  this.props.separateDetailedDescriptionData?.message_long,
              },
              () => {
                this.separateDetailedDescriptionConnectingToParent();
              }
            );
          }
        }
      }
    }
    
    if(prevProps.flowChartRetry !== this.props.flowChartRetry
    || prevProps.blockDiagramRetry !== this.props.blockDiagramRetry){
      if(this.props.flowChartRetry || this.props.blockDiagramRetry){
        this.setState(
          {
            separateDetailedDescriptionLoading: false,
            isSeprateDetailedDescriptionAvailable: false,
            genarateSeparateDetailedDescription: false,
            separateDetailedDescriptionRetry: false,
            separateDetailedDescriptionStreaming: false,
          },
          () => {
            this.separateDetailedDescriptionConnectingToParent();
          }
        );
      }

    }
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
    const { sectionRefs } = this.props;
    return (
      <>
        {this.state.isSeprateDetailedDescriptionAvailable &&
          this.props.isRegenerteClaimAvailable && (
            <Row className={classes.contenetContainer}>
              <div className="diagrams-figures-heading-cont">
                <h2
                  ref={sectionRefs.extraDetailedDescriptionRef}
                  className={classes.patentDetailHeading}
                >
                  Detailed Description
                </h2>
              </div>
              <Col className={`${classes.content}`}>
                <div>
                  {this.state.separateDetailedDescriptionRetry ||
                  (this.props.flowChartDetailedDescriptionRetry &&
                    this.props.flowChartAvailable) ||
                  (this.props.blockDiaDetailedDescriptionRetry &&
                    this.props.blockDiagramAvailable) ||
                  (this.props.detailedDescriptionRetry &&
                    this.props.detailedDescriptionAvailable) ||
                  this.props.detailedDescriptionCommonRetry ? (
                    <>
                      <div className={classes.cautionContentCont}>
                        {this.state.seprateDetailedDescriptionShortMessage && (
                          <span className={classes.cautionContent}>
                            {" "}
                            <img className={classes.info} src={info} />
                            {this.state.seprateDetailedDescriptionShortMessage}
                            <span className={classes.overlayText}>
                              {this.state.seprateDetailedDescriptionLongMessage}
                            </span>
                          </span>
                        )}
                        <span
                          style={{
                            backgroundColor: "#FF7E57",
                            border: "0px",
                          }}
                          className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
                          onClick={() => this.retryHandler()}
                        >
                          <span className="version-title">Retry</span>
                        </span>
                      </div>
                      {this.state.separateDetailedDescriptionFiguresContent &&
                        this.state.separateDetailedDescriptionFiguresContent
                          .length > 0 && (
                          <>
                            <pre className={classes.pre}>
                              {
                                this.state
                                  .separateDetailedDescriptionFiguresContent
                              }
                            </pre>

                            <div className={classes.cautionContentCont}>
                              <span
                                style={{
                                  backgroundColor: "#FF7E57",
                                  border: "0px",
                                }}
                                className="hs-version-num prompt-button regen-button edit-section-btn retry-hover"
                                onClick={() => this.retryHandler()}
                              >
                                <span className="version-title">
                                  Continue generating detailed description
                                </span>
                              </span>
                            </div>
                          </>
                        )}
                    </>
                  ) : (
                    <>
                      {this.state.separateDetailedDescriptionLoading ? (
                        <>
                          {this.state
                            .separateDetailedDescriptionFiguresContent &&
                          this.state.separateDetailedDescriptionFiguresContent
                            .length > 0 ? (
                            <>
                              {this.copyElement(
                                this.state
                                  .separateDetailedDescriptionFiguresContent,
                                "Detailed Description Of Figure"
                              )}
                              <pre className={classes.pre}>
                                {
                                  this.state
                                    .separateDetailedDescriptionFiguresContent
                                }
                                {this.state
                                  .callingSeparateDetailedDescription && (
                                  <BlinkingCursor />
                                )}
                              </pre>
                              {this.state
                                .callingSeparateDetailedDescription && (
                                <div className="detailed-description-generating-animation">
                                  <Abstract />
                                </div>
                              )}
                            </>
                          ) : this.state.callingSeparateDetailedDescription ? (
                            <>
                              <CountdownTimer
                                targetDate={
                                  this.props.project.expectedTimeout
                                    .flowchart_detaild_description_of_figure
                                }
                                sectionType={
                                  "Flowchart Detailed Description Of Figure"
                                }
                              />
                            </>
                          ) : (
                            <>
                              <div className="extra-detailed-description-abstract">
                                <Abstract />
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        this.state
                          .separateDetailedDescriptionFiguresContent && (
                          <>
                            {this.copyElement(
                              this.state
                                .separateDetailedDescriptionFiguresContent,
                              "Detailed Description Of Figure"
                            )}
                            <pre className={classes.pre}>
                              {
                                this.state
                                  .separateDetailedDescriptionFiguresContent
                              }
                              {this.state
                                .callingSeparateDetailedDescription && (
                                <BlinkingCursor />
                              )}
                            </pre>
                            {this.state.callingSeparateDetailedDescription && (
                              <div className="detailed-description-generating-animation">
                                <Abstract />
                              </div>
                            )}
                          </>
                        )
                      )}
                    </>
                  )}
                </div>
              </Col>
            </Row>
          )}
      </>
    );
  }
}
