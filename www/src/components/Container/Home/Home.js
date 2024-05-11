import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Container, Row, Col } from "reactstrap";
import axios from "axios";
import "./Home.scss";
import DraftingList from "../DraftingList/draftingList";
import LoadingScreen from "../../LoadingScreen/loadingScreen";
import right_arrow_icon from "../../assets/icons/arrow_submit.svg";
import info from "../../assets/icons/info_white.svg";
import greyInfo from "../../assets/icons/grey_info.svg";
import {
  addProjectId,
  addProjectHistoryId,
  addUserId,
  limitExceed,
  inLimit,
  logIn,
  logOut,
} from "../../../store/action";
import apiServices from "../../../services/apiServices";
import { toast } from "react-toastify";
import CountryFilter from "../../Elements/CountryFilter/CountryFilter";
import streamApi from "../../../services/streamApi";
import Modal from "../ImageViewer/Modal";
import { isAccess } from "../../../utils/accessCheck";
import ClearButton from "./ClearButton";
import DraftButton from "./DraftButton";
import ExplorePriorArtButton from "./ExplorePriorArtButton";
import ValidateInput from "./ValidateInput";
import Nav from "react-bootstrap/Nav";
import Tab from "react-bootstrap/Tab";
import ClaimsPriorArt from "./ClaimsPriorart/ClaimsPriorArt";
import DraftPatent from "./DraftPatent/DraftPatent";
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      invention: "",
      isApiCallDone: false,
      projectErrorMessage: "",
      charLength: 0,
      isProjectError: "",
      solInput: "",
      solCharLength: 0,
      solCharLengthExceed: false,
      userType: "",
      isLoading: false,
      projectsLoading: true,
      patentLanguage: "us",
      isFilter: false,
      selectedCountries: [],
      applicationDate: "",
      publicationDate: "",
      priorityDate: "",
      dateType: "priorityDate",
      claims: "",
      isClaimBox: true,
      generatedInvention: "",
      patentStatus: "",
      patentKeywords: "",
      uploadedFiles: [],
      uploadRefrenceFiles : false,
      uploadFilesRetry: false,
      uploadRequestsCount: 0,  // Tracks the number of active upload requests
      uploadDocumentInput : "",
      activeTab : "draftClaims",
      problem : "",
      solution : "",
      novelty : "",
      userFileUUID: "",
      loadingNovelty : false,
      noveltyRetry : false,
      primaryClassCode: "",
      secondaryClassCode : "",

    };
    this.controller = {};
    this.apisTokens = {};
  }

  componentDidMount() {
    this.updateSession();
    this.props.inputInLimit();
    document.addEventListener("mousedown", this.handleOutsideClick);
    this.mapInitailTab();
  }

  mapInitailTab = async()=>{
    try{
      if(isAccess(
        this.props,
        "drafting_draft_claim"
      )){
        this.setState({activeTab : 'draftClaims'});
      }else if(isAccess(
        this.props,
        "prior_art_explore"
      )){
        this.setState({activeTab : 'priorArt'});
      }else if(isAccess(
        this.props,
        "drafting_view_specs"
      )){
        this.setState({activeTab : 'draftPatent'});
      }
    }catch(e){
      console.log(e)
    }
  }

  updateSession = ()=>{
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn === "true") {
      this.props.updateSession(true);
      this.props.login();
      // this.checkUser()
    } else {
      this.props.updateSession(false);
    }
  }

  componentWillUnmount() {
    window.scroll({ top: 0, left: 0, behavior: "instant" });
    document.removeEventListener("mousedown", this.handleOutsideClick);
  }

  handleOutsideClick = (event) => {
    const button = document.getElementById("explore-prior-art-button");
    const popup = document.getElementById("country-filter");

    if (
      popup &&
      !popup?.contains(event.target) &&
      !button?.contains(event.target)
    ) {
      this.setState({ isFilter: false });
    }
  };

  checkUser = async () => {
    try {
      let data = {
        id: localStorage.getItem("user_id"),
        role_id: localStorage.getItem("role_id"),
      };
      let check = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.check_user_access_to_project,
        data
      );

      this.setState({ userType: check.response.features });
    } catch (e) {
      console.log(e);
    }
  };

  failToGenerateInvention = async () => {
    try {
      this.setState({
        isApiCallDone: false,
      });
      let toastData = this.props.project?.config?.toasterStyle;
      toastData["autoClose"] = 1000;
      toast.error(
        "Failed to generate please retry",
        this.props.project?.config?.toasterStyle
      );
    } catch (e) {
      console.log(e);
    }
  };

  generatingInvention = async (user_id, key, type) => {
    try {
      let streamComplete = false;
      if (
        this.controller[
          this.props.project?.api_config?.endpoints?.claim_invention
        ]
      ) {
        this.controller[
          this.props.project?.api_config?.endpoints?.claim_invention
        ].abort();
      }
      this.controller[
        this.props.project?.api_config?.endpoints?.claim_invention
      ] = new AbortController();

      if (
        this.apisTokens[
          this.props.project?.api_config?.endpoints?.insert_claim_data
        ]
      ) {
        this.apisTokens[
          this.props.project?.api_config?.endpoints?.insert_claim_data
        ].cancel();
      }

      this.apisTokens[
        this.props.project?.api_config?.endpoints?.insert_claim_data
      ] = axios.CancelToken.source();

      let solutionNovelty;
      if(this.activeTab === "draftClaims"){
        solutionNovelty = "solution : " + this.state?.solution + "\n" + "novelty : " + this.state?.novelty
      }

      let data = {
        claim_data: this.state.claims ? this.state.claims : "",
        user_id: user_id,
        is_inserted: false,
        // privilege_id: type,
        project_type: key,
        claims_style: type,
      };

      let insertClaim = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.insert_claim_data,
        data,
        this.apisTokens[
          this.props.project?.api_config?.endpoints?.insert_claim_data
        ].token
      );

      let payLoad = {
        section_history_id: insertClaim?.["section_history_id"],
      };

      const callBack = ({
        content,
        isFinish,
        retry,
        shortMessage,
        longMessage,
      }) => {
        if (content) {
          this.setState({
            generatedInvention: content,
          });
        }
        if (isFinish) {
          if (!retry) {
            streamComplete = true;
          }
        }
      };

      await streamApi.getData(
        "post",
        this.props.project?.api_config?.endpoints?.claim_invention,
        payLoad,
        this.controller[
          this.props.project?.api_config?.endpoints?.claim_invention
        ].signal,
        callBack
      );

      if (streamComplete && this.state.generatedInvention.length > 0) {
        return true;
      } else {
        this.failToGenerateInvention();
        return false;
      }
    } catch (e) {
      console.log(e);
      this.failToGenerateInvention();
      return false;
    }
  };

  //To create new project ID in database and render the patent details page
  callApi = async (key, type) => {
    try {
      let user_id = this.props.project.user_id;
      let inventionGenerated = true;

      let solutionNovelty;
      if(this.state.activeTab === "draftClaims" || this.state.activeTab === "priorArt" ){
        solutionNovelty = "Novelty: " + this.state?.novelty  + "\n" + this.state?.solution
      }

      if (!this.state.invention && this.state.invention.length === 0 && this.state.activeTab === "draftPatent") {
        inventionGenerated = await this.generatingInvention(user_id, key, type);
        if (!inventionGenerated) {
          return;
        }
      }

      let generatedInvention = this.state.generatedInvention.replace(
        "Current invention:",
        ""
      );

      let data = {
        invention: this.state.activeTab === "draftClaims" ||  this.state.activeTab === "priorArt"  ? solutionNovelty :  this.state.invention
          ? this.state.invention
          : generatedInvention
          ? generatedInvention
          : "",
        claims: this.state.claims ? this.state.claims : "",
        user_id: user_id,
        is_inserted: false,
        project_type: key,
        claims_style: type,
      };

      let project_response = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.insert_project_data,
        data
      );
      if (project_response["status"] === "Success") {
        this.props.addProjectId(project_response["response"]["project_id"]);
        this.props.addProjectHistoryId(
          project_response["response"]["project_history_id"]
        );

        let filterData = {
          selectedCountries: this.state.selectedCountries,
          applicationDate: this.state.applicationDate
            ? new Date(this.state.applicationDate).toString()
            : "",
          publicationDate: this.state.publicationDate
            ? new Date(this.state.publicationDate).toString()
            : "",
          priorityDate: this.state.priorityDate
            ? new Date(this.state.priorityDate).toString()
            : "",
          dateType: this.state.dateType,
          patentStatus: this.state.patentStatus,
          patentKeywords: this.state.patentKeywords,
          primaryClassCode : this.state.primaryClassCode,
          secondaryClassCode : this.state.secondaryClassCode
        };

        let filterDataName = `filterData${project_response?.["response"]?.["project_id"]}`;
        // let filterParams = `?filterParam=${filterData}`

        await localStorage.setItem(filterDataName, JSON.stringify(filterData));

        this.props.history.push(
          key == "prior_art"
            ? "/priorArt/" +
                project_response["response"]["project_id"] +
                "/" +
                true +
                "/"
            : this.state.claims && this.state.claims.length > 0
            ? "/patentDetails/" + project_response["response"]["project_id"]
            : "/patentDetails/" +
              project_response["response"]["project_id"] +
              "/edit" +
              "/Claims"
        );
      } else if (project_response["status"] == "Error") {
        this.setState({
          projectErrorMessage: project_response["message"],
          isProjectError: true,
        });
      }

      this.setState({
        invention: "",
        isApiCallDone: false,
        solInput: "",
      });
    } catch (error) {
      console.log(error);
      this.setState({
        projectErrorMessage: `Unable to create a new project, Please contact to dolcera tech : ${error}`,
        isProjectError: true,
      });
    }
  };

  countWords = (str) => {
    str = str.trim();
    return str.split(/\s+/).length;
  };

  updateStateAndCheckLimit = (data, counterPart, stateKey) => {
    const wordLimit = this.props.project?.config?.wordLimt
      ? parseInt(this.props.project.config.wordLimt)
      : 3000;

    let wordCount;
    if (stateKey === "invention") {
      wordCount = this.countWords(data);
      this.setState({
        charLength: data ? wordCount : 0,
      });
    }

    this.setState((prevState) => ({
      invention: stateKey === "invention" ? data : prevState.invention,
      claims: stateKey === "claims" ? data : prevState.claims,
    }));

    wordCount > wordLimit
      ? this.props.inputExceed()
      : this.props.inputInLimit();
  };

  searchHandler = (data) => {
    this.updateStateAndCheckLimit(data, this.state.claims, "invention");
  };

  inputClaimHandler = (data) => {
    this.updateStateAndCheckLimit(data, this.state.invention, "claims");
  };

  solutionHandler = (data) => {
    var wordLimt = 3000;
    if (this.props.project?.config?.wordLimt) {
      wordLimt = parseInt(this.props.project.config.wordLimt);
    }

    function countWords(str) {
      str = str.trim();
      return str.split(/\s+/).length;
    }
    let wordCount = countWords(data);

    this.setState({ solInput: data });
    if (data) {
      this.setState({ solCharLength: wordCount });
    } else {
      this.setState({ solCharLength: 0 });
    }

    if (wordCount > wordLimt) {
      this.setState({ solCharLengthExceed: true });
    } else {
      this.setState({ solCharLengthExceed: false });
    }
  };

  submitHandler = (data, type) => {
    if (
      this.state.invention.trim().length == 0 &&
      this.state.claims.trim().length === 0 &&
      this.state.activeTab === 'draftPatent'
    ) {
      
      let toastData = this.props.project?.config?.toasterStyle;
      toastData["autoClose"] = 1000;
      toast.error(
        "Please enter claims or invention first",
        this.props.project?.config?.toasterStyle
      );
      return;
    }else if(
     this.state.activeTab === 'draftClaims'
     &&( this.state.novelty.trim().length === 0
     || this.state.solution.trim().length === 0)
  ){
      let toastData = this.props.project?.config?.toasterStyle;
      toastData["autoClose"] = 1000;
      toast.error(
        "Please analyse input and novelty first",
        this.props.project?.config?.toasterStyle
      );
      return;
    }

    this.callApi(data, type == "us" ? "us" : "eu");
    this.setState({ isApiCallDone: true });
    this.props.inputValueHandler(this.state.invention);
  };

  clearTextHandler = () => {
    this.setState({ invention: "", claims: "", charLength: 0 ,uploadDocumentInput : "", problem : "", solution : "", novelty : "" });
  }
  loadingScreenHandler = () => {
    this.setState({ isLoading: true });
  };

  projectFlagHandler = () => {
    this.setState({ projectsLoading: false });
  };

  languageHandler = (e, lang) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ patentLanguage: lang });
  };

  filterToggleHandler = () => {
    this.setState({ isFilter: !this.state.isFilter });
  };

  explorePriorArtHandler = () => {
    this.submitHandler("prior_art");
  };

  handleCountrySelector = (data) => {
    this.setState({ selectedCountries: data });
  };

  handleDateChangeHandler = (
    applicationDate,
    publicationDate,
    priorityDate
  ) => {
    this.setState({
      applicationDate: applicationDate,
      publicationDate: publicationDate,
      priorityDate: priorityDate,
    });
  };

  dateTypeHandler = (dateType) => {
    this.setState({
      dateType: dateType,
    });
  };

  // Optimized state handler for various properties
  stateHandler = (key, value) => {
    this.setState({
      [key]: value,
    });
  };

  patentKeywordsHandler = (keywords) => {
    this.setState({
      patentKeywords: keywords,
    });
  };

  imageUploadHandler = (fileName, type, files) => {
    if (files === null) {
      let newUploadedFiles = this.state.uploadedFiles.filter(
        (file, i) => file.name !== fileName
      );

      newUploadedFiles = newUploadedFiles || []
      this.setState({ uploadedFiles: newUploadedFiles }, () => {
        this.refrenceListUploadHandler("delete");
      });
    } else {
      this.setState((pre)=>({
        uploadedFiles : [...pre.uploadedFiles, ...files]
      }))
    }
  };


  uploadRefrenceFilesResponseHandler =(response, callFrom)=>{
    try{
      if(response?.status === "Success"){
        this.setState({uploadFilesRetry : false})
        let generatedSection = response?.response || "";
        if(generatedSection?.invention?.Problem){
          this.setState({problem : generatedSection?.invention?.Problem });
        }if(generatedSection?.invention?.Solution){
          this.setState({solution : generatedSection?.invention?.Solution });
        }if(generatedSection?.upload_file_id?.[0]?.user_file_uuid){
          this.setState({userFileUUID : generatedSection?.upload_file_id?.[0]?.user_file_uuid});
        }
      }else if(callFrom !== "delete" && (response?.status === "Error" &&  response?.name != "CanceledError") ){
        this.setState({uploadFilesRetry : true});
        let toastData = this.props.project?.config?.toasterStyle;
        toastData["autoClose"] = 1500;
        toast.error(
          "Failed to generate please retry upload",
          this.props.project?.config?.toasterStyle
        );
        window.favloader.stop();
      }
    }catch(e){
      console.log(e);
    }
  }

  refrenceListUploadHandler = async (callFrom) => {
    try {
      this.setState(prevState => ({
        uploadRefrenceFiles: true,
        uploadRequestsCount: prevState.uploadRequestsCount + 1,
        uploadFilesRetry : false
      }));

      window.favloader.start();
      let user_id = localStorage.getItem("user_id");

      if (
        this.apisTokens[
          this.props.project?.api_config?.endpoints?.reference_files_upload
        ]
      ) {
        this.apisTokens[
          this.props.project?.api_config?.endpoints?.reference_files_upload
        ].cancel();
      }

      this.apisTokens[
        this.props.project?.api_config?.endpoints?.reference_files_upload
      ] = axios.CancelToken.source();

      const formData = new FormData();

      Array.from(this.state.uploadedFiles).forEach((file) => {
        formData.append("files", file);
      });

      formData.append("sysuser_id", user_id);
      formData.append("input", this.state.uploadDocumentInput);
      let upLoad;
      if((this.state.uploadedFiles && this.state.uploadedFiles.length > 0 )|| (this.state.uploadDocumentInput)){
         upLoad = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.reference_files_upload,
          formData,
          this.apisTokens[
            this.props.project?.api_config?.endpoints?.reference_files_upload
          ].token,
          null,
          true
        );
      }else{
        if(callFrom !== "delete"){
          let toastData = this.props.project?.config?.toasterStyle;
          toastData["autoClose"] = 1500;
          toast.error(
            "Please upload files or enter any input.",
            this.props.project?.config?.toasterStyle
          );
        }
      }

      this.setState(prevState => ({
        uploadRefrenceFiles: prevState.uploadRequestsCount > 1, // Keep true if other requests are still pending
        uploadRequestsCount: prevState.uploadRequestsCount - 1
      }), () => {
        this.uploadRefrenceFilesResponseHandler(upLoad, callFrom);
        if(this.state.uploadRequestsCount === 0){
          window.favloader.stop();
        }
      });


    } catch (e) {
      console.log(e);
      this.setState(prevState => ({
        uploadRequestsCount: prevState.uploadRequestsCount - 1,
        uploadRefrenceFiles: prevState.uploadRequestsCount > 1
      }),()=>{
        if(this.state.uploadRequestsCount === 0){
          window.favloader.stop();
        }
      });
    }
  };

  tabSwitchHandler = (tab)=>{
    console.log("TABS",tab);
    try{
      this.setState({activeTab : tab})
    }catch(e){
      console.log(e);
    }
  }

  render() {
    console.log(this.state.primaryClassCode,this.state.secondaryClassCode);
    if (this.state.isLoading) {
      // return <LoadingScreen />;
    }
    if (!this.props.project.user_id) {
      let user_id = localStorage.getItem("user_id");
      this.props.addUserId(user_id);
    }
    const { isApiCallDone, titleErrorMessage } = this.state;

    var wordLimt = 3000;
    if (this.props.project?.config?.wordLimt) {
      wordLimt = parseInt(this.props.project.config.wordLimt);
    }

    let isDraftClaimAccess = isAccess(
      this.props,
      "drafting_draft_claim"
    );

    let isPriorArtAccess = isAccess(
      this.props,
      "prior_art_explore"
    );
    let isDraftPatentAccess = isAccess(
      this.props,
      "drafting_view_specs"
    );

    return (
      <Container fluid>
        <Row className="draft-main-container">
          <Col id="search_bar">
            <div className="landing-page-title">
              Empowering users with generative AI for IP solutions
            </div>

            <div>
      {(isDraftClaimAccess || isPriorArtAccess || isDraftPatentAccess) &&  <Row>
            <Tab.Container activeKey={ this.state.activeTab } >
            <div className="home-nav-items-conatiner" >
            <Nav bsPrefix = "search-box-container home-tabs-container home-nav-items" variant="underline" defaultActiveKey="draftClaims">
              { isDraftClaimAccess && <Nav.Item>
                  <Nav.Link bsPrefix = "nav-link" eventKey="draftClaims" onClick={() => {this.tabSwitchHandler('draftClaims')}} > Draft Claims</Nav.Link>
                </Nav.Item>}
               {isPriorArtAccess && <Nav.Item>
                  <Nav.Link bsPrefix = "nav-link" eventKey="priorArt" onClick={() => {this.tabSwitchHandler('priorArt')}} >Explore Prior Art</Nav.Link>
                </Nav.Item>}
           {isDraftPatentAccess &&  <Nav.Item>
                  <Nav.Link eventKey="draftPatent" onClick={() => {this.tabSwitchHandler('draftPatent')}} >Draft Patent</Nav.Link>
                </Nav.Item>}
              </Nav>
            </div>
              <div className="search-box-container home-tabs-container"  >
              <Tab.Content>
                <Tab.Pane eventKey="draftClaims">
                  <ClaimsPriorArt uploadedFiles = {this.state.uploadedFiles}
                  uploadDocumentInput = {this.state.uploadDocumentInput}
                  uploadRefrenceFiles = {this.state.uploadRefrenceFiles}
                  problem = {this.state.problem}
                  solution = {this.state.solution}
                  novelty = {this.state.novelty}
                  uploadFilesRetry = {this.state.uploadFilesRetry}
                  userFileUUID = {this.state.userFileUUID}
                  loadingNovelty = {this.state.loadingNovelty}
                  noveltyRetry = {this.state.noveltyRetry}
                  imageUploadHandler = {this.imageUploadHandler}
                  refrenceListUploadHandler = {this.refrenceListUploadHandler}
                  uploadDocumentInputHandler = {this.stateHandler}
                  problemtInputHandler = {this.stateHandler}
                  solutionHandler = {this.stateHandler}
                  noveltyHandler = {this.stateHandler}
                  isDraftClaimAccess = {isDraftClaimAccess}
                  props = {this.props}
                   />
                </Tab.Pane>
                <Tab.Pane eventKey="priorArt">
                  <ClaimsPriorArt uploadedFiles = {this.state.uploadedFiles}
                  uploadDocumentInput = {this.state.uploadDocumentInput}
                  uploadRefrenceFiles = {this.state.uploadRefrenceFiles}
                  problem = {this.state.problem}
                  solution = {this.state.solution}
                  novelty = {this.state.novelty}
                  uploadFilesRetry = {this.state.uploadFilesRetry}
                  userFileUUID = {this.state.userFileUUID}
                  loadingNovelty = {this.state.loadingNovelty}
                  noveltyRetry = {this.state.noveltyRetry}
                  imageUploadHandler = {this.imageUploadHandler}
                  refrenceListUploadHandler = {this.refrenceListUploadHandler}
                  uploadDocumentInputHandler = {this.stateHandler}
                  problemtInputHandler = {this.stateHandler}
                  solutionHandler = {this.stateHandler}
                  noveltyHandler = {this.stateHandler}
                  isDraftClaimAccess = {isDraftClaimAccess}
                  props = {this.props}
                   />
                </Tab.Pane>
                <Tab.Pane eventKey="draftPatent">
                <DraftPatent
                  charLength={this.state.charLength}
                  invention={this.state.invention}
                  claims={this.state.claims}
                  uploadRefrenceFiles = {this.state.uploadRefrenceFiles}
                  activeTab = { this.state.activeTab}
                  searchHandler={this.searchHandler}
                  inputClaimHandler={this.inputClaimHandler}
                  isDraftClaimAccess = {isDraftClaimAccess}
                  isPriorArtAccess = {isPriorArtAccess}
                  additionalProps = {this.props}
                  props = {this.props}
                />
                </Tab.Pane>
              </Tab.Content>
              </div>
              
            </Tab.Container>
            </Row>}
   
            </div>

         { (isDraftClaimAccess || isPriorArtAccess) && ((this.state.activeTab === 'draftClaims' && this.state.novelty || this.state.activeTab === 'draftPatent' || ( this.state.activeTab === 'priorArt' && this.state.novelty) ) &&  <Row className="search-box-container">
              {isDraftClaimAccess && <Col className="home-input-instructions" lg={12}>
                <span>
                  {" "}
                  <img src={greyInfo} /> Input your invention for claim
                  generation, or use claims alone or with your invention to
                  draft your complete patent.
                </span>
              </Col>}
              <ValidateInput />
              <Col>
                <Container className="main-footer-button-container">
                  <Row>
                    <Col lg={2}>
                      {this.state.solCharLengthExceed && (
                        <div className="caution-container-sol">
                          <p className="caution-sol">
                            {" "}
                            <img className="info" src={info} /> Too many
                            Characters. The limit is {wordLimt} words.
                          </p>
                        </div>
                      )}
                    </Col>
                    <Col>
                      <Row className="mfbc-actions">
                        <Col className="mfbc-actions-col">

                          <ClearButton
                            clearTextHandler={this.clearTextHandler}
                          />
                          
                            {(isDraftClaimAccess && this.state.activeTab !== 'priorArt') && <DraftButton
                              isInputExceed={this.props.isInputExceed}
                              solCharLengthExceed={
                                this.state.solCharLengthExceed
                              }
                              patentLanguage={this.state.patentLanguage}
                              claims={this.state.claims}
                              submitHandler={this.submitHandler}
                              languageHandler={this.languageHandler}
                              uploadRefrenceFiles = {this.state.uploadRefrenceFiles}
                              activeTab = { this.state.activeTab}
                            />}
                          
                         {( isPriorArtAccess &&  this.state.activeTab === "priorArt") && (<div className="explore-prior-art-cont">
                            <ExplorePriorArtButton
                              isInputExceed={this.props.isInputExceed}
                              solCharLengthExceed={
                                this.state.solCharLengthExceed
                              }
                              filterToggleHandler={this.filterToggleHandler}
                              uploadRefrenceFiles = {this.state.uploadRefrenceFiles}
                            />
                            {this.state.isFilter && (
                              <div className="home-prior-artfilter-outer-container">
                                <CountryFilter
                                  {...this.props}
                                  explorePriorArtHandler={
                                    this.explorePriorArtHandler
                                  }
                                  className="create-button"
                                  onClick={() =>
                                    this.submitHandler(
                                      "claims",
                                      this.state.patentLanguage
                                    )
                                  }
                                  handleDateChangeHandler={
                                    this.handleDateChangeHandler
                                  }
                                  selectedDateTypeHandler={this.dateTypeHandler}
                                  cancelFilterHandler={this.filterToggleHandler}
                                  patentKeywordsHandler={
                                    this.patentKeywordsHandler
                                  }
                                  dateType={this.state.dateType}
                                  patentStatus={this.state.patentStatus}
                                  patentKeywords={this.state.patentKeywords}
                                  page="home"
                                  selectedCountries={
                                    this.state.selectedCountries
                                  }
                                  secondaryClassCode = {this.state.secondaryClassCode}
                                  primaryClassCode = {this.state.primaryClassCode}
                                  stateHandler={this.stateHandler}
                                />
                              </div>
                            )}
                          </div>)}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Container>
              </Col>
            </Row>)}
            <DraftingList
              {...this.props}
              user_id={localStorage.getItem("user_id")}
              loadingScreenHandler={this.loadingScreenHandler}
              projectFlagHandler={this.projectFlagHandler}
              projectLoadingFlag={this.state.projectsLoading}
            />
          </Col>
        </Row>

        {isApiCallDone && (
          <Modal isOpen={true}>
            <LoadingScreen />
          </Modal>
        )}
      </Container>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    project: state.projectData,
    isInputExceed: state.inputLimitReducer.limitExceed,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addProjectId: (data) => dispatch(addProjectId(data)),
    addProjectHistoryId: (data) => dispatch(addProjectHistoryId(data)),
    addUserId: (data) => dispatch(addUserId(data)),
    inputExceed: (data) => dispatch(limitExceed()),
    inputInLimit: (data) => dispatch(inLimit()),
    login: () => dispatch(logIn()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
