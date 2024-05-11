import React, { Component } from 'react';
import apiServices from '../../../services/apiServices';
// import AsyncSelect from 'react-select/async';
import CreatableAsyncSelect from 'react-select/async-creatable'; // Correct import

import { Col, Row, Container } from "reactstrap";
import './autosuggest.css'


class FilterSection extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedOptions: [],
      menuPlacement: 'bottom',
    };
    this.selectRef = React.createRef();
  }

  componentDidUpdate =(prevProps)=> {
    if(prevProps.value !== this.props.value){
      const valueArray = this.props.value && this.props.value.length > 0 ? this.props.value.split("|").map(value => ({
        value: value,
        label: value
      })) : [];
      this.setState({ selectedOptions: valueArray });
    }

  }
  

  componentDidMount() {
    const valueArray = this.props.value && this.props.value.length > 0 ? this.props.value.split("|").map(value => ({
      value: value,
      label: value
    })) : [];

    this.setState({ selectedOptions: valueArray });
    window.addEventListener('resize', this.updateMenuPlacement);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateMenuPlacement);
  }


  updateMenuPlacement = () => {
    if (!this.selectRef.current) return;
    const selectRect = this.selectRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - selectRect.bottom;
    const spaceAbove = selectRect.top;
    const menuHeightEstimate = 300; // Adjust based on your dropdown's size

    if (spaceBelow < menuHeightEstimate && spaceAbove > spaceBelow) {
      this.setState({ menuPlacement: 'top' });
    } else {
      this.setState({ menuPlacement: 'bottom' });
    }
  }


  // Function to load options from the API
  loadOptions = async (inputValue) => {
    try {
      const response = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.priorart_auto_complete,
        {
          project_id: this.props.match?.params?.id,
          input_search_keywords: inputValue, // Adjust based on your API's requirements
          input_section: this.props.name,
        }
      );

      // Assuming the API returns an array of options in the format [{ name: 'Option1' }, { name: 'Option2' }]
      // We map it to the format required by react-select: [{ value: 'Option1', label: 'Option1' }, ...]
      const options = response?.response?.[this.props.name]?.map(option => ({
        value: option?.value ? option?.value :"", // Adjust if your data format is different
        label: option?.display ? option?.display : "",
      }));

      return options;
    } catch (error) {
      console.error('Error fetching options:', error);
      return [];
    }
  };

  handleChange = (selectedOptions) => {
    console.log("selectedOptions==>",selectedOptions);
    this.setState({ selectedOptions });
    // Perform any additional actions with the selected options

    const concatenatedString = selectedOptions.map(item => item.value).join(" | ");
    this.props.inputChangeHandler(concatenatedString);
  };

  handleCreate = (inputValue) => {
    // Function to handle the creation of a new option
    this.setState(prevState => ({
      selectedOptions: [...prevState.selectedOptions, { value: inputValue, label: inputValue }]
    }));
    const updatedOptions = [...this.state.selectedOptions, { value: inputValue, label: inputValue }];
    const concatenatedString = updatedOptions.map(item => item.value).join(" | ");
    this.props.inputChangeHandler(concatenatedString);
  };


  render() {
    const { selectedOptions, menuPlacement } = this.state;
    const hideFilters = this.props.page === "home" && !(this.props.name === 'primary_class' || this.props.name === 'secondary_class');
    const manualwidth = this.props.page === "home" && (this.props.name === 'primary_class' || this.props.name === 'secondary_class');

    return (
      <Col
      lg={12}
      className={`mt-3 ${(hideFilters) ? " hide-filter" : manualwidth ? " filter-width-in-home-page" : " "}`}
    >
      <Row>
      <div className="filter-title">
            <span className="filter-main-headings-color">{this.props.title}</span>
            {this.props.instruction && (
              <span className="filter-instruction-span">
                {this.props.instruction}
              </span>
            )}
          </div>
      </Row>
      <Row className="country-filters-background country-filters-background-text-box-padding" >
      <div ref={this.selectRef} onFocus={this.updateMenuPlacement} className="filter-section">
        <CreatableAsyncSelect
          isMulti
          cacheOptions
          defaultOptions
          loadOptions={this.loadOptions}
          value={selectedOptions}
          onChange={this.handleChange}
          placeholder={this.props.placeholder + "   "|| 'Select...'}
          menuPlacement={menuPlacement}
          menuPosition="fixed"
          theme={(theme) => ({
            ...theme,
            borderRadius: '10px',
            minHeight : '40px',
            border : "none"
          })}
          onCreateOption={this.handleCreate} // Handle new option creation
          allowCreateWhileLoading={true} // Allow creating new options even while loading options
              formatCreateLabel={(inputValue) => `"${inputValue}"`} // Customize the label for creating a new option
        />
      </div>
      </Row>
      </Col>
    );
  }
}

export default FilterSection;
