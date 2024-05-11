import React,{useState} from "react";
import "./Home.scss";
import MyButton from "../../Elements/MyButton/MyButton";
import { Container, Row, Col } from "reactstrap";

const UploadDocumentTextBox = ({analyseHandler, uploadDocumentInputHandler, uploadDocumentInput, uploadRefrenceFiles, uploadFilesRetry}) => {
  const [textareaHeights, setTextareaHeights] = useState({
    inputText: '100px'
    // Add more textareas as needed
  });
  
  const handleTextareaResize = (event) => {
    const { name, scrollHeight } = event.target;
    const minHeight = parseInt(textareaHeights[name], 10) || 100;
    const newHeight = `${Math.max(minHeight, scrollHeight)}px`;
    // Update the specific textarea height using its name
    setTextareaHeights(prevHeights => ({
      ...prevHeights,
      [name]: newHeight
    }));
  };

  const onChangeHandler = (val)=>{
    uploadDocumentInputHandler('uploadDocumentInput',val);
    if(val.trim().length === 0){
      setTextareaHeights(prevHeights => ({
        ...prevHeights,
        inputText: '100px'
      }));
    }
  }

  return (
    <Container fluid>
      <Row>
        <Col lg={12} >
          <div className="home-input-box-heading">
            <span>Input text (optional)</span>
          </div>
          <div className="textarea-cont">
            <textarea
              name = 'inputText'
              className="home-textarea-containers home-textarea-input-for-uploads"
              type="text"
              style={{ height: textareaHeights.inputText,resize: "revert-layer", }}
              placeholder="Input text"
              onChange={(event) => onChangeHandler(event.target.value)}
              value={uploadDocumentInput}
              onInput={handleTextareaResize}
            ></textarea>
          </div>
        </Col>
        <Col>

        </Col>
      </Row>
      <Row className="analyse-input-button-container" >
      <MyButton 
      text = {uploadFilesRetry ? "Retry" : "Analyse input"}
      className = { `create-button ${uploadRefrenceFiles ? " not-allowed-cursor" : uploadFilesRetry ?  " home-page-retry-button" : ""}`} 
      onClick = {analyseHandler}
      disabled = {uploadRefrenceFiles}
      ></MyButton>
      </Row>

    </Container>
  );
};

export default UploadDocumentTextBox;
