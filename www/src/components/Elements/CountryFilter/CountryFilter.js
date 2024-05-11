import React, { Component } from "react";
import "./CountryFilter.scss";
import DatePicker from "react-datepicker";
import DateTypeDropdown from "../DropDown/DateTypeDropdown";
import CountrySelector from "../CountrySelector/CountrySelector";
import CountryDorpDown from "../../Container/Home/Dropdown";
import right_arrow_icon from "../../assets/icons/arrow_submit.svg";
import closeIcon from "../../assets/icons/close2.svg";
import Modal from "../../Container/ImageViewer/Modal";
import { Col, Row, Container } from "reactstrap";
import FilterSection from "./FilterSection";
import filterIcon from "../../assets/icons/filterWhite.svg";


export default class CountryFilter extends Component {
  constructor(props) {
    super(props);
    const {
      selectedCountries,
      applicationDate,
      publicationDate,
      priorityDate,
      dateType,
      patentStatus,
      patentKeywords,
      publicationType,
      estiDeclared,
      reduceBy,
      searchField,
      companies,
      primaryClassCode,
      secondaryClassCode,
      refrencePatentNumber
    } = props;

    this.state = {
      selectedCountries,
      searchTerm: "",
      selectAll: false,
      applicationDate,
      publicationDate,
      priorityDate,
      isCountryDorpDown: false,
      dateType,
      patentStatus,
      patentKeywords,
      publicationType,
      estiDeclared,
      reduceBy,
      searchField,
      companies,
      primaryClassCode,
      secondaryClassCode,
      refrencePatentNumber,

      companyTextareaHeight: '40px',
      primaryClassCodeTextareaHeight: '40px',
      refrencePatentNumberTextareaHeight: '40px',
      necessaryKeywordsTextareaHeight: '40px',
    };

    // Define default props
    CountryFilter.defaultProps = {
      selectedCountries: [],
      applicationDate: null,
      publicationDate: null,
      priorityDate: null,
      dateType: "",
      patentStatus: "",
      patentKeywords: "",
      publicationType : "",
      estiDeclared :"",
      reduceBy : "",
      searchField : "",
      companies : "",
      primaryClassCode : "",
      secondaryClassCode : "",
      refrencePatentNumber : ""
    };

    // Define default props
    CountryFilter.defaultProps = {
      selectedCountries: [],
      applicationDate: null,
      publicationDate: null,
      priorityDate: null,
      dateType: "",
      patentStatus: "",
      patentKeywords: ""
      };
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (
      prevState.applicationDate !== this.state.applicationDate ||
      prevState.publicationDate !== this.state.publicationDate ||
      prevState.priorityDate !== this.state.priorityDate
    ) {
      if (this.props?.handleDateChangeHandler) {
        this.props.handleDateChangeHandler(
          this.state.applicationDate,
          this.state.publicationDate,
          this.state.priorityDate
        );
      }
    }
  };

  handleCheckboxChange = (countryId) => {
    this.setState(
      (prevState) => {
        const selectedCountries = prevState.selectedCountries?.includes(
          countryId
        )
          ? prevState.selectedCountries?.filter((id) => id !== countryId)
          : [...prevState.selectedCountries, countryId];

        return { selectedCountries };
      },
      () => {
        let countries = this.state.selectedCountries.map((data) => ({
          country: data,
        }));
        this.setState({ formattedSelectedCountries: countries });
        if (this.props?.handleCountrySelector) {
          this.props?.handleCountrySelector(this.state.selectedCountries);
        }
      }
    );
  };

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  dateChangeHandler = (date, type) => {
    switch (type) {
      case "applicationDate":
        this.setState({
          applicationDate: date,
        });
        break;
      case "priorityDate":
        this.setState({
          priorityDate: date,
        });
        break;
      case "publicationDate":
        this.setState({
          publicationDate: date,
        });
      default:
        break;
    }
  };

