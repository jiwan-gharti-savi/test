import React from "react";
import { connect } from "react-redux";
import "./patentDetails.css";
import "../fallbackContainer/animate.scss";
import { Link, NavLink } from "react-router-dom";
import Prompt from "./patentDetailsPrompt";
import classes from "./patentDetails.module.css";
import back_icon from "../../assets/icons/back.svg";
import axios from "axios";
import Abstract from "../fallbackContainer/abstract/abstract";
import apiServices from "../../../services/apiServices";
import { Container, Row, Col } from "reactstrap";
import Error from "../Error/textError";
import info from "../../assets/icons/info_orange.svg";
import ReloadOverlay from "./Overlay/reloadOverlay";

import {
  toggleRetryOverlay,
  enableDiaExport,
  patentExported,
  patentExporting,
} from "../../../store/action";
import { toast } from "react-toastify";
import copy from "../../assets/icons/copy.svg";
import tick from "../../assets/icons/tick.png";
import MyButton from "../../Elements/MyButton/MyButton";
import info_white from "../../assets/icons/info_white.svg";
import down_arrow from "../../assets/icons/down_arrow.svg";
import download_thin from "../../assets/icons/download_thin.svg";
import download_white from "../../assets/icons/download_white.svg";
import top from "../../assets/icons/top.svg";
import loading_icon from "../../assets/icons/loading.gif";
import LoadingScreen from "../../LoadingScreen/loadingScreen";
import arrow_down from "../../assets/icons/arrow_down.svg";
import ImageViewer from "../ImageViewer/ImageViewer";
import Diagrams from "./Diagrams";
import CountdownTimer from "../Counter/CountdownTimer";
import logo from "../../assets/icons/IP_Author_logo.svg";
import streamApi from "../../../services/streamApi";
import PulseLoader from "react-spinners/PulseLoader";
import BlinkingCursor from "../../LoadingScreen/BlinkingCursor";
import Skeleton from "react-loading-skeleton";
import SkeltonWrapper from "../../Elements/Skelton/SkeltonWrapper";
import { isAccess } from "../../../utils/accessCheck";

class patentDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showHiddenComponent: true,
      showToggleButton: false,
      sectionData: [],
      inputValDataBase: "",
      user_id: props.project?.user_id,
      titleLoading: true,
      abstractLoading: true,
      claimsLoading: true,
      descriptionLoading: true,
      technicalLoading: true,
      backgroundLoading: true,
      summaryLoading: true,
      listOfFiguresLoading: true,
      detailedDescriptionFiguresLoading: true,
      titleErrorMessage: "",
      abstractErrorMessage: "",
      detailDescriptionErrorMessage: "",
      backgroundDescriptionErrorMessage: "",
      technicalFieldErrorMessage: "",
      summaryErrorMessage: "",
      claimsErrorMessage: "",
      listOfFiguresErrorMessage: "",
      detailedDescriptionFiguresErrorMessage: "",
      embodimentsErrorMessage: "",
      response: [],
      apiErrors: [],
      errorReset: false,
      apiSuccessCount: 0,
      toaster: false,
      titleLongMessage: "",
      abstractLongMessage: "",
      detailLongMessage: "",
      backgroundLongMessage: "",
      technicalFieldLongMessage: "",
      summartLongMessage: "",
      claimsLongMessage: "",
      listOfFiguresLongMessage: "",
      detailedDescriptionFiguresLongMessage: "",
      embodimentsLongMessage: "",
      activeType: null,
      detailDescriptionFig: false,
      apiResponse: "",
      isClaims: true,
      reDraftPatent: false,
      isOpen: false,
      scrolledItem: "Title",
      priotArtEnable: false,
      scrolled: false,
      pageLoading: false,
      flowChartText: [],
      previewChart: false,
      previewIndex: 0,
      isDownload: false,
      isDownloadPatent: false,
      exportPatent: false,
      downloadFlowSvg: false,
      isFlowchartButtons: false,
      embodimentsLoading: true,
      viewerContent: "",
      selectedClaimVersionId: "",
      regenerateClaimSectionHistoryId: true,
      projectHistoryId: "",
      isBlockDia: true,
      regenrateLoading: true,
      regenrateClaimRetry: false,
      loadDiagramApis: false,
      typeOfDia: "",
      isFlowChart: true,
      enableExport: false,
      flowChartApiSuccess: false,
      blockApiSuccess: false,
      regenClaimSectionHistoryId: "",
      generatingSummary: false,
      generatingDetaildescription: false,
      generateRegenClaim: false,
      isEmbodiment: false,
      generatingEmbodiments: false,
      isFlowEmbodiment: true,
      isBlockEmbodiment: true,
      generatingDiagrams: false,
      callEmbodiments: false,
      isFlowLoading: true,
      isBlockLoading: true,
      isFlowEmbLoading: true,
      isBlockEmbLoading: true,
      isBlockDiaRetry: false,
      isFlowRetry: false,
      isFlowEmbRetry: false,
      isBlockEmbRetry: false,
      isBlockDiaSuccess: false,
      isFlowSuccess: false,
      showEmbodiments: true,
      isExportingPriorArt: false,
      diagramName: "",

      titleStream: false,
      abstractStream: false,
      technicalFiledStream: false,
      backgroundStream: false,
      summaryStream: false,
      claimSectionHistoryId: "",
      flowChartData: "",
      blockDiagramData: "",
      isProjectComplete: false,
      diagramsStreaming: false,
      blockDiagramsavailable: false,
      flowChartsAvailable: false,
      blockDesLoading: true,
      blockDesRetry: false,
      flowDesLoading: true,
      flowDesRetry: false,
      redraftDiagrams: false,
      detailedDescriptionLoading: true,
      detailedDescriptionRetry: false,
      detailedDescriptionData : "",
      isRegenerteClaimAvailable : true,
      isFlowDetailedDescriptionLoading : true,
      isBlockDetailedDescriptionLoading : true,
      detailedDescriptionStreaming : false,
      isSeprateDetailedDescriptionAvailable : true,
      separateDetailedDescriptionStreaming : false,
      separateDetailedDescriptionRetry : false,
      separateDetailedDescriptionData: "",
      detailedDescriptionAvailable : true,
      projectCompleteNotification : false

    };

    this.scrollTitle = React.createRef();
    this.scrollAbstract = React.createRef();
    this.scrollImages = React.createRef();
    this.scrollClaims = React.createRef();
    this.scrollDetailDescription = React.createRef();
    this.scrollTechnicalField = React.createRef();
    this.scrollBackground = React.createRef();
    this.scrollSummary = React.createRef();
    this.scrollListOfFigures = React.createRef();
    this.scrollDescriptionFigures = React.createRef();

    this.childComponentMounted = false;
    this.childRef = React.createRef();
    this.callChildFunction = this.callChildFunction.bind(this);
    this.reDraftPatentHandler = this.reDraftPatentHandler.bind(this);
    this.sliderSettings = {
      infinite: false,
      speed: 500,
      slidesToShow: 5,
      slidesToScroll: 5,
    };
    this.apiStatusToken = {};
    this.flowEmbodimentsRef = React.createRef();
    this.blockEmbodimentRef = React.createRef();
    this.flowChartRef = React.createRef();
    this.blockDiagramRef = React.createRef();
    this.figuresRef = React.createRef();
    this.extraDetailedDescriptionRef = React.createRef();
    this.notification = null;
    this.controller = {};
    this.shortErrorMessage = "We're sorry, but we couldn't process your request at this time. Please try again shortly.";
    this.lonErrorMessage = "Failed to process your request.";
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevState.errorReset && prevState.apiErrors.length > 1) {
      this.setState({ errorReset: true });
      if (!this.props.isOpen) {
        this.props.toggleOverlay();
        window.favloader.stop();
      }
    }
    if (
      !prevState.errorReset &&
      prevState.apiErrors.length == 0 &&
      this.state.apiSuccessCount == 8
    ) {
      this.setState({ apiSuccessCount: 0 });
      // toast.info(
      //   this.props.project?.config?.project_success,
      //   this.props.project?.config?.toasterStyle
      // );
    }

    if (
      prevState.generatingSummary !== this.state.generatingSummary ||
      prevState.generatingDetaildescription !==
        this.state.generatingDetaildescription ||
      prevState.generatingEmbodiments !== this.state.generatingEmbodiments ||
      prevState.generatingDiagrams !== this.state.generatingDiagrams ||
      prevState.regenrateClaimRetry !== this.state.regenrateClaimRetry ||
      prevState.separateDetailedDescriptionStreaming !== this.state.separateDetailedDescriptionStreaming ||
      prevState.blockDesRetry !== this.state.blockDesRetry ||
      prevState.flowDesRetry !== this.state.flowDesRetry
    ) {
      if (
        this.state.generatingSummary ||
        this.state.generatingDetaildescription ||
        this.state.generatingEmbodiments ||
        (this.state.generatingDiagrams && !this.state.blockDesRetry && !this.state.flowDesRetry ) ||
        this.state.separateDetailedDescriptionStreaming
      ) {
        window.favloader.start();
      } else {
        window.favloader.stop();
      }

      if (this.state.regenrateClaimRetry) {
        window.favloader.stop();
      }
    }
  }

  callChildFunction(index) {
    if (this.childComponentMounted) {
      const child = this.childRef.current;
      child.handleClick();
    }
  }

  //To load get the input value that entered in the Home page
  //getting id from current url to get entered text from database
  get_invention_title = async () => {
    window.scrollTo(0, 0);
    this.childComponentMounted = true;

    try {
      let user_id = localStorage.getItem("user_id");

      let inputVal = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.get_invention_title,
        {
          project_id: this.props.match?.params?.id,
        }
      );

      this.setState(
        { inputValDataBase: inputVal?.["response"]?.["invention_title"] },
        () => {
          // this.getselectedClaimVersionId();
          this.getProjectHistoryIdData(
            inputVal?.["response"]?.["invention_title"]
          );
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  getProjectHistoryIdData = async (title) => {
    try {
      const url_id = this.props?.match?.params?.id;
      let get_project_history_id_data = {
        invention: title,
        project_id: url_id,
      };
      let select_project_history_value = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_project_history,
        get_project_history_id_data
      );
      let project_history_id =
        select_project_history_value["response"][0]["project_history_id"];
      this.setState({ projectHistoryId: project_history_id });
    } catch (e) {
      console.log(e);
    }
  };

  // This will run when you click on the prompt
  //It will genrate new patent details for edited input in the prompt
  sample = async (text) => {
    var thisView = this;
    let project_id = this.props.match?.params?.id;
    try {
      let endPoints = this.props.project?.api_config?.endpoints;
      let get_data_apis = [
        endPoints?.get_title,
        endPoints?.get_abstract,
        endPoints?.get_background_description,
        endPoints?.get_technical_field,
        endPoints?.get_summary,
        endPoints?.get_claims,
        // endPoints?.get_list_of_figures,
        // endPoints?.get_detailed_description_figure,
      ];

      let project_history_id;
      if (!this.state.projectHistoryId) {
        const url_id = this.props?.match?.params?.id;
        let get_project_history_id_data = {
          invention: this.state.inputValDataBase,
          project_id: url_id,
        };
        let select_project_history_value = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.select_project_history,
          get_project_history_id_data
        );
        project_history_id =
          select_project_history_value["response"][0]["project_history_id"];
        this.setState({ projectHistoryId: project_history_id });
      }
      // let project_history_id =
      //   select_project_history_value["response"][0]["project_history_id"];
      let apiData = {
        data: text,
        project_id: project_id,
        project_history_id: project_history_id
          ? project_history_id
          : this.state.projectHistoryId,
      };
      let allAPi = await axios.all(
        get_data_apis.map((eachApi) => {
          if (this.apiStatusToken[eachApi])
            this.apiStatusToken[eachApi].cancel();
          this.apiStatusToken[eachApi] = axios.CancelToken.source();
          return apiServices.getData(
            "post",
            eachApi,
            apiData,
            this.apiStatusToken[eachApi].token
          );
        })
      );

      let projectData = {};
      let errorData = {};

      if (allAPi) {
        await allAPi.map((eachResp, apiIndex) => {
          if (apiIndex != 0) {
            if (eachResp["status"] == "Success") {
              let dataResponse = eachResp["response"];

              switch (apiIndex) {
                case 1:
                  projectData.Abstract = dataResponse;
                  break;
                case 2:
                  projectData.background_Description = dataResponse;
                  break;
                case 3:
                  projectData.technical_Field = dataResponse;
                  break;
                case 4:
                  projectData.summary = dataResponse;
                  break;
                case 5:
                  projectData.Claims = dataResponse;
                  break;
                // case 7:
                //   projectData.ListOfFigures = dataResponse;
                //   break;
                // case 8:
                //   projectData.detailedDescriptionFigures = dataResponse;
                //   break;
                default:
                  break;
              }
            } else if (eachResp["status"] == "Error") {
              let errorResponse = eachResp?.["message"];
              switch (apiIndex) {
                case 1:
                  errorData.abstractErrorMessage = errorResponse;
                  break;
                case 2:
                  errorData.detailDescriptionErrorMessage = errorResponse;
                  break;
                case 3:
                  errorData.backgroundDescriptionErrorMessage = errorResponse;
                  break;
                case 4:
                  errorData.technicalFieldErrorMessage = errorResponse;
                  break;
                case 5:
                  errorData.summaryErrorMessage = errorResponse;
                  break;
                case 6:
                  errorData.claimsErrorMessage = errorResponse;
                  break;
                // case 7:
                //   errorData.listOfFiguresErrorMessage = errorResponse;
                //   break;
                // case 7:
                //   errorData.detailDescriptionErrorMessage = errorResponse;
                //   break;
                default:
                  break;
              }
            }
          }
        });
      }

      if (projectData) {
        this.setState((pre) => ({
          sectionData: {
            ...pre.sectionData,
            ...projectData,
          },
          ...projectData,
        }));
      }
      if (errorData) {
        this.setState({ ...errorData });
      }

      (async () => {
        try {
          let response = await apiServices.getData(
            "post",
            endPoints?.update_project_data,
            {
              params: {
                project_id: this.props.match?.params?.id,
                invention_title: text,
              },
            }
          );
          this.setState({
            project: response,
          });
        } catch (e) {
          console.log(e);
        }
      })();

      this.get_data();

      // this.props.history.push('/patentDetails/'+this.props.project.project_id);
      let update_instance = [
        "Title",
        "Abstract",
        "Claims",
        // "detail_Description",
        "technical_Field",
        "background_Description",
        "summary",
        // "ListOfFigures",
        // "detailedDescriptionFigures",
      ];
      update_instance.map((eachSection, sectionIndex) => {
        apiServices.getData("post", endPoints?.update_section_data, {
          project_id: thisView.props.match?.params?.id,
          content: allAPi[sectionIndex]["data"][0],
          section_type: eachSection,
        });
      });
    } catch (e) {
      console.log(e);
    }
  };

  componentWillMount() {
    window.scroll({ top: 0, left: 0, behavior: "instant" });
    let filterDataName = `filterData${this.props.match?.params?.id}`;
    localStorage.removeItem(filterDataName);
    this.checkUserAccessToProject();
  }

  getselectedClaimVersionId = async (redraft = false) => {
    try {
      let selectedVersionId = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.is_selected_clm_id,
        { project_id: this.props?.match?.params?.id }
      );

      if (selectedVersionId.status == "Success") {
        this.setState(
          {
            selectedClaimVersionId:
              selectedVersionId?.response?.[0]?.["section_history_id"],
          },
          () => {
            if (redraft) {
              this.regenerateClaims();
            } else {
              this.isRegenerateClaim();
            }
          }
        );
        // this.isRegenerateClaim();
      }
    } catch (e) {
      console.log(e);
    }
  };

  isRegenerateClaim = async () => {
    try {
      this.setState({ regenrateLoading: true, isFlowLoading: true });
      const payLoad = {
        claim_section_history_id: this.state.selectedClaimVersionId,
      };

      const isRegenerate = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_regenerate_claim,
        payLoad
      );
      this.setState({ regenrateLoading: false, isFlowLoading: false });
      if (
        isRegenerate.status == "Success" &&  (isRegenerate.response &&
        isRegenerate.response.length == 0)
      ) {
        this.regenerateClaims();
        return;
      } else if (
        isRegenerate.status == "Success" &&
       ( isRegenerate.response.length > 0 &&  isRegenerate.response )&&
        isRegenerate.response[0]?.["is_error"] == "Success"
      ) {
        this.setState({
          regenerateClaimSectionHistoryId:
            isRegenerate.response[0]?.section_history_id,
          loadDiagramApis: true,
          regenClaimSectionHistoryId:
            isRegenerate.response[0]?.section_history_id,
          regenrateClaimRetry: false,
          generateRegenClaim: false,
          isRegenerteClaimAvailable : true
        });
      } else if (
        (isRegenerate.status == "Success" &&  isRegenerate.response &&
          isRegenerate.response.length == 0) ||
        isRegenerate.status == "Error" ||
        isRegenerate.response[0]?.is_error == "Error"
      ) {
        // this.regenerateClaims();
        this.setState({
          regenrateClaimRetry: true,
          regenClaimError: isRegenerate.response?.[0]?.message,
          regenClaimLongError: isRegenerate.response?.[0]?.message_long,
          regenerateClaimSectionHistoryId:  isRegenerate.response[0]?.section_history_id ?  isRegenerate.response[0]?.section_history_id : "",
          diagramsStreaming: false,
          isRegenerteClaimAvailable : false,
          regenClaimSectionHistoryId:
          isRegenerate.response[0]?.section_history_id,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  regenerateClaims = async () => {
    if (this.apiStatusToken["regenClaimToken"]) {
      this.apiStatusToken["regenClaimToken"].cancel();
    }
    this.apiStatusToken["regenClaimToken"] = axios.CancelToken.source();

    if (this.controller["regenClaimToken"]) {
      this.controller["regenClaimToken"].abort();
    }
    this.controller["regenClaimToken"] = new AbortController();

    try {
      this.setState({
        regenrateLoading: true,
        regenrateClaimRetry: false,
        generateRegenClaim: true,
        isFlowLoading: true,
        diagramsStreaming: true,
      });
      let project_history_id;
      if (!this.state.projectHistoryId) {
        const url_id = this.props?.match?.params?.id;
        let get_project_history_id_data = {
          invention: this.state.inputValDataBase,
          project_id: url_id,
        };
        let select_project_history_value = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.select_project_history,
          get_project_history_id_data
        );
        project_history_id =
          select_project_history_value["response"][0]["project_history_id"];
        this.setState({ projectHistoryId: project_history_id });
      }

      let payLoad = {
        data: this.state.inputValDataBase,
        project_id: this.props?.match?.params?.id,
        project_history_id: this.state.projectHistoryId
          ? this.state.projectHistoryId
          : project_history_id,
        redraft: false,
      };

      if(this.state.regenClaimSectionHistoryId){
        payLoad['section_history_id'] = this.state.regenClaimSectionHistoryId
      }

      if(this.state.selectedClaimVersionId){
        payLoad['claim_section_history_id'] = this.state.selectedClaimVersionId
      }

      const callBack = ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (isFinish) {
          if (retry) {
            this.setState({
              regenrateClaimRetry: true,
              regenClaimError: shortMessage,
              regenClaimLongError: longMessage,
              regenrateLoading: false,
              isFlowLoading: false,
              diagramsStreaming: false,
              isRegenerteClaimAvailable : false
            });
          } else {
            this.isRegenerateClaim();
          }
        }
      };

      let regenClaimStream = await streamApi.getData(
        "post",
        this.props.project?.api_config?.endpoints?.regenerate_claim,
        payLoad,
        this.controller["regenClaimToken"].signal,
        callBack
      );
    } catch (e) {
      this.setState({ regenrateClaimRetry: true });
      console.log(e);
    }
  };

  checkUserAccessToProject = async () => {
    let data = {
      id: localStorage.getItem("user_id"),
      project_id: this.props?.match?.params?.id,
      role_id: localStorage.getItem("role_id"),
    };

    var response = await apiServices.getData(
      "post",
      this.props.project?.api_config?.endpoints?.check_user_access_to_project,
      data
    );
    if (response["status"] === "Error" || response?.response?.project !== 'yes' || !isAccess(this.props, 'drafting_view_specs') ) {
      let toastData = this.props.project?.config?.toasterStyle;
      toastData["autoClose"] = response?.["message_time"];
      let toastMessage = response["message"] ? response["message"] :"Unauthorized Access Attempted"
      toast.error(toastMessage, toastData);
      this.props.history.push("/home");
    } else {
      this.get_invention_title();
      this.get_data();
    }
  };

  getOtherSectiondata = (section, data) => {
    let sectionData;
    if (section) {
      sectionData = section;
    } else {
      sectionData = this.state.apiResponse;
    }
    let all;
    if (data) {
      all = data;
    } else {
      all = [
        "Title",
        "Abstract",
        // "detail_Description",
        "technical_Field",
        "background_Description",
        "summary",
        // 'embodiments'
        // "list_of_figures",
        // "detailed_description_figures",
      ];
    }

    let available = [];
    if (sectionData?.response) {
      sectionData?.response.map((eachResp) => {
        if (eachResp.is_error === "Success") {
          available.push(eachResp.section_type);
        }
      });
    }

    // sectionData?.data?.response.map((eachResp) => {
    //   if (eachResp.is_error === "Success") {
    //     available.push(eachResp.section_type);
    //   }
    // });

    var difference = all.filter((x) => available.indexOf(x) === -1);
    if (
      difference.indexOf("list_of_figures") > -1 &&
      difference.indexOf("detailed_description_figures") > -1
    ) {
      difference.pop();
    }
    if (difference && difference.length > 0) {
      difference.map((eachPending) => {
        this.retryApi(eachPending);
      });
    }
  };

  // It will call api on conditional basis
  // @check , to check that we have data of given input already present in the database or not
  // if 'true' , will fetch from database
  // if 'false' ,  will genarate and store in the database along with rendering on ui
  get_data = async () => {
    var thisView = this;

    // if(localStorage.getItem("regenerateButton")){
    //   this.getOtherSectiondata()
    // }
    // else{
    try {
      const link = window.location.href;
      const parts = link.split("/");
      const url_id = parts[4];
      let user_id = this.props.project.user_id;

      let is_DD_based_on_same_claim = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.is_DD_based_on_same_claim,
        {
          project_id: url_id,
        }
      );

      let checkPriorArt = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.download_btn_active,
        {
          project_id: url_id,
        }
      );

      this.setState({
        priotArtEnable: checkPriorArt["response"]["is_prior_art"],
        isDownloadPatent: checkPriorArt["response"]["is_download_btn_active"],
      });

      if (is_DD_based_on_same_claim["response"]["is_redraft_needed"] == "yes") {
        this.setState({ reDraftPatent: true });
      }

      let sectionData = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_one_section,
        {
          project_id: url_id,
        }
      );

      this.checkForDownloadButton(true);

      if (!this.state.inputValDataBase) {
        let project_data = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.get_invention_title,
          {
            project_id: url_id,
          }
        );

        this.setState({
          inputValDataBase: project_data["response"]["invention_title"],
        });
      }

      var failedCount = 0;
      if (sectionData["response"] && sectionData["response"].length > 0) {
        sectionData["response"].map((eachApi) => {
          if (eachApi.is_error == "Error") {
            failedCount += 1;
          }
        });
      }

      function checkIsSuccess(array) {
        let hasClaims = false;
        let hasTitle = false;

        for (let obj of array) {
          if (obj.is_error === "Success" && obj.section_type === "Claims") {
            hasClaims = true;
          }
          if (obj.is_error === "Success" && obj.section_type === "Title") {
            hasTitle = true;
          }
        }

        // return hasClaims && hasTitle;
        return hasClaims;
      }

      //check each section data, if we have any particular data stop its loading and rest will continue load , will stop when we get data
      const checkWhichSectionHasData = (array) => {
        let thisView = this;
        for (let obj of array) {
          if (obj.is_error === "Success" && obj.section_type === "Claims") {
            this.setState({ claimsLoading: false });
          }
          if (obj.is_error === "Success" && obj.section_type === "Title") {
            this.setState({ titleLoading: false });
          }
          if (obj.is_error === "Success" && obj.section_type === "Abstract") {
            this.setState({ abstractLoading: false });
          }
          if (obj.is_error === "Success" && obj.section_type === "summary") {
            this.setState({ summaryLoading: false });
          }
          if (
            obj.is_error === "Success" &&
            obj.section_type === "detailed_description_figures"
          ) {
            this.setState({ detailedDescriptionFiguresLoading: false });
          }
          if (
            obj.is_error === "Success" &&
            obj.section_type === "technical_Field"
          ) {
            this.setState({ technicalLoading: false });
          }
          if (
            obj.is_error === "Success" &&
            obj.section_type === "background_Description"
          ) {
            this.setState({ backgroundLoading: false });
          }
          if (
            obj.is_error === "Success" &&
            obj.section_type === "list_of_figures"
          ) {
            this.setState({ listOfFiguresLoading: false });
          }
        
          if (obj.section_type === "regenerate_claim") {
            if (obj.is_error === "Success") {
              this.setState({
                regenrateLoading: false,
                isFlowLoading: false,
                regenrateClaimRetry: false,
                generateRegenClaim: false,
                regenerateClaimSectionHistoryId: obj?.section_history_id,
                regenClaimSectionHistoryId: obj?.section_history_id,
                selectedClaimVersionId: obj?.claim_section_history_id,
                loadDiagramApis: true,
                isRegenerteClaimAvailable : true
              });
            } else {
              this.setState({
                regenrateClaimRetry: true,
                regenClaimError: obj?.message,
                regenClaimLongError: obj?.message_long,
                regenerateClaimSectionHistoryId:  obj?.section_history_id ?  obj?.section_history_id : "",
                regenClaimSectionHistoryId:  obj?.section_history_id ?  obj?.section_history_id : "",
                diagramsStreaming: false,
                regenrateLoading: false,
                isFlowLoading: false,
                selectedClaimVersionId: obj?.claim_section_history_id ? obj?.claim_section_history_id : "",
                isRegenerteClaimAvailable : false

              });
            }
          }
          if (!this.state.regenrateClaimRetry) {
            if (obj.section_type === "flowchart_diagram") {
                this.setState({ flowChartData: obj });
            } else if (obj.section_type === "block_diagram") {
                this.setState({ blockDiagramData: obj });
            } else if (obj.section_type === "extra_diagram") {
                this.setState({ detailedDescriptionData: obj });
            } else if (obj.section_type === "total_detailed_description") {
                this.setState({ separateDetailedDescriptionData: obj });
            }
          }
        
        }
      };

      if (sectionData?.response) {
        thisView.setState({ apiResponse: sectionData });
        const result = checkIsSuccess(sectionData?.response);

        checkWhichSectionHasData(sectionData?.response);

        const checkClaimSuccess = (array) => {
          let hasClaims = false;
          let hasRegenClaim = false;

          for (let obj of array) {
            if (obj.is_error === "Success" && obj.section_type === "Claims") {
              if (obj.section_history_id) {
                this.setState({
                  claimSectionHistoryId: obj.section_history_id,
                });
              }
              hasClaims = true;
            }
          }
          for (let obj of array) {
            if (obj.section_type === "regenerate_claim") {
              hasRegenClaim = true;
            }
          }

          return [hasClaims, hasRegenClaim];
        };

        const [claimsDone, regenClaim] = checkClaimSuccess(
          sectionData?.response
        );
        if (!regenClaim) {
          this.getselectedClaimVersionId();
        }

        // for now we always have claims, therefore 1st condition will always true
        if (result) {
          let all = [
            "Title",
            "Abstract",
            // "detail_Description",
            "technical_Field",
            "background_Description",
            "summary",
            // "embodiments"
            // "list_of_figures",
            // "detailed_description_figures",
          ];

          this.setState({ isClaims: true }, () =>
            this.getOtherSectiondata(sectionData, all)
          );
          // this.getOtherSectiondata(sectionData, all);
        } else {
          let all = [
            "Title",
            "Abstract",
            // "detail_Description",
            "technical_Field",
            "background_Description",
            "summary",
            // 'embodiments'
            // "list_of_figures",
            // "detailed_description_figures",
          ];
          this.setState(
            {
              isClaims: true,
            },
            () => this.getOtherSectiondata(sectionData, all)
          );
        }

        if (sectionData?.response && sectionData?.response.length > 0) {
          let projectData = {};
          let projectHistoryData = {};
          Object.keys(sectionData.response).map((eachKey) => {
            switch (sectionData.response[eachKey]["section_type"]) {
              case "Title":
                if (sectionData.response[eachKey]["is_error"] == "Error") {
                  this.setState({ titleErrorMessage: "-" });
                } else {
                  projectData.Title = sectionData.response[eachKey]["text"];
                  projectHistoryData.Title =
                    sectionData.response[eachKey]["text"];
                }

                break;
              case "Abstract":
                if (sectionData.response[eachKey]["is_error"] == "Error") {
                  this.setState({ abstractErrorMessage: "-" });
                } else {
                  projectData.Abstract = sectionData.response[eachKey]["text"];
                  projectHistoryData.Abstract =
                    sectionData.response[eachKey]["text"];
                }

                break;

              case "technical_Field":
                if (sectionData.response[eachKey]["is_error"] == "Error") {
                  this.setState({ technicalFieldErrorMessage: "-" });
                } else {
                  projectData.technical_Field =
                    sectionData.response[eachKey]["text"];
                  projectHistoryData.technical_Field =
                    sectionData.response[eachKey]["text"];
                }
                break;

              case "background_Description":
                if (sectionData.response[eachKey]["is_error"] == "Error") {
                  this.setState({ backgroundDescriptionErrorMessage: "-" });
                } else {
                  projectData.background_Description =
                    sectionData.response[eachKey]["text"];
                  projectHistoryData.background_Description =
                    sectionData.response[eachKey]["text"];
                }
                break;

              case "summary":
                if (sectionData.response[eachKey]["is_error"] == "Error") {
                  this.setState({ summaryErrorMessage: "-" });
                } else {
                  projectData.summary = sectionData.response[eachKey]["text"];
                  projectHistoryData.summary =
                    sectionData.response[eachKey]["text"];
                }
                break;

              case "Claims":
                if (sectionData.response[eachKey]["is_error"] == "Error") {
                  this.setState({ claimsErrorMessage: "-", isClaims: false });
                } else {
                  projectData.Claims = sectionData.response[eachKey]["text"];
                  projectHistoryData.Claims =
                    sectionData.response[eachKey]["text"];
                }
                break;

              default:
                break;
            }
          });

          this.setState({
            sectionData: projectData,
            // sectionHistoryData: projectHistoryData,
          });
        }
      }
    } catch (e) {
      console.log("error = >", e);
    }
    this.setState({ pageLoading: false });
  };

  checkForDownloadButton = async (initialLoad, type) => {
    try {
      const url_id = this.props?.match?.params?.id;

      let checkPriorArt = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.download_btn_active,
        {
          project_id: url_id,
        }
      );
      let buttonActive = checkPriorArt["response"]["is_download_btn_active"];
      let projectComplete = checkPriorArt["response"]["project_finish"];

      if (
        type === 'figures' &&
        checkPriorArt["response"]["is_flowchart_diagram"] &&
        checkPriorArt["response"]["is_block_diagram"]
      ) {
        let toastData = this.props.project?.config?.toasterStyle;
        toastData["autoClose"] = this.props.project?.toaster?.detailPage;
        toast.info("Figures Drafted", toastData);
      }
      if (
        type === 'totalDetailedDescription' &&
        checkPriorArt["response"]["is_total_detailed_description"]
      ) {
        let toastData = this.props.project?.config?.toasterStyle;
        toastData["autoClose"] = this.props.project?.toaster?.detailPage;
        toast.info("Detailed Description Drafted", toastData);
      }

      if ((projectComplete && projectComplete !== this.state.isProjectComplete) || ( projectComplete && !this.state.isProjectComplete )) {
        if (!initialLoad) {
          let toastData = this.props.project?.config?.toasterStyle;
          toastData["autoClose"] = this.props.project?.toaster?.detailPage;
          toast.info(this.props.project?.config?.project_success, toastData);
          this.showNotification("Patent has been Drafted successfully");
          this.setState({projectCompleteNotification : true});
        }
        this.setState({ isProjectComplete: projectComplete });
      }
      if (buttonActive && buttonActive !== this.state.isDownloadPatent) {
        this.setState({ isDownloadPatent: buttonActive });
      }
    } catch (e) {
      console.log(e);
    }
  };

  toggleStreamState = (type, flag) => {
    switch (type) {
      case "Title":
        this.setState({ titleStream: flag });
        break;
      case "Abstract":
        this.setState({ abstractStream: flag });
        break;
      case "technical_Field":
        this.setState({ technicalFieldStream: flag });
        break;
      case "background_Description":
        this.setState({ backgroundDescriptionStream: flag });
        break;
      case "summary":
        this.setState({ summaryStream: flag });
        break;
      default:
        break;
    }
  };

  getSectionTypeDataHandler = async(metaData) =>{
    try{

      return await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_one_section_type,
        {
          project_id: this.props.match?.params?.id,
          section_type: metaData.type,
        }
      );

    }catch(e){
      console.log(e);
    }
  }

  processData = async (
    data,
    metaData,
    isFinish,
    retry,
    shortMessage,
    longMessage,
    autoRetryError = false
  ) => {
    try {
      this.toggleStreamState(metaData.type, true);

      let sectionTypeData;

      if (isFinish) {
        if (!data && !retry) {
          this.retryApi(metaData["type"]);
          return;
        } else if (retry) {
          this.toggleStreamState(metaData.type, false);
          let getSectionTypeData = await this.getSectionTypeDataHandler(metaData)

          if(getSectionTypeData?.["response"] && getSectionTypeData?.["response"]?.["is_error"] === 'Error'){
            sectionTypeData = getSectionTypeData;
          }else{
            data = [];
            data["status"] = "Error";
            data["message"] = shortMessage ? shortMessage : "Failed to load please retry" ;
            data["message_long"] = longMessage ? longMessage :
               "Failed to load please retry";
          }
          autoRetryError = true;
        } else {
          this.toggleStreamState(metaData.type, false);
          this.checkForDownloadButton();

          sectionTypeData = await this.getSectionTypeDataHandler(metaData);

          if (
            sectionTypeData?.["response"]?.["is_error"] !== "Error" ||
            data?.["status"] !== "Error"
          ) {
            let toastData = this.props.project?.config?.toasterStyle;
            toastData["autoClose"] = this.props.project?.toaster?.detailPage;
            let type = metaData.type;
            if (type === "detail_Description") {
              type = "";
            } else if (type === "background_Description") {
              type = "Background";
            } else if (type === "technical_Field") {
              type = "Technical Field";
            } else if (type === "summary") {
              type = "Summary";
            }

            toast.info(type + " Drafted", toastData);
          }
        }
      }


      if (
        ((sectionTypeData?.["response"]?.["is_error"] !== "Error" ||
          data?.["status"] !== "Error")) &&
        !autoRetryError
      ) {

        var resp = data;
        this.setState((pre) => ({
          sectionData: {
            ...pre.sectionData,
            [metaData.type]: sectionTypeData?.["response"]?.["text"]
              ? sectionTypeData?.["response"]?.["text"]
              : resp,
          },
        }));

        // {((metaData.type == 'list_of_figures' || metaData.type == 'detailed_description_figures') && !this.state.flowChartAvailable) ? toastInfo = "" : toast.info(data.message, toastData)};
        switch (metaData.type) {
          case "Title":
            this.setState({
              titleLoading: false,
              titleErrorMessage: "",
              titleLongMessage: "",
            });
            this.setState((prev) => ({
              apiSuccessCount: prev.apiSuccessCount + 1,
            }));
            // if (this.state.sectionData.Claims) {
            //   this.getOtherSectiondata();
            // }
            break;

          case "Abstract":
            this.setState({
              abstractLoading: false,
              abstractErrorMessage: "",
              abstractLongMessage: "",
            });
            this.setState((prev) => ({
              apiSuccessCount: prev.apiSuccessCount + 1,
            }));
            break;


          case "background_Description":
            this.setState({
              backgroundLoading: false,
              backgroundDescriptionErrorMessage: "",
              backgroundLongMessage: "",
            });
            this.setState((prev) => ({
              apiSuccessCount: prev.apiSuccessCount + 1,
            }));
            break;

          case "technical_Field":
            this.setState({
              technicalLoading: false,
              technicalFieldErrorMessage: "",
              technicalFieldLongMessage: "",
            });
            this.setState((prev) => ({
              apiSuccessCount: prev.apiSuccessCount + 1,
            }));
            break;

          case "summary":
            this.setState({
              summaryLoading: false,
              summaryErrorMessage: "",
              summartLongMessage: "",
              generatingSummary: false,
            });
            this.setState((prev) => ({
              apiSuccessCount: prev.apiSuccessCount + 1,
            }));
            break;

          case "Claims":
            this.setState({
              claimsLoading: false,
              claimsErrorMessage: "",
              claimsLongMessage: "",
            });
            this.setState((prev) => ({
              apiSuccessCount: prev.apiSuccessCount + 1,
            }));
            // this.getOtherSectiondata();
            break;
        }
      } else if (
        data?.["status"] == "Error" ||
        sectionTypeData?.["response"]?.["is_error"] == "Error"
      ) {
        var apiErrors = this.state.apiErrors;
        apiErrors.push(metaData.type);
        this.setState({ apiErrors });

        var respErr =
          data?.["message"] || sectionTypeData?.["response"]?.["message"];
        var longErr =
          data?.["message_long"] ||
          sectionTypeData?.["response"]?.["message_long"];
        switch (metaData.type) {
          case "Title":
            this.setState({
              titleLoading: false,
              titleErrorMessage: respErr ? respErr :  this.lonErrorMessage,
              titleLongMessage: longErr ? longErr : this.shortErrorMessage,
            });
            break;

          case "Abstract":
            this.setState({
              abstractLoading: false,
              abstractErrorMessage: respErr ? respErr :  this.lonErrorMessage,
              abstractLongMessage: longErr ? longErr : this.shortErrorMessage,
            });
            break;

          case "background_Description":
            this.setState({
              backgroundLoading: false,
              backgroundDescriptionErrorMessage:  respErr ? respErr :   this.lonErrorMessage,
              backgroundLongMessage:longErr ? longErr : this.shortErrorMessage,
            });
            break;

          case "technical_Field":
            this.setState({
              technicalLoading: false,
              technicalFieldErrorMessage: respErr ? respErr :  this.lonErrorMessage,
              technicalFieldLongMessage: longErr ? longErr : this.shortErrorMessage,
            });
            break;

          case "summary":
            this.setState({
              summaryLoading: false,
              summaryErrorMessage: respErr ? respErr :  this.lonErrorMessage,
              summartLongMessage: longErr ? longErr : this.shortErrorMessage,
              generatingSummary: false,
            });
            break;

          case "Claims":
            this.setState({
              claimsLoading: false,
              claimsErrorMessage: respErr ? respErr :  this.lonErrorMessage,
              claimsLongMessage: longErr ? longErr : this.shortErrorMessage,
              isClaims: false,
            });
            break;

          default:
            break;
        }
      }
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

  editModule = (type, text) => {

    const sectionAccessMapping = {
      'Title': 'drafting_edit_title',
      'Abstract': 'drafting_edit_abstract',
      'Technical Field': 'drafting_edit_technical_field',
      'Background': 'drafting_edit_background',
      'Summary': 'drafting_edit_summary',
      'Claims': 'drafting_edit_claim',
    };
    
    const url_id = this.props.match?.params?.id;
    const withSpaces = type.replace(/_/g, " ");
    const capitalized = withSpaces.replace(/(?:^|\s)\S/g, (char) => {
      return char.toUpperCase();
    });
    let name = `Modify ${capitalized}`;

    let sectionAccessType = sectionAccessMapping[capitalized] || "";
    let isUserAccess =( isAccess(this.props,sectionAccessType) ||  isAccess(this.props,'drafting_edit_specs'));
    return (
      <div className={classes.editContainer}>
        {/* <img src = {copy} onClick={() => this.copyToClipBoard(text)} >Copy</img> */}
        <div
          onClick={() => this.copyToClipBoard(text, type)}
          className={classes.copyCont}
        >
          {" "}
          <img src={this.state.activeType === type ? tick : copy} />
          {this.state.activeType === type
            ? "Copied " + capitalized
            : "Copy " + capitalized}
        </div>
        {/* <img
          className={classes.copyImg}
          src={this.state.activeType === type ? tick : copy}
          onClick={() => this.copyToClipBoard(text, type)}
        />
        <span className={classes.tooltip}>
          {this.state.activeType === type ? "copied!!" : "copy"}
        </span> */}
        { isUserAccess &&
          (<Link
            className={classes.linkTag}
            to={`/patentDetails/${url_id}/edit/${type}`}
          >
            <div className="edit-section-btn">
              {/* <span
              className="hs-version-num prompt-button regen-button edit-section-btn"
              // onClick={() => this.callChildFunction()}
            >
              <span className="version-title">{name}</span>
            </span> */}
              <MyButton
                className="hs-version-num prompt-button regen-button edit-section-btn"
                // onClick={() => this.callChildFunction()}
                text={name}
                rightImageClass="version-title"
              />
            </div>
          </Link>)
        }
      </div>
    );
  
  };

  retryModule = (type, error, longErr) => {
    return (
      <div className={classes.cautionContentCont}>
        <span className={classes.cautionContent}>
          {" "}
          <img className={classes.info} src={info} />
          {error}
          <span className={classes.overlayText}>{longErr}</span>
        </span>
        <span
          style={{
            backgroundColor: "#FF7E57",
            border: "0px",
          }}
          className="hs-version-num prompt-button regen-button edit-section-btn retry-hover "
          onClick={() => this.retryApi(type)}
        >
          <span className="version-title">Retry</span>
        </span>
      </div>
    );
  };

  retryApi = async (type, flag = false) => {
    var thisView = this;
    const url_id = this.props.match?.params?.id;
    let endPoints = this.props.project?.api_config?.endpoints;
    let get_data_apis = [];

    if (this.apiStatusToken[type]) this.apiStatusToken[type].cancel();
    this.apiStatusToken[type] = axios.CancelToken.source();

    if (this.controller[type]) {
      this.controller[type].abort();
    }
    this.controller[type] = new AbortController();

    switch (type) {
      case "Title":
        this.setState({ titleLoading: true });
        get_data_apis.push({ type: "Title", api: endPoints?.get_title });
        break;

      case "Abstract":
        this.setState({ abstractLoading: true });
        get_data_apis.push({ type: "Abstract", api: endPoints?.get_abstract });
        break;


      case "background_Description":
        this.setState({ backgroundLoading: true });
        get_data_apis.push({
          type: "background_Description",
          api: endPoints?.get_background_description,
        });
        break;

      case "technical_Field":
        this.setState({ technicalLoading: true });
        get_data_apis.push({
          type: "technical_Field",
          api: endPoints?.get_technical_field,
        });
        break;

      case "summary":
        this.setState({ summaryLoading: true, generatingSummary: true });
        get_data_apis.push({ type: "summary", api: endPoints?.get_summary });
        break;

      case "Claims":
        this.setState({
          claimsLoading: true,
          isClaims: true,
          abstractLoading: true,
          descriptionLoading: true,
          backgroundLoading: true,
          technicalLoading: true,
          summaryLoading: true,
          listOfFiguresLoading: true,
          detailedDescriptionFiguresLoading: true,
        });
        get_data_apis.push({ type: "Claims", api: endPoints?.get_claims });
        break;

      case "list_of_figures":
        this.setState({
          listOfFiguresLoading: true,
          detailedDescriptionFiguresLoading: true,
          detailDescriptionFig: false,
        });
        get_data_apis.push({
          type: "list_of_figures",
          api: endPoints?.get_list_of_figures,
        });
        break;

      case "detailed_description_figures":
        this.setState({ detailedDescriptionFiguresLoading: true });
        get_data_apis.push({
          type: "detailed_description_figures",
          api: endPoints?.get_detailed_description_figure,
        });
        break;

      // case "embodiments":
      //   this.setState({ embodimentsLoading: true });
      //   get_data_apis.push({
      //     type: "embodiments",
      //     api: endPoints?.embodiments,
      //   });
      //   break;

      default:
        break;
    }
    let project_history_id;
    if (!this.state.projectHistoryId) {
      const url_id = this.props?.match?.params?.id;
      let get_project_history_id_data = {
        invention: this.state.inputValDataBase,
        project_id: url_id,
      };
      let select_project_history_value = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_project_history,
        get_project_history_id_data
      );
      project_history_id =
        select_project_history_value["response"][0]["project_history_id"];
      this.setState({ projectHistoryId: project_history_id });
    }

    let apiData = {
      data: this.state.inputValDataBase,
      project_id: url_id,
      project_history_id: project_history_id
        ? project_history_id
        : this.state.projectHistoryId,
      redraft: flag,
      claim_section_history_id: this.state.claimSectionHistoryId,
    };

    this.setState({ apiErrors: [], errorReset: false });

    // get_data_apis.map((eachApi) => {
    //   return apiServices
    //     .getData("post", eachApi.api, apiData, this.apiStatusToken[type].token)
    //     .then((data) => {
    //       thisView.processData(data, eachApi);
    //     })
    //     .catch((e) => {});
    // });

    get_data_apis.map(async (eachApi) => {
      try {
        const callBack = ({
          content,
          isFinish,
          retry,
          shortMessage,
          longMessage,
        }) => {
          let streamedData;
          switch (eachApi.type) {
            case "Title":
              streamedData = content?.["title"];
              break;

            case "Abstract":
              streamedData = content?.["abstract"];
              break;

            case "background_Description":
              streamedData = content?.["background_description"];
              break;

            case "technical_Field":
              streamedData = content?.["technical_field"];
              break;

            case "summary":
              streamedData = content?.["summary"];
              break;

            default:
              break;
          }

          // console.log(eachApi, "==>", content);
          // if (content && Object.keys(content).length > 0) {

          // }
          thisView.processData(
            streamedData,
            eachApi,
            isFinish,
            retry,
            shortMessage,
            longMessage
          );
        };
        const data = await streamApi.getData(
          "post",
          eachApi.api,
          apiData,
          this.controller[type].signal,
          callBack
        );

        // thisView.processData(data, eachApi);
      } catch (e) {
        // Handle the error here
      }
    });
  };

  exportHandler = async () => {
    try {
      this.props.patentExporting();
      if (this.state.blockDiagramsavailable || this.state.flowChartsAvailable) {
        this.saveHandler(null, true);
      } else {
        const url_id = this.props.match?.params?.id;
        let file = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.export_project,
          {
            project_id: url_id,
          },
          null,
          "blob"
        );

        const filename = "IPAuthor - " + this.state.sectionData.Title + ".docx";
        const blob = new Blob([file], { type: "application/octet-stream" });

        // Create a temporary URL for the generated document
        const url = window.URL.createObjectURL(blob);

        // Create a link element and simulate a click to trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();

        // Clean up the temporary URL and the link element
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
        this.props.patentExported();
      }
    } catch (e) {
      console.log(e);
      this.props.patentExported();
    }
  };

  reDraftPatentHandler = () => {
    let sectionData = {
      Claims: this.state.sectionData.Claims,
      list_of_figures: this.state.sectionData.list_of_figures,
      detailed_description_figures:
        this.state.sectionData.detailed_description_figures,
      flowchart_diagram: this.state.sectionData.flowchart_diagram,
    };
    
    this.setState((prevState) => ({
      redraftDiagrams: !prevState.redraftDiagrams,
        reDraftPatent: false,
        sectionData: sectionData,
        regenerateClaimSectionHistoryId: true,
        loadDiagramApis: false,
        regenClaimSectionHistoryId: "",
        flowChartData: "",
        blockDiagramData: "",
        detailedDescriptionData : "",
        redraftDiagrams: true,
        isRegenerteClaimAvailable : false,
        separateDetailedDescriptionData : ""
    }),()=>{
      this.getselectedClaimVersionId(true)
    });
    
    let all = [
      "Title",
      "Abstract",
      // "detail_Description",
      "technical_Field",
      "background_Description",
      "summary",
      // "embodiments"
    ];

    if (all && all.length > 0) {
      all.map((eachPending) => {
        this.retryApi(eachPending, true);
      });
    }
  };

  retryHandler = async () => {
    try {
      const link = window.location.href;
      const parts = link.split("/");
      const url_id = parts[4];

      let sectionData = {
        Claims: this.state.sectionData.Claims,
        list_of_figures: this.state.sectionData.list_of_figures,
        detailed_description_figures:
          this.state.sectionData.detailed_description_figures,
        flowchart_diagram: this.state.sectionData.flowchart_diagram,
      };

      if (this.apiStatusToken) {
        Object.keys(this.apiStatusToken).map((key) => {
          this.apiStatusToken[key].cancel();
        });
      }

      let is_DD_based_on_same_claim = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.is_DD_based_on_same_claim,
        {
          project_id: url_id,
        }
      );

      if (is_DD_based_on_same_claim["response"]["is_redraft_needed"] == "yes") {
        this.setState({ reDraftPatent: true });
        this.reDraftPatentHandler();
      } else {
        this.get_data();
        this.setState((prevState) => ({
          redraftDiagrams: !prevState.redraftDiagrams,
          sectionData: sectionData,
          regenerateClaimSectionHistoryId: true,
          loadDiagramApis: false,
          regenClaimSectionHistoryId: "",
          flowChartData: "",
          blockDiagramData: "",
          separateDetailedDescriptionData :""
        }),()=>{
          this.getselectedClaimVersionId(true)
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  toggleDropdown = (e) => {
    e.stopPropagation();
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  scrollhandler = (type, ref) => {
    switch (type) {
      case "Title":
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        this.setState({ scrolledItem: type });
        break;
      case "Abstract":
        this.scrollAbstract?.current?.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
      case "Images":
        this.scrollImages?.current?.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
      case "Claims":
        this.scrollClaims?.current?.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
      case "Detailed Description":
        this.scrollDetailDescription?.current?.scrollIntoView({
          behavior: "smooth",
        });
        this.setState({ scrolledItem: type });
        break;
      case "Technical Field":
        this.scrollTechnicalField?.current?.scrollIntoView({
          behavior: "smooth",
        });
        this.setState({ scrolledItem: type });
        break;
      case "Background":
        this.scrollBackground?.current?.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
      case "Summary":
        this.scrollSummary?.current?.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
      case "List of Figures with Brief Descriptions":
        this.scrollListOfFigures?.current?.scrollIntoView({
          behavior: "smooth",
        });
        this.setState({ scrolledItem: type });
        break;
      case "Detailed Description of the Figures":
        this.scrollDescriptionFigures?.current?.scrollIntoView({
          behavior: "smooth",
        });
        this.setState({ scrolledItem: type });
        break;
      case "figures":
        ref?.current.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
      case "flowChart":
        ref?.current.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
      case "blockDiagram":
        ref?.current.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
      case "flowEmbodiments":
        ref?.current.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
      case "blockEmbidiments":
        ref?.current.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
      case "extraDetailedDescription":
        ref?.current.scrollIntoView({ behavior: "smooth" });
        this.setState({ scrolledItem: type });
        break;
    }
  };

  exportPriorArtHandler = async () => {
    try {
      this.setState({ isExportingPriorArt: true });
      const url_id = this.props.match?.params?.id;
      // let file = await axios.post(
      //   this.props.project?.api_config?.endpoints?.export_priorart,
      //   {
      //     project_id: url_id,
      //   },
      //   {
      //     responseType: "blob",
      //   }
      // );

      let file = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.export_priorart,
        {
          project_id: url_id,
          format : 'docx'
        },
        null,
        "blob"
      );

      let truncateString = (text, limit) => {
        const words = text.split(" ");
        const truncatedWords = words.slice(0, limit);
        const truncatedText = truncatedWords.join(" ");

        return truncatedText;
      };

      let file_ = truncateString(this.state.inputValDataBase, 15);
      let filename =
        "IPAuthor - Prior Art -" + this.state.sectionData?.Title + ".docx";

      // const filename =this.state.inputValDataBase + ".docx" || "PriorArt.docx";
      const blob = new Blob([file], { type: "application/octet-stream" });

      // Create a temporary URL for the generated document
      const url = window.URL.createObjectURL(blob);

      // Create a link element and simulate a click to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary URL and the link element
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      this.setState({ isExportingPriorArt: false });
    } catch (e) {
      console.log(e);
      this.setState({ isExportingPriorArt: false });
    }
  };

  closeDownloadPopupHandler = () => {
    this.setState({ isOpen: false });
  };

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);

    if (!("Notification" in window)) {
      console.log("Browser does not support desktop notification");
    } else {
      Notification.requestPermission();
    }
  }

  componentWillUnmount() {
    if (this.apiStatusToken) {
      Object.keys(this.apiStatusToken).map((key) => {
        this.apiStatusToken[key].cancel();
      });
    }

    if (this.controller) {
      Object.keys(this.controller).map((keys) => {
        this.controller[keys].abort();
      });
    }

    window.favloader.stop();
    window.removeEventListener("scroll", this.handleScroll);
    window.scroll({ top: 0, left: 0, behavior: "instant" });
    this.notification?.close();
  }

  showNotification = (notification) => {
    var options = {
      // body: 'Notification Body',
      icon: logo,
      dir: "ltr",
    };
    this.notification = new Notification(notification, options);
    setTimeout(() => {
      this.notification.close();
    }, 30000);
  };

  handleScroll = () => {
    const abstractSection = this.scrollAbstract.current;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (abstractSection && scrollTop >= abstractSection.offsetTop - 100) {
      this.setState({ scrolled: true });
    } else {
      this.setState({ scrolled: false, scrolledItem: "Title" });
    }
  };

  pageScrollhandler = (flag) => {
    if (flag) {
      this.scrollhandler("Title");
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };


  previewHandler = (index, e, content, typeOfDia, diaName) => {
    if (e?.target?.className !== "hit-button") {
      // Your current logic here...
      e?.preventDefault();
      e?.stopPropagation();
      this.setState((prev) => {
        return {
          previewChart: !prev.previewChart,
        };
      });
      this.setState({
        viewerContent: content,
        typeOfDia: typeOfDia ? typeOfDia : "",
        diagramName: diaName,
      });
      if (index) {
        this.setState({ previewIndex: index });
      }
    }
  };

  saveHandler = (e, draft, svg) => {
    e?.preventDefault();
    e?.stopPropagation();
    this.setState({ enableExport: !this.state.enableExport });

    this.props.enableExport();
  };

  handlePatentExport = () => {
    this.setState({ exportPatent: false });
  };

  toggleflowSvgHandler = () => {
    this.setState({ downloadFlowSvg: false });
  };

  toggleDownloadFlowChartButtons = (e) => {
    e.stopPropagation();
    this.setState((prev) => ({
      isFlowchartButtons: !prev.isFlowchartButtons,
    }));
  };

  setGetStoredFlowChart = () => {
    this.setState({ loadDiagramApis: false });
  };

  updateStateAndCheckApi = (key, data) => {
    const updateObj = {};
    if (key == "isFlowChart") {
      this.setState({ flowChartsAvailable: data });
    } else {
      this.setState({ blockDiagramsavailable: data });
    }

    if (data !== null && data !== undefined) {
      updateObj[key] = data;
    }

    this.setState(updateObj, () => {
      if (
        this.state.blockApiSuccess &&
        this.state.flowChartApiSuccess &&
        (this.state.isFlowSuccess || this.state.isBlockDiaSuccess)
      ) {
        this.setState({ callEmbodiments: true });
      }

      if (
        (this.state.blockApiSuccess &&
          this.state.flowChartApiSuccess &&
          !this.state.isBlockDia &&
          !this.state.isFlowChart) ||
        this.state.isFlowRetry ||
        this.state.isBlockDiaRetry
      ) {
        this.setState({ showEmbodiments: false });
      } else {
        this.setState({ showEmbodiments: true });
      }
    });
  };

  blockDiahandler = (data, apiCalled, blockSuccess, blockRetry) => {
    if (apiCalled !== null && apiCalled !== undefined) {
      this.setState({
        blockApiSuccess: apiCalled,
      });
    }

    if (blockRetry !== null && blockRetry !== undefined) {
      this.setState({ isBlockDiaRetry: blockRetry });
    }

    if (data !== null && data !== undefined) {
      this.setState({ isBlockDiaSuccess: data });
    }
    if (data !== null && data !== undefined) {
      this.updateStateAndCheckApi("isBlockDia", data, apiCalled);
    }
  };

  blockDiaDescriptionHandler = (loading, retry) => {
    if (loading !== null && loading !== undefined) {
      this.setState({ blockDesLoading: loading });
    }
    if (retry !== null && retry !== undefined) {
      this.setState({ blockDesRetry: retry });
    }
  };

  flowDiaDescriptionHandler = (loading, retry) => {
    if (loading !== null && loading !== undefined) {
      this.setState({ flowDesLoading: loading });
    }
    if (retry !== null && retry !== undefined) {
      this.setState({ flowDesRetry: retry });
    }
  };

  flowChartAvailableHandler = (data, apiCalled, flowSuccess, flowRetry) => {
    if (apiCalled !== null && apiCalled !== undefined) {
      this.setState({
        flowChartApiSuccess: apiCalled,
      });
    }

    if (flowRetry !== null && flowRetry !== undefined) {
      this.setState({ isFlowRetry: flowRetry });
    }

    if (data !== null && data !== undefined) {
      this.setState({ isFlowSuccess: data });
    }

    if (data !== null && data !== undefined) {
      this.updateStateAndCheckApi("isFlowChart", data, apiCalled);
    }
  };

  embodiemntshandler = (data) => {
    this.setState({ isEmbodiment: data });
  };

  generatingEmbodimentshandler = (flag) => {
    this.setState({ generatingEmbodiments: flag });
  };

  flowEmbodimenthandler = (flag) => {
    this.setState({ isFlowEmbodiment: flag });
  };

  blockEmbodimenthandler = (flag) => {
    this.setState({ isBlockEmbodiment: flag });
  };

  generateDiaHandler = (flag) => {
    this.setState({ generatingDiagrams: flag });
  };

  embodiemntshandler = (data) => {
    this.setState({ isEmbodiment: data });
  };

  diagramLoadingHandler = (type, flag, retry) => {
    if (type == "isFlowEmbLoading") {
      this.setState({ isFlowEmbRetry: retry });
    } else if (type == "isBlockEmbLoading") {
      this.setState({ isBlockEmbRetry: retry });
    }
    if (type == "stopEmbodimentLoading") {
      this.setState({
        isFlowEmbLoading: false,
        isBlockEmbLoading: false,
        isFlowEmbRetry: retry,
      });
    } else {
      this.setState({ [type]: flag });
    }


  };

  diagramsStremingHandler = (flag) => {
    this.setState({ diagramsStreaming: flag });
  };

  detailedDescriptionLoadingHandler = (loading) => {
    this.setState({ detailedDescriptionLoading: loading });
  };

  detailedDescriptionRetryHandler = (retry) => {
    this.setState({ detailedDescriptionRetry: retry });
  };

  // extraDetailedDescriptionHandler = (flag) =>{
  //   this.setState({ separateDetailedDescriptionStreaming: flag });
  // }

  detailedDescriptionStreamingHandler = (flag)=>{
    this.setState({ detailedDescriptionStreaming: flag });
  }

  separateDetailedDescriptionConnectingToParentHandler = (key,value)=>{
    this.setState({
      [key]: value
    });
  }

  detailedDescriptionAvailableHandler =(flag)=>{
    this.setState({
      detailedDescriptionAvailable : flag
    })
  }

  render() {
    let { sectionData, isOpen } = this.state;
    const url_id = this.props.match?.params?.id;
    // sectionData.Title = sectionData?.Title?.replace(/"/g, "");
    const {
      titleErrorMessage,
      abstractErrorMessage,
      detailDescriptionErrorMessage,
      backgroundDescriptionErrorMessage,
      technicalFieldErrorMessage,
      summaryErrorMessage,
      claimsErrorMessage,
      listOfFiguresErrorMessage,
      detailedDescriptionFiguresErrorMessage,
      titleLongMessage,
      abstractLongMessage,
      detailLongMessage,
      backgroundLongMessage,
      technicalFieldLongMessage,
      summartLongMessage,
      claimsLongMessage,
      listOfFiguresLongMessage,
      detailedDescriptionFiguresLongMessage,
      isClaims,
      scrolledItem,
      scrolled,
    } = this.state;

    let count = Object.keys(sectionData).length;
    const objectKeys = sectionData ? Object.keys(sectionData) : [];
    return (
      <Container
        onClick={this.closeDownloadPopupHandler}
        fluid
        className="patent-details-container"
      >
        <header className={classes.header}>
          <div className={classes.leftNav}>
            <Link
              to={
                "/patentDetails/" +
                this.props.match?.params?.id +
                "/edit" +
                "/Claims/"
              }
              id="home-link"
              className={classes.navLinkStyle}
            >
              <div
                style={{ textDecorationLine: "none" }}
                className={classes.leftNavCont}
              >
                <img src={back_icon} alt="back" />
                <span className={classes.noUnderline}>Claims</span>
              </div>
            </Link>
          </div>

          <div className={classes.rightNav}>
              <div className={classes.titleNav}>
                <div className={classes.Div}>{
                   this.state.inputValDataBase ?
                   <p>{this.state.inputValDataBase}</p> : 
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
          <div className={classes.rightSide}>
            {this.state.isDownloadPatent && (
              <div className={classes.dropdown}>
                <MyButton
                  className={classes.exportCont}
                  text="Download"
                  leftImage={
                    this.props?.isPatentExport || this.state.isExportingPriorArt
                      ? loading_icon
                      : download_thin
                  }
                  leftImageClass="download_icon"
                  onClick={(e) => this.toggleDropdown(e)}
                  rightImageClass="down_arrow"
                  rightImage={down_arrow}
                />

                {isOpen && (
                  <div className={classes.dropdownContent}>
                    <div
                      className={"download_draft"}
                      onClick={this.exportHandler}
                    >
                      {" "}
                      <img
                        className="download_white_icon"
                        src={download_white}
                      />
                      <img className="download_blue_icon" src={download_thin} />{" "}
                      Draft
                    </div>
                    {this.state.priotArtEnable && (
                      <div
                        onClick={this.exportPriorArtHandler}
                        className={"download_priorart_draft download_draft"}
                      >
                        {" "}
                        <img
                          className="download_white_icon"
                          src={download_white}
                        />
                        <img
                          className={
                            classes.priorArtDownload + " download_blue_icon"
                          }
                          src={download_thin}
                        />
                        Prior Art
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className={classes.editInvention}>
              <span
                className="hs-version-num selected_version regen-button "
                // onClick={() => this.callChildFunction()}
              >
                <span className="version-title">Edit</span>
              </span>
            </div>
          </div>
        </header>
        <main className={classes.main}>
          <div className={classes.left}>
            <nav
              className={`transition-class  sidenav${
                scrolled ? " sidenav-top-height" : " fade-effect"
              }`}
            >
              <div className="menu">
                <ul className="menu-list">
                  <li
                    onClick={() => this.scrollhandler("Title")}
                    className="menu-item"
                  >
                    <span
                      className={`menu-link ${
                        scrolledItem == "Title" ? "highlight-text" : ""
                      } `}
                    >
                      Title
                      {this.state.titleStream ? (
                        <span>
                          <PulseLoader
                            color={
                              this.props.project.expectedTimeout.pulseloader
                                .color
                            }
                            size={
                              this.props.project.expectedTimeout.pulseloader
                                .size
                            }
                            speedMultiplier={
                              this.props.project.expectedTimeout.pulseloader
                                .speed
                            }
                          />
                        </span>
                      ) : this.state.titleLoading ? (
                        <span>
                          <img
                            className="menu-loading"
                            src={loading_icon}
                            alt="loading"
                          />
                        </span>
                      ) : titleErrorMessage && titleErrorMessage !== "" ? (
                        <span>
                          <img
                            className="menu-loading"
                            src={info}
                            alt="loading"
                          />
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  </li>
                  <li
                    onClick={() => this.scrollhandler("Abstract")}
                    className="menu-item"
                  >
                    <span
                      className={`menu-link ${
                        scrolledItem == "Abstract" ? "highlight-text" : ""
                      } `}
                    >
                      Abstract
                      {this.state.abstractStream ? (
                        <span>
                          <PulseLoader
                            color={
                              this.props.project.expectedTimeout.pulseloader
                                .color
                            }
                            size={
                              this.props.project.expectedTimeout.pulseloader
                                .size
                            }
                            speedMultiplier={
                              this.props.project.expectedTimeout.pulseloader
                                .speed
                            }
                          />
                        </span>
                      ) : this.state.abstractLoading ? (
                        <span>
                          <img
                            className="menu-loading"
                            src={loading_icon}
                            alt="loading"
                          />
                        </span>
                      ) : abstractErrorMessage &&
                        abstractErrorMessage !== "" ? (
                        <span>
                          <img
                            className="menu-loading"
                            src={info}
                            alt="loading"
                          />
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  </li>
                  <li
                    onClick={() => this.scrollhandler("Technical Field")}
                    className="menu-item"
                  >
                    <span
                      className={`menu-link ${
                        scrolledItem == "Technical Field"
                          ? "highlight-text"
                          : ""
                      } `}
                    >
                      Technical Field
                      {this.state.technicalFiledStream ? (
                        <span>
                          <PulseLoader
                            color={
                              this.props.project.expectedTimeout.pulseloader
                                .color
                            }
                            size={
                              this.props.project.expectedTimeout.pulseloader
                                .size
                            }
                            speedMultiplier={
                              this.props.project.expectedTimeout.pulseloader
                                .speed
                            }
                          />
                        </span>
                      ) : this.state.technicalLoading ? (
                        <span>
                          <img
                            className="menu-loading"
                            src={loading_icon}
                            alt="loading"
                          />
                        </span>
                      ) : technicalFieldErrorMessage &&
                        technicalFieldErrorMessage !== "" ? (
                        <span>
                          <img
                            className="menu-loading"
                            src={info}
                            alt="loading"
                          />
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  </li>
                  <li
                    onClick={() => this.scrollhandler("Background")}
                    className="menu-item"
                  >
                    <span
                      className={`menu-link ${
                        scrolledItem == "Background" ? "highlight-text" : ""
                      } `}
                    >
                      Background
                      {this.state.backgroundStream ? (
                        <span>
                          <PulseLoader
                            color={
                              this.props.project.expectedTimeout.pulseloader
                                .color
                            }
                            size={
                              this.props.project.expectedTimeout.pulseloader
                                .size
                            }
                            speedMultiplier={
                              this.props.project.expectedTimeout.pulseloader
                                .speed
                            }
                          />
                        </span>
                      ) : this.state.backgroundLoading ? (
                        <span>
                          <img
                            className="menu-loading"
                            src={loading_icon}
                            alt="loading"
                          />
                        </span>
                      ) : backgroundDescriptionErrorMessage &&
                        backgroundDescriptionErrorMessage !== "" ? (
                        <span>
                          <img
                            className="menu-loading"
                            src={info}
                            alt="loading"
                          />
                        </span>
                      ) : (
                        ""
                      )}
                    </span>{" "}
                  </li>
                  <li
                    onClick={() => this.scrollhandler("Summary")}
                    className="menu-item"
                  >
                    <span
                      className={`menu-link ${
                        scrolledItem == "Summary" ? "highlight-text" : ""
                      } `}
                    >
                      Summary
                      {this.state.summaryStream ? (
                        <span>
                          <PulseLoader
                            color={
                              this.props.project.expectedTimeout.pulseloader
                                .color
                            }
                            size={
                              this.props.project.expectedTimeout.pulseloader
                                .size
                            }
                            speedMultiplier={
                              this.props.project.expectedTimeout.pulseloader
                                .speed
                            }
                          />
                        </span>
                      ) : this.state.summaryLoading ? (
                        <span>
                          <img
                            className="menu-loading"
                            src={loading_icon}
                            alt="loading"
                          />
                        </span>
                      ) : summaryErrorMessage && summaryErrorMessage !== "" ? (
                        <span>
                          <img
                            className="menu-loading"
                            src={info}
                            alt="loading"
                          />
                        </span>
                      ) : (
                        ""
                      )}
                    </span>
                  </li>
                  {(this.state.regenrateLoading ||
                    this.state.regenrateClaimRetry ||
                    (this.state.isRegenerteClaimAvailable &&
                      this.state.isFlowChart) ||
                    (this.state.isRegenerteClaimAvailable &&
                      this.state.isBlockDia) || (this.state.isRegenerteClaimAvailable &&
                        this.state.isRegenerteClaimAvailable )) && (
                    <li
                      onClick={() =>
                        this.scrollhandler(
                          "figures",
                          this.state.regenrateLoading ||
                            this.state.regenrateClaimRetry
                            ? this.figuresRef
                            : this.state.isFlowChart
                            ? this.flowChartRef
                            : this.state.isBlockDia
                            ? this.blockDiagramRef
                            : this.scrollSummary
                        )
                      }
                      className="menu-item"
                    >
                      <span
                        className={`menu-link ${
                          scrolledItem == "figures" ? "highlight-text" : ""
                        } `}
                      >
                        Figures
                        {this.state.diagramsStreaming ? (
                          <span>
                            <PulseLoader
                              color={
                                this.props.project.expectedTimeout.pulseloader
                                  .color
                              }
                              size={
                                this.props.project.expectedTimeout.pulseloader
                                  .size
                              }
                              speedMultiplier={
                                this.props.project.expectedTimeout.pulseloader
                                  .speed
                              }
                            />
                          </span>
                        ) : (this.state.isFlowLoading &&
                            !this.state.regenrateClaimRetry) ||
                          (this.state.isBlockLoading &&
                            !this.state.regenrateClaimRetry) 
                          ? (
                          <span>
                            <img
                              className="menu-loading"
                              src={loading_icon}
                              alt="loading"
                            />
                          </span>
                        ) : this.state.regenrateClaimRetry ||
                          (this.state.isFlowChart &&
                            (this.state.isFlowRetry)) ||
                          (this.state.isBlockDia &&
                            (this.state.isBlockDiaRetry)) ? (
                          <span>
                            <img
                              className="menu-loading"
                              src={info}
                              alt="loading"
                            />
                          </span>
                        ) : (
                          ""
                        )}
                      </span>
                    </li>
                  )}

                  {/* Seprate detailed description */}

                {(this.state.isSeprateDetailedDescriptionAvailable && this.state.isRegenerteClaimAvailable)
                 && <li
                    onClick={() => this.scrollhandler( "extraDetailedDescription", this.extraDetailedDescriptionRef)}
                    className="menu-item"
                  >
                    <span
                      className={`menu-link ${
                        scrolledItem == "extraDetailedDescription" ? "highlight-text" : ""
                      } `}
                    >
                      Detailed description
                      {
                      (this.state.separateDetailedDescriptionStreaming || this.state.detailedDescriptionStreaming && (!this.state.blockDesRetry && !this.state.flowDesRetry && !this.state.detailedDescriptionRetry && !this.state.separateDetailedDescriptionRetry)) ? 
                      (<span>
                          <PulseLoader
                            color={
                              this.props.project.expectedTimeout.pulseloader
                                .color
                            }
                            size={
                              this.props.project.expectedTimeout.pulseloader
                                .size
                            }
                            speedMultiplier={
                              this.props.project.expectedTimeout.pulseloader
                                .speed
                            }
                          />
                        </span>)
                        :((this.state.flowDesLoading && !this.state.regenrateClaimRetry) ||(this.state.blockDesLoading && !this.state.regenrateClaimRetry )) && (!this.state.blockDesRetry && !this.state.flowDesRetry && !this.state.detailedDescriptionRetry && !this.state.separateDetailedDescriptionRetry)
                        ? <span>
                        <img
                          className="menu-loading"
                          src={loading_icon}
                          alt="loading"
                        />
                      </span>
                       : ((this.state.isBlockDia && this.state.blockDesRetry)
                       || (this.state.isFlowChart && this.state.flowDesRetry ) ||
                       ( this.state.detailedDescriptionAvailable && this.state.detailedDescriptionRetry )|| this.state.separateDetailedDescriptionRetry
                       )
                       ? 
                       <span>
                       <img
                         className="menu-loading"
                         src={info}
                         alt="loading"
                       />
                     </span>
                        : ""
                      }
                    </span>
                  </li>}

                      {/* Claims */}

                  <li
                    onClick={() => this.scrollhandler("Claims")}
                    className="menu-item"
                  >
                    <span
                      className={`menu-link ${
                        scrolledItem == "Claims" ? "highlight-text" : ""
                      } `}
                    >
                      Claims
                      {this.state.claimsLoading && (
                        <span>
                          <img
                            className="menu-loading"
                            src={loading_icon}
                            alt="loading"
                          />
                        </span>
                      )}
                    </span>
                  </li>
                  {false && (
                    <li
                      onClick={() => this.scrollhandler("Detailed Description")}
                      className="menu-item"
                    >
                      <span
                        className={`menu-link ${
                          scrolledItem === "Detailed Description"
                            ? "highlight-text"
                            : ""
                        } `}
                      >
                        Detailed Description
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </nav>
            <div
              onClick={() => this.pageScrollhandler(scrolled)}
              className={classes.topCont}
            >
              <img src={scrolled ? top : arrow_down} />
            </div>
          </div>

          <Container className={classes.right}>
            {this.state.reDraftPatent && this.state.isDownloadPatent && (
              <div
                className={`${classes.reDraftPatentDiv} col mb-5 mb-md-5 mb-sm-5`}
              >
                <MyButton
                  text={"Redraft Patent"}
                  className={"edit-section-btn regen-button"}
                  onClick={this.reDraftPatentHandler}
                />
                <div className="caution-container-prior-art ">
                  {" "}
                  <p className="caution-claims">
                    {" "}
                    <img className="redraft-info" src={info_white} />{" "}
                    <span className="attention">Attention :</span> Current
                    description is not aligned with the revised claims. Please
                    re-draft patent accordingly.
                  </p>
                </div>
              </div>
            )}
            {this.state.pageLoading ? (
              <LoadingScreen className={classes.loadingScreen} />
            ) : (
              <div className={classes.block}>
                <div>
                  {this.state.titleLoading ? (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollTitle}
                        className={classes.patentDetailHeading}
                      >
                        Title
                      </h2>
                      <Abstract />
                    </Row>
                  ) : (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollTitle}
                        className={`${classes.patentDetailHeading} col mt-lg-0  mt-md-5 mt-sm-5 mt-5`}
                      >
                        Title
                      </h2>
                      <div className={`${classes.content}`}>
                        {" "}
                        {titleErrorMessage && titleErrorMessage !== "" ? (
                          this.retryModule(
                            "Title",
                            titleErrorMessage,
                            titleLongMessage
                          )
                        ) : (
                          <>
                            {this.editModule("Title", sectionData.Title)}
                            <pre className={classes.pre}>
                              {sectionData.Title}
                              {this.state.titleStream && <BlinkingCursor />}
                            </pre>
                          </>
                        )}
                        {/* <pre className={classes.pre}>{sectionData.Title}</pre> */}
                      </div>
                      {/* {key == "Title" && <hr />}{" "} */}
                    </Row>
                  )}

                  {!isClaims ? (
                    ""
                  ) : this.state.abstractLoading ? (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollAbstract}
                        className={classes.patentDetailHeading}
                      >
                        Abstract
                      </h2>
                      <Abstract />
                    </Row>
                  ) : (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollAbstract}
                        className={classes.patentDetailHeading}
                      >
                        Abstract
                      </h2>
                      <div className={classes.content}>
                        {" "}
                        {abstractErrorMessage && abstractErrorMessage !== "" ? (
                          this.retryModule(
                            "Abstract",
                            abstractErrorMessage,
                            abstractLongMessage
                          )
                        ) : (
                          <>
                            {this.editModule("Abstract", sectionData.Abstract)}{" "}
                            <pre className={classes.pre}>
                              {sectionData ? sectionData.Abstract : ""}
                              {this.state.abstractStream && <BlinkingCursor />}
                            </pre>
                          </>
                        )}
                      </div>
                      {/* {key == "Title" && <hr />}{" "} */}
                    </Row>
                  )}
                  {!isClaims ? (
                    ""
                  ) : this.state.technicalLoading ? (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollTechnicalField}
                        className={classes.patentDetailHeading}
                      >
                        {" "}
                        Technical Field
                      </h2>
                      <Abstract />
                    </Row>
                  ) : (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollTechnicalField}
                        className={classes.patentDetailHeading}
                      >
                        Technical Field
                      </h2>
                      <div className={classes.content}>
                        {" "}
                        {technicalFieldErrorMessage &&
                        technicalFieldErrorMessage !== "" ? (
                          this.retryModule(
                            "technical_Field",
                            technicalFieldErrorMessage,
                            technicalFieldLongMessage
                          )
                        ) : (
                          <>
                            {this.editModule(
                              "technical_Field",
                              sectionData.technical_Field
                            )}{" "}
                            <pre className={classes.pre}>
                              {sectionData.technical_Field}
                              {this.state.technicalFieldStream && (
                                <BlinkingCursor />
                              )}
                            </pre>
                          </>
                        )}
                      </div>
                    </Row>
                  )}

                  {!isClaims ? (
                    ""
                  ) : this.state.backgroundLoading ? (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollBackground}
                        className={classes.patentDetailHeading}
                      >
                        Background
                      </h2>
                      <Abstract />
                    </Row>
                  ) : (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollBackground}
                        className={classes.patentDetailHeading}
                      >
                        Background
                      </h2>
                      <div className={classes.content}>
                        {" "}
                        {backgroundDescriptionErrorMessage &&
                        backgroundDescriptionErrorMessage !== "" ? (
                          this.retryModule(
                            "background_Description",
                            backgroundDescriptionErrorMessage,
                            backgroundLongMessage
                          )
                        ) : (
                          <>
                            {this.editModule(
                              "background_Description",
                              sectionData.background_Description
                            )}{" "}
                            <pre className={classes.pre}>
                              {sectionData.background_Description}
                              {this.state.backgroundDescriptionStream && (
                                <BlinkingCursor />
                              )}
                            </pre>
                          </>
                        )}
                      </div>
                    </Row>
                  )}
                  {!isClaims ? (
                    ""
                  ) : this.state.generatingSummary ? (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollSummary}
                        className={classes.patentDetailHeading}
                      >
                        Summary
                      </h2>
                      <CountdownTimer
                        targetDate={
                          this.props.project.expectedTimeout.get_summary
                        }
                        sectionType={"Summary"}
                      />
                    </Row>
                  ) : this.state.summaryLoading ? (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollSummary}
                        className={classes.patentDetailHeading}
                      >
                        Summary
                      </h2>
                      <Abstract />
                    </Row>
                  ) : (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollSummary}
                        className={classes.patentDetailHeading}
                      >
                        Summary
                      </h2>
                      <div className={classes.content}>
                        {" "}
                        {summaryErrorMessage && summaryErrorMessage !== "" ? (
                          this.retryModule(
                            "summary",
                            summaryErrorMessage,
                            summartLongMessage
                          )
                        ) : (
                          <>
                            {this.editModule("summary", sectionData.summary)}{" "}
                            <pre className={classes.pre}>
                              {sectionData.summary}
                              {this.state.summaryStream && <BlinkingCursor />}
                            </pre>
                          </>
                        )}
                        {/* <pre className={classes.pre}>{sectionData.summary}</pre> */}
                      </div>
                    </Row>
                  )}
                  {
                    <Diagrams
                      checkForDownloadButtonhandler={
                        this.checkForDownloadButton
                      }
                      enableExporting={this.state.enableExport}
                      flowChartAvailableHandler={this.flowChartAvailableHandler}
                      regenClaimError={this.state.regenClaimError}
                      regenClaimLongError={this.state.regenClaimLongError}
                      loadDiagramApis={this.state.loadDiagramApis}
                      setGetStoredFlowChart={this.setGetStoredFlowChart}
                      regenerateClaims={this.regenerateClaims}
                      regenrateClaimRetry={this.state.regenrateClaimRetry}
                      regenrateLoading={this.state.regenrateLoading}
                      blockDiahandler={this.blockDiahandler}
                      inputValDataBase={this.state.inputValDataBase}
                      projectHistoryId={this.state.projectHistoryId}
                      regenerateClaimSectionHistoryId={
                        this.state.regenerateClaimSectionHistoryId
                      }
                      isRegenerteClaimAvailable = {this.state.isRegenerteClaimAvailable}
                      selectedClaimVersionId={this.state.selectedClaimVersionId}
                      sectionRefs={{
                        flowChartRef: this.flowChartRef,
                        blockDiagramRef: this.blockDiagramRef,
                        figuresRef: this.figuresRef,
                        extraDetailedDescriptionRef : this.extraDetailedDescriptionRef
                      }}
                      previewHandler={this.previewHandler}
                      {...this.props}
                      inventionTitle={this.state.sectionData.Title}
                      generateRegenClaim={this.state.generateRegenClaim}
                      generateDiaHandler={this.generateDiaHandler}
                      diagramLoadingHandler={this.diagramLoadingHandler}
                      flowChartLoading={this.state.isFlowLoading}
                      blockDiaLoading={this.state.isBlockLoading}
                      flowChartData={this.state.flowChartData}
                      blockDiagramData={this.state.blockDiagramData}
                      separateDetailedDescriptionData = {this.state.separateDetailedDescriptionData}
                      diagramsStremingHandler={this.diagramsStremingHandler}
                      redraftDiagrams={this.state.redraftDiagrams}
                      isProjectComplete={this.state.isProjectComplete}
                      blockDiaDescriptionHandler={
                        this.blockDiaDescriptionHandler
                      }
                      flowDiaDescriptionHandler={this.flowDiaDescriptionHandler}
                      detailedDescriptionData={this.state.detailedDescriptionData}
                      detailedDescriptionLoadingHandler={
                        this.detailedDescriptionLoadingHandler
                      }
                      detailedDescriptionRetryHandler={
                        this.detailedDescriptionRetryHandler
                      }
                      detailedDescriptionAvailableHandler = {this.detailedDescriptionAvailableHandler}
                      detailedDescriptionStreamingHandler = {this.detailedDescriptionStreamingHandler}
                      extraDetailedDescriptionHandler = {this.extraDetailedDescriptionHandler}
                      separateDetailedDescriptionConnectingToParentHandler = {this.separateDetailedDescriptionConnectingToParentHandler}
                    />
                  }
                  {this.state.claimsLoading ? (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollClaims}
                        className={classes.patentDetailHeading}
                      >
                        Claims
                      </h2>
                      <Abstract />
                    </Row>
                  ) : (
                    <Row className={classes.contenetContainer}>
                      {" "}
                      <h2
                        ref={this.scrollClaims}
                        className={classes.patentDetailHeading}
                      >
                        Claims
                      </h2>
                      <div className={classes.content}>
                        {" "}
                        {claimsErrorMessage && claimsErrorMessage !== "" ? (
                          this.retryModule(
                            "Claims",
                            claimsErrorMessage,
                            claimsLongMessage
                          )
                        ) : (
                          <>
                            {this.editModule("Claims", sectionData.Claims)}{" "}
                            <pre className={classes.pre}>
                              {sectionData.Claims}
                            </pre>
                          </>
                        )}
                        {/* <pre className={classes.pre}>{sectionData.Claims}</pre> */}
                      </div>
                      {/* {key == "Title" && <hr />}{" "} */}
                    </Row>
                  )}
                </div>
                <Prompt
                  sample={this.sample}
                  text={this.state.inputValDataBase}
                ></Prompt>
                <ReloadOverlay retry={this.retryHandler} />
                {this.state.previewChart && (
                  <ImageViewer
                    typeOfDia={this.state.typeOfDia}
                    previewIndex={this.state.previewIndex}
                    flowChartText={[this.state.viewerContent]}
                    isOpen={this.state.previewChart}
                    closePreviewHandler={this.previewHandler}
                    diagramName={this.state.diagramName}
                  />
                )}
              </div>
            )}
          </Container>
        </main>
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    project: state.projectData,
    isOpen: state.modalReducer.retryOverlay,
    isPatentExport: state.exportReducer.patentExport,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    toggleOverlay: () => dispatch(toggleRetryOverlay()),
    enableExport: (data) => dispatch(enableDiaExport(data)),
    patentExporting: (data) => dispatch(patentExporting(data)),
    patentExported: (data) => dispatch(patentExported(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(patentDetails);
