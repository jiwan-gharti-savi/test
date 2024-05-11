import React, { Component } from 'react';
import './DateTypeDropdown.css';
import PropTypes from 'prop-types';
import downArrow from "../../../components/assets/icons/arrow-down.svg"

class DateTypeDropdown extends Component {
  constructor(props) {
    super(props);

    const{
      selectedValue
    } = props;

    this.state = {
      isOpen: false,
      selectedValue
    };

    DateTypeDropdown.defaultProps = {
      selectedValue: "",
    }

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleOptionClick = this.handleOptionClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedValue !== this.props.selectedValue) {
      this.setState({ selectedValue: this.props.selectedValue });
    }
  }

  toggleDropdown() {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  }

  handleOptionClick(value) {
    this.setState({
      selectedValue: value,
      isOpen: false,
    });
    this.props.dateTypeHandler(value);
  }

  render() {
    const { isOpen, selectedValue } = this.state;
    return (
      <div className="custom-dropdown-container">
        <div
          className = {`custom-dropdown-header ${this.props?.page === "home" ? " border-for-home-page-filter" : ""}`} 
          onClick={() => {
            if (true) {
              this.toggleDropdown();
            }
          }}
        >
          {this.props.options.find((option) => option.value === selectedValue)?.label || this.props.dropdownHeading}
          <span className={`arrow ${isOpen ? 'open' : ''}`}><img src={downArrow} alt="arrow" /></span>
        </div>

        {isOpen && (
          <div className="custom-dropdown-options">
            {this.props.options.map((option) => (
              <div
                key={option.value}
                className="date-type-custom-option"
                onClick={() => this.handleOptionClick(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
}

DateTypeDropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedValue: PropTypes.string,
  onDateTypeChange: PropTypes.func.isRequired,
};

export default DateTypeDropdown;
