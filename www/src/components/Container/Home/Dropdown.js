import React, { Component } from 'react';
import './Dropdown.css'; // Import the external CSS file
import downArrow from "../../../components/assets/icons/arrow-down.svg"




class Dropdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      selectedValue: 'Language',
    };

    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleOptionClick = this.handleOptionClick.bind(this);
  }


  componentDidMount() {
    // Attach a click event listener to the document body
    document.body.addEventListener('click', this.closeDropDown);
  }

  componentWillUnmount() {
    // Remove the click event listener when the component is unmounted
    document.body.removeEventListener('click', this.closeDropDown);
  }


  closeDropDown=(event)=> {
    // Check if the clicked element is within the dropdown container
    if (this.dropdownRef && !this.dropdownRef.contains(event.target) && this.state.isOpen) {
      // Clicked outside the dropdown, close it
      this.setState({ isOpen: false });
    }
  }

 
  toggleDropdown=(e)=> {
    e.stopPropagation();
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  }


  handleOptionClick(value) {
    this.setState({
      // selectedValue: value,
      // isOpen: false,
    });
  }

  onCheckBoxClick = (e,data)=>{
    e.stopPropagation();
    this.props?.handleCheckboxChange(data.id);
  }

  render() {
    const { isOpen, selectedValue } = this.state;
    return (
      <div  >
         <div className="custom-dropdown-container " ref={(ref) => (this.dropdownRef = ref)}  >
        <div className= {`custom-dropdown-header ${this.props?.page === "home" ? " border-for-home-page-filter" : ""}`}  onClick={ (e) =>{
            if(true){
                this.toggleDropdown(e)
            }
        }}>
          <span>{ this.props?.selectedCountriesList && this.props?.selectedCountriesList?.length >0 ? this.props?.selectedCountriesList.length + " selected" : "Select countries"}</span>
          <span className={`arrow ${isOpen ? 'open' : ''}`}><img src={downArrow} alt="downArrow" /></span>
        </div>
        
        {isOpen &&  (
          <div className="custom-dropdown-options">{
            this.props?.project?.countries && this.props?.project?.countries?.length >0 && this.props?.project?.countries.slice(0, 5).map((data)=>{
              return(
                <label key={data?.id}  className="custom-option" >
                <input
                  type="checkbox"
                  value={data?.value}
                  checked={this.props?.selectedCountriesList && this.props?.selectedCountriesList.includes(data.id)}
                  onChange={(e) => this.onCheckBoxClick(e,data)}
                />
                {data?.label}
              </label>
              )
            })
            
          }
          <div className='drop-down-more-button edit-invention' onClick={()=>this.props?.modalHandler()} >more..</div>
            {/* <div className="custom-option" onClick={() => this.handleOptionClick('US')}>US Patent <img className='dropdown-white-arrow-images' src={whiteArrow} /> <img className='dropdown-blue-arrow-images' src={blueArrow} /> </div>
            <div className="custom-option" onClick={() => this.handleOptionClick('Europe')}>Europe Patent <img className='dropdown-white-arrow-images' src={whiteArrow} /> <img className='dropdown-blue-arrow-images' src={blueArrow} /> </div> */}
            {/* <div className="custom-option" onClick={() => this.handleOptionClick('Option 3')}>Option 3</div> */}
          </div>
        )}
      </div>
      </div>
     
    );
  }
}

export default Dropdown;
