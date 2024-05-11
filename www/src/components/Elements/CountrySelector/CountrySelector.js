import React, { Component } from 'react';
import './CountrySelector.scss';
import cancelIcon from "../../assets/icons/close.svg"

class CountrySelector extends Component {
constructor(props) {
    super(props);

    this.state = {
      selectedCountries: [],
      searchTerm: '',
    };
  }

  handleCheckboxChange = (countryId) => {
    this.setState((prevState) => {
      const selectedCountries = prevState.selectedCountries.includes(countryId)
        ? prevState.selectedCountries.filter((id) => id !== countryId)
        : [...prevState.selectedCountries, countryId];

      return { selectedCountries };
    });
  };

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  render() {
    const { selectedCountries, searchTerm } = this.props;
    const { countries } = this.props.project ;

    const filteredCountries = countries.filter((country) =>
      country.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // console.log("FILTER==>",selectedCountries, searchTerm, filteredCountries)

    return (
      <div className='country-selector-container' >
        <div className='country-search-input-cont' >
        <input
        className='country-search-input'
          type="text"
          placeholder="Search countries..."
          value={searchTerm}
          onChange={ (e)=> this.props.handleSearchChange(e)}
        />
        <div className='country-select-all-cont' >
        <label>
          <input
            type="checkbox"
            checked={this.props.selectAll}
            onChange={this.props.handleSelectAllChange}
          />
          Select All
        </label>
        <span onClick={this.props.onClose} ><img className='countary-modal-cancel-button' src={cancelIcon} alt='cancel'  /></span>
        </div>
       
        </div>
        <div className='grid-outer-container' >
        <div className="country-grid">
          {filteredCountries.map((country) => (
            <label key={country.id}>
              <input
                className='country-check-box-input'
                type="checkbox"
                value={country.value}
                checked={selectedCountries.includes(country.id)}
                onChange={(e) => this.props.handleCheckboxChange(country.id)}
              />
              {country.label}
            </label>
          ))}
        </div>
        </div>
       
       
      </div>
    );
  }
}

export default CountrySelector