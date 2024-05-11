import React, { Component } from "react";
import axios from "axios";
import { connect } from "react-redux";

import { Link, NavLink } from "react-router-dom";
import CustomTextInput from "../InputTextArea/textAreaAutoSize";
import { Container, Row, Col } from "reactstrap";

import back_icon from "../../assets/icons/back.svg";
import "../fallbackContainer/animate.scss";
import classes from "../patent/patentDetails.module.css";
import { toggleModal } from "../../../store/action";
import apiServices from "../../../services/apiServices";
import logo from "../../assets/icons/IP_Author_logo.svg";
import History from "../patent/History/History"

import { toast } from "react-toastify";
import streamApi from "../../../services/streamApi";
import Template from "./Template";
import { isAccess } from "../../../utils/accessCheck";
import SkeltonWrapper from "../../Elements/Skelton/SkeltonWrapper";

class generatedData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userData: "",
      isWaiting: true,
      editorText: "",
      showPrompt: true,
      indexValue: "",
      sectionDataType: [],
      setContent: [],
      textContent: "",
      id: [],
      prompt_data: {},
      forceUpdate: false,
      loading: false,
      generatedValue: "",
      loading_section: false,
      selectedVersion: 0,
      unEditedData: "",
      version: "",
      section_history_id: [],
      is_prompt_success: false,
      loadingClaims: true,
      inventionName: "",
      newbutton: false,
      isPriorArt: null,
      isRedraftRequired: false,
      isChecked: true,
      setHistory: true,
      projectHistoryId: "",
      preContent: "",
      flowChartLoading: true,
      isflowChartRetry: false,
      flowChartAvailable: true,
      blockDiagramAvailable: true,
      flowShortMessage: "",
      flowLongMessage: "",
      blockShortMessage: "",
      blockLongMessage: "",
      blockdiagramLoading: true,
      isBlockDiaRetry: false,
      regenerateClaimSectionHistoryId: "",
      hasBlockDiagram: false,
      hasFlowChart: false,
      callingFlowChart: false,
      callingBlockdiagram: false,
      blockContent: "",
      regenerateClaim: false,
      showImages: false,
      promptText: "",
      savePrompt: false,
      cancelRegclaim: false,
      isError: "",
      flowsectionHistoryId: "",
      blocksectionHistoryId: "",
      regenClaimSectionHistoryId: "",
      generatingClaims: false,
      generatingFlowDia: false,
      generatingBlockDia: false,
      generatingRegenClaims: false,
      generatingPromptInput: false,
      versionData: "",
      language: "",
      initialLoadingClaim: true,
    };
    this.childRef = React.createRef();
    this.edithandler = this.edithandler.bind(this);
    this.handleDataUpdate = this.handleDataUpdate.bind(this);
    this.promptHandler = this.promptHandler.bind(this);
    this.checkClaims = this.checkClaims.bind(this);
    this.sample = this.sample.bind(this);
    this.childComponentMounted = false;
    this.apisTokens = {};
    this.diagramsFlag = true;
    this.notification = {};
    this.isStreamClaims = false;
    this.controller = {};
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.editorText !== this.state.editorText) {
      this.setState({
        editorData: this.state.editorText,
      });
    }
    if (
      prevState.generatingClaims !== this.state.generatingClaims
      // prevState.generatingFlowDia !== this.state.generatingFlowDia ||
      // prevState.generatingBlockDia !== this.state.generatingBlockDia ||
      // prevState.generatingRegenClaims !== this.state.generatingRegenClaims ||
      // prevState.generatingPromptInput !== this.state.generatingPromptInput
    ) {
      if (
        this.state.generatingClaims
        // this.state.generatingFlowDia ||
        // this.state.generatingBlockDia ||
        // this.state.generatingRegenClaims ||
        // this.state.generatingPromptInput
      ) {
        window.favloader.start();
      } else {
        window.favloader.stop();
      }

      // const linkEl = document.querySelector("link[rel*='icon']");
      // if (linkEl) {
      //   linkEl.href = this.state.generatingClaims
      //     ? `${process.env.PUBLIC_URL}/loading.gif`     // Replace with path to loading icon
      //     : `${process.env.PUBLIC_URL}/favicon.ico`;   // Replace with path to regular icon
      // }
    }
    if (this.state.isTemplateOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  componentDidMount() {
    this.childComponentMounted = true;

    if (!("Notification" in window)) {
      console.log("Browser does not support desktop notification");
    } else {
      Notification.requestPermission();
    }
  }

  showNotification = (message) => {
    var options = {
      // body: 'Notification Body',
      icon: logo,
      dir: "ltr",
    };
    this.notification[message] = new Notification(message, options);
    setTimeout(() => {
      this.notification[message].close();
    }, 5000);
  };

  //Generate data from the input given in the prompt
  callApi = async (value) => {
    this.setState({ generatingPromptInput: true });
    this.setState({
      flowChartLoading: true,
      loadingClaims: true,
      generatingClaims: true,
      loading_section: true,
    });

    let generateDataobj = {};
    if (this.apisTokens[this.props.editText]) {
      this.apisTokens[this.props.editText].cancel();
    }
    this.apisTokens[this.props.editText] = axios.CancelToken.source();

    if (this.controller[this.props.editText]) {
      this.controller[this.props.editText].abort();
    }
    this.controller[this.props.editText] = new AbortController();

    let callApiData = {
      data: value,
      project_id: this.props.id,
      section_history_id: this.state.section_history_id,
      project_history_id: this.state.projectHistoryId,
    };

    let streamComplete = false;

    const callBack = ({
      content,
      isFinish,
      retry,
      shortMessage,
      longMessage,}) => {
      let streamedData;
      switch (this.props.editText) {
        case "Title":
          streamedData = content?.["title"];
          break;

        case "Abstract":
          streamedData = content?.["abstract"];
          break;

        case "background_Description":
          streamedData = content?.["background_decription"];
          break;

        case "technical_Field":
          streamedData = content?.["technical_field"];
          break;

        case "summary":
          streamedData = content?.["summary"];
          break;

        case "Claims":
          streamedData = content?.["claims"];
          break;

        default:
          break;
      }

      if (streamedData && Object.keys(content).length > 0) {
        this.setState({
          editorText: streamedData,
          loadingClaims: false,
          newbutton: false,
          generatingClaims: false,

          is_prompt_success: true,
          generatingPromptInput: false,
        });
      }
      streamComplete = isFinish;
    };

    await streamApi.getData(
      "post",
      this.props?.project?.config?.baseUrl +
        `/patentDetails/${this.props.id}/edit/${this.props.editText}`,
      callApiData,
      this.controller[this.props.editText].signal,
      callBack
    );

    if (streamComplete) { 
      this.getSectionTypeData(false);
    }
  };

  componentWillMount() {
    this.checkUserAccessToProject();
    // this.checkClaims();
    // this.checkForPriorArt();
    // this.checkForClaimRedraftHandler();
    // window.scroll({ top: 0, left: 0, behavior: 'instant' });
    // console.log("mount")
    // window.mermaid.initialize(this.props?.config);
  }

  componentWillUnmount() {
    var thisView = this;
    if (this.apisTokens) {
      Object.keys(this.apisTokens).map((key) => {
        thisView.apisTokens[key].cancel();
      });
    }

    if (this.controller) {
      Object.keys(this.controller).map((keys) => {
        this.controller[keys].abort();
      });
    }

    window.favloader.stop();

    if (this.notification) {
      Object.keys(this.notification).map((key) => {
        thisView.notification[key].close();
      });
    }
  }

  checkUserAccessToProject = async () => {

    const sectionAccessMapping = {
      'Title': 'drafting_edit_title',
      'Abstract': 'drafting_edit_abstract',
      'technical_Field': 'drafting_edit_technical_field',
      'background_Description': 'drafting_edit_background',
      'summary': 'drafting_edit_summary',
      'Claims': 'drafting_edit_claim',
    };
    
    let sectionAccessType = sectionAccessMapping[this.props.editText] || "";
    let isUserAccess = isAccess(this.props,sectionAccessType) || isAccess(this.props,'drafting_edit_specs')

    let data = {
      id: localStorage.getItem("user_id"),
      project_id: this.props.id,
      role_id: localStorage.getItem("role_id"),
    };
    var response = await apiServices.getData(
      "post",
      this.props.project?.api_config?.endpoints?.check_user_access_to_project,
      data
    );
    if ( (this.props.editText == "Claims" && !isAccess(this.props, 'drafting_view_claim') ) || (response["status"] === "Error" || response?.response?.project !== 'yes' || !isUserAccess)) {
      let toastData = this.props.project?.config?.toasterStyle;
      toastData["autoClose"] = response["message_time"];
      let toastMessage = response["message"] ? response["message"] :"Unauthorized Access Attempted"
      toast.error(toastMessage, this.props.project?.config?.toasterStyle);
      this.props.history.push("/home");
    } else {
      this.checkClaims();
      this.checkForPriorArt();
      this.getSectionTypeData(null, true);
    }
  };

  //To load data, if already present in Database
  getSectionTypeData = async (flag = true, initialLoad = false) => {
    try {
      if (flag) {
        this.setState({ loadingClaims: true });
      }
      if (initialLoad) {
        this.setState({
          initialLoadingClaim: true,
        });
      }
      this.checkForClaimRedraftHandler();
      let id = this.props.id;
      let type = this.props.editText;

      let payLoad = {
        project_id: this.props.match?.params?.ID,
      };

      let project_data = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.get_invention_title,
        payLoad
      );

      let inputValDataBase = project_data["response"]["invention_title"];
      this.setState({
        inventionName: inputValDataBase,
        generatingClaims: false,
      });

      let sectionDataPayLoad = {
        project_id: parseInt(id),
        section_type: type,
      };

      let sectionData = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_section_history,
        sectionDataPayLoad
      );

      if (
        this.props.editText == "Claims" &&
        sectionData["response"].length === 0
      ) {
        this.getClaims();
        // this.getFlowchartDiagram();
        return;
      }

      if (sectionData["status"] === "Success") {
        this.setState({
          sectionDataType: [],
          id: 1,
          setContent: [],
          initialLoadingClaim: false,
        });
        let size = sectionData["response"].length;
        if (this.state.is_prompt_success === true) {
          this.edithandler(
            0,
            sectionData["response"][0]["text"],
            sectionData["response"][0]["section_history_id"],
            sectionData["response"][0]["is_error"],
            sectionData["response"][0]
          );
        }

        // To call  edithandler function if claims failed initially
        if (size == 1 && sectionData["response"][0]["is_error"] == "Error") {
          this.edithandler(
            0,
            sectionData["response"][0]["text"],
            sectionData["response"][0]["section_history_id"],
            sectionData["response"][0]["is_error"],
            sectionData["response"][0]
          );
        }


        if(!initialLoad && sectionData["response"][0]["is_error"] === "Success"){
         
          let type = this.props.editText;
          if (type === "background_Description") {
            type = "Background";
          } else if (type === "technical_Field") {
            type = "Technical Field";
          } else if (type === "summary") {
            type = "Summary";
          }
          this.showNotification(`${type} Drafted`);
          let toastData = this.props.project?.config?.toasterStyle;
          toastData["autoClose"] = this.props.project?.toaster?.claims;
          toast.info(type + " Drafted", this.props.project?.config?.toasterStyle);
        }

        for (let i = 0; i < size; i++) {
          if (sectionData["response"][i]["is_selected"] == true) {
            this.setState({
              version: sectionData["response"][i]["version"],
              promptText: sectionData["response"][i]["prompt"],
            });
          }

          this.setState((prevState) => ({
            sectionDataType: [
              ...prevState.sectionDataType,
              {
                ...sectionData["response"][i],
                id: sectionData["response"][i]["version"],
                section_history_id:
                  sectionData["response"][i]["section_history_id"],
                data: sectionData["response"][i]["text"],
              },
            ],

            setContent: [
              ...prevState.setContent,
              {
                ...sectionData["response"][i],
                id: sectionData["response"][i]["version"],
                data: sectionData["response"][i]["prompt"],
                section_history_id:
                  sectionData["response"][i]["section_history_id"],
              },
            ],
            id: prevState.id + 1,
          }));

          if (
            sectionData["response"][i]["is_selected"] &&
            this.state.is_prompt_success === false
          ) {
            this.edithandler(
              i,
              sectionData["response"][i]["text"],
              sectionData["response"][i]["section_history_id"],
              sectionData["response"][i]["is_error"],
              sectionData["response"][i]
            );
          }
        }
        if (sectionData["response"].length !== 0) {
          this.setState({
            loadingClaims: false,
            loading_section: false,
            is_prompt_success: false,
          });
        }
      } else if (sectionData["status"] === "Error") {
      }
    } catch (e) {
      console.log(e);
      this.setState({ loadingClaims: false, loading_section: false });
    }
  };

  //calling getStoredFlowchartDiagrams from this function, it will call everytime after genrating data and getting data from database
  edithandler(
    index,
    text,
    section_history_id,
    is_error,
    versionData,
    save = false
  ) {
    if (this.apisTokens.flowchart_diagram) {
      this.apisTokens.flowchart_diagram.cancel();
    }
    if (this.apisTokens.block_diagram) {
      this.apisTokens.block_diagram.cancel();
    }
    if (this.apisTokens.regenerate_claim) {
      this.apisTokens.regenerate_claim.cancel();
    }
    this.setState(
      {
        section_history_id: section_history_id,
        editorText: text,
        forceUpdate: !this.state.forceUpdate,
        selectedVersion: index,
        PromptValue: this.state.setContent[index],
        unEditedData: this.state.sectionDataType[index],
        isflowChartRetry: false,
        flowChartAvailable: true,
        blockDiagramAvailable: true,
        isError: is_error,
        versionData,
      },
      () => {
        if (is_error == "Success" && save) {
          this.toggleSavePrompt(true);
        }
      }
      // this.props.editText == "Claims" && this.diagramsFlag ? this.loadDiagrams(is_error) : ""
    );
    if (is_error == "Error") {
      this.setState({ setHistory: true });
    }
  }

  loadDiagrams = (is_error, index) => {
    if (is_error == "Success") {
      // this.getStoredFlowchartDiagrams(is_error);
      // this.regenerateclaims();
      // this.getBlockDiagrams();
      // this.getStoredBlockDiagrams(is_error);

      if (this.apisTokens.flowchart_diagram) {
        this.apisTokens.flowchart_diagram.cancel();
      }
      if (this.apisTokens.block_diagram) {
        this.apisTokens.block_diagram.cancel();
      }
      if (this.apisTokens.regenerate_claim) {
        this.apisTokens.regenerate_claim.cancel();
      }

      // if (this.apisTokens) {
      //   Object.keys(this.apisTokens).map((key) => {
      //     console.log("bhanu=>", this.apisTokens[key], key);
      //     this.apisTokens[key].cancel();
      //   });
      // }

      this.setState(
        {
          preContent: "",
          blockContent: "",
          regenerateClaimSectionHistoryId: "",
          showImages: true,
          flowChartLoading: true,
          blockdiagramLoading: true,
          blocksectionHistoryId: "",
          flowsectionHistoryId: "",
          regenClaimSectionHistoryId: "",
        },
        () => this.isRegenerateClaim(is_error)
      );
    } else {
      this.setState({
        flowChartLoading: false,
        preContent: "",
        blockdiagramLoading: false,
        blockContent: "",
        showImages: false,
      });
    }
  };

  //To genrate data input in the prompt
  sample = async (value) => {
    this.callApi(value);
    this.setState({ loading_section: true });
  };

  checkClaims = async () => {
    try {
      const url_id = this.props.match?.params?.ID;
      let get_project_history_id_data = {
        project_id: url_id,
      };
      if(this.state.inventionName){
        get_project_history_id_data['invention'] = this.state.inventionName
      }
      let select_project_history_value = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_project_history,
        get_project_history_id_data
      );
      let project_history_id =
        select_project_history_value["response"][0]["project_history_id"];
      this.setState({
        projectHistoryId: project_history_id,
        language: select_project_history_value["response"][0]["claims_style"],
      });
      let claims_project_history_data = {
        project_id: url_id,
        section_type: "Claims",
      };
      let Claim_value = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints
          ?.check_data_of_each_section_type,
        claims_project_history_data
      );

      if (
        project_history_id &&
        Claim_value["response"][0] &&
        project_history_id != Claim_value["response"][0]["project_history_id"]
      ) {
        this.setState({
          newbutton: true,
        });
        // localStorage.setItem("regenerateButton", true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  handleDataUpdate(index, value) {
    const newValue = [...this.props.value.value];
  }

  //To Open Prompt
  // If error is true, then again prompt will open
  // If error while re draft, it will call directly without prompt
  promptHandler = (index, version, error, redraft, sectionHistory, event) => {
    if (error == "Error") {
      event.stopPropagation();
    }
    if (
      (redraft && this.props.editText == "Claims" && error == "Error") ||
      (this.state.sectionDataType.length === 1 &&
        this.props.editText == "Claims" &&
        error == "Error")
    ) {
      this.getClaims(redraft, sectionHistory);
    } else {
      if (version) {
        this.setState({ version }, () => this.props.togglingModal());
      } else {
        this.props.togglingModal();
      }
    }

    let sectionDataType = this.state.sectionDataType;
    if (
      (sectionDataType.length > 0 &&
        redraft &&
        this.props.editText == "Claims" &&
        error == "Error") ||
      (sectionDataType.length === 1 &&
        this.props.editText == "Claims" &&
        error == "Error")
    ) {
      sectionDataType.shift();
      this.setState({ sectionDataType: sectionDataType });
    }
  };

  getClaims = async (flag = false, sectionHistory) => {
    this.setState({
      flowChartLoading: true,
      loadingClaims: true,
      generatingClaims: true,
      loading_section: true,
    });
    this.isStreamClaims = false;
    var tmpPromptResponse = "";
    try {
      const url_id = this.props.match?.params?.ID;
      let get_project_history_id_data = {
        project_id: url_id,
      };
      if(this.state.inventionName){
        get_project_history_id_data['invention'] = this.state.inventionName
      }
     
      let select_project_history_value = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_project_history,
        get_project_history_id_data
      );
      let project_history_id =
        select_project_history_value["response"][0]["project_history_id"];
      this.setState({ projectHistoryId: project_history_id });
      let apiData = {
        data: this.state.inventionName,
        project_id: url_id,
        project_history_id: project_history_id,
        redraft: flag,
      };
      if (sectionHistory) {
        apiData.section_history_id = sectionHistory;
      }

      // if (this.apisTokens[this.props.editText]) {
      //   this.apisTokens[this.props.editText].cancel();
      // }
      // this.apisTokens[this.props.editText] = axios.CancelToken.source();

      if (this.controller[this.props.editText]) {
        this.controller[this.props.editText].abort();
      }
      this.controller[this.props.editText] = new AbortController();

      // let getClaims = await apiServices.getData(
      //   "post",
      //   this.props.project?.api_config?.endpoints?.get_claims,
      //   apiData,
      //   this.apisTokens[this.props.editText].token
      // );

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

        if (content?.claims && Object.keys(content).length > 0) {
          this.setState({
            editorText: content?.claims,
            loadingClaims: false,
            newbutton: false,
            generatingClaims: false,
          });
        }
        streamComplete = isFinish;
      };

      let getClaims = await streamApi.getData(
        "post",
        this.props.project?.api_config?.endpoints?.get_claims,
        apiData,
        this.controller[this.props.editText].signal,
        callBack
      );

      if (streamretry == true) {
        this.setState({
          claimsLoading: false,
          flowChartLoading: false,
          setHistory: true,
          loadingClaims: false,
          loading_section: false,
        });
        this.setState((prevState) => ({
          sectionDataType: [
            { data: "", section_history_id: "", is_error: "Error" },
          ],
        }));
        // this.setState({sectionDataType:[getClaims]})
      } else if (streamComplete) {
        // this.setState(
        //   {
        //     claims: getClaims.response,
        //     claimsLoading: false,
        //     section_history_id: getClaims.section_history_id,
        //   }
        //   // () => this.getFlowchartDiagram()
        // );
        this.getSectionTypeData();
      }
      this.setState({
        loadingClaims: false,
        newbutton: false,
        generatingClaims: false,
      });
    } catch (e) {
      console.log(e);
      this.setState({ loadingClaims: false });
      this.setState({
        claimsErrorMessage:  "Failed to create. Please try again. Thank you.",
        claimsLoading: false,
        claimsLongErrorMessage:  "Failed to create.",
      });
      // this.getSectionTypeData();
    }
  };

  getInventionTitle = async () => {
    try {
      let inputVal = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.get_invention_title,
        {
          project_id: this.props.match?.params?.ID,
        }
      );

      this.setState({ inventionName: inputVal["response"]["invention_title"] });
    } catch (e) {
      console.log(e);
    }
  };

  checkForPriorArt = async () => {
    try {
      let res = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.is_prior_art,
        {
          project_id: this.props.match?.params?.ID,
        }
      );

      this.setState({ isPriorArt: res["response"]["is_prior_art"] });
    } catch (e) {
      console.log(e);
    }
  };

  checkForClaimRedraftHandler = async () => {
    try {
      let res = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.is_re_draft_claim,
        {
          project_id: this.props.match?.params?.ID,
        }
      );

      this.setState({
        isRedraftRequired: res["response"]["redraft_claim_need"],
      });
    } catch (e) {
      console.log(e);
    }
  };

  isHistoryHandler = (check) => {
    this.setState((prevState) => ({
      setHistory: !prevState.setHistory,
    }));
  };

  editButtonHandler = () => {
    window.scroll({ top: 0, left: 0, behavior: "instant" });
  };

  toggleSavePrompt = (save) => {
    this.setState((pre) => ({
      savePrompt: !pre.savePrompt,
    }));
  };

  cancelRegenClaimHandler = () => {
    this.setState({ cancelRegclaim: false });
  };

  editHandlerHistory = (
    index,
    data,
    section_history_id,
    is_error,
    versionData,
    save
  ) => {
    // if(this.props.editText === "Claims"){
    //   this.checkForClaimRedraftHandler();
    // }
    this.edithandler(
      index,
      data,
      section_history_id,
      is_error,
      versionData,
      save
    );
    this.setState({
      cancelRegclaim: null,
      editorText: data,
      selectedVersion: index,
      version: versionData.id,
      promptText: versionData.prompt,
    });
  };

  promptHandlerHistory = (
    prompt,
    index,
    id,
    is_error,
    is_redraft,
    section_history_id,
    event
  ) => {
    this.setState(
      { promptText: prompt },
      this.promptHandler(
        index,
        id,
        is_error,
        is_redraft,
        section_history_id,
        event
      )
    );
  };

  render() {
    const link = window.location.href;
    const parts = link.split("/");
    const url_id = parts[4];
    const { editText } = this.props;
    const { editorText, sectionDataType, setContent } = this.state;
    let promptData = this.state.setContent[this.state.selectedVersion];
    let updatetext = editorText
      ? editorText
      : sectionDataType.length > 0
      ? sectionDataType?.[0]?.["data"]
      : "";




    return (
      <Container fluid>
        <header className={classes.header}>
          <div className={classes.leftNav}>
            {this.state.isPriorArt != null && (
              <Link
                to={
                  this.props.match.params.flowChart === "flowChart"
                    ? "/patentDetails/" +
                      this.props.match?.params?.ID +
                      "/edit/" +
                      "Claims"
                    :( this.props.editText == "Claims" && this.state.isPriorArt && isAccess(this.props, 'prior_art_view') )
                    ? "/priorArt/" + this.props.match?.params?.ID + "/true"
                    : this.props.editText == "Claims"
                    ? "/"
                    : `/patentDetails/${url_id}`
                }
                id="home-link"
                className={classes.navLinkStyle}
              >
                <div
                  style={{ textDecorationLine: "none" }}
                  className={classes.leftNavCont}
                >
                  <img src={back_icon} alt="back" />
                  <span className={classes.noUnderline}>
                    {this.props.match.params.flowChart === "flowChart"
                      ? "Claims"
                      : this.props.editText == "Claims" && this.state.isPriorArt
                      ? "Prior Art"
                      : this.props.editText == "Claims"
                      ? "Home"
                      : "Patent Details"}
                  </span>
                </div>
              </Link>
            )}
          </div>
       
            <div className="right-nav">
              <div className="title-nav">
                <div className="div-element-for-header">
                  {
                    this.state.inventionName ?
                    <p>{this.state.inventionName}</p>:
                    <>
                    <SkeltonWrapper
                    padding={"0px 5px"}
                    background={"transparent"}
                  />
                  <SkeltonWrapper
                    padding={"0px 5px"}
                    background={"transparent"}
                  />
                  <SkeltonWrapper
                    padding={"0px 5px"}
                    background={"transparent"}
                  />
                   </>
                  }
                 
                
                </div>
              </div>
            </div>
 
        </header>
        {/* className={classes.generateDataCont} */}
        <Row className={classes.generateDataCont}>
          <Col lg={8} xs={12} md={12} sm={12} id="EditText">
            <CustomTextInput
              {...this.props}
              editText={editText}
              data={updatetext}
              promptData={this.state.prompt_data}
              onDataUpdate={this.handleDataUpdate}
              url_id={url_id}
              forceUpdate={this.state.forceUpdate}
              history={this.props.history}
              index={this.state.selectedVersion}
              unEditedText={
                this.state.unEditedData
                  ? this.state.unEditedData
                  : this.state.sectionDataType[this.state.selectedVersion]
              }
              sectionDataType={this.state.sectionDataType}
              loadingClaims={this.state.loadingClaims}
              isButton={this.state.newbutton}
              generateClaims={this.getClaims}
              loadSectionHistory={this.getSectionTypeData}
              inventionName={this.state.inventionName}
              getInventionTitle={this.getInventionTitle}
              isPriorArt={this.state.isPriorArt}
              isRedraftRequired={this.state.isRedraftRequired}
              checkForClaimRedraftHandler={this.checkForClaimRedraftHandler}
              isHistoryHandler={this.isHistoryHandler}
              setHistory={this.state.setHistory}
              projectHistoryId={this.state.projectHistoryId}
              preContent={this.state.preContent}
              flowChartLoading={this.state.flowChartLoading}
              isflowChartRetry={this.state.isflowChartRetry}
              retryFlowChartHandler={this.genrateFlowHandler}
              retryBlockDiagramHandler={this.genrateBlockHandler}
              flowChartAvailable={this.state.flowChartAvailable}
              flowLongMessage={this.state.flowLongMessage}
              flowShortMessage={this.state.flowShortMessage}
              genrateFlowHandler={this.genrateFlowHandler}
              genrateBlockHandler={this.genrateBlockHandler}
              blockdiagramLoading={this.state.blockdiagramLoading}
              isBlockDiaRetry={this.state.isBlockDiaRetry}
              blockContent={this.state.blockContent}
              showDiagramshandler={this.showDiagramshandler}
              showImages={this.state.showImages}
              blockShortMessage={this.state.blockShortMessage}
              blockLongMessage={this.state.blockLongMessage}
              callingBlockdiagram={this.state.callingBlockdiagram}
              promptText={this.state.promptText}
              blockDiagramAvailable={this.state.blockDiagramAvailable}
              regenerateClaimSectionHistoryId={
                this.state.regenerateClaimSectionHistoryId
              }
              savePrompt={this.state.savePrompt}
              isError={this.state.isError}
              loadingSection={this.state.loading_section}
              generatingClaims={this.state.generatingClaims}
              generatingFlowDia={this.state.generatingFlowDia}
              generatingBlockDia={this.state.generatingBlockDia}
              generatingRegenClaims={this.state.generatingRegenClaims}
              diagramsFlag={this.diagramsFlag}
              language={this.state.language}
            />
          </Col>

          {/* className="history-side-container new" */}
          <History
              {...this.props}
              sectionDataType={sectionDataType}
              setHistory={this.state.setHistory}
              loading_section={this.state.loading_section}
              loadingClaims={this.state.loadingClaims}
              selectedVersion={this.state.selectedVersion}
              edithandler={this.edithandler}
              editHandlerHistory={this.editHandlerHistory}
              promptHandlerHistory={this.promptHandlerHistory}
              versionData={this.state.versionData}
              initialLoadingClaim={this.state.initialLoadingClaim}
              sample={this.sample}
              editText={this.props.editText}
              version={this.state.version}
          />
        </Row>

      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  project: state.projectData,
});

const mapDispatchToProps = (dispatch) => {
  return {
    togglingModal: () => dispatch(toggleModal()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(generatedData);
