import React, { Component } from 'react';

export default class PriorArtSelectedFilters extends Component {
  truncatedString = (originalString, maxLength) => {
    return originalString.length > maxLength
      ? originalString.substring(0, maxLength) + '...'
      : originalString;
  };

  convert = (str) => {
    const date = new Date(str),
          mnth = (`0${date.getMonth() + 1}`).slice(-2),
          day = (`0${date.getDate()}`).slice(-2);
    return [date.getFullYear(), mnth, day].join('-');
  };

  renderSections = () => {
    let sections = [];

    // Country Section
    if (this.props.initialSelectedCountries && this.props.initialSelectedCountries.length > 0) {
      const maxElementsToShow = 2;
      let resultCountries = this.props.initialSelectedCountries.slice(0, maxElementsToShow).join(", ");
      if (this.props.initialSelectedCountries.length > maxElementsToShow) {
        resultCountries += "...";
      }
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)} id="filtered-items">
          <span>Country: </span>
          <span className="selected-filter">{resultCountries.toUpperCase()}</span>
        </div>
      );
    }

    // Patent Status Section
    if (this.props.selectedPatentStatus) {
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
          <span>Patent status: </span>
          <span className="selected-filter">{this.props.selectedPatentStatus}</span>
        </div>
      );
    }

    // Dates Section (Priority, Application, Publication)
    ['selectedPriorityDate', 'selectedApplicationDate', 'selectedPublicationDate'].forEach(dateType => {
      if (this.props[dateType]) {
        const label = dateType.replace('selected', '').replace('Date', ' Date');
        sections.push(
          <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
            <span>{label}: </span>
            <span className="selected-filter">{this.convert(this.props[dateType])}</span>
          </div>
        );
      }
    });

    // Keywords Section
    if (this.props.selectedPatentKeywords) {
      const truncatedKeywords = this.truncatedString(this.props.selectedPatentKeywords, 20);
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
          <span>Keywords: </span>
          <span className="selected-filter">{truncatedKeywords}</span>
        </div>
      );
    }

    // Publication Type Section
    if (this.props.selectedPublicationType) {
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
          <span>Publication type: </span>
          <span className="selected-filter">{this.props.selectedPublicationType}</span>
        </div>
      );
    }

    // Additional sections (ESTI, Reduce by, Search Field, Companies, Primary Class Code, Reference Patent Number)
    if (this.props.selectEstiDeclared) {
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
          <span>ESTI: </span>
          <span className="selected-filter">{this.props.selectEstiDeclared}</span>
        </div>
      );
    }

    if (this.props.selectedReduceBy) {
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
          <span>Reduce by: </span>
          <span className="selected-filter">{this.props.selectedReduceBy}</span>
        </div>
      );
    }

    if (this.props.selectedSerachField) {
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
          <span>Search Field: </span>
          <span className="selected-filter">{this.props.selectedSerachField}</span>
        </div>
      );
    }

    if (this.props.selectedCompanies) {
      const companies = this.truncatedString(this.props.selectedCompanies, 20);
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
          <span>Companies: </span>
          <span className="selected-filter">{companies}</span>
        </div>
      );
    }

    if (this.props.selectPrimaryClassCode) {
      const primaryClassCode = this.truncatedString(this.props.selectPrimaryClassCode, 20).replace(' | ', ', ');
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
          <span>Primary class code: </span>
          <span className="selected-filter">{primaryClassCode}</span>
        </div>
      );
    }

    if (this.props.selectSecondaryClassCode) {
      const secondaryClassCode = this.truncatedString(this.props.selectSecondaryClassCode, 20).replace(' | ', ', ');
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
          <span>Secondary class code: </span>
          <span className="selected-filter">{secondaryClassCode}</span>
        </div>
      );
    }

    if (this.props.selectedRefrencePatentNumber) {
      const referencePatentNumber = this.truncatedString(this.props.selectedRefrencePatentNumber, 20);
      sections.push(
        <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
          <span>Reference patent number: </span>
          <span className="selected-filter">{referencePatentNumber}</span>
        </div>
      );
    }

    return sections;
  };

  render() {
    const sections = this.renderSections();
    const sectionsToShow = sections.slice(0, 5);
    const showMoreButton = sections.length > 5;

    return (
      <>
        {sectionsToShow}
        {showMoreButton && (
         <div className="filtered-items" onClick={(e) => this.props.filtersToggleHandler(e)}>
         <span className="selected-filter">more..</span>
       </div>
        )}
      </>
    );
  }
}
