import React, { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import apiServices from "../../../services/apiServices";
import { connect } from "react-redux";
import MyButton from "../../Elements/MyButton/MyButton";

import { toast } from "react-toastify";
import Abstract from "../fallbackContainer/abstract/abstract";
import arrow from "../../../components/assets/icons/arrow_submit.svg";
import info from "../../../../src/components/assets/icons/info_white.svg";
import axios from "axios";
import Prompt from "../patent/patentDetailsPrompt";
import { togglePatentEditModal } from "../../../store/action";
import edit_icon from "../../../components/assets/icons/edit_icon.svg";
import { Col, Container, Row } from "reactstrap";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import Mermaid from "../FlowChart/Mermaid";
import orange_info from "../../../../src/components/assets/icons/info_orange.svg";
import noDataImage from "../../../../src/components/assets/icons/no_flowchart.svg";
import ImageViewer from "../ImageViewer/ImageViewer";
import download_thin from "../../../components/assets/icons/download_thin.svg";
import loading_icon from "../../../components/assets/icons/loading.gif";
import preview_icon from "../../../components/assets/icons/zoom.svg";
import CountdownTimer from "../Counter/CountdownTimer";
import BlinkingCursor from "../../LoadingScreen/BlinkingCursor";
import us_flag from "../../../components/assets/icons/US_flag.svg";
import europeFlag from "../../../components/assets/icons/europe.svg";
import "./textAreaAutoSize.css"
import { isAccess } from "../../../utils/accessCheck";

class CustomTextInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      content: "",
      url_id: "",
      original_data: "",
      saveError: false,
      toasterMessage: "",
      toaster: false,
      setDisable: false,
      isChecked: true,
      setHistory: false,
      showImages: false,
      preContent: ``,
      previewChart: false,
      previewIndex: 0,
      flowChartText: [],
      isDownload: false,
      viewerContent: "",
      typeOfDia: "flow",
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.regeneratePatent = this.regeneratePatent(this);
    this.draftPatnet = this.draftPatnet.bind(this);
    this.scroToBlockDia = React.createRef();
    this.apisTokens = {};
  }

  componentDidMount() {
    this.setState({ content: this.props.data, original_data: this.props.data });
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.data !== this.props.data ||
      prevProps.forceUpdate !== this.props.forceUpdate
    ) {
      this.setState({
        content: this.props.data,
        original_data: this.props.data,
      });
    }

    if (this.props.match.params.new == "image") {
      this.props.isCheckHandler(false);
    }

    if (
      prevProps.savePrompt !== this.props.savePrompt 
    ) {
      this.handleSave("savingPrompt");
    }
  }

  handleChange(event) {
    const inputValue = event.target.value;
    this.setState({ content: inputValue });
  }

  regeneratePatent() {}

  handleSave = async (savingPrompt) => {
    if (this.apisTokens["saveToken"]) {
      this.apisTokens["saveToken"].cancel();
    }
    this.apisTokens["saveToken"] = axios.CancelToken.source();

    try {
      // this.setState({ setDisable: true });
      let text = this.state.content;
      let unEditedData = String(this.props.unEditedText.data);
      let apiData = {
        project_id: parseInt(this.props.url_id),
        section_type: this.props.editText,
        content:
          savingPrompt == "savingPrompt" ? this.state.original_data : text,
        index: this.props.index,
        version: this.props.sectionDataType.length
        };
          
        if(this.props.sectionDataType[this.props.index]["section_history_id"]){
          apiData['section_history_id'] = this.props.sectionDataType[this.props.index]["section_history_id"]
        }
        if(this.props.sectionDataType[this.props.index]["claim_section_history_id"]){
          apiData['claim_section_history_id'] = this.props.sectionDataType[this.props.index]["claim_section_history_id"]
        }

        
        

      let response = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.insert_section_history,
        apiData,
        this.apisTokens["saveToken"].token
      );
      if (response["status"] === "Success" && savingPrompt !== "savingPrompt") {
        this.setState({ saveError: false });
        if (savingPrompt !== "savingPrompt") {
          this.props.loadSectionHistory(false);
        }
        // this.props.checkForClaimRedraftHandler();
        // localStorage.setItem("regenerateButton", false);
        if (savingPrompt !== "savingPrompt") {
          toast.info(
            response["message"],
            this.props.project?.config?.toasterStyle
          );
        }
        if (this.props["editText"] !== "Claims") {
          this.props.history.replace(
            `/patentDetails/${parseInt(this.props.url_id)}`
          );
        }
      } else if (response["status"] === "Error") {
        this.setState({ saveError: true });
        if (savingPrompt !== "savingPrompt") {
          toast.info(
            response["message"],
            this.props.project?.config?.toasterStyle
          );
        }
      }else if(response["status"] === "Success" && savingPrompt === "savingPrompt"){
        this.props.checkForClaimRedraftHandler();
      }
      this.setState({ setDisable: false });
    } catch (e) {
      console.log(e);
      this.setState({ setDisable: false });
    }
  };

  draftPatnet = async () => {
    try {
      this.setState({ setDisable: true });
      let text = this.state.content;
      let unEditedData = String(this.props.unEditedText.data);

      let apiData = {
        project_id: parseInt(this.props.url_id),
        section_type: this.props.editText,
        content: text,
        index: this.props.index,
        version: this.props.sectionDataType.length
      };

      if( this.props.sectionDataType[this.props.index]["section_history_id"]){
        apiData['section_history_id'] = this.props.sectionDataType[this.props.index]["section_history_id"]
      }

      let response = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.insert_section_history,
        apiData
      );
      if (response["status"] === "Success") {
        this.setState({ saveError: false });
        // localStorage.setItem("regenerateButton", false);

        // toast.info(
        //   response["message"],
        //   this.props.project?.config?.toasterStyle
        // );
        this.props.history.push(`/patentDetails/${this.props.url_id}`);
      } else if (response["status"] === "Error") {
        this.setState({ saveError: true });
        toast.info(
          response["message"],
          this.props.project?.config?.toasterStyle
        );
      }
      this.setState({ setDisable: false });
    } catch (e) {
      console.log(e);
      this.setState({ setDisable: false });
    }
  };

  openPrompt = () => {
    this.props.toggleOverlay();
  };

  regenrateHandler = async (text) => {
    if (text.trim().length === 0) {
      return;
    }
    try {
      let prev_project_history_id = this.props.project["project_history_id"];
      let get_project_history_id_data = {
        invention: text,
        project_id: parseInt(this.props.url_id),
      };
      if (prev_project_history_id === undefined) {
        let select_project_history_value = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.select_project_history,
          get_project_history_id_data
        );
        prev_project_history_id =
          select_project_history_value["response"][0]["project_history_id"];
      }
      let invention_data = {
        invention: text,
        project_id: parseInt(this.props.url_id),
        project_history_id: prev_project_history_id,
      };
      let update_invention_value = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.update_invention,
        invention_data
      );
      this.props.checkForClaimRedraftHandler();
      this.props.getInventionTitle();
      let toasterStyle = this.props.project?.config?.toasterStyle;
      toasterStyle.autoClose = 1000;
      toast.info("Invention Modified Succesfully", toasterStyle);
    } catch (e) {
      console.log(e);
    }
  };

  handleCheckboxChange = (event) => {
    this.props.isCheckHandler(event.target.checked);
    this.setState({ isChecked: event.target.checked });
  };

  componentWillUnmount() {
    // this.props.isCheckHandler(false);
    this.setState({ isChecked: false });
  }

  componentWillMount() {
    // this.getFlowchartDiagram();
  }

  hideHistoryHandler = () => {
    // ;
    // this.setState({isChecked:true},()=>this.props.isCheckHandler(true));
    // this.props.history.goBack();
    this.props.isHistoryHandler();
  };

  updateDiagramHandler = () => {
    this.props.history.goBack();
  };

  showImagesHandler = () => {
    this.props.showDiagramshandler();
    // this.setState((prevState) => ({
    //   showImages: !prevState.showImages,
    // }));
  };

  handleFlowChange = (inputValue) => {
    this.setState({ preContent: inputValue });
  };

  retryFlowChartHandler = () => {
    this.props.retryFlowChartHandler();
  };

  retryBlockDiagramHandler = () => {
    this.props.retryBlockDiagramHandler();
  };

  previewHandler = (index, content, type) => {
    this.setState((prev) => {
      return {
        previewChart: !prev.previewChart,
      };
    });
    this.setState({ viewerContent: content, typeOfDia: type });
    if (index) {
      this.setState({ previewIndex: index });
    }
  };

  saveHandler = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    this.setState((prev) => {
      return { isDownload: !prev.isDownload };
    });
  };

  genrateFlowHandler = () => {
    // this.setState({ showImages: true });
    this.props.showDiagramshandler("true");
    this.props.genrateFlowHandler();
  };

  genrateBlockHandler = () => {
    this.props.genrateBlockHandler();
    this.scroToBlockDia?.current?.scrollIntoView({ behavior: "smooth" });
  };

  render() {
    const url_id = this.props?.editText;

    let edit_text_title = this.props.editText;
    let modified_edit_text_title = "";
    if (edit_text_title == "detail_Description") {
      modified_edit_text_title = "Detail Description";
    } else if (edit_text_title == "technical_Field") {
      modified_edit_text_title = "Technical Field";
    } else if (edit_text_title == "background_Description") {
      modified_edit_text_title = "Background Description";
    } else if (edit_text_title == "summary") {
      modified_edit_text_title = "Summary";
    } else if (edit_text_title == "technical_Field") {
      modified_edit_text_title = "Technical Field";
    } else if (edit_text_title == "list_of_figures") {
      modified_edit_text_title = "List of Figures with Brief Descriptions";
    } else if (edit_text_title == "detailed_description_figures") {
      modified_edit_text_title = "Detailed Description of the Figures";
    }

    const SEVEN_DAYS_IN_MS = 60 * 1000;
    const NOW_IN_MS = new Date().getTime();
    const dateTimeAfterSevenDays = NOW_IN_MS + SEVEN_DAYS_IN_MS;

    return (
      <>
        <div className={"generate-report-cont"}>
          {this.props.match.params.flowChart === "flowChart" ? (
            <>
              <MyButton
                className="generate-button"
                text="Update Flowchart"
                rightImage={arrow}
                onClick={this.updateDiagramHandler}
              />
            </>
          ) : (
            <>
              {(this.props["editText"] === "Claims" &&
              !this.props.isPriorArt &&
              this.props.isPriorArt != null && (isAccess(this.props, 'drafting_prompt_claim') || isAccess(this.props, 'drafting_prompt_specs'))) ? (
                <MyButton
                  className="generate-button"
                  onClick={() =>
                    this.props.loadingClaims ? "" : this.openPrompt()
                  }
                  text="Modify Invention"
                  disabled={this.state.setDisable}
                  rightImage={arrow}
                />
              ) : (
                ""
              )}
              <MyButton
                className="generate-button"
                onClick={() => {
                  if (
                    this.props["editText"] === "Claims" &&
                    !this.props.loadingSection &&
                    !(this.props.loadingClaims || this.props.isError == "Error")
                  ) {
                    this.handleSave();
                  } else if (
                    this.props["editText"] !== "Claims" &&
                    !this.props.loadingClaims
                  ) {
                    this.handleSave();
                  }
                }}
                text={`Save ${
                  modified_edit_text_title != ""
                    ? modified_edit_text_title
                    : this.props.editText
                }`}
                disabled={this.state.setDisable}
                rightImage={arrow}
              />

              {(this.props["editText"] === "Claims" && isAccess(this.props,'drafting_view_specs')) && (
                <MyButton
                  className="generate-button pa_draft_patent_button"
                  onClick={
                    this.props.isError == "Success" &&
                    !this.props.loadingSection
                      ? this.draftPatnet
                      : ""
                  }
                  text="Draft Patent"
                  disabled={this.state.setDisable}
                  rightImage={arrow}
                />
              )}

              {this.props.isRedraftRequired &&
                this.props["editText"] === "Claims" && (
                  <button
                    disabled={this.state.setDisable}
                    className="generate-button"
                    id="re_draft_claims"
                    onClick={() => this.props.generateClaims(true)}
                  >
                    {this.props["editText"] === "Claims" ? (
                      <>
                        Re-draft Claims <img src={arrow} alt="Arrow" />
                      </>
                    ) : (
                      `Update ${this.props["editText"]}`
                    )}
                  </button>
                )}

              {this.props.isRedraftRequired &&
                this.props["editText"] === "Claims" && (
                  <div
                    className={`caution-container-claims container ${
                      this.props.isPriorArt
                        ? " caution-container-claims-art"
                        : ""
                    }`}
                  >
                    {" "}
                    <p className="caution-claims">
                      {" "}
                      <img className="redraft-info" src={info} />{" "}
                      <span className="attention">Attention:</span> Current
                      claims are not aligned with the revised invention. Please
                      re-draft claims accordingly.
                    </p>
                  </div>
                )}
            </>
          )}
        </div>

        <div
          className={`text-editor-container ${
            this.props.isRedraftRequired && this.props["editText"] === "Claims"
              ? "text-editor-container-bottom-margin"
              : ""
          } `}
        >
          <div className="outer-edit-cont">
            <div
              className={`inner-container invenction_claims ${
                this.props.match.params.flowChart == "flowChart"
                  ? " line-height-textarea"
                  : ""
              }`}
            >
              { (
                <>
                  <div className="edit-cont">
                    <span
                      className={
                        this.props.loadingClaims
                          ? "claims_generating"
                          : "claims_generated"
                      }
                    >
                      Modify{" "}
                      {this.props.match.params.flowChart == "flowChart"
                        ? "Flowchart"
                        : modified_edit_text_title != ""
                        ? modified_edit_text_title
                        : this.props.editText}
                    </span>
                    {this.props["editText"] === "Claims" && this.props?.language && <img className="text-area-flags"  src={this.props.language == 'us' ? us_flag : this.props.language == 'eu' ? europeFlag : ""} alt ='flag' />}
                  </div>
                  {
                    <>
                      {
                        <Container className="container-box">
                          {" "}
                          <Row>
                            {" "}
                            <Col>
                              {this.props.generatingClaims ? (
                                <>
                                  <div className="image-out-cont">
                                    <CountdownTimer
                                      targetDate={
                                        this.props.project.expectedTimeout
                                          .get_claims
                                      }
                                      sectionType={this.props["editText"]}
                                    />
                                  </div>
                                </>
                              ) : this.props.loadingClaims ? (
                                <div style={{ backgroundColor: "white" }}>
                                  <Abstract />
                                  <Abstract />
                                  <Abstract />
                                  <Abstract />
                                  <Abstract />
                                  <Abstract />
                                  <Abstract />
                                  <Abstract />
                                  <Abstract />
                                  <Abstract />
                                  <Abstract />
                                </div>
                              ) : (
                                (this.props.loadingSection  || !(isAccess(this.props ,'drafting_edit_specs')) || !(isAccess(this.props, 'drafting_edit_claim')) ) ? 
                                <pre className = "pre-tag-text-area" >{this.state.content} {this.props.loadingSection &&<BlinkingCursor/>} </pre> :
                                <TextareaAutosize
                                  cacheMeasurements
                                  value={this.state.content}
                                  onChange={this.handleChange}
                                  editText={this.props.editText}
                                  minRows={80}
                                  // maxRows={100}
                                />
                                
                              )}
                            </Col>{" "}
                            <Col
                              className={`${
                                this.props.showImages &&
                                this.props["editText"] === false
                                  ? "flowchart-show"
                                  : "hide-display"
                              }`}
                              lg={6}
                              xs={12}
                              md={12}
                              sm={12}
                            >
                              {!this.props.flowChartAvailable &&
                                !this.props.blockDiagramAvailable && (
                                  <div className="no-flow-chart-image-cont">
                                    <img src={noDataImage} />
                                    <span>No Diagram available.</span>
                                  </div>
                                )}

                              <>
                                {this.props.flowChartAvailable && (
                                  <>
                                    <span className="flow-chart-title">
                                      Flowchart
                                    </span>
                                    {this.props.generatingFlowDia ||
                                    this.props.generatingRegenClaims ? (
                                      <>
                                        <div className="image-out-cont">
                                          <CountdownTimer
                                            targetDate={
                                              this.props.generatingFlowDia
                                                ? this.props.project
                                                    .expectedTimeout
                                                    .flowchart_diagram
                                                : this.props.project
                                                    .expectedTimeout
                                                    .regenerate_claim
                                            }
                                            sectionType={
                                              this.props.generatingFlowDia
                                                ? "Flowchart"
                                                : "Regenerate Claims"
                                            }
                                          />
                                        </div>
                                      </>
                                    ) : this.props.flowChartLoading ? (
                                      <div
                                        className="flow-chart-animation-cont"
                                        style={{ backgroundColor: "white" }}
                                      >
                                        <Abstract />
                                        <Abstract />
                                        <Abstract />
                                      </div>
                                    ) : (
                                      <>
                                        {/* <MyButton
                            className={`hs-version-num prompt-button prompt-button-new regen-button  "p_retry retry-hover"`}
                            // onClick={() =>
                            //   this.callChildFunction(
                            //     index,
                            //     data.id,
                            //     data?.status ? data?.status : data?.is_error,
                            //     data.is_redraft,
                            //     data.section_history_id
                            //   )
                            // }
                            text={"Retry"}
                            // rightImage={white_arrow}
                            rightImageClass="custom-right-icon"
                          /> */}
                                        <div
                                          className={`image-cont image-cont-visible `}
                                        >
                                          {this.props.isflowChartRetry ? (
                                            <div className="flow-chart-retry-cont">
                                              <div className="flow-caution-outer-cont margin-top-bottom">
                                                <span
                                                  className={
                                                    "flow-caution-content"
                                                  }
                                                >
                                                  {" "}
                                                  <img src={orange_info} />
                                                  {this.props.flowShortMessage}
                                                  <span
                                                    className={
                                                      "flow-overlay-text"
                                                    }
                                                  >
                                                    {this.props.flowLongMessage}
                                                  </span>
                                                </span>
                                                <MyButton
                                                  text="Retry"
                                                  className="flow-retry-button"
                                                  onClick={
                                                    this.retryFlowChartHandler
                                                  }
                                                />
                                              </div>
                                            </div>
                                          ) : this.props.flowChartAvailable ===
                                            false ? (
                                            <div className="no-flow-chart-image-cont">
                                              <img src={noDataImage} />
                                              <span>
                                                No flowchart is available for
                                                the provided set of claims
                                              </span>
                                            </div>
                                          ) : (
                                            <>
                                              {this.props.preContent && (
                                                <>
                                                  <div className="image-out-cont">
                                                    <div className="image-background">
                                                      <div className="image-inner-cont">
                                                        {" "}
                                                        <div className="image-edit-button">
                                                          {" "}
                                                          <Link
                                                            to={`/patentDetails/${parseInt(
                                                              this.props.url_id
                                                            )}/edit/${
                                                              this.props
                                                                .editText
                                                            }/flowChart/`}
                                                          >
                                                            {/* <MyButton

                                          className={`hs-version-num prompt-button prompt-button-new regen-button`}
                                          text="Edit"
                                          onClick={this.editButtonHandler}
                                        /> */}
                                                          </Link>
                                                        </div>{" "}
                                                        <div className="mermaid-outer-cont">
                                                          {
                                                            <div
                                                              onClick={() =>
                                                                this.previewHandler(
                                                                  null,
                                                                  this.props
                                                                    .preContent,
                                                                  "flow"
                                                                )
                                                              }
                                                              className="preview-button-cont"
                                                            >
                                                              <img
                                                                src={
                                                                  preview_icon
                                                                }
                                                                alt="preview"
                                                              />
                                                              Zoom
                                                            </div>
                                                          }

                                                          {this.props
                                                            .preContent && (
                                                            <Mermaid
                                                              key={Math.floor(
                                                                Math.random() *
                                                                  10
                                                              )}
                                                              mermaidId={
                                                                "mermaid" +
                                                                Math.floor(
                                                                  Math.random() *
                                                                    100
                                                                )
                                                              }
                                                              {...this.props}
                                                              preContent={
                                                                this.props
                                                                  .preContent
                                                              }
                                                              download={
                                                                this.state
                                                                  .isDownload
                                                              }
                                                              saveHandler={
                                                                this.saveHandler
                                                              }
                                                              projectId={
                                                                this.props.match
                                                                  ?.params?.ID
                                                              }
                                                            />
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </>
                                    )}
                                  </>
                                )}

                                {this.props.regenerateClaimSectionHistoryId &&
                                  this.props.blockDiagramAvailable && (
                                    <div
                                      className="block-diagram-cont"
                                      ref={this.scroToBlockDia}
                                    >
                                      <span className="flow-chart-title">
                                        Block Diagram
                                      </span>

                                      {this.props.generatingBlockDia ? (
                                        <>
                                          <div className="image-out-cont">
                                            <CountdownTimer
                                              targetDate={
                                                this.props.project
                                                  .expectedTimeout.block_diagram
                                              }
                                              sectionType={"Block Diagram"}
                                            />
                                          </div>
                                        </>
                                      ) : this.props.blockdiagramLoading ? (
                                        <div
                                          className="flow-chart-animation-cont"
                                          style={{ backgroundColor: "white" }}
                                        >
                                          <Abstract />
                                          <Abstract />
                                          <Abstract />
                                        </div>
                                      ) : (
                                        <div className="image-cont image-cont-visible ">
                                          {this.props.isBlockDiaRetry ? (
                                            <div className="flow-chart-retry-cont">
                                              <div className="flow-caution-outer-cont margin-top-bottom">
                                                <span
                                                  className={
                                                    "flow-caution-content"
                                                  }
                                                >
                                                  {" "}
                                                  <img src={orange_info} />
                                                  {this.props.blockShortMessage}
                                                  <span
                                                    className={
                                                      "flow-overlay-text"
                                                    }
                                                  >
                                                    {
                                                      this.props
                                                        .blockLongMessage
                                                    }
                                                  </span>
                                                </span>
                                                <MyButton
                                                  text="Retry"
                                                  className="flow-retry-button"
                                                  onClick={
                                                    this
                                                      .retryBlockDiagramHandler
                                                  }
                                                />
                                              </div>
                                            </div>
                                          ) : this.props
                                              .blockDiagramAvailable ===
                                            false ? (
                                            <div className="no-flow-chart-image-cont">
                                              <img src={noDataImage} />
                                              <span>
                                                No block diagram is available
                                                for the provided set of claims
                                              </span>
                                            </div>
                                          ) : this.props.blockContent ? (
                                            <div className="image-out-cont">
                                              <div className="image-background">
                                                <div className="image-inner-cont">
                                                  {" "}
                                                  <div className="image-edit-button">
                                                    {" "}
                                                    <Link
                                                      to={`/patentDetails/${parseInt(
                                                        this.props.url_id
                                                      )}/edit/${
                                                        this.props.editText
                                                      }/flowChart/`}
                                                    >
                                                      {/* <MyButton

                                          className={`hs-version-num prompt-button prompt-button-new regen-button`}
                                          text="Edit"
                                          onClick={this.editButtonHandler}
                                        /> */}
                                                    </Link>
                                                  </div>{" "}
                                                  <div className="mermaid-outer-cont">
                                                    {
                                                      <div
                                                        onClick={() =>
                                                          this.previewHandler(
                                                            null,
                                                            this.props
                                                              .blockContent,
                                                            "block"
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
                                                    }
                                                    <div className="flow-chart-download-cont-div">
                                                      {" "}
                                                    </div>
                                                    {this.props
                                                      .blockContent && (
                                                      <Mermaid
                                                        key={Math.floor(
                                                          Math.random() * 10
                                                        )}
                                                        mermaidId={
                                                          "mermaid" +
                                                          Math.floor(
                                                            Math.random() * 100
                                                          )
                                                        }
                                                        {...this.props}
                                                        preContent={
                                                          this.props
                                                            .blockContent
                                                        }
                                                        // preContent={
                                                        //   this.props.preContent
                                                        // }
                                                        diagramType={"block"}
                                                        download={
                                                          this.state.isDownload
                                                        }
                                                        saveHandler={
                                                          this.saveHandler
                                                        }
                                                        projectId={
                                                          this.props.match
                                                            ?.params?.ID
                                                        }
                                                      />
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ) : (
                                            ""
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )}
                              </>
                            </Col>{" "}
                          </Row>
                        </Container>
                      }
                    </>
                  }

                  {/* {this.props.loadingClaims && <div style={{height:"200px"}}></div>} */}
                </>
              )}
              <div>
                <Prompt
                  text={this.props.inventionName}
                  regenrate={this.regenrateHandler}
                  type={"claims"}
                ></Prompt>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="button-container">
          <button
            disabled={this.state.setDisable}
            className="generate-button"
            onClick={this.handleSave}
          >
            {this.props["editText"] === "Claims" ? (
              <>
                Generate Report <img src={arrow} alt="Arrow" />
              </>
            ) : (
              "Save"
            )}
          </button>
        </div> */}
        {this.state.previewChart && (
          <ImageViewer
            flowChartText={[this.state.viewerContent]}
            previewIndex={this.state.previewIndex}
            isOpen={this.state.previewChart}
            closePreviewHandler={this.previewHandler}
            typeOfDia={this.state.typeOfDia}
          />
        )}
      </>
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CustomTextInput);
