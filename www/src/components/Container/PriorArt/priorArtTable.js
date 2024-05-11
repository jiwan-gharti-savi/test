import React, { Component } from "react";
import axios from "axios";
import back_icon from "../../assets/icons/back.svg";
import { Link } from "react-router-dom";
import classes from "./priorArt.module.css";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import {
  Container,
  Row,
  Col,
} from "reactstrap";
import apiServices from "../../../services/apiServices";
import Prompt from "../patent/patentDetailsPrompt";
import {
  togglePatentEditModal,
  toggleClaimsEditModal,
} from "../../../store/action";
import ClaimsOverlay from "./generateClaimsOverlay";
import LoadingScreen from "../../LoadingScreen/loadingScreen";
import white_arrow from "../../assets/icons/arrow_submit.svg";

import MyButton from "../../Elements/MyButton/MyButton";
import "react-circular-progressbar/dist/styles.css";

import blue_icon from "../../assets/icons/download_blue_icon.svg";
import "./priorArtTable.scss";
import info_orange from "../../assets/icons/info_orange.svg";
import default_image from "../../assets/icons/not_create.svg";
import CountdownTimer from "../Counter/CountdownTimer";
import logo from "../../assets/icons/IP_Author_logo.svg";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.css";
import filterIcon from "../../assets/icons/filter-2.svg";
import CountrySelector from "../../Elements/CountrySelector/CountrySelector";
import Modal from "../ImageViewer/Modal";
import CountryFilter from "../../Elements/CountryFilter/CountryFilter";
import menuIcon from "../../assets/icons/menu.svg";
import SkeltonWrapper from "../../Elements/Skelton/SkeltonWrapper";
import download_thin from "../../assets/icons/download_thin.svg";
import download_white from "../../assets/icons/download_white.svg";
import down_arrow from "../../assets/icons/down_arrow.svg";
import PriorArtSelectedFilters from "./priorArtSelectedFilters";

import { isAccess } from "../../../utils/accessCheck";

import PriorArtSkelton from "./PriorArtSkelton";
import PriorArtDetails from "./PriorArtDetails";

import Sticky from 'react-stickynode';
import Pagination from "../../Elements/Pagination/Pagination";



class PriorArtTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputValDataBase: "",
      checkedBoxes: [],
      priorArtData: null,
      allPriorArtData: [],
      latestIndex: 0,
      isLoading: true,
      selectedPriorArt: "",
      loadingGenrate: false,
      pageNumber: 1,
      serviceRetry: false,
      loading: false,
      similarityApiStatus: true,
      generatingPriorArt: false,
      isApplicationDateDropDown: false,
      isPriorityDateDropDown: false,
      applicationDate: "",
      priorityDate: null,
      publicationDate: null,
      formattedSelectedCountries: [],
      patentLanguage: "us",
      selectedCountries: [],
      searchTerm: "",
      isCountryDorpDown: false,
      selectAll: false,
      isFilter: false,
      moveArrowIcon: true,
      dateType: "priorityDate",
      patentStatus: "",
      patentKeywords: "",
      publicationType: "",
      estiDeclared: "",
      reduceBy: "",
      searchField: "",
      textareaHeight : '40px',

      companies: "",
      primaryClassCode: "",
      secondaryClassCode : "",
      refrencePatentNumber: "",
      isExportTypeOpen: false,

      selectedApplicationDate: null,
      selectedPriorityDate: null,
      selectedPublicationDate: null,
      selectedDateType: "",
      initialSelectedCountries: [],
      priorArtShortMessage: "",
      priorArtLongMessage: "",
      selectedPatentStatus: "",
      selectedPatentKeywords: "",
      selectedPublicationType: "",
      selectEstiDeclared: "",
      selectedReduceBy: "",
      selectedSerachField: "",
      selectedCompanies: "",
      selectPrimaryClassCode: "",
      selectSecondaryClassCode: "",
      selectedRefrencePatentNumber: "",

      isPageScrollTop : false,
      isAdvanceFilter : true,
      priorArtDataToShow : [],
      pageCount : 0
    };

    this.apisTokens = {};
    this.notification = null;

  }

  componentWillMount() {
    // if (!this.props.match?.params?.id) {
    //   this.checkUserAccessToProject();
    // } else {
    //   this.get_invention_title();
    // }
    this.checkUserAccessToProject();
    window.addEventListener("scroll", this.handleScroll);
  }

  componentDidMount() {
    if (!("Notification" in window)) {
      console.log("Browser does not support desktop notification");
    } else {
      Notification.requestPermission();
    }
    document.addEventListener("mousedown", this.handleOutsideClick);
  }

  componentWillUnmount() {
    if (this.apisTokens) {
      Object.keys(this.apisTokens).map((key) => {
        this.apisTokens[key].cancel();
      });
    }
    window.favloader.stop();
    this.notification?.close();
    window.removeEventListener("scroll", this.handleScroll);
    document.removeEventListener("mousedown", this.handleOutsideClick);
    // document.body.style.overflow = "unset";
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.generatingPriorArt !== this.state.generatingPriorArt) {
      if (this.state.generatingPriorArt) {
        window.favloader.start();
      } else {
        window.favloader.stop();
      }
    }

    // if (this.state.isCountryDorpDown || this.state.isFilter) {
    //   document.body.style.overflow = "hidden";
    // } else {
    //   document.body.style.overflow = "auto";
    // }
  }

  filtersToggleHandler = (event) => {
    if (event) {
      event.stopPropagation();
    }
    if(isAccess(this.props,"prior_art_explore")){
      this.setState((prev) => ({ isFilter: !prev.isFilter }));
    };
  };

  closeFilterHandler = () => {
    this.setState({ isFilter: true });
  };

  handleOutsideClick = (event) => {
    const popup = document.getElementById("country-filter"); // Replace with the actual ID of your popup
    const button = document.getElementById("filter-toggal-button");
    const menuButton = document.getElementById("menu-button");
    const flaskButton = document.getElementById("flask-button");
    const filterOptions = document.getElementsByClassName("filtered-items");
    const priorArtExportButton = document.getElementById("prior-art-download");
    const exportContainer = document.getElementById("export-type-cont");
    const filteredItemsArray = Array.from(filterOptions);
    const clickInsideItems = filteredItemsArray.some((element) =>
      element.contains(event.target)
    );

    if (
      popup &&
      !popup?.contains(event.target) &&
      this.state.isFilter == true &&
      !button.contains(event.target) &&
      flaskButton !== event.target &&
      menuButton !== event.target &&
      filterOptions !== event.target &&
      event.target.className !== "filtered-items" &&
      event.target.className !== "selected-filter" &&
      !clickInsideItems
    ) {
      // Click occurred outside the popup
      this.setState({ isFilter: false });
    }
    if (
      !exportContainer?.contains(event.target) &&
      priorArtExportButton !== event.target
    ) {
      this.setState({ isExportTypeOpen: false });
    }
  };

  handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop >= 1) {
      this.setState({ moveArrowIcon: false });
    } else {
      this.setState({ moveArrowIcon: true });
    }
    
  }
  handleStickyStateChange = (status)=>{
    if (status.status === Sticky.STATUS_FIXED) {
      this.setState({isPageScrollTop : true});
  }else{
    this.setState({isPageScrollTop : false});
  }
  }

  toggleCountryModal = () => {
    this.setState({ isCountryDorpDown: !this.state.isCountryDorpDown });
  };

  languageHandler = (e, lang) => {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ patentLanguage: lang });
  };

  showNotification = (notification) => {
    var options = {
      // body: 'Notification Body',
      icon: logo,
      dir: "ltr",
    };
    this.notification = new Notification(notification, options);
    setTimeout(() => {
      this.notification.close();
    }, 5000);
  };

  explorePriorArtHandler = () => {
    this.regenrateHandler(this.state.inputValDataBase, true);
    this.filtersToggleHandler();
  };

  updateFilterHandler = (select_project_history) => {
    let applicationDate = select_project_history.response?.[0]?.["filters"]?.[
      "application_date"
    ]
      ? new Date(
          select_project_history.response?.[0]?.["filters"]?.[
            "application_date"
          ]
        )
      : "";
    let priorityDate = select_project_history.response?.[0]?.["filters"]?.[
      "priority_date"
    ]
      ? new Date(
          select_project_history.response?.[0]?.["filters"]?.["priority_date"]
        )
      : "";
    let publicationDate = select_project_history.response?.[0]?.["filters"]?.[
      "publication_date"
    ]
      ? new Date(
          select_project_history.response?.[0]?.["filters"]?.[
            "publication_date"
          ]
        )
      : "";

    let selectedCountries =
      select_project_history.response?.[0]?.["filters"]?.[
        "selected_countries"
      ] &&
      select_project_history.response?.[0]?.["filters"]?.["selected_countries"]
        .length > 0
        ? select_project_history.response?.[0]?.["filters"]?.[
            "selected_countries"
          ].map((data) => data.country.toLowerCase())
        : [];

    let selectedPatentStatus = select_project_history?.response?.[0]?.[
      "filters"
    ]?.["active"]
      ? select_project_history?.response?.[0]?.["filters"]?.["active"]
      : "";

    let selectedPatentKeywords = select_project_history?.response?.[0]?.[
      "filters"
    ]?.["important_terms"]
      ? select_project_history?.response?.[0]?.["filters"]?.["important_terms"]
      : "";

    let selectedpublicationType = select_project_history?.response?.[0]?.[
      "filters"
    ]?.["ptype"]
      ? select_project_history?.response?.[0]?.["filters"]?.["ptype"]
      : "";

    let selectEstiDeclared = select_project_history?.response?.[0]?.[
      "filters"
    ]?.["etsi"]
      ? select_project_history?.response?.[0]?.["filters"]?.["etsi"]
      : "";

    let selectedReduceBy = select_project_history?.response?.[0]?.["filters"]?.[
      "red_by"
    ]
      ? select_project_history?.response?.[0]?.["filters"]?.["red_by"]
      : "";

    let selectedSerachField = select_project_history?.response?.[0]?.[
      "filters"
    ]?.["search"]
      ? select_project_history?.response?.[0]?.["filters"]?.["search"]
      : "";

    let selectedCompanies = select_project_history?.response?.[0]?.[
      "filters"
    ]?.["company"]
      ? select_project_history?.response?.[0]?.["filters"]?.["company"]
      : "";

    let selectPrimaryClassCode = select_project_history?.response?.[0]?.[
      "filters"
    ]?.["primary_class"]
      ? select_project_history?.response?.[0]?.["filters"]?.["primary_class"]
      : "";

    let selectSecondaryClassCode = select_project_history?.response?.[0]?.[
      "filters"
    ]?.["secondary_class"]
      ? select_project_history?.response?.[0]?.["filters"]?.["secondary_class"]
      : "";

    let selectedRefrencePatentNumber = select_project_history?.response?.[0]?.[
      "filters"
    ]?.["ref_pn"]
      ? select_project_history?.response?.[0]?.["filters"]?.["ref_pn"]
      : "";

    if (priorityDate) {
      this.setState({ dateType: "priorityDate" });
      this.setState({ selectedDateType: "priorityDate" });
    } else if (applicationDate) {
      this.setState({ dateType: "applicationDate" });
      this.setState({ selectedDateType: "applicationDate" });
    } else if (publicationDate) {
      this.setState({ dateType: "publicationDate" });
      this.setState({ selectedDateType: "publicationDate" });
    }

    this.setState({
      selectedApplicationDate: applicationDate,
      selectedPriorityDate: priorityDate,
      selectedPublicationDate: publicationDate,
      initialSelectedCountries: selectedCountries,
      applicationDate: applicationDate,
      priorityDate: priorityDate,
      publicationDate: publicationDate,
      patentStatus: selectedPatentStatus,
      patentKeywords: selectedPatentKeywords,
      publicationType: selectedpublicationType,
      estiDeclared: selectEstiDeclared,
      reduceBy: selectedReduceBy,
      searchField: selectedSerachField,
      companies: selectedCompanies,
      primaryClassCode: selectPrimaryClassCode,
      secondaryClassCode: selectSecondaryClassCode,
      refrencePatentNumber: selectedRefrencePatentNumber,
      isExportTypeOpen: false,

      selectedCountries: selectedCountries,
      selectedPatentStatus: selectedPatentStatus,
      selectedPatentKeywords: selectedPatentKeywords,
      selectedPublicationType: selectedpublicationType,
      selectEstiDeclared: selectEstiDeclared,
      selectedReduceBy: selectedReduceBy,
      selectedSerachField: selectedSerachField,
      selectedCompanies: selectedCompanies,
      selectPrimaryClassCode: selectPrimaryClassCode,
      selectSecondryClassCode: selectSecondaryClassCode,
      selectedRefrencePatentNumber: selectedRefrencePatentNumber,
    });
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
      );

      this.setState(
        {
          inputValDataBase: inputVal["response"]["invention_title"],
        },
        () => {
          this.retrievedFilterHandler(true);
          this.testApihandler();
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  testApihandler = async () => {
    try {
      let inputVal = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.priorart_auto_complete,
        {
          project_id: this.props.match?.params?.id,
          input_search_keywords: "comp",
          input_section: "companies",
        }
      );
    } catch (e) {
      console.log(e);
    }
  };

  retrievedFilterHandler = async (initialLoading = false) => {
    try {
      let filterDataName = `filterData${this.props.match?.params?.id}`;

      let retrievedFilterData = await JSON.parse(
        localStorage.getItem(filterDataName)
      );
      if (retrievedFilterData) {
        this.setState(
          {
            selectedApplicationDate: retrievedFilterData?.applicationDate
              ? new Date(retrievedFilterData.applicationDate)
              : null,
            selectedPriorityDate: retrievedFilterData?.priorityDate
              ? new Date(retrievedFilterData.priorityDate)
              : null,
            selectedPublicationDate: retrievedFilterData?.publicationDate
              ? new Date(retrievedFilterData.publicationDate)
              : null,
            initialSelectedCountries: retrievedFilterData?.selectedCountries
              ? retrievedFilterData.selectedCountries
              : [],
            selectedDateType: retrievedFilterData?.dateType
              ? retrievedFilterData.dateType
              : null,
            applicationDate: retrievedFilterData?.applicationDate
              ? new Date(retrievedFilterData.applicationDate)
              : null,
            priorityDate: retrievedFilterData?.priorityDate
              ? new Date(retrievedFilterData.priorityDate)
              : null,
            publicationDate: retrievedFilterData?.publicationDate
              ? new Date(retrievedFilterData.publicationDate)
              : null,
            selectedCountries: retrievedFilterData?.selectedCountries
              ? retrievedFilterData.selectedCountries
              : [],
            dateType: retrievedFilterData?.dateType
              ? retrievedFilterData.dateType
              : null,

            selectedPatentStatus: retrievedFilterData?.patentStatus
              ? retrievedFilterData?.patentStatus
              : "",
            patentStatus: retrievedFilterData?.patentStatus
              ? retrievedFilterData?.patentStatus
              : "",

            selectedPatentKeywords: retrievedFilterData?.patentKeywords
              ? retrievedFilterData?.patentKeywords
              : "",

            patentKeywords: retrievedFilterData?.patentKeywords
              ? retrievedFilterData?.patentKeywords
              : "",
            publicationType: retrievedFilterData?.publicationType
              ? retrievedFilterData?.publicationType
              : "",
            estiDeclared: retrievedFilterData?.estiDeclared
              ? retrievedFilterData?.estiDeclared
              : "",
            reduceBy: retrievedFilterData?.reduceBy
              ? retrievedFilterData?.reduceBy
              : "",
            searchField: retrievedFilterData?.searchField
              ? retrievedFilterData?.searchField
              : "",
            companies: retrievedFilterData?.companies
              ? retrievedFilterData?.companies
              : "",
            primaryClassCode: retrievedFilterData?.primaryClassCode
              ? retrievedFilterData?.primaryClassCode
              : "",
            secondaryClassCode: retrievedFilterData?.secondaryClassCode
              ? retrievedFilterData?.secondaryClassCode
              : "",
            refrencePatentNumber: retrievedFilterData?.refrencePatentNumber
              ? retrievedFilterData?.refrencePatentNumber
              : "",
          },
          () => {
            if (initialLoading) {
              this.prior_art_value();
            }
          }
        );
      } else {
        if (initialLoading) {
          this.prior_art_value();
        }
      }
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
      this.setState({ selectedPriorArt: select_project_history.response[0] });
      if (
        !select_project_history?.response[0] ||
        select_project_history?.response[0]["prior_art_analysis"] == null ||
        select_project_history?.response[0]["prior_art_analysis"].length === 0
      ) {
        console.log("REGENRATE===>");
        this.regenrateHandler(this.state.inputValDataBase);
        this.setState({ isLoading: false });
        return;
      } else if (
        select_project_history?.response[0].is_error == "Error" ||
        select_project_history.status == "Error"
      ) {
        this.setState({
          isLoading: false,
          serviceRetry: true,
          priorArtShortMessage: select_project_history?.response[0].message,
          priorArtLongMessage: select_project_history?.response[0].message_long,
        });

        this.updateFilterHandler(select_project_history);
      } else {
        this.updateFilterHandler(select_project_history);

        this.setState({
          priorArtData:
            select_project_history.response[0]["prior_art_analysis"],
          allPriorArtData: select_project_history.response,
          inputValDataBase:
            select_project_history.response[0]["invention_title"],
          selectedPriorArt: select_project_history.response[0],
        });
        let filterDataName = `filterData${this.props.match?.params?.id}`;
        localStorage.removeItem(filterDataName);
      }
    } catch (e) {
      console.log(e);
      this.setState({
        isLoading: false,
        serviceRetry: true,
        generatingPriorArt: false,
      });
    }
    this.setState({ isLoading: false });
  };



  checkUserAccessToProject = async () => {
    let data = {
      id: localStorage.getItem("user_id"),
      project_id: this.props.match?.params?.id,
      role_id: localStorage.getItem("role_id"),
    };

    var response = await apiServices.getData(
      "post",
      this.props.project?.api_config?.endpoints?.check_user_access_to_project,
      data
    );
    if (response["status"] === "Error" || response?.response?.project !== 'yes' || !isAccess(this.props,"prior_art_view")) {
      let toastData = this.props.project?.config?.toasterStyle;
      toastData["autoClose"] = response["message_time"];
      let toastMessage = response["message"] ? response["message"] :"Unauthorized Access Attempted"
      toast.error(toastMessage, toastData);
      this.props.history.push("/home");
    } else {
      this.get_invention_title();
    }
  };

  genrateHandler = async () => {
    try {
      // this.setState({ loadingGenrate: true });
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

      let updateProjectHistory = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.update_project_history,
        {
          claims_style: this.state.patentLanguage,
          project_history_id: this.state.selectedPriorArt["project_history_id"],
          project_id: this.state.selectedPriorArt["project_id"],
        }
      );

      this.props.history.push(
        "/patentDetails/" + this.props.match?.params?.id + "/edit" + "/Claims/"
      );
    } catch (e) {
      console.log(e);
    }
    // this.setState({ loadingGenrate: false });
  };

  openPrompt = () => {
    this.props.toggleOverlay();
  };

  regenrateHandler = async (text, filter = false) => {
    try {
      this.setState({ isLoading: true, generatingPriorArt: true });
      let prev_project_history_id = this.props.project["project_history_id"];
      let get_project_history_id_data = {
        invention: text,
        project_id: this.props.match?.params?.id,
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
        project_id: this.props.match?.params?.id,
        project_history_id: prev_project_history_id,
      };
      let update_invention_value = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.update_invention,
        invention_data
      );
      let new_project_history_id =
        update_invention_value["response"]["project_history_id"];
      let prior_art_data = {
        project_history_id: new_project_history_id,
      };

      let countries = this.state.selectedCountries.map((data) => ({
        country: data,
      }));
      let generate_prior_art_data = {
        invention_title: text,
        project_id: this.props.match?.params?.id,
        filters: {
          selected_countries: countries,
          active: this.state.patentStatus,
          necessary_key_words: this.state.patentKeywords,
          ptype: this.state.publicationType,
          etsi: this.state.estiDeclared,
          red_by: this.state.reduceBy,
          search: this.state.searchField,
          company: this.state.companies,
          primary_class: this.state.primaryClassCode,
          secondary_class: this.state.secondaryClassCode,
          ref_pn: this.state.refrencePatentNumber,
        },
      };

      let selectedDateType = this.state.dateType;

      if (selectedDateType == "applicationDate") {
        generate_prior_art_data.filters.application_date =
          this.state.applicationDate;
      } else if (selectedDateType == "priorityDate") {
        generate_prior_art_data.filters.priority_date = this.state.priorityDate;
      } else if (selectedDateType == "publicationDate") {
        generate_prior_art_data.filters.publication_date =
          this.state.publicationDate;
      }

      let historyData = {
        project_id: this.props.match?.params?.id,
        request_page: this.state.pageNumber,
      };

      //to get prior art from ai
      let check_prior_art_data = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_one_project_history,
        prior_art_data
      );
      if (this.apisTokens.priorArtData) {
        this.apisTokens["priorArtData"].cancel();
      }
      this.apisTokens["priorArtData"] = axios.CancelToken.source();
      let prior_art_value = "";

      if (
        check_prior_art_data["response"][0]["prior_art"] === null ||
        Object.keys(check_prior_art_data["response"][0]["prior_art"]).length ===
          0 ||
        check_prior_art_data["response"][0]?.is_error == "Error" ||
        filter
      ) {
        this.setState({
          similarityApiStatus: true,
          initialSelectedCountries: this.state.selectedCountries,
          selectedApplicationDate: this.state.applicationDate,
          selectedPriorityDate: this.state.priorityDate,
          selectedPublicationDate: this.state.publicationDate,
          selectedPatentStatus: this.state.patentStatus,
          selectedPatentKeywords: this.state.patentKeywords,
          selectedPublicationType: this.state.publicationType,
          selectEstiDeclared: this.state.estiDeclared,
          selectedReduceBy: this.state.reduceBy,
          selectedSerachField: this.state.searchField,
          selectedCompanies: this.state.companies,
          selectPrimaryClassCode: this.state.primaryClassCode,
          selectSecondaryClassCode: this.state.secondaryClassCode,
          selectedRefrencePatentNumber: this.state.refrencePatentNumber,
        });
        // this.retrievedFilterHandler();
        prior_art_value = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.prior_art,
          generate_prior_art_data,
          this.apisTokens["priorArtData"].token
        );
        this.setState({ similarityApiStatus: false });
      }
      let prior_art = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_project_history,
        historyData
      );

      if (
        (prior_art_value && prior_art_value["status"] === "Error") ||
        prior_art?.response?.[0]?.is_error == "Error"
      ) {
        this.setState({
          serviceRetry: true,
          priorArtShortMessage: prior_art?.response?.[0]?.message,
          priorArtLongMessage: prior_art?.response?.[0]?.message_long,
        });

        this.updateFilterHandler(prior_art);
      } else {
        this.setState({ serviceRetry: false });
        this.showNotification("Prior Art Loaded");
        let filterDataName = `filterData${this.props.match?.params?.id}`;
        localStorage.removeItem(filterDataName);
      }

      this.updateFilterHandler(prior_art);

      this.setState({
        priorArtData: prior_art.response[0]["prior_art_analysis"],
      });
      if (this.apisTokens.projectHistory) {
        this.apisTokens["projectHistory"].cancel();
      }
      this.apisTokens["projectHistory"] = axios.CancelToken.source();

      // to get prior art from history section

      if (this.apisTokens.selectHistory) {
        this.apisTokens["selectHistory"].cancel();
      }
      this.apisTokens["selectHistory"] = axios.CancelToken.source();
      this.setState({ generatingPriorArt: false });
    } catch (e) {}
    this.setState({ isLoading: false, generatingPriorArt: false });
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

  retryHandler = (data) => {
    this.setState({ isLoading: true }, () =>
      this.regenrateHandler(data["invention_title"])
    );
  };

  loadMoreHandler = () => {
    this.setState(
      (prev) => ({ pageNumber: prev + 1 }),
      () => this.regenrateHandler(this.state.inputValDataBase)
    );
  };

  exportHandler = async (e, format) => {
    try {
      e.stopPropagation();
      const url_id = this.props.match?.params?.id;
      let countries = this.state.selectedCountries.map((data) => ({
        country: data,
      }));
      let exportPayload = {
        project_id: this.props.match?.params?.id,
        format: format,
        filters: {
          // application_date: this.state.applicationDate,
          // priority_date: this.state.priorityDate,
          // publication_date: this.state.publicationDate,
          selected_countries: countries,
          active: this.state.patentStatus,

          necessary_key_words: this.state.patentKeywords,
          ptype: this.state.publicationType,
          etsi: this.state.estiDeclared,
          red_by: this.state.reduceBy,
          search: this.state.searchField,
          company: this.state.companies,
          primary_class: this.state.primaryClassCode,
          secondary_class: this.state.secondaryClassCode,
          ref_pn: this.state.refrencePatentNumber,
        },
        page_num : this.state.pageCount
      };

      let selectedDateType = this.state.dateType;

      if (selectedDateType == "applicationDate") {
        exportPayload.filters.application_date = this.state.applicationDate;
      } else if (selectedDateType == "priorityDate") {
        exportPayload.filters.priority_date = this.state.priorityDate;
      } else if (selectedDateType == "publicationDate") {
        exportPayload.filters.publication_date = this.state.publicationDate;
      }

      let file = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.export_priorart,
        exportPayload,
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
      let filename = "IPAuthor - Prior Art -" + file_ + "...  " + ".docx";

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
      this.exportHandlerToggleHandler();
    } catch (e) {
      console.log(e);
    }
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

  patentKeywordsHandler = (keywords) => {
    this.setState({
      patentKeywords: keywords,
    });
  };

  publicationTypeHandler = (keywords) => {
    this.setState({
      publicationType: keywords,
    });
  };

  // Optimized state handler for various properties
  stateHandler = (key, value) => {
    this.setState({
      [key]: value,
    });
  };

  exportHandlerToggleHandler = () => {
    this.setState((pre) => ({
      isExportTypeOpen: !pre.isExportTypeOpen,
    }));
  };


  toggleAdvanceFilterHandler=()=>{
    this.setState((pre)=>({
      isAdvanceFilter : !pre.isAdvanceFilter
    }))
  }

  currentItems = (items)=>{
    this.setState({priorArtDataToShow : items })
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render() {
    const { priorArtData, serviceRetry, similarityApiStatus } = this.state;
    let isDraftClaimAccess = isAccess(
      this.props,
      "drafting_draft_claim"
    );
    let isPriorArtAccess = isAccess(
      this.props,
      "prior_art_explore"
    );
    let isPatentInfoAccess = isAccess(
      this.props,
      "prior_art_masked"
    );
 
    console.log(this.state.pageCount);

    return (
      <Container fluid>
        <Row>
          <Col className="title-header">
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
                <div className="div-element-for-header">
                  {this.state.inputValDataBase ? (
                    <p>{this.state.inputValDataBase}</p>
                  ) : (
                    <>
                      <SkeltonWrapper
                        padding={"0px 5px"}
                        background={"transparent"}
                        // skeltonHeight={"70.5px"}
                      />
                      <SkeltonWrapper
                        padding={"0px 5px"}
                        background={"transparent"}
                        // skeltonHeight={"70.5px"}
                      />
                      <SkeltonWrapper
                        padding={"0px 5px"}
                        background={"transparent"}
                        // skeltonHeight={"70.5px"}
                      />
                    </>
                  )}
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
            {!this.state.isLoading &&
              priorArtData &&
              priorArtData.length > 0 && (
                <div className={classes.exportPriorArt}>
                  <MyButton
                    text="Prior Art"
                    onClick={this.exportHandlerToggleHandler}
                    className={classes.exportCont}
                    leftImage={blue_icon}
                    leftImageClass="download_icon"
                    rightImage={down_arrow}
                    rightImageClass={classes.downloadButtonRightIcon}
                    id={"prior-art-download"}
                  >
                    {this.state.isExportTypeOpen && (
                      <Row
                        id="export-type-cont"
                        className={classes.exportTypeCont}
                      >
                       {isPatentInfoAccess && <Col
                          className={classes.exportTypeFormat}
                          onClick={(e) => this.exportHandler(e, "docx")}
                        >
                          <img
                            className={classes.downloadTypeBlueIcon}
                            src={download_thin}
                            alt="download-button"
                          />
                          <img
                            className={classes.downloadTypeWhiteIcon}
                            src={download_white}
                            alt="download-button"
                          />
                          <span>Docx</span>
                        </Col>}
                        <Col
                          className={classes.exportTypeFormat}
                          onClick={(e) => this.exportHandler(e, "masked_docx")}
                        >
                          <img
                            className={classes.downloadTypeBlueIcon}
                            src={download_thin}
                            alt="download-button"
                          />
                          <img
                            className={classes.downloadTypeWhiteIcon}
                            src={download_white}
                            alt="download-button"
                          />
                          <span>Masked Docx</span>
                        </Col>
                      </Row>
                    )}
                  </MyButton>
                </div>
              )}
          </Col>
        </Row>
        <Sticky  onStateChange={this.handleStickyStateChange} className = "prior-art-sticky-margin-top" enabled={true} top={0} bottomBoundary={0} innerZ = {1}>
        <Row  className={`options-section ${"this.state.isPageScrollTop" ? ' fixed-position-on-scroll justify-content-center align-items-center' : ""} `}>
          
          <Col>
            <Row>
              <Col className="os-ptions">
                {serviceRetry ? (
                  !this.state.isLoading && (
                    <>
                      <div></div>
                      <>
                        <div className="error-cont">
                          <span className={"cautionContent"}>
                            {" "}
                            <img className={"info"} src={info_orange} />
                            {this.state.priorArtShortMessage
                              ? this.state.priorArtShortMessage
                              : "We're sorry, but we couldn't create the prior art at this time. Please try again shortly."}
                            <span className={"overlayText"}>
                              {this.state.priorArtLongMessage
                                ? this.state.priorArtLongMessage
                                : "Failed to create piror art"}
                            </span>
                          </span>
                          <MyButton
                            className={`hs-version-num prompt-button regen-button p_retry retry-hover`}
                            onClick={() =>
                              this.retryHandler({
                                invention_title: this.state.inputValDataBase,
                              })
                            }
                            text={"Retry"}
                            rightImage={white_arrow}
                            rightImageClass="custom-right-icon"
                          />
                        </div>
                      </>
                    </>
                  )
                ) : (
                  <>
                    <div className="prior-art-filter-button-outer-cont">
                      <div
                        onClick={(e) => this.filtersToggleHandler(e)}
                        className="filter-icon-cont"
                        id="filter-toggal-button"
                      >
                        {" "}
                        <img
                          id="menu-button"
                          src={menuIcon}
                          alt="menuIcon"
                        />{" "}
                        <img
                          id="flask-button"
                          className="filter-icon-prior-art"
                          src={filterIcon}
                          alt="filterIcon"
                        />{" "}
                        <span className="prior-art-filter-header-heading" >Filter</span>

                        <PriorArtSelectedFilters
                        initialSelectedCountries = {this.state.initialSelectedCountries}
                        selectedPatentKeywords = {this.state.selectedPatentKeywords}
                        selectedCompanies = {this.state.selectedCompanies}
                        selectPrimaryClassCode = {this.state.selectPrimaryClassCode}
                        selectSecondaryClassCode = {this.state.selectSecondaryClassCode}
                        selectedRefrencePatentNumber = {this.state.selectedRefrencePatentNumber}
                        selectedPatentStatus = {this.state.selectedPatentStatus}
                        selectedPriorityDate = {this.state.selectedPriorityDate}
                        selectedApplicationDate = {this.state.selectedApplicationDate}
                        selectedPublicationDate = {this.state.selectedPublicationDate}
                        selectedPublicationType = {this.state.selectedPublicationType}
                        selectEstiDeclared = {this.state.selectEstiDeclared}
                        selectedReduceBy = {this.state.selectedReduceBy}
                        selectedSerachField = {this.state.selectedSerachField}

                        filtersToggleHandler = {this.filtersToggleHandler}
                        {...this.props}

                        />

                      </div>
                    </div>
                    <div className="prior-art-draft-claim-button-cont">
                      <>
                      { isPriorArtAccess && <MyButton
                          className="edit-invention"
                          onClick={() =>
                            priorArtData && priorArtData.length > 0
                              ? this.openPrompt()
                              : ""
                          }
                          text={"Modify Invention"}
                        />}
                       {isDraftClaimAccess && <MyButton
                          className="next-button pa-draft-claims"
                          onClick={this.genrateHandler}
                          text={"Draft Claims"}
                          rightImage={white_arrow}
                          rightImageClass={classes.genImage}
                        >
                          <span
                            onClick={(e) => this.languageHandler(e, "us")}
                            className={
                              this.state.patentLanguage == "us"
                                ? "home-selected-language-button"
                                : "home-language-button"
                            }
                            title="Select US patent style"
                          >
                            US
                          </span>
                          <span
                            onClick={(e) => this.languageHandler(e, "eu")}
                            className={
                              this.state.patentLanguage == "eu"
                                ? "home-selected-language-button"
                                : "home-language-button"
                            }
                            title="Select EU patent style"
                          >
                            EP
                          </span>
                        </MyButton>}
                      </>
                    </div>
                  </>
                )}
              </Col>
            </Row>
          </Col>
         
        </Row>
        </Sticky>
        {this.state.loading ? (
          <LoadingScreen />
        ) : (
          <Container
            fluid
            className={classes.main + " priorart-container-main priorart-container-main-scroll" + `${this.state.isPageScrollTop ? " priorart-container-main-scroll" : ""}`}
          >
            <Row className="prior-art-table-advance-filter-container" >
            {this.state.isFilter &&  <>
              {/* <Col xs ={3} lg={3}></Col> */}
              <div className= {`prior-art-advance-filters  ${this.state.isPageScrollTop ? " prior-art-advance-filters-scroll-up" : "" } `} >
                {
                  <CountryFilter
                    applicationDate={
                      this.state.selectedApplicationDate
                        ? this.state.selectedApplicationDate
                        : this.state.applicationDate
                    }
                    priorityDate={
                      this.state.selectedPriorityDate
                        ? this.state.selectedPriorityDate
                        : this.state.priorityDate
                    }
                    publicationDate={
                      this.state.selectedPublicationDate
                        ? this.state.selectedPublicationDate
                        : this.state.publicationDate
                    }
                    selectedCountries={
                      this.state.initialSelectedCountries
                        ? this.state.initialSelectedCountries
                        : this.state.selectedCountries
                    }
                    explorePriorArtHandler={this.explorePriorArtHandler}
                    {...this.props}
                    component={"priorArt"}
                    handleCountrySelector={this.handleCountrySelector}
                    handleDateChangeHandler={this.handleDateChangeHandler}
                    cancelFilterHandler={this.filtersToggleHandler}
                    selectedDateTypeHandler={this.dateTypeHandler}
                    patentKeywordsHandler={this.patentKeywordsHandler}
                    stateHandler={this.stateHandler}
                    dateType={
                      this.state.selectedDateType
                        ? this.state.selectedDateType
                        : this.state.dateType
                    }
                    patentStatus={
                      this.state.selectedPatentStatus
                        ? this.state.selectedPatentStatus
                        : this.state.patentStatus
                    }
                    patentKeywords={
                      this.state.selectedPatentKeywords
                        ? this.state.selectedPatentKeywords
                        : this.state.patentKeywords
                    }
                    publicationType={
                      this.state.selectedPublicationType
                        ? this.state.selectedPublicationType
                        : this.state.publicationType
                    }
                    estiDeclared={
                      this.state.selectEstiDeclared
                        ? this.state.selectEstiDeclared
                        : this.state.estiDeclared
                    }
                    reduceBy={
                      this.state.selectedReduceBy
                        ? this.state.selectedReduceBy
                        : this.state.reduceBy
                    }
                    searchField={
                      this.state.selectedSerachField
                        ? this.state.selectedSerachField
                        : this.state.searchField
                    }
                    companies={
                      this.state.selectedCompanies
                        ? this.state.selectedCompanies
                        : this.state.companies
                    }
                    primaryClassCode={
                      this.state.selectPrimaryClassCode
                        ? this.state.selectPrimaryClassCode
                        : this.state.primaryClassCode
                    }
                    secondaryClassCode={
                      this.state.selectSecondaryClassCode
                        ? this.state.selectSecondaryClassCode
                        : this.state.secondaryClassCode
                    }
                    refrencePatentNumber={
                      this.state.selectedRefrencePatentNumber
                        ? this.state.selectedRefrencePatentNumber
                        : this.state.refrencePatentNumber
                    }
                    isPageScrollTop = {this.state.isPageScrollTop} 
                  />
                }
              </div>
              </>}
              <Col>
                <div className="prior-art-toggle-button-seprator" >
                  {/* <div onClick={()=> this.toggleAdvanceFilterHandler()} className={`prior-art-toggle-button-container ${!this.state.moveArrowIcon ? ' prior-art-toggle-button-container-fixed' : "" } `} ><img className="prior-art-filter-toggle-arrow" src={ this.state.isAdvanceFilter ? blueArrowLeft : blueArrowRight} /></div> */}
                  <div>
                    {!this.state.isLoading && (
                      <div
                        className={`${
                          classes.invenctionSummary
                        } prior_art_summary ${
                          !priorArtData || priorArtData.length == 0
                            ? "no_prior_art"
                            : ""
                        }`}
                      >
                        {priorArtData &&
                        priorArtData.length > 0 &&
                        !serviceRetry ? (
                          <>
                            <span className="novelty_header">Novelty:</span>
                            <span>
                              <p className="novelity-detail-paragraph" >
                              {priorArtData[0]["invention_summary"]}
                              </p>
                              </span>
                          </>
                        ) : (
                          !similarityApiStatus &&
                          priorArtData !== null &&
                          priorArtData.length == 0 &&
                          !serviceRetry && (
                            <div className={classes.noPriorArtCont}>
                              <img src={default_image} alt="No prior art" />
                              <span className="no_data">
                                No prior art was found for your invention.
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <Container />
                    <div className={classes.right}>
                      {this.state.generatingPriorArt ? (
                        <Row className="each-priorart-patent">
                          <CountdownTimer
                            targetDate={
                              this.props.project.expectedTimeout.prior_art
                            }
                            sectionType={"PriorArt"}
                          />
                        </Row>
                      ) : this.state.isLoading ? (
                        <>
                       <PriorArtSkelton/>
                       </>
 
                      ) : !serviceRetry ? (
                        <Container
                          fluid
                          className={`${classes.container} results_container`}
                        >
                          <Row></Row>
                          {this.state.priorArtDataToShow?.map((data, index) => {
                            return (
                             <PriorArtDetails data = {data} index = {index}  isPatentInfoAccess = {isPatentInfoAccess} selectedDateType = {this.state.selectedDateType} />
                            );
                          })}
                           
                          <Pagination items = {priorArtData} itemsPerPage = {5} currentItemsHandler = {this.currentItems} pageCountHandler = {this.stateHandler} />
                        </Container>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        )}

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
        <>
          <Modal
            isOpen={this.state.isCountryDorpDown}
            onClose={this.toggleCountryModal}
          >
            <CountrySelector
              {...this.props}
              selectedCountries={this.state.selectedCountries}
              searchTerm={this.state.searchTerm}
              handleCheckboxChange={this.handleCheckboxChange}
              handleSearchChange={this.handleSearchChange}
              onClose={this.toggleCountryModal}
              handleSelectAllChange={this.handleSelectAllChange}
              selectAll={this.state.selectAll}
            />
          </Modal>
        </>
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

export default connect(mapStateToProps, mapDispatchToProps)(PriorArtTable);