  toggleCountryModal = () => {
    this.setState({ isCountryDorpDown: !this.state.isCountryDorpDown });
  };

  handleSelectAllChange = () => {
    this.setState((prevState) => ({
      selectAll: !prevState.selectAll,
      selectedCountries: prevState.selectAll
        ? []
        : this.props?.project?.countries &&
          this.props?.project?.countries.map((country) => country.id),
    }));
  };

  dateTypeHandler = (date) => {
    this.setState({ dateType: date });
    if (this.props?.selectedDateTypeHandler) {
      this.props.selectedDateTypeHandler(date);
    }
  };



  explorePriorArt = () => {
    if (this.props.type === 'inventionDisclosure'){
      this.props.updateDisclosureHandler(
        this.state.formattedSelectedCountries,
      this.state.dateType,
      this.state.applicationDate,
      this.state.priorityDate,
      this.state.publicationDate
      )
    }else{
      this.props.explorePriorArtHandler(
        this.state.formattedSelectedCountries,
        this.state.dateType,
        this.state.applicationDate,
        this.state.priorityDate,
        this.state.publicationDate
      );
    }
   
  };

  cancelFilterHandler = () => {
    this.props.cancelFilterHandler();
  };

  clearFilterHandler = () => {
    const stateNames = ['patentStatus', 'publicationType', 'estiDeclared', 'reduceBy', 'searchField', 'companies', 'primaryClassCode', 'secondaryClassCode', 'refrencePatentNumber'];
    this.setState(
      {
        selectedCountries: [],
        applicationDate: null,
        publicationDate: null,
        priorityDate: null,
        dateType: "",
        patentStatus: "",
        patentKeywords: "",
        publicationType : "",
        estiDeclared :"",
        reduceBy : "",
        searchField : "",
        companies : [],
        primaryClassCode : "",
        secondaryClassCode : "",
        refrencePatentNumber : "",
        companyTextareaHeight: '40.1px',
        primaryClassCodeTextareaHeight: '40.1px',
        refrencePatentNumberTextareaHeight: '40.1px',
        necessaryKeywordsTextareaHeight: '40.1px',
        patentKeywords: "",
        textareaHeight : "40px",
      },
      () => {
        if (this.props?.handleCountrySelector) {
          this.props.handleCountrySelector([]);
        }
        if (this.props?.selectedDateTypeHandler) {
          this.props?.selectedDateTypeHandler("");
        }
        if (this.props?.patentStatusHandler) {
          this.props?.patentStatusHandler("");
        }
        if (this.props?.patentKeywordsHandler) {
          this.props?.patentKeywordsHandler("");
        }

        for (const stateName of stateNames) {
          this.props.stateHandler(stateName, '');
        }
      }
    );
    localStorage.removeItem("filterData");
  };

  // handleTextareaResize = (event) => {
  //   // Update the height when the textarea is resized
  //   const textareaName = event.target.name + 'TextareaHeight';
  //   console.log("textareaName",textareaName,this.state.textareaName);
  //   this.setState({
  //     [textareaName]: `${Math.max(40, event.target.scrollHeight)}px`,
  //   });
  // };

  handleTextareaResize = (event) => {
    // Update the height when the textarea is resized
    this.setState({
      textareaHeight: `${Math.max(10, event.target.scrollHeight)}px`,
    });
  };

  patentStatusHandler = (status) => {
    this.setState({ patentStatus: status });
    this.props.stateHandler('patentStatus', status);
  };

  publicationStatusHandler = (status) => {
    this.setState({ publicationType: status });
    this.props.stateHandler('publicationType', status);
  };

  etsiHandler = (status) => {
    this.setState({ estiDeclared: status });
    this.props.stateHandler('estiDeclared', status);
  };
  reducedHandler = (status) => {
    this.setState({ reduceBy: status });
    this.props.stateHandler('reduceBy', status);
  };
  searchFiledHandler = (status) => {
    this.setState({ searchField: status });
    this.props.stateHandler('searchField', status);
  };

