import React, { useState } from "react";
import DragAndDrop from "../GeneratedData/DragAndDrop/DragAndDrop";
import { Container, Row, Col } from "reactstrap";
import FilePreview from "../GeneratedData/DragAndDrop/FilePreview";


const UploadDocument = (props) => {
  // const[ uploadedFiles, setUploadedFiles] = useState([]);

  // const imageUploadHandler = (index, type, files) => {
  //     if (files === null && uploadedFiles[index]) {
  //         const newUploadedFiles = uploadedFiles.filter((_, i) => i !== index);
  //         setUploadedFiles(newUploadedFiles);
  //     }else{
  //         setUploadedFiles(files);
  //     }
  // };

  const handleDeleteImage = (fileName) => {
    props?.imageUploadHandler( (fileName ||  props?.index), "base64_image", null);
    // document.getElementById(props.htmlFor).value = '';
    // setPreview("");
  };
  
  return (
    <>
      <Row className="mb-3">
        <Col className="home-drap-and-drop" lg={12} >
          <div className="home-input-box-heading home-drag-drop-button-container mb-2">
            <span>Input files</span>
            <DragAndDrop
            {...props}
            htmlFor={"figure-upload"}
            enableMultipleTypes={true}
            files={props.uploadedFiles}
          />
          </div>
        </Col>
       {props?.uploadedFiles && <Col>
        <div className="drap-drop-file-preview">
          {props?.uploadedFiles?.map((file, index) => (
            <FilePreview
              key={index}
              file={file}
              index= {index}
              onDelete={handleDeleteImage}
            />
          ))}
        </div>
        </Col>}
      </Row>
    </>
  );
};

export default UploadDocument;
