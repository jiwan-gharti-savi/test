import React from "react";
import classes from "./patentDetails.module.css";
import Mermaid from "../FlowChart/Mermaid";
import { Container, Row, Col } from "reactstrap";
import download_thin from "../../assets/icons/download_thin.svg";
import apiServices from "../../../services/apiServices";
import info from "../../assets/icons/info_orange.svg";
import Abstract from "../fallbackContainer/abstract/abstract";
import axios from "axios";
import noDataImage from "../../assets/icons/no_flowchart.svg";
import preview_icon from "../../assets/icons/zoom.svg";
import { incrementDiaCount, resetDiaCount } from "../../../store/action.js";
import { connect } from "react-redux";
import CountdownTimer from "../Counter/CountdownTimer";
import copy from "../../assets/icons/copy.svg";
import tick from "../../assets/icons/tick.png";
import streamApi from "../../../services/streamApi.js";
import "./Diagrams.css";
import BlinkingCursor from "../../LoadingScreen/BlinkingCursor.js";
import Template from "../GeneratedData/Template.js";
import { UpdateMermaidQueue } from "./UpdateMermaidQueue.js";
import DetailedDescription from "./DetailedDescription.js";
import white_arrow from "../../assets/icons/arrow_submit.svg";
import blue_arrow from "../../assets/icons/blue_arrow_submit.svg";

