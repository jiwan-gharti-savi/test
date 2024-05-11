import React from "react";
import "./DragAndDrap.scss";
import imageIcon from "../../../../components/assets/icons/image.svg";
import pdf_icon from "../../../../components/assets/icons/pdf.svg";  // Assuming you have an icon for PDFs
import doc_icon from "../../../../components/assets/icons/doc.svg";  // Assuming you have an icon for DOCX and DOC files
import cancel from "../../../../components/assets/icons/cancel.svg";  // Assuming you have an icon for DOCX and DOC files
import "./FilePreview.scss"

const FilePreview = ({ file, onDelete , index}) => {
  const renderFilePreview = () => {
    const filename = file?.path;
    const parts = filename.split(".");
    const extension = parts[parts.length - 1].trim();
    console.log("extension",extension,index)
    let fileFirstName = parts?.[0]
    switch (extension) {
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        return <> <img src= {imageIcon} alt="img" />  <span className="file-preview-file-name" >{fileFirstName}</span>  <span>.{extension}</span></>  ;
      case 'pdf':
        return <>  <img src= {pdf_icon} alt="pdf" /> <span className="file-preview-file-name" >{fileFirstName}</span>  <span>.{extension}</span></>  ;
      case 'doc':
      case 'docx':
        return  <>  <img src= {doc_icon} alt="doc" /> <span className="file-preview-file-name" >{fileFirstName}</span>  <span>.{extension}</span></>  ;
      default:
        return  <>  <img src= {imageIcon} alt="img" /> <span className="file-preview-file-name" >{fileFirstName}</span>  <span>.{extension}</span></>  ;
    }
  };
//   <img src={upload_icon} alt="Upload preview" className="file-preview-image" />

  return (
    <div className='file-container'>
      {renderFilePreview()}
      <div className="file-preview-tooltiop" >
        <span>{file?.path}</span>
      </div>
      <span className='file-delete-button' onClick={ () => onDelete(file?.name)}>
        <img src = {cancel} alt="cancel" />
      </span>
    </div>
  );
};

export default FilePreview;

