import React,{useState} from "react";
import { Container, Col, Row } from "reactstrap";
import Form from 'react-bootstrap/Form';
import MyButton from "../../Elements/MyButton/MyButton";
import "./ConfirmDeletion.scss";
import closeIcon from "../../assets/icons/close2.svg";

const ConfirmDeletion = (props) => {

  const[deleteButton, setDeleteButton] = useState(true);

  const checkInputHandler = (e) => {
    if(e.target.value === "DELETE PROJECT"){
      setDeleteButton(false)
    }else{
      setDeleteButton(true)
    }
  }

  return (
    <Container fluid>
      <Row className="delete-project-heading" >
      <div className="cancel-button-delete-overlay" >
          <img onClick = {()=> props.toggleConfirmdeletion()} src={closeIcon} alt="delete" className="delete-icon" />
        </div>
        <p>Delete Project</p>
      </Row>
      <Row className="confirm-deletion-outer-row" >
       
        <Col className="text-center" lg={12}>
          <p>To confirm deletion, type <span>"DELETE PROJECT"</span> in the box below.</p>
          <Form.Control onChange={checkInputHandler} className="confirm-deletion-text-box" type="text" placeholder="" />
        </Col>
        <Col className="d-flex justify-content-center align-items-center gap-2" lg = {12}>
          <MyButton disabled = {deleteButton} text={"Delete"} className='delete-yes-button' onClick = {()=> props.deleteProjectHandler()}/>
          {/* <MyButton text={"No"} className='delete-no-button' onClick = {()=> props.toggleConfirmdeletion()} /> */}
        </Col>
      </Row>
    </Container>
  );
};

export default ConfirmDeletion;