class Diagrams extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      embodiemntsLoading: true,
      embodimentsRetry: false,
      embodiemntsAvailable: true,
      flowChartContent: "",
      flowChartLoading: true,
      flowChartAvailable: true,
      flowChartRetry: false,
      flowLongMessage: "",
      flowShortMessage: "",
      blockDiagramLoading: true,
      blockDiagramAvailable: true,
      blockDiagramRetry: false,
      blockDiagramContent: "",
      blockShortMessage: "",
      blockLongMessage: "",
      generateFlowDia: false,
      generateBlockDia: false,
      flowsectionHistoryId: "",
      blocksectionHistoryId: "",
      activeType: null,

      flowChartMainBriefDescription: "",
      flowChartMainMermaid: "",
      flowChartMermaidsData: "",
      flowChartDetailedDescriptionLoading: true,
      flowChartDetailedDescriptionCount: 0,
      flowChartDetailedDescriptionRetry: false,
      callingFlowDescription: false,
      flowChartCommonRetry: false,
      flowChartMainBriefDescriptionLoading: false,
      flowChartDetailedDescriptionFigures: "",
      streamingFlowchartDia: false,
      streamingFlowCommon: false,
      flowChartDetailedDescriptionShortMessage: "",
      flowChartDetailedDescriptionLongMessage: "",
      flowChartDetailedDescriptionSucess : false,


      blockDiaMainBriefDescription: "",
      blockDiaMainMermaid: "",
      blockDiaMermaidsData: "",
      blockDiaDetailedDescriptionLoading: true,
      blockDiaDetailedDescriptionCount: 0,
      blockDiaDetailedDescriptionRetry: false,
      callingBlockDescription: false,
      blockDiaCommonRetry: false,
      blockDiagramMainBriefDescriptionLoading: false,
      blockDetailedDescriptionOfFigures: "",
      blockDetailedDescriptionShortMessage: "",
      blockDetailedDescriptionLongMessage: "",
      streamimgBlockDiagrams: false,
      streamingBlockCommon: false,
      blockDetailedDescriptionSuccess : false,

      templateData: [],
      templateFigBase64: [],
      loadingTemplate: false,
      isTemplateOpen: false,

      detailedDescriptionLoading: true,
      generateDetailedDescription: false,
      detailedDescriptionRetry: false,
      streamingDetailedDescription: false,
      detailedDescriptionCommonRetry: false,
      detailedDescriptionShortMessage: "",
      detailedDescriptionLongMessage: "",
      callingDetailedDescription: false,
      detailedDescriptionContent: "",
      detailedDescriptionId: "",
      detailedDescriptionAvailable: true,
      detailedDescriptionSuccess : false
    };
    this.queue = new UpdateMermaidQueue(
      this.updateMermaidsWithDelay.bind(this)
    );
    this.apisTokens = {};
    this.controller = {};

    this.section1Ref = React.createRef();
  }

  shouldComponentUpdate(nextProps, nextState) {
    // If any of the conditions are true, then update the component
    return !(
      nextProps.loadDiagramApis === this.props.loadDiagramApis &&
      nextState.flowChartContent === this.state.flowChartContent &&
      nextState.blockDiagramContent === this.state.blockDiagramContent &&
      nextState.flowChartRetry === this.state.flowChartRetry &&
      nextState.blockDiagramRetry === this.state.blockDiagramRetry &&
      nextState.flowChartLoading === this.state.flowChartLoading &&
      nextState.blockDiagramLoading === this.state.blockDiagramLoading &&
      nextProps.enableExporting === this.props.enableExporting &&
      nextProps.generateRegenClaim === this.props.generateRegenClaim &&
      nextState.generateFlowDia === this.state.generateFlowDia &&
      nextState.generateBlockDia === this.state.generateBlockDia &&
      nextProps.regenrateLoading === this.props.regenrateLoading &&
      nextProps.regenrateClaimRetry === this.props.regenrateClaimRetry &&
      nextState.activeType === this.state.activeType &&
      nextState.flowChartMainBriefDescription ===
        this.state.flowChartMainBriefDescription &&
      nextState.flowChartMainMermaid === this.state.flowChartMainMermaid &&
      nextState.flowChartMermaidsData === this.state.flowChartMermaidsData &&
      nextState.blockDiaMainBriefDescription ===
        this.state.blockDiaMainBriefDescription &&
      nextState.blockDiaMainMermaid === this.state.blockDiaMainMermaid &&
      nextState.blockDiaMermaidsData === this.state.blockDiaMermaidsData &&
      nextState.blockDiaDetailedDescriptionLoading ===
        this.state.blockDiaDetailedDescriptionLoading &&
      nextState.blockDiaDetailedDescriptionRetry ===
        this.state.blockDiaDetailedDescriptionRetry &&
      nextState.flowChartDetailedDescriptionRetry ===
        this.state.flowChartDetailedDescriptionRetry &&
      nextState.flowChartDetailedDescriptionLoading ===
        this.state.flowChartDetailedDescriptionLoading &&
      nextState.blockDiaCommonRetry === this.state.blockDiaCommonRetry &&
      nextState.flowChartCommonRetry === this.state.flowChartCommonRetry &&
      nextState.flowChartMainBriefDescriptionLoading ===
        this.state.flowChartMainBriefDescriptionLoading &&
      nextState.blockDiagramMainBriefDescriptionLoading ===
        this.state.blockDiagramMainBriefDescriptionLoading &&
      nextState.blockDetailedDescriptionOfFigures ===
        this.state.blockDetailedDescriptionOfFigures &&
      nextState.flowChartDetailedDescriptionFigures ===
        this.state.flowChartDetailedDescriptionFigures &&
      nextProps.flowChartData === this.props.flowChartData &&
      nextProps.blockDiagramData === this.props.blockDiagramData &&
      nextState.streamingFlowchartDia === this.state.streamingFlowchartDia &&
      nextState.streamimgBlockDiagrams === this.state.streamimgBlockDiagrams &&
      nextState.streamingFlowCommon === this.state.streamingFlowCommon &&
      nextState.streamingBlockCommon === this.state.streamingBlockCommon &&
      nextState.callingFlowDescription === this.state.callingFlowDescription &&
      nextState.callingBlockDescription ===
        this.state.callingBlockDescription &&
      nextProps.redraftDiagrams === this.props.redraftDiagrams &&
      nextProps.isProjectComplete === this.props.isProjectComplete &&
      nextState.templateData === this.state.templateData &&
      nextState.loadingTemplate === this.state.loadingTemplate &&
      nextState.templateFigBase64 === this.state.templateFigBase64 &&
      nextState.isTemplateOpen === this.state.isTemplateOpen &&
      nextState.blockDetailedDescriptionLongMessage ===
        this.state.blockDetailedDescriptionLongMessage &&
      nextState.blockDetailedDescriptionShortMessage ===
        this.state.blockDetailedDescriptionShortMessage &&
      nextState.flowChartDetailedDescriptionShortMessage ===
        this.state.flowChartDetailedDescriptionShortMessage &&
      nextState.flowChartDetailedDescriptionLongMessage ===
        this.state.flowChartDetailedDescriptionLongMessage &&
      nextState.detailedDescriptionLoading ===
        this.state.detailedDescriptionLoading &&
      nextState.generateDetailedDescription ===
        this.state.generateDetailedDescription &&
      nextState.detailedDescriptionRetry ===
        this.state.detailedDescriptionRetry &&
      nextState.streamingDetailedDescription ===
        this.state.streamingDetailedDescription &&
      nextState.detailedDescriptionCommonRetry ===
        this.state.detailedDescriptionCommonRetry &&
      nextState.detailedDescriptionShortMessage ===
        this.state.detailedDescriptionShortMessage &&
      nextState.detailedDescriptionLongMessage ===
        this.state.detailedDescriptionLongMessage &&
      nextState.callingDetailedDescription ===
        this.state.callingDetailedDescription &&
      nextState.detailedDescriptionContent ===
        this.state.detailedDescriptionContent &&
      nextState.detailedDescriptionId === this.state.detailedDescriptionId &&
      nextState.detailedDescriptionAvailable ===
        this.state.detailedDescriptionAvailable &&
      nextProps.isRegenerteClaimAvailable ===
        this.props.isRegenerteClaimAvailable &&
        nextState.flowChartDetailedDescriptionSucess ===
        this.state.flowChartDetailedDescriptionSucess &&
        nextState.blockDetailedDescriptionSuccess === this.state.blockDetailedDescriptionSuccess &&
        nextState.detailedDescriptionSuccess === this.state.detailedDescriptionSuccess
    );
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.props.redraftDiagrams !== prevProps.redraftDiagrams) {
      this.setState({
        flowChartLoading: true,
        blockDiagramLoading: true,
        flowChartMainMermaid: "",
        flowChartMainBriefDescription: "",
        flowChartAvailable: true,
        flowChartRetry: false,
        flowsectionHistoryId: "",
        flowChartMermaidsData: "",
        generateFlowDia: false,

        blockDiaMainMermaid: "",
        blockDiaMainBriefDescription: "",
        blockDiagramAvailable: true,
        blockDiagramRetry: false,
        blocksectionHistoryId: "",
        blockDiaMermaidsData: "",
        generateBlockDia: false,
      });
    }

    this.toggleDescriptionSuccessOnDiagramUnavailable(prevProps, prevState)

    if (this.props.loadDiagramApis && !prevProps.loadDiagramApis) {
      if (!this.props.flowChartData) {
        this.getStoredFlowChart("initialLoad");
        this.props.setGetStoredFlowChart();
      } else {
        this.setState({ flowChartLoading: false });
        if (this.props.flowChartData?.is_error === "Success") {
          this.setState(
            {
              // flowChartMainMermaid: this.props.flowChartData?.["text"],
              flowChartMainBriefDescription:
                this.props.flowChartData?.["main_breif_description"],
              flowChartAvailable:
                this.props.flowChartData?.["diagram_available"] || false,
              flowChartRetry: false,
              flowsectionHistoryId:
                this.props.flowChartData?.["section_history_id"],
              flowChartMermaidsData: {
                mermaids: [],
                breif_descriptions:
                  this.props.flowChartData?.["breif_descriptions"],
              },
              generateFlowDia: false,
            },
            () => {
              if (this.props.flowChartData?.mermaids) {
                this.addUpdateTask(
                  this.props.flowChartData?.mermaids,
                  "flowChart"
                );
              }
              if (this.props.flowChartData?.main_mermaid) {
                this.addUpdateTask(
                  this.props.flowChartData?.main_mermaid,
                  "flowMain"
                );
              }
              this.props.flowChartAvailableHandler(
                this.state.flowChartAvailable,
                true,
                this.state.flowChartAvailable,
                this.state.flowChartRetry
              );
            }
          );

          if (
            this.props.flowChartData?.["is_error"] == "Success" &&
            this.props.flowChartData?.["diagram_available"] &&
            (!this.props.flowChartData?.["mermaids"] ||
              this.props.flowChartData?.["mermaids"].length == 0) &&
            this.props.flowChartData?.["main_mermaid"] &&
            this.props.flowChartData?.["main_mermaid"].length > 0
          ) {
            for (
              let i = 0;
              i < this.props.flowChartData?.["main_mermaid"].length;
              i++
            ) {
              this.countDiagrams();
            }
          } else if (
            this.props.flowChartData?.["is_error"] == "Success" &&
            this.props.flowChartData?.["diagram_available"] &&
            this.props.flowChartData?.["mermaids"] &&
            this.props.flowChartData?.["mermaids"].length > 0
          ) {
            for (
              let i = 0;
              i <
              this.props.flowChartData?.["mermaids"].length +
                (this.props.flowChartData?.["main_mermaid"] &&
                this.props.flowChartData?.["main_mermaid"].length > 0 &&
                this.props.flowChartData?.["diagram_available"]
                  ? this.props.flowChartData?.["main_mermaid"].length
                  : 0);
              i++
            ) {
              // console.log("diaCount C", i);
              this.countDiagrams();
            }
          }
        } else {
          this.setState(
            {
              flowChartRetry: true,
              flowChartLoading: false,
              flowLongMessage: this.props.flowChartData?.message_long,
              flowShortMessage: this.props.flowChartData?.message,
              flowsectionHistoryId:
                this.props.flowChartData?.["section_history_id"],
            },
            () => {
              this.props.flowChartAvailableHandler(
                null,
                false,
                false,
                this.state.flowChartRetry
              );
              this.props.diagramLoadingHandler(
                "isFlowLoading",
                this.state.flowChartLoading
              );
            }
          );
        }

        if (
          this.props.flowChartData?.["is_dd_error"] == "Success" &&
          this.props.flowChartData?.["detailed_description_figures"]
        ) {
          this.setState({
            flowChartDetailedDescriptionFigures:
              this.props.flowChartData?.["detailed_description_figures"],
            flowChartDetailedDescriptionLoading: false,
            flowChartDetailedDescriptionSucess : true
          });
        } else {
          this.setState({
            flowLongMessage: this.props.flowChartData?.message_long,
            flowShortMessage: this.props.flowChartData?.message,
            flowChartDetailedDescriptionRetry: true,
            flowChartDetailedDescriptionLoading: false,
            flowsectionHistoryId:
              this.props.flowChartData?.["section_history_id"],
            flowChartDetailedDescriptionLoading: false,
            flowChartDetailedDescriptionFigures: this.props.flowChartData?.[
              "detailed_description_figures"
            ]
              ? this.props.flowChartData?.["detailed_description_figures"]
              : "",
            flowChartDetailedDescriptionShortMessage:
              this.props.flowChartData?.["message_dd"],
            flowChartDetailedDescriptionLongMessage:
              this.props.flowChartData?.["message_dd_long"],
          });
        }
        this.props.diagramLoadingHandler("isFlowDetailedDescriptionLoading", false);
      }
      if (!this.props.blockDiagramData) {
        this.getStoredBlockDiagramHandler("initialLoad");
        this.props.setGetStoredFlowChart();
      } else {
        this.setState({ blockDiagramLoading: false });
        if (this.props.blockDiagramData?.is_error == "Success") {
          this.setState(
            {
              // blockDiaMainMermaid: this.props.blockDiagramData?.text,
              blockDiaMainBriefDescription:
                this.props.blockDiagramData?.main_breif_description,

              blockDiagramAvailable:
                this.props.blockDiagramData?.["diagram_available"] || false,
              blockDiagramRetry: false,
              blocksectionHistoryId:
                this.props.blockDiagramData?.["section_history_id"],

              blockDiaMermaidsData: {
                mermaids: [],
                breif_descriptions:
                  this.props.blockDiagramData?.breif_descriptions,
              },
              generateBlockDia: false,
            },
            () => {
              if (this.props.blockDiagramData?.mermaids) {
                this.addUpdateTask(
                  this.props.blockDiagramData?.mermaids,
                  "blockDiagram"
                );
              }
              if (this.props.blockDiagramData?.main_mermaid) {
                this.addUpdateTask(
                  this.props.blockDiagramData?.main_mermaid,
                  "blockMain"
                );
              }
              this.props.blockDiahandler(
                this.state.blockDiagramAvailable,
                true,
                this.state.blockDiagramAvailable,
                this.state.blockDiagramRetry
              );
              if (
                this.props.blockDiagramData?.["is_error"] == "Success" &&
                this.props.blockDiagramData?.["diagram_available"] &&
                (!this.props.blockDiagramData?.["mermaids"] ||
                  this.props.blockDiagramData?.["mermaids"].length == 0) &&
                this.props.blockDiagramData?.["main_mermaid"] &&
                this.props.blockDiagramData?.["main_mermaid"].length > 0
              ) {
                for (
                  let i = 0;
                  i < this.props.blockDiagramData?.["main_mermaid"].length;
                  i++
                ) {
                  this.countDiagrams();
                }
              } else if (
                this.props.blockDiagramData?.["is_error"] == "Success" &&
                this.props.blockDiagramData?.["diagram_available"] &&
                this.props.blockDiagramData?.["mermaids"] &&
                this.props.blockDiagramData?.["mermaids"].length > 0
              ) {
                for (
                  let i = 0;
                  i <
                  this.props.blockDiagramData?.["mermaids"].length +
                    (this.props.blockDiagramData?.["diagram_available"] &&
                    this.props.blockDiagramData?.["main_mermaid"] &&
                    this.props.blockDiagramData?.["main_mermaid"].length > 0
                      ? this.props.blockDiagramData?.["main_mermaid"].length
                      : 0);
                  i++
                ) {
                  this.countDiagrams();
                }
              }
            }
          );
        } else {
          this.setState(
            {
              blockDiagramRetry: true,
              blockDiagramLoading: false,
              blockShortMessage: this.props.blockDiagramData?.message,
              blockLongMessage: this.props.blockDiagramData?.message_long,
              blocksectionHistoryId:
                this.props.blockDiagramData?.["section_history_id"],
            },
            () => {
              this.props.blockDiahandler(
                null,
                false,
                false,
                this.state.blockDiagramRetry
              );
              this.props.diagramLoadingHandler(
                "isBlockLoading",
                this.state.blockDiagramLoading
              );
            }
          );
        }
        if (this.props.blockDiagramData?.["is_dd_error"] === "Success") {
          this.setState({
            blockDetailedDescriptionOfFigures:
              this.props.blockDiagramData?.detailed_description_figures,
            blockDiaDetailedDescriptionLoading: false,
            blockDetailedDescriptionSuccess :true
          });
        } else {
          this.setState({
            blockDiaDetailedDescriptionRetry: true,
            blockDiaDetailedDescriptionLoading: false,
            blocksectionHistoryId:
              this.props.blockDiagramData?.["section_history_id"],
            blockDetailedDescriptionOfFigures: this.props.blockDiagramData
              ?.detailed_description_figures
              ? this.props.blockDiagramData?.detailed_description_figures
              : "",
            blockDetailedDescriptionShortMessage:
              this.props.blockDiagramData?.message_dd,
            blockDetailedDescriptionLongMessage:
              this.props.blockDiagramData?.message_dd_long,
          });
        }
        this.props.diagramLoadingHandler("isBlockDetailedDescriptionLoading", false);
        this.props.diagramLoadingHandler("isBlockLoading", false);
      }
      if (!this.props.detailedDescriptionData) {
        this.getStoredDetailedDescription("initialLoad");
      } else {
        this.setState({ detailedDescriptionLoading: false });

        if (
          this.props.detailedDescriptionData &&
          !this.props.detailedDescriptionData?.["diagram_available"]
        ) {
          this.setState(
            {
              detailedDescriptionAvailable:
                this.props.detailedDescriptionData?.["diagram_available"] ||
                false,
              detailedDescriptionCommonRetry: false,
              detailedDescriptionLoading: false,
              generateDetailedDescription: false,
              detailedDescriptionRetry: false,
              streamingDetailedDescription: false,
            },
            () => {
              this.detailedDescriptionConnectingToParent();
            }
          );
          return;
        }
        if (this.props.detailedDescriptionData?.["is_error"] === "Success") {
          if (
            this.props.detailedDescriptionData?.["is_dd_error"] === "Success"
          ) {
            this.setState(
              {
                detailedDescriptionContent:
                  this.props.detailedDescriptionData
                    ?.detailed_description_figures,
                detailedDescriptionLoading: false,
                detailedDescriptionSuccess : true,
                detailedDescriptionId:
                this.props.detailedDescriptionData?.["section_history_id"],
              },
              () => {
                this.detailedDescriptionConnectingToParent();
              }
            );
          } else {
            this.setState(
              {
                detailedDescriptionRetry: true,
                detailedDescriptionLoading: false,
                detailedDescriptionId:
                  this.props.detailedDescriptionData?.["section_history_id"],
                detailedDescriptionContent: this.props.detailedDescriptionData
                  ?.detailed_description_figures
                  ? this.props.detailedDescriptionData
                      ?.detailed_description_figures
                  : "",
                detailedDescriptionShortMessage:
                  this.props.detailedDescriptionData?.message_dd,
                detailedDescriptionLongMessage:
                  this.props.detailedDescriptionData?.message_dd_long,
              },
              () => this.detailedDescriptionConnectingToParent()
            );
          }
        } else {
          this.setState(
            {
              detailedDescriptionCommonRetry: true,
              detailedDescriptionLoading: false,
              detailedDescriptionShortMessage:
                this.props.detailedDescriptionData?.message,
              detailedDescriptionLongMessage:
                this.props.detailedDescriptionData?.message_long,
              detailedDescriptionId:
                this.props.detailedDescriptionData?.["section_history_id"],
            },
            () => this.detailedDescriptionConnectingToParent()
          );
        }
      }
    }

    if (
      prevState.generateFlowDia !== this.state.generateFlowDia ||
      prevState.generateBlockDia !== this.state.generateBlockDia ||
      prevProps.generateRegenClaim !== this.props.generateRegenClaim ||
      prevState.flowChartAvailable !== this.state.flowChartAvailable ||
      prevState.blockDiagramAvailable !== this.state.blockDiagramAvailable ||
      prevState.flowChartCommonRetry !== this.state.flowChartCommonRetry ||
      prevState.flowChartRetry !== this.state.flowChartRetry ||
      prevState.blockDiaCommonRetry !== this.state.blockDiaCommonRetry ||
      prevState.callingFlowDescription !== this.state.callingFlowDescription ||
      prevState.callingBlockDescription !== this.state.callingBlockDescription
    ) {
      if (
        this.state.generateFlowDia ||
        this.state.generateBlockDia ||
        this.props.generateRegenClaim ||
        this.state.callingFlowDescription ||
        this.state.callingBlockDescription
      ) {
        this.props.generateDiaHandler(true);
      } else {
        this.props.generateDiaHandler(false);
      }
      if (
        (!this.state.flowChartAvailable && !this.state.blockDiagramAvailable) ||
        this.props.regenrateClaimRetry ||
        this.state.flowChartCommonRetry ||
        this.state.blockDiaCommonRetry ||
        (this.state.flowChartRetry && this.state.blockDiagramRetry)
      ) {
        this.props.generateDiaHandler(false);
      }
    }

    this.checkConditionForTemplateLoading(prevProps, prevState);
    if (this.state.isTemplateOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    this.blockDiaDescriptionHandler(prevProps, prevState);
    this.flowDiaDescriptionHandler(prevProps, prevState);

    // if(){
    //   this.props.diagramLoadingHandler("isFlowDetailedDescriptionLoading", false);
    // }
  };


  toggleDescriptionSuccessOnDiagramUnavailable = (prevProps, prevState)=>{

    if((prevState.flowChartAvailable !== this.state.flowChartAvailable) &&  !this.state.flowChartAvailable){
      this.setState({
        flowChartDetailedDescriptionSucess : true
      })
    }
    
    if((prevState.blockDiagramAvailable !== this.state.blockDiagramAvailable) &&  !this.state.blockDiagramAvailable){
      this.setState({
        blockDetailedDescriptionSuccess : true
      })
    }
    if((prevState.detailedDescriptionAvailable !== this.state.detailedDescriptionAvailable) &&  !this.state.detailedDescriptionAvailable){
      this.setState({
        detailedDescriptionSuccess : true
      })
    }

  }


  componentWillUnmount() {
    if (this.apisTokens) {
      Object.keys(this.apisTokens).map((key) => {
        this.apisTokens[key].cancel();
      });
    }

    if (this.controller) {
      Object.keys(this.controller).map((keys) => {
        this.controller[keys].abort();
      });
    }

    this.props.resetDiaCount();
    window.favloader.stop();
  }

  blockDiaDescriptionHandler = (prevProps, prevState) => {
    if (
      prevState.blockDiaDetailedDescriptionLoading !==
        this.state.blockDiaDetailedDescriptionLoading ||
      prevState.blockDiaDetailedDescriptionRetry !==
        this.state.blockDiaDetailedDescriptionRetry
    ) {
      this.props.blockDiaDescriptionHandler(
        this.state.blockDiaDetailedDescriptionLoading,
        this.state.blockDiaDetailedDescriptionRetry
      );
    }
  };

  flowDiaDescriptionHandler = (prevProps, prevState) => {
    if (
      prevState.flowChartDetailedDescriptionLoading !==
        this.state.flowChartDetailedDescriptionLoading ||
      prevState.flowChartDetailedDescriptionRetry !==
        this.state.flowChartDetailedDescriptionRetry
    ) {
      this.props.flowDiaDescriptionHandler(
        this.state.flowChartDetailedDescriptionLoading,
        this.state.flowChartDetailedDescriptionRetry
      );
    }
  };

  detailedDescriptionConnectingToParent = () => {
    try {
      this.props?.detailedDescriptionLoadingHandler(
        this.state.detailedDescriptionLoading
      );
      if (
        this.state.detailedDescriptionCommonRetry ||
        this.state.detailedDescriptionRetry
      ) {
        this.props?.detailedDescriptionRetryHandler(true);
      } else {
        this.props?.detailedDescriptionRetryHandler(false);
      }

      this.props.detailedDescriptionAvailableHandler(this.state.detailedDescriptionAvailable)
    } catch (e) {
      console.log(e);
    }
  };

  checkConditionForTemplateLoading = (prevProps, prevState) => {
    if (prevProps.isProjectComplete !== this.props.isProjectComplete) {
      if (
        this.props.isProjectComplete &&
        this.props.project?.config?.template
      ) {
        this.getStoredTemplate();
      }
    }
  };

  getStoredTemplate = async () => {
    this.setState({ loadingTemplate: true });
    try {
      let data = {
        claim_section_history_id: this.props.selectedClaimVersionId,
        project_id: this.props?.match?.params?.id,
      };
      let storedTemaplate = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_project_figure_data,
        data
      );

      if (
        storedTemaplate["status"] === "Success" &&
        storedTemaplate["response"] &&
        storedTemaplate["response"].length > 0
      ) {
        this.setState({
          templateData: storedTemaplate["response"],
        });
        let figuresData = storedTemaplate["response"]
          .map((data) =>
            data["name"] && data["base64_image"]
              ? { mermaid: data["base64_image"], name: data["name"] }
              : null
          )
          .filter(Boolean);
        this.setState({ templateFigBase64: figuresData });
      }
      this.setState({ loadingTemplate: false });
    } catch (e) {
      console.log(e);
      this.setState({ loadingTemplate: false });
    }
  };

  checkStreamingOfDiagrams = (type, state) => {
    if (

      this.state.streamingFlowchartDia ||
      this.state.streamimgBlockDiagrams ||
      this.state.streamingBlockCommon ||
      this.state.streamingFlowCommon 
    ) {
      this.props.diagramsStremingHandler(true);
    } else {
      this.props.diagramsStremingHandler(false);
    }

    if(
      this.state.callingFlowDescription ||
      this.state.callingBlockDescription ||
      this.state.streamingDetailedDescription
    ){
      this.props.detailedDescriptionStreamingHandler(true);
    }else{
      this.props.detailedDescriptionStreamingHandler(false);
    }
  };


  getDiagrams = async (endPoint, payload, section_history_id) => {
    try {
      if (this.apisTokens[endPoint]) {
        this.apisTokens[endPoint].cancel();
      }

      this.apisTokens[endPoint] = axios.CancelToken.source();

      let project_history_id;
      if (!this.props.projectHistoryId && !payload) {
        const url_id = this.props?.match?.params?.id;
        let get_project_history_id_data = {
          invention: this.props.inputValDataBase,
          project_id: url_id,
        };
        let select_project_history_value = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.select_project_history,
          get_project_history_id_data
        );
        project_history_id =
          select_project_history_value["response"][0]["project_history_id"];
      }

      let payLoad = {
        data: this.props.inputValDataBase,
        project_id: this.props?.match?.params?.id,
        project_history_id: this.props.projectHistoryId
          ? this.props.projectHistoryId
          : project_history_id,
        redraft: false,
      };

      if (this.props.selectedClaimVersionId) {
        payLoad["claim_section_history_id"] = this.props.selectedClaimVersionId;
      }
      if (this.props.regenerateClaimSectionHistoryId) {
        payLoad["regenerate_claim_section_history_id"] =
          this.props.regenerateClaimSectionHistoryId;
      }
      if (section_history_id) {
        payLoad["section_history_id"] = section_history_id;
      }

      return await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints[endPoint],
        payload ? payload : payLoad,
        this.apisTokens[endPoint]?.token
      );
    } catch (e) {
      console.log(e);
    }
  };

  getStream = async (
    endPoint,
    section_history_id,
    callBack,
    template = false
  ) => {
    try {
      if (this.controller[endPoint]) {
        this.controller[endPoint].abort();
      }
      this.controller[endPoint] = new AbortController();

      let payLoad = {
        data: this.props.inputValDataBase,
        project_id: this.props?.match?.params?.id,
        project_history_id: this.props.projectHistoryId,
        redraft: false,
      };
      if (section_history_id) {
        payLoad["section_history_id"] = section_history_id;
      }
      if (this.props.selectedClaimVersionId) {
        payLoad["claim_section_history_id"] = this.props.selectedClaimVersionId;
      }
      if (this.props.regenerateClaimSectionHistoryId) {
        payLoad["regenerate_claim_section_history_id"] =
          this.props.regenerateClaimSectionHistoryId;
      }
      if (template) {
        payLoad["template"] = true;
      }

      const callStreamApi = await streamApi.getData(
        "post",
        this.props.project?.api_config?.endpoints[endPoint],
        payLoad,
        this.controller[endPoint].signal,
        callBack
      );
    } catch (e) {
      console.log(e);
    }
  };

  getDetailedDescriptionCommon = async (getDetailedDescription) => {
    try {
      this.setState(
        {
          detailedDescriptionLoading: true,
          generateDetailedDescription: true,
          detailedDescriptionRetry: false,
          streamingDetailedDescription: true,
          detailedDescriptionCommonRetry: false,
        },
        () => {
          this.detailedDescriptionConnectingToParent();
          this.checkStreamingOfDiagrams();
        }
      );

      const callBack = async ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (isFinish) {
          this.setState({ streamingDetailedDescription: false }, () => {
            this.checkStreamingOfDiagrams();
          });
          if (retry) {
            this.setState(
              {
                detailedDescriptionCommonRetry: true,
                detailedDescriptionLoading: false,
                // blockDiagramContent: "",
                detailedDescriptionShortMessage: this.state.detailedDescriptionShortMessage ? this.state.detailedDescriptionShortMessage : shortMessage,
                detailedDescriptionLongMessage: this.state.detailedDescriptionLongMessage ? this.state.detailedDescriptionLongMessage : longMessage,
              },
              () => {
                this.detailedDescriptionConnectingToParent();
              }
            );
          } else {
            this.getStoredDetailedDescription("commonApi");
          }
        }
      };

      await this.getStream(
        "other_detailed_description_common",
        this.state.detailedDescriptionId,
        callBack
      );
    } catch (e) {
      console.log(e);
    }
  };

  getDetailedDescription = async (sectionHistoryId, retry = false) => {
    try {
      this.setState(
        {
          detailedDescriptionRetry: false,
          callingDetailedDescription: true,
          detailedDescriptionLoading: true,
          generateDetailedDescription: true,
          streamingDetailedDescription: true,
        },
        () => {
          this.checkStreamingOfDiagrams();
          this.detailedDescriptionConnectingToParent();
        }
      );

     

      const callBack = ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (content) {
          this.setState({
            detailedDescriptionLoading: false,
            detailedDescriptionContent: content,
            generateDetailedDescription: false,
          });
        }
        if (isFinish) {
          this.setState({ streamingDetailedDescription: false }, () => {
            this.checkStreamingOfDiagrams();
          });
          if (retry) {
            this.setState(
              {
                detailedDescriptionRetry: true,
                detailedDescriptionShortMessage: this.state.detailedDescriptionShortMessage ? this.state.detailedDescriptionShortMessage : shortMessage,
                detailedDescriptionLongMessage: this.state.detailedDescriptionLongMessage ? this.state.detailedDescriptionLongMessage : longMessage,
              },
              () => {
                this.detailedDescriptionConnectingToParent();
              }
            );

            this.setState({ detailedDescriptionContent: "" });
            return;
          } else {
            this.getStoredDetailedDescription("detailedDescription");
            this.setState(
              {
                callingDetailedDescription: false,
                detailedDescriptionLoading: false,
              },
              () => {
                this.checkStreamingOfDiagrams();
                this.detailedDescriptionConnectingToParent();
              }
            );
          }
        }
      };

      await this.getStream(
        "other_detailed_description",
        this.state.detailedDescriptionId,
        callBack
      );
    } catch (e) {
      console.log(e);
    }
  };

  getStoredDetailedDescription = async (callType) => {
    try {
      // this.props.checkForDownloadButtonhandler(false);
      let payLoad = {
        claim_section_history_id: this.props.selectedClaimVersionId,
      };

      let storedDetailedDescription = await this.getDiagrams(
        "select_other_detailed_description_clm",
        payLoad
      );

      if (callType == "initialLoad") {
        this.setState({ detailedDescriptionLoading: false });
      }

      if (
        storedDetailedDescription.status == "Success" &&
        storedDetailedDescription.response &&
        storedDetailedDescription.response.length == 0
      ) {
        this.getDetailedDescriptionCommon();
        return;
      } else if (
        storedDetailedDescription.status == "Success" &&
        storedDetailedDescription?.response &&
        storedDetailedDescription?.response?.length > 0 &&
        !storedDetailedDescription.response[0]?.["diagram_available"]
      ) {
        this.setState(
          {
            detailedDescriptionCommonRetry: false,
            detailedDescriptionLoading: false,
            detailedDescriptionAvailable:
              storedDetailedDescription.response[0]?.["diagram_available"] ||
              false,
            generateDetailedDescription: false,
            detailedDescriptionRetry: false,
            streamingDetailedDescription: false,
            detailedDescriptionId:
            storedDetailedDescription.response[0]["section_history_id"],
          },
          () => {
            this.detailedDescriptionConnectingToParent();
          }
        );
      } else if (
        storedDetailedDescription.status == "Success" &&
        storedDetailedDescription.response.length &&
        storedDetailedDescription.response.length > 0 &&
        storedDetailedDescription.response[0]?.["is_common_error"]
      ) {
        this.setState(
          {
            detailedDescriptionCommonRetry: true,
            detailedDescriptionLoading: false,
            detailedDescriptionShortMessage:
              storedDetailedDescription.response[0]?.message,
            detailedDescriptionLongMessage:
              storedDetailedDescription.response[0]?.message_long,
            detailedDescriptionAvailable:
              storedDetailedDescription.response[0]?.["diagram_available"] ||
              false,
            detailedDescriptionId:
              storedDetailedDescription.response[0]["section_history_id"],
          },
          () => {
            this.detailedDescriptionConnectingToParent();
            this.getDetailedDescriptionCommon();
          }
        );
      }

      if (
        storedDetailedDescription.response[0]?.["is_dd_error"] !== "Success" &&
        callType == "detailedDescription"
      ) {
        if (this.props?.project?.config?.multiRetry) {
          const sectionHistoryId = storedDetailedDescription?.response?.[0]?.["section_history_id"] || this.state.detailedDescriptionId;
          this.setState(
            {
              detailedDescriptionId : sectionHistoryId,
            },
            () => {
              this.getDetailedDescription();
            }
          );
        } else {
          this.setState(
            {
              detailedDescriptionRetry: true,
              detailedDescriptionLoading: false,
              detailedDescriptionId:
                storedDetailedDescription.response[0]["section_history_id"],
              detailedDescriptionShortMessage:
                storedDetailedDescription.response[0].message_dd,
              detailedDescriptionLongMessage:
                storedDetailedDescription.response[0].message_dd_long,
              detailedDescriptionContent:
                storedDetailedDescription.response[0][
                  "detailed_description_figures"
                ],
              detailedDescriptionAvailable:
                storedDetailedDescription.response[0]?.["diagram_available"] ||
                false,
            },
            () => {
              this.detailedDescriptionConnectingToParent();
            }
          );
        }
      } else if(
        storedDetailedDescription.response[0]?.["is_dd_error"] === "Success" &&
        callType == "detailedDescription"
      ){
        this.setState({
          detailedDescriptionRetry: false,
          detailedDescriptionLoading: false,
          detailedDescriptionId:
            storedDetailedDescription.response[0]["section_history_id"],
          detailedDescriptionShortMessage:
            storedDetailedDescription.response[0].message_dd,
          detailedDescriptionAvailable:
            storedDetailedDescription.response[0]?.["diagram_available"] ||
            false,
            detailedDescriptionSuccess : true
        })
      }
       else if (
        storedDetailedDescription.response[0]?.["is_dd_error"] !== "Success" &&
        !storedDetailedDescription.response[0]?.["is_common_error"] &&
        callType == "commonApi"
      ) {
        this.setState({
          detailedDescriptionId:
          storedDetailedDescription.response[0]["section_history_id"],
        },()=>{
          setTimeout(() => {
            this.getDetailedDescription(
              storedDetailedDescription.response[0]["section_history_id"]
            );
          }, 10);
        })

      }
    } catch (e) {
      console.log(e);
    }
  };

  // Method to add tasks to the queue
  addUpdateTask = (mermaids, type) => {
    this.queue.addTask({ mermaids, type });
  };

  //deyalying mermaid to avoid rendering issue
  updateMermaidsWithDelay = async ({ mermaids, type }) => {
    for (let i = 0; i < mermaids?.length; i++) {
      // Use Promise to create a delay
      await new Promise((resolve) =>
        setTimeout(resolve, type == "flowChart" ? 10 : 10)
      );

      if (type == "flowChart") {
        this.setState((prevState) => ({
          flowChartMermaidsData: {
            ...prevState.flowChartMermaidsData,
            mermaids: [
              ...prevState.flowChartMermaidsData.mermaids,
              mermaids[i],
            ],
          },
        }));
      } else if (type == "blockDiagram") {
        this.setState((prevState) => ({
          blockDiaMermaidsData: {
            ...prevState.blockDiaMermaidsData,
            mermaids: [...prevState.blockDiaMermaidsData.mermaids, mermaids[i]],
          },
        }));
      } else if (type == "flowMain") {
        this.setState((prevState) => ({
          flowChartMainMermaid: [
            ...prevState.flowChartMainMermaid,
            mermaids[i],
          ],
        }));
      } else if (type == "blockMain") {
        this.setState((prevState) => ({
          blockDiaMainMermaid: [...prevState.blockDiaMainMermaid, mermaids[i]],
        }));
      }
    }
  };

  getFlowDetailedDescription = async (section_history_id) => {
    try {
      this.setState((pre) => ({
        flowChartDetailedDescriptionCount:
          pre.flowChartDetailedDescriptionCount + 1,
      }));

      this.setState(
        {
          flowChartDetailedDescriptionRetry: false,
          callingFlowDescription: true,
          flowChartDetailedDescriptionLoading: true,
        },
        () => {
          this.checkStreamingOfDiagrams();
        }
      );

      // this.props.diagramLoadingHandler("isFlowLoading", true);
      const callBack = ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (content) {
          this.setState({ flowChartDetailedDescriptionLoading: false });

          this.setState({ flowChartDetailedDescriptionFigures: content });

          // this.setState((pre) => ({
          //   flowChartContent: {
          //     ...pre.flowChartContent,
          //     detailed_description_figures: content,
          //   },
          // }));
        }
        if (isFinish) {
          this.setState(
            {
              callingFlowDescription: false,
              flowChartLoading: false,
              flowChartDetailedDescriptionLoading : false
            },
            () => {
              this.checkStreamingOfDiagrams();
              // this.props.diagramLoadingHandler(
              //   "isFlowLoading",
              //   this.state.flowChartLoading
              // );
            }
          );

          if (retry) {
            this.setState({
              flowChartDetailedDescriptionRetry: true,
              flowChartDetailedDescriptionCount: 0,
              flowChartDetailedDescriptionShortMessage: this.state.flowChartDetailedDescriptionShortMessage ?  this.state.flowChartDetailedDescriptionShortMessage : shortMessage,
              flowChartDetailedDescriptionLongMessage: this.state.flowChartDetailedDescriptionLongMessage ?  this.state.flowChartDetailedDescriptionLongMessage : longMessage,
            });

            this.setState({ flowChartDetailedDescriptionFigures: "" });
            return;
          } else {
            this.getStoredFlowChart("flowDetailDescription");
          }
        }
      };

      let flowChart = await this.getStream(
        "flowchart_description",
        this.state.flowsectionHistoryId,
        callBack
      );
    } catch (e) {
      console.log(e);
    }
  };

  getBlockDetailedDescription = async (
    section_history_id,
    template = false
  ) => {
    try {
      this.setState((pre) => ({
        blockDiaDetailedDescriptionCount:
          pre.blockDiaDetailedDescriptionCount + 1,
      }));

      if (this.state.blockDiaDetailedDescriptionCount > 2) {
        // this.setState({
        //   blockDiaDetailedDescriptionRetry: true,
        //   blockDiaDetailedDescriptionCount: 0,
        // });
        // this.setState({ blockDetailedDescriptionOfFigures: "" });
        // return;
      }

      this.setState(
        {
          blockDiaDetailedDescriptionRetry: false,
          callingBlockDescription: true,
          blockDiaDetailedDescriptionLoading: true,
        },
        () => {
          this.checkStreamingOfDiagrams();
        }
      );

      // this.props.diagramLoadingHandler("isBlockLoading", true);
      const callBack = ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (content) {
          this.setState({
            blockDiaDetailedDescriptionLoading: false,
            blockDetailedDescriptionOfFigures: content,
          });
          // this.setState((pre) => ({
          //   blockDiagramContent: {
          //     ...pre.blockDiagramContent,
          //     detailed_description_figures: content,
          //   },
          // }));
        }
        if (isFinish) {
          this.setState(
            {
              callingBlockDescription: false,
              blockDiagramLoading: false,
              blockDiaDetailedDescriptionLoading: false,
            },
            () => {
              this.checkStreamingOfDiagrams();
              // this.props.diagramLoadingHandler(
              //   "isBlockLoading",
              //   this.state.blockDiagramLoading
              // );
            }
          );
          if (retry) {
            this.setState({
              blockDiaDetailedDescriptionRetry: true,
              blockDiaDetailedDescriptionCount: 0,
              blockDetailedDescriptionShortMessage: this.state.blockDetailedDescriptionShortMessage ?  this.state.blockDetailedDescriptionShortMessage : shortMessage,
              blockDetailedDescriptionLongMessage: this.state.blockDetailedDescriptionLongMessage ?  this.state.blockDetailedDescriptionLongMessage : longMessage,
            });
            this.setState({ blockDetailedDescriptionOfFigures: "" });
            return;
          } else {
            this.getStoredBlockDia("blockDetailDescription");
          }
        }
      };

      await this.getStream(
        "block_diagram_description",
        this.state.blocksectionHistoryId,
        callBack,
        template
      );
    } catch (e) {
      console.log(e);
    }
  };

  getStoredFlowChart = async (callType) => {
    this.props.checkForDownloadButtonhandler(false, 'figures');
    this.props.flowChartAvailableHandler(
      null,
      false,
      null,
      this.state.flowChartRetry
    );
    try {
      // if (callType !== "flowDetailDescription" && callType !== "commonApi") {
      //   this.setState({ flowChartLoading: true }, () =>
      //     this.props.diagramLoadingHandler(
      //       "isFlowLoading",
      //       this.state.flowChartLoading
      //     )
      //   );
      // }

      let payLoad = {
        claim_section_history_id: this.props.selectedClaimVersionId,
        callType: callType,
      };

      let storedFlowChart = await this.getDiagrams(
        "select_flowchart_diagram_clm",
        payLoad
      );

      // let response = storedFlowChart["response"];

      if (callType == "initialLoad") {
        this.setState({ flowChartLoading: false }, () =>
          this.props.diagramLoadingHandler(
            "isFlowLoading",
            this.state.flowChartLoading
          )
        );
      }
      
      if(callType == "initialLoad" &&  storedFlowChart?.response?.length > 0 && storedFlowChart?.response?.[0]?.["diagram_available"] === false){
        this.setState(
          {
            flowChartCommonRetry: false,
            flowChartLoading: false,
            flowLongMessage: storedFlowChart.response[0].message_long,
            flowShortMessage: storedFlowChart.response[0].message,
            flowChartDetailedDescriptionLoading : false,
            flowChartLoading: false,
            flowChartAvailable : false
          },
          () =>{
            this.props.diagramLoadingHandler(
              "isFlowLoading",
              this.state.flowChartLoading
            )
            this.props.flowChartAvailableHandler(
              this.state.flowChartAvailable,
              null,
              this.state.flowChartAvailable,
              this.state.flowChartRetry
            );
          }
        );
        return;
      }

      if (typeof callType === "undefined") {
        callType = "commonApi";
      }

      if (
        storedFlowChart.status == "Success" &&
        storedFlowChart.response &&
        storedFlowChart.response.length == 0
      ) {
        //call on initial project creation i.e empty database
        this.getFlowChartCommon();
        return;
      } else if (
        storedFlowChart.status == "Success" &&
        storedFlowChart.response &&
        storedFlowChart.response.length > 0 &&
        storedFlowChart.response[0]?.["is_common_error"]
      ) {
        //for flowchartCommon api error case
        if(this.props?.project?.config?.multiRetry){

          const sectionHistoryId = storedFlowChart?.response?.[0]?.["section_history_id"] || this.state.flowsectionHistoryId;

          this.setState(
            {
              flowsectionHistoryId : sectionHistoryId,
            },
            () => {
              this.getFlowChartCommon();
            }
          );
        }else{
          this.setState(
            {
              flowChartCommonRetry: true,
              flowChartLoading: false,
              flowLongMessage: storedFlowChart.response[0].message_long,
              flowShortMessage: storedFlowChart.response[0].message,
              flowChartDetailedDescriptionLoading : false
            },
            () =>
              this.props.diagramLoadingHandler(
                "isFlowLoading",
                this.state.flowChartLoading
              )
          );
        }

      } else if (
        storedFlowChart.response[0]?.["is_error"] === "Success" &&
        (callType == "commonApi" || callType === "initialLoad") &&
        storedFlowChart.response[0]?.["diagram_available"] === false &&
        storedFlowChart.status == "Success" &&
        storedFlowChart.response &&
        storedFlowChart.response.length > 0
      ) {
        this.setState(
          {
            generateFlowDia: false,
            flowChartAvailable: false,
            flowChartRetry: true,
            flowChartLoading: false,
            flowLongMessage: storedFlowChart.response[0].message_long,
            flowShortMessage: storedFlowChart.response[0].message,
            flowsectionHistoryId:
              storedFlowChart.response[0]["section_history_id"],
              flowChartDetailedDescriptionLoading : false
          },
          () => {
            this.props.flowChartAvailableHandler(
              this.state.flowChartAvailable,
              null,
              this.state.flowChartAvailable,
              this.state.flowChartRetry
            );
            this.props.diagramLoadingHandler(
              "isFlowLoading",
              this.state.flowChartLoading
            );
          }
        );
      } else if (
        storedFlowChart.response[0]?.["is_error"] === "Success" &&
        (callType == "commonApi" || callType === "initialLoad") &&
        storedFlowChart.response[0]?.["diagram_available"] === false &&
        storedFlowChart.status == "Success" &&
        storedFlowChart.response.length > 0
      ) {
        this.setState(
          {
            generateFlowDia: false,
            flowChartAvailable: false,
            flowChartRetry: true,
            flowChartLoading: false,
            flowLongMessage: storedFlowChart.response[0].message_long,
            flowShortMessage: storedFlowChart.response[0].message,
            flowsectionHistoryId:
              storedFlowChart.response[0]["section_history_id"],
          },
          () => {
            this.props.flowChartAvailableHandler(
              this.state.flowChartAvailable,
              null,
              this.state.flowChartAvailable,
              this.state.flowChartRetry
            );
            this.props.diagramLoadingHandler(
              "isFlowLoading",
              this.state.flowChartLoading
            );
          }
        );
      } else if (
        storedFlowChart.status == "Success" &&
        storedFlowChart.response &&
        storedFlowChart.response.length > 0 &&
        !storedFlowChart.response[0]?.["is_common_error"] &&
        (storedFlowChart.response[0]?.["is_error"] !== "Success" ||
          storedFlowChart.response[0]?.["is_dd_error"] !== "Success") &&
        (callType == "flowDiagram" ||
          callType == "commonApi" ||
          callType == "flowDetailDescription")
      ) {
        //flowchartCommmon api succes case
        // calling both flowchart and detailed description same time
        if (
          storedFlowChart.response[0]?.["is_error"] !== "Success" &&
          callType == "flowDiagram"
        ) {
          //flowchart Fail i.e flowChart Retry
          if (this.props?.project?.config?.multiRetry) {

            const sectionHistoryId = storedFlowChart?.response?.[0]?.["section_history_id"] || this.state.flowsectionHistoryId;

            this.setState(
              {
                flowsectionHistoryId : sectionHistoryId,
              },
              () => {
                this.getFlowChart("retry");
              }
            );
          } else {
            this.setState(
              {
                flowChartRetry: true,
                flowChartLoading: false,
                flowLongMessage: storedFlowChart.response[0].message_long,
                flowShortMessage: storedFlowChart.response[0].message,
                flowsectionHistoryId:
                  storedFlowChart.response[0]["section_history_id"],
              },
              () => {
                this.props.flowChartAvailableHandler(
                  null,
                  null,
                  null,
                  this.state.flowChartRetry
                );
              }
            );
          }

        } else if (
          storedFlowChart.response[0]?.["is_error"] !== "Success" &&
          callType == "commonApi"
        ) {
          // calling flowChart after common success
          this.setState(
            {
              flowsectionHistoryId:
                storedFlowChart.response[0]["section_history_id"],
            },
            () => this.getFlowChart("commonApi")
          );
        }

        if (
          storedFlowChart.response[0]?.["is_dd_error"] !== "Success" &&
          callType == "flowDetailDescription"
        ) {
          //detailedDesction fails, i.e detailed description retry
          if (this.props?.project?.config?.multiRetry) {
            const sectionHistoryId =
              storedFlowChart?.response?.[0]?.section_history_id ||
              this.state.flowsectionHistoryId; // Preserve the current state if section_history_id is not present
          
            this.setState(
              {
                flowsectionHistoryId: sectionHistoryId,
              },
              () => {
                this.getFlowDetailedDescription();
              }
            );
          }else {
            this.setState({
              flowChartDetailedDescriptionRetry: true,
              flowChartDetailedDescriptionLoading: false,
              flowsectionHistoryId:
                storedFlowChart.response[0]["section_history_id"],
              flowChartDetailedDescriptionShortMessage:
                storedFlowChart?.response[0]?.message_dd,
              flowChartDetailedDescriptionLongMessage:
                storedFlowChart?.response[0]?.message_dd_long,
            });
          }
        } else if (
          // calling detailed description after common success
          storedFlowChart.response[0]?.["is_dd_error"] !== "Success" &&
          callType == "commonApi"
        ) {
          setTimeout(() => {
            this.getFlowDetailedDescription(
              storedFlowChart.response[0]["section_history_id"]
            );
          }, 10);
        }
        // return;
      }

      if (
        storedFlowChart.status == "Success" &&
        storedFlowChart.response.length &&
        storedFlowChart.response.length > 0
      ) {
        if (
          storedFlowChart.response?.[0].is_error === "Success" &&
          callType === "initialLoad"
        ) {
          this.setState(
            {
              flowChartAvailable:
                storedFlowChart.response[0]?.["diagram_available"] || false,
              flowChartRetry: false,
              flowsectionHistoryId:
                storedFlowChart.response[0]?.["section_history_id"],
              generateFlowDia: false,
            },
            () => {
              this.props.flowChartAvailableHandler(
                this.state.flowChartAvailable,
                true,
                this.state.flowChartAvailable,
                this.state.flowChartRetry
              );
            }
          );
        }

        if (
          storedFlowChart.response?.[0].is_error === "Success" &&
          callType === "flowDiagram"
        ) {
          this.setState(
            {
              flowChartAvailable:
                storedFlowChart.response[0]?.["diagram_available"] || false,
              flowChartRetry: false,
              flowsectionHistoryId:
                storedFlowChart.response[0]?.["section_history_id"],
              generateFlowDia: false,
            },
            () => {
              this.props.flowChartAvailableHandler(
                this.state.flowChartAvailable,
                true,
                this.state.flowChartAvailable,
                this.state.flowChartRetry
              );
              if (
                storedFlowChart.response[0]["is_error"] == "Success" &&
                this.state.flowChartAvailable &&
                (!storedFlowChart.response[0]?.["mermaids"] ||
                  storedFlowChart.response[0]?.["mermaids"].length == 0) &&
                storedFlowChart.response[0]?.["main_mermaid"] &&
                storedFlowChart.response[0]?.["main_mermaid"].length > 0
              ) {
                for (
                  let i = 0;
                  i < storedFlowChart.response[0]?.["main_mermaid"].length;
                  i++
                ) {
                  this.countDiagrams();
                }
              } else if (
                storedFlowChart.response[0]["is_error"] == "Success" &&
                this.state.flowChartAvailable &&
                storedFlowChart.response[0]?.["mermaids"] &&
                storedFlowChart.response[0]?.["mermaids"].length > 0
              ) {
                for (
                  let i = 0;
                  i <
                  storedFlowChart.response[0]?.["mermaids"].length +
                    (storedFlowChart.response[0]?.["main_mermaid"] &&
                    storedFlowChart.response[0]?.["main_mermaid"].length > 0 &&
                    this.state.flowChartAvailable
                      ? storedFlowChart.response[0]?.["main_mermaid"].length
                      : 0);
                  i++
                ) {
                  this.countDiagrams();
                }
              }
            }
          );
        }

        if( storedFlowChart.response[0]?.["is_dd_error"] === "Success" &&
        callType == "flowDetailDescription"){
          this.setState({
            flowChartDetailedDescriptionRetry: false,
            flowChartDetailedDescriptionLoading: false,
            flowsectionHistoryId:
              storedFlowChart.response[0]["section_history_id"],
              flowChartDetailedDescriptionSucess : true  
          });
          this.props.diagramLoadingHandler("isFlowDetailedDescriptionLoading", false);
        } 
      }
    } catch (e) {
      console.log(e);
    }
  };

  countDiagrams = (type) => {
    this.props.incrementDiaCount();
  };

  getStoredBlockDiagramHandler = (type) => {
    this.getStoredBlockDia(type);
    this.props.blockDiahandler(null, false, null, this.state.blockDiagramRetry);
  };

  getFlowChartCommon = async () => {
    try {
      this.setState(
        {
          flowChartLoading: true,
          generateFlowDia: true,
          flowChartCommonRetry: false,
          streamingFlowCommon: true,
        },
        () => {
          this.props.diagramLoadingHandler(
            "isFlowLoading",
            this.state.flowChartLoading
          );
          this.checkStreamingOfDiagrams();
        }
      );

      const callBack = ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (isFinish) {
          this.setState({ streamingFlowCommon: false }, () => {
            this.checkStreamingOfDiagrams();
          });
          if (retry) {
            this.setState(
              {
                flowChartCommonRetry: true,
                flowChartLoading: false,
                // flowChartContent: "",
                flowLongMessage: this.state.flowLongMessage ? this.state.flowLongMessage : shortMessage,
                flowShortMessage: this.state.flowShortMessage ? this.state.flowShortMessage : longMessage,
              },
              () => {
                this.props.flowChartAvailableHandler(
                  null,
                  false,
                  false,
                  this.state.flowChartRetry
                );
                this.props.diagramLoadingHandler(
                  "isFlowLoading",
                  this.state.flowChartLoading
                );
              }
            );
          } else {
            this.getStoredFlowChart("commonApi");
          }
        }
      };

      let flowChartCommon = await this.getStream(
        "flowchart_common",
        this.state.flowsectionHistoryId,
        callBack
      );
    } catch (e) {
      console.log(e);
    }
  };

  getFlowChart = async (type) => {
    if (type == "retry") {
      this.setState(
        {
          flowChartMainBriefDescriptionLoading: true,
          flowChartRetry: false,
          flowChartMainBriefDescription: "",
          mermaids: "",
        },
        () =>
          this.props.diagramLoadingHandler(
            "isFlowLoading",
            this.state.flowChartLoading
          )
      );
    } else {
      // this.setState({ flowChartLoading: true, generateFlowDia: true }, () =>
      //   this.props.diagramLoadingHandler(
      //     "isFlowLoading",
      //     this.state.flowChartLoading
      //   )
      // );
    }
    this.setState(
      {
        streamingFlowchartDia: true,
        flowChartMainBriefDescriptionLoading: true,
      },
      () => {
        this.checkStreamingOfDiagrams();
      }
    );
    try {
      const callBack = ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (
          content?.breif_description ||
          content?.main_breif_descriptions ||
          content?.main_brief_descriptions
        ) {
          this.setState(
            {
              flowChartMainBriefDescription: content?.main_breif_descriptions
                ? content?.main_breif_descriptions
                : content?.main_brief_descriptions
                ? content?.main_brief_descriptions
                : content?.brief_description,
              flowChartLoading: false,
              flowChartRetry: false,
              generateFlowDia: false,
              flowChartMainBriefDescriptionLoading: false,
            },
            () =>
              this.props.diagramLoadingHandler(
                "isFlowLoading",
                this.state.flowChartLoading
              )
          );
        }

        if (content?.main_mermaids) {
          this.setState({ flowChartMainMermaid: content?.main_mermaids });
        }

        if (content?.mermaids) {
          this.setState({
            flowChartMermaidsData: {
              mermaids: content?.mermaids,
            },
          });
        }

        if (content?.breif_descriptions || content?.brief_descriptions) {
          let mermaids = this.state?.flowChartMermaidsData?.mermaids;
          this.setState({
            flowChartMermaidsData: {
              mermaids: mermaids,
              breif_descriptions: content?.breif_descriptions
                ? content?.breif_descriptions
                : content?.brief_descriptions,
            },
          });
        }
        if (isFinish) {
          this.setState(
            { streamingFlowchartDia: false, flowChartLoading: false },
            () => {
              this.checkStreamingOfDiagrams();
              this.props.diagramLoadingHandler(
                "isFlowLoading",
                this.state.flowChartLoading
              );
            }
          );
          if (retry) {
            this.setState(
              {
                flowChartRetry: true,
                flowChartLoading: false,
                // flowChartContent: "",
                flowLongMessage: this.state.flowLongMessage ? this.state.flowLongMessage : shortMessage,
                flowShortMessage: this.state.flowShortMessage ? this.state.flowShortMessage : longMessage,
                streamingFlowchartDia: false,
              },
              () => {
                this.props.flowChartAvailableHandler(
                  null,
                  false,
                  false,
                  this.state.flowChartRetry
                );
                this.props.diagramLoadingHandler(
                  "isFlowLoading",
                  this.state.flowChartLoading
                );
              }
            );
          } else {
            this.setState(
              { flowChartMainBriefDescriptionLoading: false },
              () => {
                this.getStoredFlowChart("flowDiagram");
              }
            );
          }
        }
      };

      let flowChart = await this.getStream(
        "flowchart_diagram",
        this.state.flowsectionHistoryId,
        callBack
      );
    } catch (e) {
      console.log(e);
    }
  };

  getStoredBlockDia = async (callType) => {
    this.props.checkForDownloadButtonhandler(false, 'figures');
    try {
      let payLoad = {
        claim_section_history_id: this.props.selectedClaimVersionId,
      };

      let storedBlockDia = await this.getDiagrams(
        "select_block_diagram_clm",
        payLoad
      );
      // if (typeof callType === "undefined") {
      //   callType = "commonApi";
      // }
      if (callType == "initialLoad") {
        this.setState({ blockDiagramLoading: false }, () =>
          this.props.diagramLoadingHandler(
            "isBlockLoading",
            this.state.blockDiagramLoading
          )
        );
      }
      if(callType == "initialLoad" && storedBlockDia?.response?.length > 0  && storedBlockDia?.response?.[0]?.["diagram_available"] === false){
        this.setState(
          {
            blockDiaCommonRetry: false,
            blockDiagramLoading: false,
            blockShortMessage: storedBlockDia.response[0]?.message,
            blockLongMessage: storedBlockDia.response[0]?.message_long,
            blocksectionHistoryId:
              storedBlockDia.response[0]["section_history_id"],
            blockDiaDetailedDescriptionLoading : false,
            blockDiagramLoading: false,
            blockDiagramAvailable : false
          },
          () => {
            this.props.diagramLoadingHandler(
              "isBlockLoading",
              this.state.blockDiagramLoading
            );
            this.props.blockDiahandler(
              this.state.blockDiagramAvailable,
              null,
              this.state.blockDiagramAvailable,
              this.state.blockDiagramRetry
            );
          }
        );
        return;
      }

      if (
        storedBlockDia.status == "Success" &&
        storedBlockDia.response &&
        storedBlockDia.response.length == 0
      ) {
        this.getBlockCommon();
        return;
      } else if (
        storedBlockDia.status == "Success" &&
        storedBlockDia.response &&
        storedBlockDia.response.length > 0 &&
        storedBlockDia.response[0]?.["is_common_error"]
      ) {
        if(this.props?.project?.config?.multiRetry){

          const sectionHistoryId = storedBlockDia?.response?.[0]?.["section_history_id"] || this.state.blocksectionHistoryId;

          this.setState(
            {
              blocksectionHistoryId : sectionHistoryId
            },
            ()=> {
              this.getBlockCommon();
            }
          );
        }else{
          this.setState(
            {
              blockDiaCommonRetry: true,
              blockDiagramLoading: false,
              blockShortMessage: storedBlockDia.response[0]?.message,
              blockLongMessage: storedBlockDia.response[0]?.message_long,
              blocksectionHistoryId:
                storedBlockDia.response[0]["section_history_id"],
              blockDiaDetailedDescriptionLoading : false
            },
            () => {
              this.props.diagramLoadingHandler(
                "isBlockLoading",
                this.state.blockDiagramLoading
              );
            }
          );
        }

      } else if (
        storedBlockDia.response[0]?.["is_error"] === "Success" &&
        (callType == "commonApi" || callType === "initialLoad") &&
        storedBlockDia.response[0]?.["diagram_available"] === false &&
        storedBlockDia.status == "Success" &&
        storedBlockDia.response &&
        storedBlockDia.response.length > 0
      ) {
        this.setState(
          {
            generateBlockDia: false,
            blockDiagramRetry: false,
            blockDiagramLoading: false,
            blockDiagramAvailable: false,
            blockShortMessage: storedBlockDia.response[0]?.message,
            blockLongMessage: storedBlockDia.response[0]?.message_long,
            blocksectionHistoryId:
              storedBlockDia.response[0]["section_history_id"],
            blockDiaDetailedDescriptionLoading : false
          },
          () => {
            this.props.blockDiahandler(
              this.state.blockDiagramAvailable,
              null,
              this.state.blockDiagramAvailable,
              this.state.blockDiagramRetry
            );
            this.props.diagramLoadingHandler(
              "isBlockLoading",
              this.state.blockDiagramLoading
            );
          }
        );
      } else if (
        storedBlockDia.response[0]?.["is_error"] === "Success" &&
        (callType == "commonApi" || callType === "initialLoad") &&
        storedBlockDia.response[0]?.["diagram_available"] === false &&
        storedBlockDia.status == "Success" &&
        storedBlockDia.response.length > 0
      ) {
        this.setState(
          {
            generateBlockDia: false,
            blockDiagramRetry: false,
            blockDiagramLoading: false,
            blockDiagramAvailable: false,
            blockShortMessage: storedBlockDia.response[0]?.message,
            blockLongMessage: storedBlockDia.response[0]?.message_long,
            blocksectionHistoryId:
              storedBlockDia.response[0]["section_history_id"],
          },
          () => {
            this.props.blockDiahandler(
              this.state.blockDiagramAvailable,
              null,
              this.state.blockDiagramAvailable,
              this.state.blockDiagramRetry
            );
            this.props.diagramLoadingHandler(
              "isBlockLoading",
              this.state.blockDiagramLoading
            );
          }
        );
      } else if (
        storedBlockDia.status == "Success" &&
        storedBlockDia.response &&
        storedBlockDia.response.length > 0 &&
        !storedBlockDia.response[0]?.["is_common_error"] &&
        (storedBlockDia.response[0]?.["is_error"] !== "Success" ||
          storedBlockDia.response[0]?.["is_dd_error"] !== "Success") &&
        (callType == "blockDiagram" ||
          callType == "commonApi" ||
          callType == "blockDetailDescription")
      ) {
        if (
          storedBlockDia.response[0]?.["is_error"] !== "Success" &&
          callType == "blockDiagram"
        ) {
          if (this.props?.project?.config?.multiRetry) {

            const sectionHistoryId =  storedBlockDia?.response?.[0]?.["section_history_id"] || this.state.blocksectionHistoryId

            this.setState(
              {
                blocksectionHistoryId : sectionHistoryId,
              },
              () => {
                this.getBlockDia("retry");
              }
            );
          } else {
            this.setState(
              {
                blockDiagramRetry: true,
                blockDiagramLoading: false,
                blockShortMessage: storedBlockDia.response[0].message,
                blockLongMessage: storedBlockDia.response[0].message_long,
                blocksectionHistoryId:
                  storedBlockDia.response[0]["section_history_id"],
              },
              () => {
                this.props.blockDiahandler(
                  null,
                  null,
                  null,
                  this.state.blockDiagramRetry
                );
              }
            );
          }
        } else if (
          storedBlockDia.response[0]?.["is_error"] !== "Success" &&
          callType == "commonApi"
        ) {
          this.setState(
            {
              blocksectionHistoryId:
                storedBlockDia.response[0]["section_history_id"],
            },
            () => {
              this.getBlockDia("commonApi");
            }
          );
        }
        

        if (
          storedBlockDia.response[0]?.["is_dd_error"] !== "Success" &&
          callType == "blockDetailDescription"
        ) {
          if (this.props?.project?.config?.multiRetry) {

            const sectionHistoryId = storedBlockDia?.response?.[0]?.["section_history_id"] || this.state.blocksectionHistoryId;

            this.setState(
              {
                blocksectionHistoryId : sectionHistoryId,
              },
              () => {
                this.getBlockDetailedDescription();
              }
            );
          } else {
            this.setState({
              blockDiaDetailedDescriptionRetry: true,
              blockDiaDetailedDescriptionLoading: false,
              blocksectionHistoryId:
                storedBlockDia.response[0]["section_history_id"],
              blockDetailedDescriptionShortMessage:
                storedBlockDia.response[0].message_dd,
              blockDetailedDescriptionLongMessage:
                storedBlockDia.response[0].message_dd_long,
            });
          }
        }else if (
          storedBlockDia.response[0]?.["is_dd_error"] !== "Success" &&
          callType == "commonApi"
        ) {
          setTimeout(() => {
            this.getBlockDetailedDescription(
              storedBlockDia.response[0]["section_history_id"]
            );
          }, 10);
        }
        // return;
      }

      if (
        storedBlockDia.status == "Success" &&
        storedBlockDia.response &&
        storedBlockDia.response.length > 0
      ) {
        if (
          storedBlockDia.response?.[0].is_error == "Success" &&
          callType === "initialLoad"
        ) {
          this.setState(
            {
              blockDiagramAvailable:
                storedBlockDia.response[0]["diagram_available"] || false,
              blockDiagramRetry: false,
              blocksectionHistoryId:
                storedBlockDia.response[0]["section_history_id"],
              generateBlockDia: false,
            },
            () => {
              this.props.blockDiahandler(
                this.state.blockDiagramAvailable,
                true,
                this.state.blockDiagramAvailable,
                this.state.blockDiagramRetry
              );
            }
          );
        }

        if (
          storedBlockDia.response?.[0].is_error == "Success" &&
          callType === "blockDiagram"
        ) {
          this.setState(
            {
              blockDiagramAvailable:
                storedBlockDia.response[0]["diagram_available"] || false,
              blockDiagramRetry: false,
              blocksectionHistoryId:
                storedBlockDia.response[0]["section_history_id"],
              generateBlockDia: false,
            },
            () => {
              this.props.blockDiahandler(
                this.state.blockDiagramAvailable,
                true,
                this.state.blockDiagramAvailable,
                this.state.blockDiagramRetry
              );
              if (
                storedBlockDia.response[0]["is_error"] == "Success" &&
                this.state.blockDiagramAvailable &&
                (!storedBlockDia.response[0]?.["mermaids"] ||
                  (storedBlockDia.response[0]?.["mermaids"] &&
                    storedBlockDia.response[0]?.["mermaids"].length == 0)) &&
                storedBlockDia.response[0]?.["main_mermaid"] &&
                storedBlockDia.response[0]?.["main_mermaid"].length > 0
              ) {
                for (
                  let i = 0;
                  i < storedBlockDia.response[0]?.["main_mermaid"]?.length;
                  i++
                ) {
                  this.countDiagrams();
                }
              } else if (
                storedBlockDia.response[0]["is_error"] == "Success" &&
                this.state.blockDiagramAvailable &&
                storedBlockDia.response[0]?.["mermaids"] &&
                storedBlockDia.response[0]?.["mermaids"].length > 0
              ) {
                for (
                  let i = 0;
                  i <
                  storedBlockDia.response[0]?.["mermaids"].length +
                    (storedBlockDia.response[0]?.["main_mermaid"] &&
                    storedBlockDia.response[0]?.["main_mermaid"].length > 0 &&
                    this.state.blockDiagramAvailable
                      ? storedBlockDia.response[0]?.["main_mermaid"].length
                      : 0);
                  i++
                ) {
                  this.countDiagrams();
                }
              }
            }
          );
        }

        if( storedBlockDia.response[0]?.["is_dd_error"] === "Success" &&
        callType == "blockDetailDescription"){
          this.setState({
            blockDiaDetailedDescriptionRetry: false,
            blockDiaDetailedDescriptionLoading: false,
            blocksectionHistoryId:
              storedBlockDia.response[0]["section_history_id"],
              blockDetailedDescriptionSuccess : true
          });
        } 
      }
    } catch (e) {
      console.log(e);
    }
  };

  getBlockCommon = async () => {
    try {
      this.setState(
        {
          blockDiagramLoading: true,
          generateBlockDia: true,
          blockDiaCommonRetry: false,
          streamingBlockCommon: true,
        },
        () => {
          this.props.diagramLoadingHandler(
            "isBlockLoading",
            this.state.blockDiagramLoading
          );
          this.checkStreamingOfDiagrams();
        }
      );

      const callBack = async ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (isFinish) {
          this.setState({ streamingBlockCommon: false }, () => {
            this.checkStreamingOfDiagrams();
          });
          if (retry) {
            this.setState(
              {
                blockDiaCommonRetry: true,
                blockDiagramLoading: false,
                // blockDiagramContent: "",
                blockShortMessage: this.state.blockShortMessage ? this.state.blockShortMessage : shortMessage,
                blockLongMessage: this.state.blockLongMessage ? this.state.blockLongMessage : longMessage,
              },
              () => {
                this.props.blockDiahandler(
                  null,
                  false,
                  false,
                  this.state.blockDiagramRetry
                );
                this.props.diagramLoadingHandler(
                  "isBlockLoading",
                  this.state.blockDiagramLoading
                );
              }
            );
          } else {
            this.getStoredBlockDia("commonApi");
          }
        }
      };

      let blockDiagramCommon = await this.getStream(
        "block_diagram_common",
        this.state.blocksectionHistoryId,
        callBack
      );
    } catch (e) {
      console.log(e);
    }
  };

  getBlockDia = async (type) => {
    if (type == "retry") {
      this.setState(
        {
          blockDiagramMainBriefDescriptionLoading: true,
          blockDiagramRetry: false,
          blockDiaMainBriefDescription: "",
          mermaids: "",
        },
        () =>
          this.props.diagramLoadingHandler(
            "isBlockLoading",
            this.state.blockDiagramLoading
          )
      );
    } else {
      this.setState({ blockDiagramLoading: true, generateBlockDia: true }, () =>
        this.props.diagramLoadingHandler(
          "isBlockLoading",
          this.state.blockDiagramLoading
        )
      );
    }

    this.setState(
      {
        streamimgBlockDiagrams: true,
        blockDiagramMainBriefDescriptionLoading: true,
      },
      () => {
        this.checkStreamingOfDiagrams();
      }
    );

    try {
      const callBack = async ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (
          content?.breif_description ||
          content?.main_breif_descriptions ||
          content?.main_brief_descriptions
        ) {
          this.setState(
            {
              blockDiaMainBriefDescription: content?.main_breif_descriptions
                ? content?.main_breif_descriptions
                : content?.main_brief_descriptions
                ? content?.main_brief_descriptions
                : content?.brief_description,
              blockDiagramLoading: false,
              blockDiagramRetry: false,
              generateBlockDia: false,
              blockDiagramMainBriefDescriptionLoading: false,
            },
            () =>
              this.props.diagramLoadingHandler(
                "isBlockLoading",
                this.state.blockDiagramLoading
              )
          );
        }

        if (content?.main_mermaids) {
          this.setState({ blockDiaMainMermaid: content?.main_mermaids });
        }

        if (content?.mermaids) {
          this.setState({
            blockDiaMermaidsData: {
              mermaids: content?.mermaids,
            },
            blockDiagramMainBriefDescriptionLoading: false,
          });
        }

        if (
          content?.breif_descriptions ||
          content?.Goal_claim_group_mermaids ||
          content?.brief_descriptions
        ) {
          let mermaids = this.state?.blockDiaMermaidsData?.mermaids;
          this.setState({
            blockDiaMermaidsData: {
              mermaids: mermaids,
              breif_descriptions: content?.Goal_claim_group_mermaids
                ? content?.Goal_claim_group_mermaids
                : content?.brief_descriptions
                ? content?.brief_descriptions
                : content?.breif_descriptions,
            },
          });
        }

        if (isFinish) {
          this.setState(
            { streamimgBlockDiagrams: false, blockDiagramLoading: false },
            () => {
              this.checkStreamingOfDiagrams();
              this.props.diagramLoadingHandler(
                "isBlockLoading",
                this.state.blockDiagramLoading
              );
            }
          );

          if (retry) {
            this.setState(
              {
                blockDiagramRetry: true,
                blockDiagramLoading: false,
                // blockDiagramContent: "",
                blockShortMessage: this.state.blockShortMessage ? this.state.blockShortMessage : shortMessage,
                blockLongMessage: this.state.blockLongMessage ? this.state.blockLongMessage : longMessage,
                streamimgBlockDiagrams: false,
              },
              () => {
                this.props.blockDiahandler(
                  null,
                  false,
                  false,
                  this.state.blockDiagramRetry
                );
                this.props.diagramLoadingHandler(
                  "isBlockLoading",
                  this.state.blockDiagramLoading
                );
              }
            );
          } else {
            this.getStoredBlockDiagramHandler("blockDiagram");
          }
        }
      };

      let blockDiagrams = await this.getStream(
        "block_diagram",
        this.state.blocksectionHistoryId,
        callBack
      );
      this.setState({ generateBlockDia: false });
    } catch (e) {
      console.log(e);
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

  mermaid = (mermaidData, diaName, diaType = "") => {
    const uniqueId = `mermaid-${new Date().getTime()}`; // Creates a unique ID using current timestamp
    return (
      <Mermaid
        initiateExport={true}
        enableExporting={this.props.enableExporting}
        {...this.props}
        preContent={mermaidData}
        projectId={this.props.match?.params?.id}
        inventionTitle={this.props.inventionTitle}
        diagramType={diaType}
        diagramName={diaName}
        templateFigBase64={this.state.templateFigBase64}
        id={uniqueId}
      />
    );
  };

  templateHandler = () => {
    this.setState((pre) => ({
      isTemplateOpen: !pre.isTemplateOpen,
    }));
  };

  saveTemplateHandler = (cancel = false) => {
    if (cancel) {
      this.setState({
        isTemplateOpen: false,
      });
    } else {
      this.templateHandler();
      this.getStoredTemplate();
      this.getBlockDetailedDescription(null, true);
    }
  };

  addFiguresButton = () => {
    if (this.props.project?.config?.template) {
      return (
        <span
          className={`${
            this.props.isProjectComplete
              ? "regen-button prompt-button"
              : "disable-template-button"
          }`}
          onClick={() => {
            this.props.isProjectComplete && this.templateHandler();
          }}
        >
          Add Figures
        </span>
      );
    }
  };

  render() {
    const { sectionRefs } = this.props;
    // console.log("blockDiaMermaidsData==>", this.state.blockDiaMermaidsData);
    return (
      <>
        {this.state.flowChartAvailable && (
          <>
            {this.props.regenrateLoading && !this.props.regenrateClaimRetry ? (
              <Row className={classes.contenetContainer}>
                {" "}
                <span ref={sectionRefs.figuresRef}></span>
                {
                  <div className="diagrams-figures-heading-cont">
                    <h2 className={classes.patentDetailHeading}>Figures</h2>
                    {this.addFiguresButton()}
                  </div>
                }
                {this.props.generateRegenClaim ? (
                  <CountdownTimer
                    targetDate={
                      this.props.project.expectedTimeout.regenerate_claim
                    }
                    sectionType={"Regenerate Claims"}
                  />
                ) : (
                  <>
                    <Abstract />
                  </>
                )}
              </Row>
            ) : !this.props.regenrateLoading &&
              this.props.regenrateClaimRetry ? (
              <Row className={classes.contenetContainer}>
                <span ref={sectionRefs.figuresRef}></span>
                <div className="diagrams-figures-heading-cont">
                  <h2 className={classes.patentDetailHeading}>Figures </h2>
                  {this.addFiguresButton()}
                </div>

                <Col className={`${classes.content}`}>
                  <div className={classes.cautionContentCont}>
                    {this.props.regenClaimError && (
                      <span className={classes.cautionContent}>
                        {" "}
                        <img className={classes.info} src={info} />
                        {this.props.regenClaimError}
                        <span className={classes.overlayText}>
                          {this.props.regenClaimLongError}
                        </span>
                      </span>
                    )}
                    <span
                      style={{
                        backgroundColor: "#FF7E57",
                        border: "0px",
                      }}
                      className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
                      onClick={() => this.props.regenerateClaims()}
                    >
                      <span className="version-title">Retry</span>
                    </span>
                  </div>
                </Col>
              </Row>
            ) : (
              ""
            )}

            {this.props.isRegenerteClaimAvailable && (
              <div key="flow-chart">
                {this.state.flowChartLoading ? (
                  <Row className={classes.contenetContainer}>
                    {" "}
                    <span ref={sectionRefs.flowChartRef}></span>
                    {!this.props.generateRegenClaim && (
                      <div className="diagrams-figures-heading-cont">
                        <h2 className={classes.patentDetailHeading}>
                          {"Figures"}
                        </h2>
                        {this.addFiguresButton()}
                      </div>
                    )}
                    {this.state.generateFlowDia ? (
                      <CountdownTimer
                        targetDate={
                          this.props.project.expectedTimeout.flowchart_diagram
                        }
                        sectionType={"Flowchart"}
                      />
                    ) : (
                      <Abstract />
                    )}
                  </Row>
                ) : this.state.flowChartCommonRetry ? (
                  <Row className={classes.contenetContainer}>
                    <span ref={sectionRefs.flowChartRef}></span>
                    {!this.props.generateRegenClaim && (
                      <div className="diagrams-figures-heading-cont">
                        <h2 className={classes.patentDetailHeading}>
                          {"Figures"}
                        </h2>
                        {this.addFiguresButton()}
                      </div>
                    )}

                    <Col className={`${classes.content}`}>
                      <div className={classes.cautionContentCont}>
                        {this.state.flowShortMessage && (
                          <span className={classes.cautionContent}>
                            {" "}
                            <img className={classes.info} src={info} />
                            {this.state.flowShortMessage}
                            <span className={classes.overlayText}>
                              {this.state.flowLongMessage}
                            </span>
                          </span>
                        )}
                        <span
                          style={{
                            backgroundColor: "#FF7E57",
                            border: "0px",
                          }}
                          className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
                          onClick={() => this.getFlowChartCommon()}
                        >
                          <span className="version-title">Retry</span>
                        </span>
                      </div>
                    </Col>
                  </Row>
                ) : !this.state.flowChartAvailable ? (
                  <Row className={classes.contenetContainer}>
                    {" "}
                    <span ref={sectionRefs.flowChartRef}></span>
                    {!this.props.generateRegenClaim && (
                      <div className="diagrams-figures-heading-cont">
                        <h2 className={classes.patentDetailHeading}>
                          {"Figures"}
                        </h2>
                        {this.addFiguresButton()}
                      </div>
                    )}
                    <div className="no-flow-chart-image-cont">
                      <img src={noDataImage} />
                      <span>
                        No flowchart is available for the provided set of claims
                      </span>
                    </div>
                  </Row>
                ) : (
                  <>
                    <Row className={classes.contenetContainer}>
                      <span ref={sectionRefs.flowChartRef}></span>
                      {!this.props.generateRegenClaim && (
                        <div className="diagrams-figures-heading-cont">
                          <h2 className={classes.patentDetailHeading}>
                            {"Figures"}
                          </h2>
                          {this.addFiguresButton()}
                        </div>
                      )}

                      <Col className={`${classes.content}`}>
                        {this.state.flowChartMainBriefDescriptionLoading &&
                        !this.state.flowChartRetry ? (
                          <>
                            <div>
                              <p className={classes.subHeading}>
                                {"FIG.1 Brief Description"}
                              </p>
                            </div>
                            <Abstract />
                          </>
                        ) : (
                          ""
                        )}
                      </Col>
                    </Row>
                    {
                      <Row
                        className={`${classes.contenetContainer} ${classes.embodimentsSection}`}
                      >
                        {
                          <Col
                            className={`${classes.content}`}
                            lg={12}
                            xs={12}
                            md={12}
                            sm={12}
                          >
                            <div>
                              {this.state.flowChartRetry ? (
                                <>
                                  <p className={classes.subHeading}>
                                    FIG.1 Diagram
                                  </p>
                                  <div className={classes.cautionContentCont}>
                                    {this.state.flowShortMessage && (
                                      <span className={classes.cautionContent}>
                                        {" "}
                                        <img
                                          className={classes.info}
                                          src={info}
                                        />
                                        {this.state.flowShortMessage}
                                        <span className={classes.overlayText}>
                                          {this.state.flowLongMessage}
                                        </span>
                                      </span>
                                    )}
                                    <span
                                      style={{
                                        backgroundColor: "#FF7E57",
                                        border: "0px",
                                      }}
                                      className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
                                      onClick={() => this.getFlowChart("retry")}
                                    >
                                      <span className="version-title">
                                        Retry
                                      </span>
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div>
                                  {" "}
                                  {this.state?.flowChartMainMermaid &&
                                    this.state?.flowChartMainBriefDescription &&
                                    this.state?.flowChartMainBriefDescription
                                      ?.length > 0 &&
                                    Array.isArray(
                                      this.state?.flowChartMainBriefDescription
                                    ) &&
                                    !this.state
                                      .flowChartMainBriefDescriptionLoading &&
                                    this.state?.flowChartMainMermaid.length >
                                      0 &&
                                    this.state?.flowChartMainBriefDescription.map(
                                      (data, index) => {
                                        let mermaidData =
                                          this.state.flowChartMainMermaid &&
                                          index >= 0 &&
                                          this.state.flowChartMainMermaid
                                            ?.length > 0
                                            ? this.state.flowChartMainMermaid?.[
                                                index
                                              ]?.["mermaid"]
                                            : "";
                                        return (
                                          <div key={index}>
                                            <Col
                                              className={`${classes.content}`}
                                            >
                                              <div>
                                                <p
                                                  className={classes.subHeading}
                                                >
                                                  {`${
                                                    data?.title
                                                      ? data?.title
                                                      : data?.main_mermaid_number
                                                  } Brief Description`}
                                                </p>
                                              </div>
                                              {data?.brief_description && (
                                                <>
                                                  {this.copyElement(
                                                    data?.brief_description,
                                                    "Brief Description"
                                                  )}
                                                  <pre className={classes.pre}>
                                                    {data?.brief_description}
                                                  </pre>
                                                </>
                                              )}
                                              <div className="border-bottom"></div>
                                            </Col>
                                            {mermaidData && (
                                              <>
                                                <p
                                                  className={classes.subHeading}
                                                >
                                                  {`${
                                                    data?.title
                                                      ? data?.title
                                                      : data?.main_mermaid_number
                                                  } Diagram`}
                                                </p>
                                                <div
                                                  className={
                                                    classes.flowChartImgCont
                                                  }
                                                >
                                                  <div
                                                    onClick={(e) =>
                                                      this.props.previewHandler(
                                                        null,
                                                        e,
                                                        mermaidData,
                                                        "flow",
                                                        data?.title
                                                          ? data?.title
                                                          : data?.main_mermaid_number
                                                      )
                                                    }
                                                    className="preview-button-cont"
                                                  >
                                                    <img
                                                      src={preview_icon}
                                                      alt="preview"
                                                    />
                                                    Zoom
                                                  </div>

                                                  {mermaidData &&
                                                    (data?.title ||
                                                      data?.main_mermaid_number) &&
                                                    (data?.brief_description ||
                                                      data?.breif_description) &&
                                                    this.mermaid(
                                                      mermaidData,
                                                      data?.title
                                                        ? data?.title
                                                        : data?.main_mermaid_number
                                                    )}
                                                </div>
                                              </>
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                </div>
                              )}
                            </div>
                            <>
                              {!this.state.flowChartMermaidsData
                                ?.breif_descriptions &&
                                !this.state.flowChartRetry &&
                                this.state.streamingFlowchartDia &&
                                !this.state.flowChartRetry && (
                              <div
                                    className={`${classes.contenetContainer}  diagrams-list-abstract`}
                                  >
                                    <Abstract />
                                    <Abstract />
                                  </div>
                                )}

                              {this.state.flowChartMermaidsData
                                ?.breif_descriptions &&
                                !this.state.flowChartRetry &&
                                Array.isArray(
                                  this.state.flowChartMermaidsData
                                    ?.breif_descriptions
                                ) &&
                                this.state.flowChartMermaidsData?.breif_descriptions.map(
                                  (data, index) => {
                                    let mermaidItem =
                                      this.state.flowChartMermaidsData
                                        ?.mermaids &&
                                      index >= 0 &&
                                      this.state.flowChartMermaidsData?.mermaids
                                        .length > 0
                                        ? this.state.flowChartMermaidsData
                                            ?.mermaids?.[index]?.["mermaid"]
                                        : "";
                                    return (
                                      <div key={index}>
                                        <Row
                                          className={classes.contenetContainer}
                                        >
                                          <Col className={`${classes.content}`}>
                                            <div>
                                              <p className={classes.subHeading}>
                                                {data?.title
                                                  ? data?.title +
                                                    " Brief Description"
                                                  : data?.sub_mermaid_number +
                                                    " Brief Description"}
                                              </p>
                                            </div>
                                            {(data.breif_description ||
                                              data?.brief_description) && (
                                              <>
                                                {this.copyElement(
                                                  data?.breif_description ||
                                                    data?.brief_description,
                                                  "Brief Description"
                                                )}
                                                <pre className={classes.pre}>
                                                  {data?.breif_description ||
                                                    data?.brief_description}
                                                </pre>
                                              </>
                                            )}
                                            <div className="border-bottom"></div>
                                          </Col>
                                        </Row>
                                        {mermaidItem && (
                                          <Row
                                            className={`${classes.contenetContainer} ${classes.embodimentsSection}`}
                                          >
                                            <Col
                                              className={`${classes.content}`}
                                              // lg={6}
                                              // xs={12}
                                              // md={12}
                                              // sm={12}
                                            >
                                              <div>
                                                <p
                                                  className={classes.subHeading}
                                                >
                                                  {data?.title
                                                    ? data?.title + " Diagram"
                                                    : data?.sub_mermaid_number +
                                                      " Diagram"}
                                                </p>
                                                <div className="diagrams-mermaid-container">
                                                  {(data?.title ||
                                                    data?.sub_mermaid_number) &&
                                                    mermaidItem && (
                                                      <div
                                                        className={
                                                          classes.flowChartImgCont
                                                        }
                                                      >
                                                        <div
                                                          onClick={(e) =>
                                                            this.props.previewHandler(
                                                              null,
                                                              e,
                                                              mermaidItem,
                                                              "flow",
                                                              data?.title
                                                                ? data?.title
                                                                : data?.sub_mermaid_number
                                                            )
                                                          }
                                                          className="preview-button-cont"
                                                        >
                                                          <img
                                                            src={preview_icon}
                                                            alt="preview"
                                                          />
                                                          Zoom
                                                        </div>

                                                        {mermaidItem &&
                                                          (data?.title ||
                                                            data?.sub_mermaid_number) &&
                                                          (data?.brief_description ||
                                                            data?.breif_description) &&
                                                          this.mermaid(
                                                            mermaidItem,
                                                            data?.title
                                                              ? data?.title
                                                              : data?.sub_mermaid_number
                                                          )}
                                                      </div>
                                                    )}
                                                </div>
                                              </div>
                                            </Col>
                                          </Row>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                            </>
                          </Col>
                        }
                      </Row>
                    }
                  </>
                )}
              </div>
            )}
          </>
        )}

        {this.props.isRegenerteClaimAvailable &&
          this.state.blockDiagramAvailable && (
            <div key="block-diagram">
              {this.state.blockDiagramLoading ? (
                <Row className={classes.contenetContainer}>
                  <span ref={sectionRefs.blockDiagramRef}></span>{" "}
                  {!this.state.flowChartAvailable && (
                    <div className="diagrams-figures-heading-cont">
                      <h2 className={classes.patentDetailHeading}>
                        {"Figures"}{" "}
                      </h2>
                      {this.addFiguresButton()}
                    </div>
                  )}
                  {this.state.generateBlockDia ? (
                    <CountdownTimer
                      targetDate={
                        this.props.project.expectedTimeout.block_diagram
                      }
                      sectionType={"Block Diagram"}
                    />
                  ) : (
                    <Abstract />
                  )}
                </Row>
              ) : this.state.blockDiaCommonRetry ? (
                <Row className={classes.contenetContainer}>
                  <span ref={sectionRefs.blockDiagramRef}></span>
                  {!this.state.flowChartAvailable && (
                    <div className="diagrams-figures-heading-cont">
                      <h2 className={classes.patentDetailHeading}>
                        {"Figures"}{" "}
                      </h2>
                      {this.addFiguresButton()}
                    </div>
                  )}
                  <Col className={`${classes.content}`}>
                    <div className={classes.cautionContentCont}>
                      {this.state.blockShortMessage && (
                        <span className={classes.cautionContent}>
                          {" "}
                          <img className={classes.info} src={info} />
                          {this.state.blockShortMessage}
                          <span className={classes.overlayText}>
                            {this.state.blockLongMessage}
                          </span>
                        </span>
                      )}
                      <span
                        style={{
                          backgroundColor: "#FF7E57",
                          border: "0px",
                        }}
                        className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
                        onClick={() => this.getBlockCommon()}
                      >
                        <span className="version-title">Retry</span>
                      </span>
                    </div>
                  </Col>
                </Row>
              ) : !this.state.blockDiagramAvailable ? (
                <Row className={classes.contenetContainer}>
                  {" "}
                  <span ref={sectionRefs.blockDiagramRef}></span>
                  <h2 className={classes.patentDetailHeading}>
                    {!this.state.flowChartAvailable && "Figures"}
                  </h2>
                  <div className="no-flow-chart-image-cont">
                    <img src={noDataImage} />
                    <span>
                      No block diagram is available for the provided set of
                      claims
                    </span>
                  </div>
                </Row>
              ) : (
                <>
                  <Row className={classes.contenetContainer}>
                    <span ref={sectionRefs.blockDiagramRef}></span>
                    {!this.state.flowChartAvailable && (
                      <div className="diagrams-figures-heading-cont">
                        <h2 className={classes.patentDetailHeading}>
                          {!this.state.flowChartAvailable && "Figures"}
                        </h2>
                        {this.addFiguresButton()}
                      </div>
                    )}

                    <Col className={`${classes.content}`}>
                      {this.state.blockDiagramMainBriefDescriptionLoading &&
                      !this.state.blockDiagramRetry ? (
                        <>
                          <div>
                            <p className={classes.subHeading}>
                              {"FIG.2 Brief Description"}
                            </p>
                          </div>
                          <Abstract />
                        </>
                      ) : (
                        ""
                      )}
                    </Col>
                  </Row>
                  <Row
                    className={`${classes.contenetContainer} ${classes.embodimentsSection}`}
                  >
                    {
                      <Col
                        className={`${classes.content}`}
                        lg={12}
                        xs={12}
                        md={12}
                        sm={12}
                      >
                        <div>
                          {this.state.blockDiagramRetry ? (
                            <>
                              <p className={classes.subHeading}>
                                FIG.2 Diagram
                              </p>
                              <div className={classes.cautionContentCont}>
                                <span className={classes.cautionContent}>
                                  {" "}
                                  <img className={classes.info} src={info} />
                                  {this.state.blockShortMessage}
                                  <span className={classes.overlayText}>
                                    {this.state.blockLongMessage}
                                  </span>
                                </span>
                                <span
                                  style={{
                                    backgroundColor: "#FF7E57",
                                    border: "0px",
                                  }}
                                  className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
                                  onClick={() => this.getBlockDia("retry")}
                                >
                                  <span className="version-title">Retry</span>
                                </span>
                              </div>
                            </>
                          ) : (
                            <div>
                              {this.state?.blockDiaMainMermaid &&
                                this.state?.blockDiaMainMermaid.length > 0 &&
                                this.state.blockDiaMainBriefDescription &&
                                this.state.blockDiaMainBriefDescription.length >
                                  0 &&
                                Array.isArray(
                                  this.state?.blockDiaMainBriefDescription
                                ) &&
                                this.state.blockDiaMainBriefDescription.map(
                                  (data, index) => {
                                    let mermaidData =
                                      this.state.blockDiaMainMermaid &&
                                      index >= 0 &&
                                      this.state.blockDiaMainMermaid?.length > 0
                                        ? this.state.blockDiaMainMermaid?.[
                                            index
                                          ]?.["mermaid"]
                                        : "";
                                    return (
                                      <div key={index}>
                                        <Col className={`${classes.content}`}>
                                          <div>
                                            <p className={classes.subHeading}>
                                              {`${
                                                data?.title
                                                  ? data?.title
                                                  : data?.main_mermaid_number
                                              } Brief Description`}
                                            </p>
                                          </div>
                                          {data?.brief_description && (
                                            <>
                                              {this.copyElement(
                                                data?.brief_description,
                                                "Brief Description"
                                              )}
                                              <pre className={classes.pre}>
                                                {data?.brief_description}
                                              </pre>
                                            </>
                                          )}
                                          <div className="border-bottom"></div>
                                        </Col>
                                        {mermaidData && (
                                          <>
                                            <p className={classes.subHeading}>
                                              {`${
                                                data?.title
                                                  ? data?.title
                                                  : data?.main_mermaid_number
                                              } Diagram`}
                                            </p>
                                            <div
                                              className={
                                                classes.flowChartImgCont
                                              }
                                            >
                                              <div
                                                onClick={(e) =>
                                                  this.props.previewHandler(
                                                    null,
                                                    e,
                                                    mermaidData,
                                                    "block",
                                                    data?.title
                                                      ? data?.title
                                                      : data?.main_mermaid_number
                                                  )
                                                }
                                                className="preview-button-cont"
                                              >
                                                <img
                                                  src={preview_icon}
                                                  alt="preview"
                                                />
                                                Zoom
                                              </div>
                                              {mermaidData &&
                                                (data?.title ||
                                                  data?.main_mermaid_number) &&
                                                (data?.brief_description ||
                                                  data?.breif_description) &&
                                                this.mermaid(
                                                  mermaidData,
                                                  data?.title
                                                    ? data?.title
                                                    : data?.main_mermaid_number,
                                                  "block"
                                                )}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    );
                                  }
                                )}
                            </div>
                          )}
                        </div>
                        <>
                          {!this.state.blockDiaMermaidsData
                            ?.breif_descriptions &&
                            !this.state.blockDiagramRetry &&
                            this.state.streamimgBlockDiagrams &&
                            !this.state.blockDiagramRetry && (
                              <div
                                className={`${classes.contenetContainer}  diagrams-list-abstract`}
                              >
                                <Abstract />
                                <Abstract />
                              </div>
                            )}
                          {this.state.blockDiaMermaidsData
                            ?.breif_descriptions &&
                            !this.state.blockDiagramRetry &&
                            Array.isArray(
                              this.state.blockDiaMermaidsData
                                ?.breif_descriptions
                            ) &&
                            this.state.blockDiaMermaidsData?.breif_descriptions.map(
                              (data, index) => {
                                let mermaidItem =
                                  this.state.blockDiaMermaidsData?.mermaids &&
                                  index >= 0 &&
                                  this.state.blockDiaMermaidsData?.mermaids
                                    .length > 0
                                    ? this.state.blockDiaMermaidsData
                                        ?.mermaids?.[index]?.["mermaid"]
                                    : "";
                                return (
                                  <div key={index}>
                                    <Row className={classes.contenetContainer}>
                                      <Col className={`${classes.content}`}>
                                        <div>
                                          <p className={classes.subHeading}>
                                            {data?.title
                                              ? data?.title
                                              : data?.sub_mermaid_number +
                                                " Brief Description"}
                                          </p>
                                        </div>
                                        {(data?.goal ||
                                          data?.breif_description ||
                                          data?.brief_description) && (
                                          <>
                                            {this.copyElement(
                                              data?.breif_description ||
                                                data?.goal,
                                              "Brief Description"
                                            )}
                                            <pre className={classes.pre}>
                                              {data?.breif_description
                                                ? data?.breif_description
                                                : data?.brief_description
                                                ? data?.brief_description
                                                : data?.goal}
                                            </pre>
                                          </>
                                        )}
                                        <div className="border-bottom"></div>
                                      </Col>
                                    </Row>
                                    {mermaidItem && (
                                      <Row
                                        className={`${classes.contenetContainer} ${classes.embodimentsSection}`}
                                      >
                                        <Col
                                          className={`${classes.content}`}
                                          // lg={6}
                                          // xs={12}
                                          // md={12}
                                          // sm={12}
                                        >
                                          <div>
                                            <p className={classes.subHeading}>
                                              {data?.title
                                                ? data?.title
                                                : data?.sub_mermaid_number +
                                                  " Diagram"}
                                            </p>
                                            <div className="diagrams-mermaid-container">
                                              {(data?.title ||
                                                data?.sub_mermaid_number) &&
                                                mermaidItem && (
                                                  <div
                                                    className={
                                                      classes.flowChartImgCont
                                                    }
                                                  >
                                                    <div
                                                      onClick={(e) =>
                                                        this.props.previewHandler(
                                                          null,
                                                          e,
                                                          mermaidItem,
                                                          "block",
                                                          data?.title
                                                            ? data?.title
                                                            : data?.sub_mermaid_number
                                                        )
                                                      }
                                                      className="preview-button-cont"
                                                    >
                                                      <img
                                                        src={preview_icon}
                                                        alt="preview"
                                                      />
                                                      Zoom
                                                    </div>

                                                    {mermaidItem &&
                                                      (data?.title ||
                                                        data?.sub_mermaid_number) &&
                                                      (data?.goal ||
                                                        data?.breif_description ||
                                                        data?.brief_description) &&
                                                      this.mermaid(
                                                        mermaidItem,
                                                        data?.title
                                                          ? data?.title
                                                          : data?.sub_mermaid_number
                                                          ? data?.title
                                                            ? data?.title
                                                            : data?.sub_mermaid_number
                                                          : "FIG",
                                                        "block"
                                                      )}
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        </Col>
                                      </Row>
                                    )}
                                  </div>
                                );
                              }
                            )}
                        </>
                      </Col>
                    }
                  </Row>
                </>
              )}
            </div>
          )}
   
          {
            <DetailedDescription 
            flowChartDetailedDescriptionSucess = {this.state.flowChartDetailedDescriptionSucess}
            blockDetailedDescriptionSuccess = {this.state.blockDetailedDescriptionSuccess}
            detailedDescriptionSuccess = {this.state.detailedDescriptionSuccess}

            callingFlowDescription = {this.state.callingFlowDescription}
            callingBlockDescription = {this.state.callingBlockDescription}
            callingDetailedDescription = {this.state.callingDetailedDescription}

            flowChartDetailedDescriptionRetry = {this.state.flowChartDetailedDescriptionRetry}
            blockDiaDetailedDescriptionRetry = {this.state.blockDiaDetailedDescriptionRetry}
            detailedDescriptionRetry = {this.state.detailedDescriptionRetry}
            detailedDescriptionCommonRetry = {this.state.detailedDescriptionCommonRetry}

            flowChartDetailedDescriptionHandler = {this.getFlowDetailedDescription}
            blockDiaDetailedDescriptionHandler = {this.getBlockDetailedDescription}
            extraDetailedDescriptionCommonHandler = {this.getDetailedDescriptionCommon}
            extraDetailedDescriptionRetryFromSeparateDetailedDescriptionHandler = {this.getDetailedDescription}

            flowChartAvailable = {this.state.flowChartAvailable}
            blockDiagramAvailable = {this.state.blockDiagramAvailable}
            detailedDescriptionAvailable = {this.state.detailedDescriptionAvailable}

            flowChartDetailedDescriptionShortMessage = {this.state.flowChartDetailedDescriptionShortMessage}
            flowChartDetailedDescriptionLongMessage = {this.state.flowChartDetailedDescriptionLongMessage}
            blockDetailedDescriptionShortMessage = {this.state.blockDetailedDescriptionShortMessage}
            blockDetailedDescriptionLongMessage ={this.state.blockDetailedDescriptionLongMessage}
            detailedDescriptionShortMessage = {this.state.detailedDescriptionShortMessage}
            detailedDescriptionLongMessage ={this.state.detailedDescriptionLongMessage}

            flowChartRetry = {this.state.flowChartRetry}
            blockDiagramRetry = {this.state.blockDiagramRetry}

            {...this.props}
            />
          }

        {this.state.loadingTemplate ? (
          <Row className={classes.contenetContainer}>
            <span></span>{" "}
            <h2 className={classes.patentDetailHeading}>
              {/* {!this.state.flowChartAvailable && "Figures"}{" "} */}
            </h2>
            <Abstract />
          </Row>
        ) : (
          this.state.templateData &&
          this.state.templateData.length > 0 &&
          this.state.templateData.map((data, index) => {
            return (
              <div key={index}>
                <Row className={classes.contenetContainer}>
                  {/* <span ref={sectionRefs.blockDiagramRef}></span> */}
                  {data?.brief_description && (
                    <Col className={`${classes.content}`}>
                      <>
                        <div>
                          <p className={classes.subHeading}>
                            {data?.name + " Brief Description"}
                          </p>
                        </div>
                        {this.state.blockDiaMainBriefDescription && (
                          <>
                            {this.copyElement(
                              data?.brief_description,
                              "Brief Description"
                            )}
                            <pre className={classes.pre}>
                              {data?.brief_description}
                            </pre>
                          </>
                        )}
                        <div className="border-bottom"></div>
                      </>
                    </Col>
                  )}
                </Row>
                <Row
                  className={`${classes.contenetContainer} ${classes.embodimentsSection}`}
                >
                  {
                    <Col
                      className={`${classes.content}`}
                      lg={6}
                      xs={12}
                      md={12}
                      sm={12}
                    >
                      <div>
                        <p className={classes.subHeading}>
                          {" "}
                          {data?.name + " Diagram"}
                        </p>
                        {
                          <div>
                            {
                              <div className={classes.flowChartImgCont}>
                                {data.base64_image ? (
                                  <div className="tenplate-image-container">
                                    <img src={data.base64_image} alt="image" />
                                  </div>
                                ) : (
                                  <pre className={classes.pre}>
                                    Not Available
                                  </pre>
                                )}
                              </div>
                            }
                          </div>
                        }
                      </div>
                    </Col>
                  }
                  {
                    <Col className={`${classes.content}`}>
                      <div>
                        <p className={classes.subHeading}>
                          {data.name + " Detailed Description Of Figure"}
                        </p>
                        {
                          <>
                            {
                              <>
                                {this.copyElement(
                                  data?.detailed_description,
                                  "Detailed Description Of Figure"
                                )}
                                <pre className={classes.pre}>
                                  {data?.detailed_description}
                                </pre>
                              </>
                            }
                          </>
                        }
                      </div>
                    </Col>
                  }
                </Row>
              </div>
            );
          })
        )}
        {this.state.isTemplateOpen && (
          <Template
            {...this.props}
            templateHandler={this.saveTemplateHandler}
          />
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    project: state.projectData,
    isDiaExport: state.flowChartRed.exportDia,
    diaCount: state.countDiagramsRed.DiaCount,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    incrementDiaCount: (data) => dispatch(incrementDiaCount(data)),
    resetDiaCount: (data) => dispatch(resetDiaCount(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Diagrams);
