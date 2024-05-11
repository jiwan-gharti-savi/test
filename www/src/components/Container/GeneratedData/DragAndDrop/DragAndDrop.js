import React, { useState, useMemo, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import "./DragAndDrap.scss";
import plucIcon from "../../../../components/assets/icons/plus.svg";
import uploadIcon from "../../../../components/assets/icons/uploads.svg";
import arrowDown from "../../../../components/assets/icons/arrow-down-white.svg";
import FilePreview from "./FilePreview";
import { toast } from "react-toastify";


const baseStyle = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

const DragAndDrop = (props) => {
  const onDrop = useCallback((acceptedFiles) => {

    const filesToUpload = acceptedFiles.slice(0, 10);

    if(acceptedFiles.length > 10){
      let toastData = props.project?.config?.toasterStyle;
      toastData["autoClose"] = 1300;
      toast.error(
        "You can upload maximum 10 files",
        props.project?.config?.toasterStyle
      );
    }

    if( props.enableMultipleTypes){
      props?.imageUploadHandler(props?.index,"base64_image", filesToUpload)
    }else{
      const file = new FileReader();
      file.onload = function () {
          props?.imageUploadHandler(props?.index,"base64_image", file.result)
      //   setPreview(file.result);
      };
  
      file.readAsDataURL(acceptedFiles[0]);
    }
   
  }, []);
  
  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragActive,
    isDragReject,
    open,
} = useDropzone({
    onDrop,
    accept: props.enableMultipleTypes
        ? '*'
        : {
          "image/*": [".png", ".gif", ".jpeg", ".jpg"],
        },
    multiple: props.enableMultipleTypes,
    noKeyboard: true,
});


  const handleDeleteImage = (fileName) => {
    props?.imageUploadHandler( (fileName ||  props?.index), "base64_image", null);
    // document.getElementById(props.htmlFor).value = '';
    // setPreview("");
  };

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

//    {
//     "image/png": [".png"],
//     "image/gif": [".gif"],
//     "image/jpeg": [".jpeg", ".jpg"],
//     "application/pdf": [".pdf"],
//     "application/msword": [".doc"],
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
// }

  return (

    <>
      {(!props?.data?.base64_image && !props?.files && props?.enableMultipleTypes) ?  (
        <div
          className="grap-drop-container"
          {...getRootProps({ style, isFocused, isDragAccept, isDragReject })}
        >
          <input {...getInputProps()} />
          <div className="upload-template-image-cont">
            <img src={uploadIcon} alt="upload_icon" />
            <div className="drap-and-drop-input-text" >
            <h5>Upload files from computer</h5>
            <p> or drag and drop here</p>
            <p>(.doc, .docx, pdf, images up to 50MB)</p>
            </div>
            
          </div>
          {/* <div>or</div>
          <div type="button" onClick={open}>
            <span className="browse-file-template">Browse file</span> from
            device
          </div> */}
        </div>
      ) : 

      <div
          className= {`grap-drop-container   ${props?.files && props?.enableMultipleTypes ? " grap-drop-container-button" : ""}`} 
          {...getRootProps({ style, isFocused, isDragAccept, isDragReject })}
        >
          <input {...getInputProps()} />
          <div className="add-files-bittun-container-div"  type="button" onClick={open}>
          <img src={plucIcon} alt="plus_icon" />
            <span className="browse-file-template">Upload</span>
            <img src={arrowDown} alt="plus_icon" />
          </div>
        </div>
      
      }

      {props?.data?.base64_image ? (
        <div className="image-container">
          <img
            className="image-uploader-image"
            src={props?.data?.base64_image}
            alt="Upload preview"
          />
          <span
            className="image-uploader-delete-button"
            onClick={() => handleDeleteImage()}
          >
            X
          </span>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default DragAndDrop;