  companyInputKeywordsHandler = (value) =>{
    this.setState({ companies: value });
    this.props.stateHandler('companies', value);
  };

  pcsFormatIgnoreCompamiesInputKeywordsHandler = (value) => {
    this.setState({ primaryClassCode: value });
    this.props.stateHandler('primaryClassCode',value);
  };

  pcsFormatIgnoreCompamiesSecondaryInputKeywordsHandler = (value) => {
    this.setState({ secondaryClassCode: value });
    this.props.stateHandler('secondaryClassCode',value);
  };
  referenceInputKeywordsHandler = (value) => {
    this.setState({ refrencePatentNumber: value });
    this.props.stateHandler('refrencePatentNumber', value);
  };

  inputKeywordsHandler = (event) => {
    event.stopPropagation();
    this.setState({ patentKeywords: event.target.value });
    this.props.patentKeywordsHandler( event.target.value);
  };

  render() {
    let selectedDate;
    if (this.state.dateType == "applicationDate") {
      selectedDate = this.state.applicationDate;
    } else if (this.state.dateType == "priorityDate") {
      selectedDate = this.state.priorityDate;
    } else if (this.state.dateType == "publicationDate") {
      selectedDate = this.state.publicationDate;
    } else {
      selectedDate = null;
    }

    if (typeof selectedDate !== "object" || selectedDate == "Invalid Date") {
      selectedDate = null;
    } else {
      selectedDate = selectedDate;
    }

    const dateTypeOptions = [
      { label: "Application Date", value: "applicationDate" },
      { label: "Priority Date", value: "priorityDate" },
      { label: "Publication Date", value: "publicationDate" },
    ];

    const patentStatusOptions = [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ];

    const publicationType = [
      { label: "Published", value: "published" },
      { label: "Granted", value: "granted" },
    ];

    const ESTI = [
      { label: "True", value: "true" },
      { label: "False", value: "false" },
    ];

    const ReduceBy = [
      { label: "Simple Family", value: "simple family" },
      { label: "Extended Family", value: "extended family" },
    ];

    const SearchField = [
      { label: "TAC", value: "tac" },
      { label: "Full Spec", value: "full spec" },
    ];
    
    console.log("companies==>",this.state.companies);
    console.log("companiesProp==>",this.props.companies);



    return (
      <Container className="country-filter-outer-container-o" fluid>
        <div
          className={`filter-pop-up-cont ${
            this.props?.component == "priorArt"
              ? " filter-pop-up-cont-prioArt-o"
              : this.props?.page === "home" ? "  filter-pop-up-cont-prioArt-for-border-radius" :""
          }`}
          id="country-filter"
          style={this.props.style}
        >
          <div
            className= {` ${this.props?.page === "home" ?  "country-filter-cancel-button" : "country-filter-cancel-button-for-prior-art" }`}
            onClick={() => this.cancelFilterHandler()}
          >
           {this.props?.page !== "home" && <span className="refine-filter" > <img src={filterIcon} alt="filter" />   <p>REFINE</p> </span>}
            <img src={closeIcon} alt="close" />
            
          </div>
          <Row className= {`filter-pop-up-inner-cont ${this.props?.page === "home" ? "" : this.props?.isPageScrollTop ? " filter-pop-up-inner-cont-fixed-dimensions-scrolled-top" : " filter-pop-up-inner-cont-fixed-dimensions"}`}>
            <Col lg={12} className="mt-3">
              <Row className="section-min-max-width">
                <div className="filter-title"><span className="filter-main-headings-color" >Date</span></div>
              </Row>
              <Row className= {`gap-3 ${this.props?.page === "home" ? "" : " country-filters-background"}`} >
                <Col className="">
                  <DateTypeDropdown
                    {...this.props}
                    options={dateTypeOptions}
                    dateTypeHandler={this.dateTypeHandler}
                    selectedValue={this.state.dateType}
                    dropdownHeading={"Select Date"}
                  />{" "}
                </Col>
                <Col className = {`section-min-max-width ${this.props?.page === "home" ? " filter-pop-up-cont-prioArt-for-border-radius" :""}`} >
                  <DatePicker
                    selected={selectedDate}
                    onChange={(date) =>
                      this.dateChangeHandler(date, this.state.dateType)
                    }
                    placeholderText="YYYY-MM-DD"
                    dateFormat="yyyy-MM-dd"
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                </Col>
              </Row>
            </Col>

            <Col className="mt-3 section-min-max-width"  lg={this.props?.page === "home" ? 0 : 12} >
              <Row>
                <div className="filter-title"><span className="filter-main-headings-color" >Country</span></div>
              </Row>
              <Row className= {`${this.props?.page === "home" ? "" : " country-filters-background"}`} >
                <CountryDorpDown
                  selectedCountriesList={this.state.selectedCountries}
                  searchTerm={this.state.searchTerm}
                  handleCheckboxChange={this.handleCheckboxChange}
                  handleSearchChange={this.handleSearchChange}
                  {...this.props}
                  modalHandler={this.toggleCountryModal}
                />
              </Row>
            </Col>

           {this.props?.page != "home" &&  <Col className="mt-3 section-min-max-width" lg={6}>
            <Row>
                <div className="filter-title">
                  {" "}
                  <span  className="filter-main-headings-color" >Patent</span>
                </div>
              </Row>
              </Col>}
              <div className= {`${this.props?.page === "home" ? "flex-for-patent-filter-home-page" : " country-filters-background"}`} >
            <Col className="mt-3 section-min-max-width" >
              <Row>
                <div className="filter-title">
                  {" "}
                  <span  className= {`${this.props?.page === "home" ? "filter-main-headings-color" : ""}`} >Patent status</span>
                </div>
              </Row>
              <Row>
                <DateTypeDropdown
                  {...this.props}
                  options={patentStatusOptions}
                  dateTypeHandler={this.patentStatusHandler}
                  selectedValue={this.state.patentStatus}
                  dropdownHeading={"Select status"}
                  dropDownType="patentStatus"
                />{" "}
              </Row>
            </Col>

            <Col className=  {`mt-3 section-min-max-width ${ this.props?.page === "home" ? " hide-filter" : ""}`}>
              <Row>
                <div className="filter-title">
                  {" "}
                  <span>Publication Type</span>
                </div>
              </Row>
              <Row>
                <DateTypeDropdown
                  {...this.props}
                  options={publicationType}
                  dateTypeHandler={this.publicationStatusHandler}
                  selectedValue={this.state.publicationType}
                  dropdownHeading={"Select publication"}
                  dropDownType="publicationStatus"
                />{" "}
              </Row>
            </Col>

            <Col className=  {`mt-3 section-min-max-width ${ this.props?.page === "home" ? " hide-filter" : ""}`}>
              <Row>
                <div className="filter-title">
                  {" "}
                  <span>ETSI declared</span>
                </div>
              </Row>
              <Row>
                <DateTypeDropdown
                  {...this.props}
                  options={ESTI}
                  dateTypeHandler={this.etsiHandler}
                  selectedValue={this.state.estiDeclared}
                  dropdownHeading={"Select ETSI"}
                  dropDownType="ETSIdeclared"
                />{" "}
              </Row>
            </Col>

            <Col className=  {`mt-3 section-min-max-width ${ this.props?.page === "home" ? " hide-filter" : ""}`}>
              <Row>
                <div className="filter-title">
                  {" "}
                  <span>Reduce by</span>
                </div>
              </Row>
              <Row>
                <DateTypeDropdown
                  {...this.props}
                  options={ReduceBy}
                  dateTypeHandler={this.reducedHandler}
                  selectedValue={this.state.reduceBy}
                  dropdownHeading={"Select reduced"}
                  dropDownType="ReduceBy"
                />{" "}
              </Row>
            </Col>

            <Col className=  {`mt-3 section-min-max-width ${ this.props?.page === "home" ? " hide-filter" : ""}`}>
              <Row>
                <div className="filter-title">
                  {" "}
                  <span>Search Field</span>
                </div>
              </Row>
              <Row>
                <DateTypeDropdown
                  {...this.props}
                  options={SearchField}
                  dateTypeHandler={this.searchFiledHandler}
                  selectedValue={this.state.searchField}
                  dropdownHeading={"Select search filed"}
                  dropDownType="SearchField"
                />{" "}
              </Row>
            </Col>
            </div>
  
            <FilterSection
              title="Companies"
              name="companies"
              placeholder="Enter companies"
              page={this.props.page}
              {...this.props}
              value = {this.state.companies}
              inputChangeHandler = {this.companyInputKeywordsHandler}
            />


            <FilterSection
              title="Primary class code"
              name="primary_class"
              placeholder="Enter primary class code"
              page={this.props.page}
              {...this.props}
              value = {this.state.primaryClassCode}
              inputChangeHandler = {this.pcsFormatIgnoreCompamiesInputKeywordsHandler}
            />
            <FilterSection
              title="Secondary class code"
              name="secondary_class"
              placeholder="Secondary class code"
              page={this.props.page}
              {...this.props}
              value = {this.state.secondaryClassCode}
              inputChangeHandler = {this.pcsFormatIgnoreCompamiesSecondaryInputKeywordsHandler}
            />


              <FilterSection
              title="Reference Patent Number"
              name="refrence_patent_number"
              placeholder="Enter reference patent number"
              instruction= "Patents mentioned here along with its family members and citations wouldn't show up in search. Patent numbers have to be pipe separated."
              page={this.props.page}
              {...this.props}
              value = {this.state.refrencePatentNumber}
              inputChangeHandler = {this.referenceInputKeywordsHandler}
            />

            <Col lg={12} className={`mt-3 ${this.props?.page === 'home' ? ' hide-filter' : ""}`} >
              <Row>
                <div className="filter-title">
                  <span className="filter-main-headings-color" >Necessary Keywords</span>
                  <span className="filter-instruction-span" >{"Terms to be included in search. Do not use proximity/wild cards/sentences etc here. Use key words as input that you definitely need. Terms in parenthesis go as an OR and the remaining go as an AND. Ex. (a,b),c -> (a OR b) AND c"}</span>
                </div>
              </Row>
              <Row className="country-filters-background country-filters-background-text-box-padding"  >
                <textarea
                  onInput={this.handleTextareaResize}
                  style={{
                    height: this.state.textareaHeight,
                    resize: "revert-layer",
                  }}
                  onChange={this.inputKeywordsHandler}
                  className="country-filter-textarea"
                  value = {this.state.patentKeywords}
                  placeholder="(a,b),c"
                />
              </Row>
            </Col>   

          </Row>
          <Row>
            <Col className= {`country-filter-buttons mt-2 ${this.props?.page === 'home' ? "" : ' country-filter-buttons-top-border' }`} >
              <button
                className="filter-div-width edit-invention explore-prior-art-filter-button"
                onClick={() => this.clearFilterHandler()}
              >
                Clear{" "}
              </button>

              <button
                className="filter-div-width create-button explore-prior-art explore-prior-art-button explore-prior-art-filter-button"
                onClick={() => this.explorePriorArt("prior_art")}
              >
                Explore{" "}
                <span className="arrow-block">
                  <img
                    src={right_arrow_icon}
                    className="right_arrow_icon"
                    alt="arrow-icon"
                  />
                </span>
              </button>
            </Col>
          </Row>

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
        </div>
      </Container>
    );
  }
}
