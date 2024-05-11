import React from 'react'
import right_arrow_icon from "../../assets/icons/arrow_submit.svg";
import loadingIcon from "../../assets/icons/loading.gif";
import { Container, Row, Col } from "reactstrap";
import MyButton from "../../Elements/MyButton/MyButton";
import "./Home.scss";



const ValidateInput = () => {
  return (
    <Col className="home-input-instructions validate-input-container" lg={12}>
    <div className="validate-options">
        <span>
        <img src ={loadingIcon} alt='loading' /> <p>option 1</p>  
        </span>
        <span>
        <img src ={loadingIcon} alt='loading' /> <p>option 2</p>  
        </span>
        <span>
        <img src ={loadingIcon} alt='loading' /> <p>option 3</p>  
        </span>
        <span>
        <img src ={loadingIcon} alt='loading' /> <p>option 4</p>  
        </span>
    </div>
 <MyButton
  text="validate input"
  className="create-button explore-prior-art explore-prior-art-button prior-art-button-firefox-fix"
  // onClick={this.handleAddFigure}
 >
  <img className="right_arrow_icon" src={right_arrow_icon} alt={"white-arrow"} />
 </MyButton>
  </Col>
  )
}

export default ValidateInput