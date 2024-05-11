import React from 'react'
import { Container, Row, Col } from "reactstrap";

import UploadDocument from '../UploadDocument'
import UploadDocumentTextBox from '../UploadDocumentTextBox'
import ProblemSolution from '../ProblemSolution';
import Novelity from '../Novelity';

const ClaimsPriorArt = ({uploadedFiles,problem,solution, novelty,uploadFilesRetry, userFileUUID,loadingNovelty, noveltyRetry,  imageUploadHandler,refrenceListUploadHandler,uploadDocumentInputHandler, uploadDocumentInput, uploadRefrenceFiles, problemtInputHandler, solutionHandler, noveltyHandler, props}) => {
  return (
    <Col className="search-bar-inner-container">
    <UploadDocument
      imageUploadHandler={imageUploadHandler}
      uploadedFiles={uploadedFiles}
    />
  <UploadDocumentTextBox analyseHandler = {refrenceListUploadHandler}
    uploadDocumentInputHandler = {uploadDocumentInputHandler}
    uploadDocumentInput = {uploadDocumentInput}
    uploadRefrenceFiles = {uploadRefrenceFiles}
    uploadFilesRetry = {uploadFilesRetry}
    />
   {(uploadRefrenceFiles || problem || solution )&&
   <>
      <ProblemSolution
        problem = {problem}
        solution = {solution}
        userFileUUID = {userFileUUID}
        loadingNovelty = {loadingNovelty}
        noveltyRetry = {noveltyRetry}
        problemtInputHandler = {problemtInputHandler}
        solutionHandler = {solutionHandler}
        uploadRefrenceFiles = {uploadRefrenceFiles}
        noveltyHandler = {noveltyHandler}
        props = {props}
    />
   { (loadingNovelty || novelty) && <Novelity
        novelty = {novelty}
        loadingNovelty = {loadingNovelty}
        noveltyHandler = {noveltyHandler}
        uploadRefrenceFiles = {uploadRefrenceFiles}
        props = {props}
        />}
    </>
  }

  </Col>
  )
}

export default ClaimsPriorArt