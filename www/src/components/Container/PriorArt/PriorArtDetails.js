import React,{useState} from 'react'
import "./priorArtTable.scss";
import {
    Container,
    Row,
    Col,
  } from "reactstrap";
import {
    CircularProgressbar,
    CircularProgressbarWithChildren,
    buildStyles,
  } from "react-circular-progressbar";

import similarSvg from "../../assets/icons/similar.svg";
import differenceSvg from "../../assets/icons/defference.svg";
import date_icon from "../../assets/icons/date.svg";
import assignee_icon from "../../assets/icons/assignee.svg";
import cpcIcon from "../../assets/icons/cpc.svg";
import arrow from "../../assets/icons/arrow-ex.svg";
import arrowDown from "../../assets/icons/arrow-ex-down.svg";



const PriorArtDetails = ({index, data, isPatentInfoAccess, selectedDateType}) => {

    const [explanationIndex, setExplanationIndex] = useState(null)
    const  primaryCPCClass =(str) =>{
        const jsonString = str.replace(/'/g, '"');
        return JSON.parse(jsonString);
      }

     const openExplanationHandler = (index)=>{
        if(explanationIndex === index){
            setExplanationIndex(null)
        }else{
            setExplanationIndex(index)
        }
     } 

  return (
    <Row key={index} className="each-priorart-patent gap-each-priorart-patent">
       { isPatentInfoAccess && <Col>
        <span className="epp-pn">
            <a
              className="patent-number"
              target="_blank"
              href={data.link}
            >
              <span className="patent-link">
                {data.pn}
              </span>
            </a>
          </span>
        </Col>}
    {  isPatentInfoAccess && <Col className="epp-data-section"  lg={12}  >
      <div className="epp-data-section-inner-container" >
       {data?.title && <div className="ep-header-section">
          <div className="epp-title">
            <span>
              <p className="prior-art-title">
                {data.title}
              </p>
            </span>
          </div>
        </div>}
        <Row className="epp-content">
          <Col className='prior-art-details-meta-container' >
            {data?.co && (
              <div className="epp-each-meta">
                <img
                  className="date-icon"
                  src={assignee_icon}
                  alt="assiginee"
                ></img>
                <span>
                  Assiginee: <b>{data.co}</b>
                </span>
              </div>
            )}
            {(selectedDateType ===
              "priorityDate" &&
              data.prid) ||
            (!selectedDateType &&
              data.prid) ? (
              <div className="epp-each-meta">
                <img
                  className="date-icon"
                  src={date_icon}
                  alt="comapny"
                ></img>
                <span>
                  Priority Date: <b>{data.prid}</b>
                </span>
              </div>
            ) : selectedDateType ===
                "applicationDate" && data.ad ? (
              <div className="epp-each-meta">
                <img
                  className="date-icon"
                  src={date_icon}
                  alt="comapny"
                ></img>
                <span>
                  Application Date: <b>{data.ad}</b>
                </span>
              </div>
            ) : data.co ? (
              <div className="epp-each-meta">
                <img
                  src={assignee_icon}
                  alt="comapny"
                ></img>
                <span>
                  Assiginee: <b>{data.co}</b>
                </span>
              </div>
            ) : (
              ""
            )}
            {
              data.pd && (
                <div className="epp-each-meta">
                  <img
                    className="date-icon"
                    src={date_icon}
                    alt="comapny"
                  ></img>
                  <span>
                    Publication Date: <b>{data.pd}</b>
                  </span>
                </div>
              ) 
            }
            {data?.cpcpri &&
              data?.cpcpri.length > 2 && (
                <div className="epp-each-meta">
                  <img
                    src={cpcIcon}
                    alt="cpc"
                  ></img>
                  <span>
                    Primary CPC Class:{" "}
                    <b>
                      {primaryCPCClass(
                        data?.cpcpri
                      ).map((item, index) => {
                        return (
                          <span key={index}>
                            {item}{" "}
                            {index ==
                            primaryCPCClass(
                              data?.cpcpri
                            ).length -
                              1
                              ? ""
                              : " ,"}
                          </span>
                        );
                      })}
                    </b>
                  </span>
                </div>
              )}
          </Col>
        </Row>
      </div>
    </Col>}
    <Col className="epp-explonation"  lg= {12}>
      <Row className="gap-3" >
        <Col  >
        <div className="prior-art-theory-title-heading-container" >
          <img src={similarSvg} alt="similarity" />
        <span>Similarity</span>
        <span>
        <svg
                width="30"
                height="30"
                viewBox="0 0 60 60"
                preserveAspectRatio="xMinYMin slice"
              >
                <CircularProgressbar
                  value={Math.ceil(
                    data.similarity_score
                  )}
                  text={`${Math.ceil(
                    data.similarity_score
                  )}`}
                  // background={"#7CB343"}
                  styles={buildStyles({
                    strokeWidth: "40",
                    backgroundColor: "#3e98c7",
                    textColor: "#7CB343",
                    pathColor: "#7CB343",
                    trailColor: "transparent",
                  })}
                />
              </svg>
        </span>
        </div>
       
      <span
        className="eppe-content-details"
        dangerouslySetInnerHTML={{
          __html: data.similarity_summary
            ? data.similarity_summary
            : "No similarity",
        }}
      ></span>
        </Col>
        <Col>

        <div className="prior-art-theory-title-heading-container">
        <img src={differenceSvg} alt="differenceSvg" />
        <span  >
        {data.claims_summary
          ? "Novelty Summary"
          : "Difference"}
      </span>
        </div>
     

      <span className="eppe-content-details">
        {data.claims_summary
          ? data.claims_summary
          : data.difference
          ? data.difference
          : "No Analysis"}
      </span>
        </Col>
      </Row>
    </Col>
   {( data?.explanation &&  isPatentInfoAccess) && <>
    <Col>
        <div className='prior-art-explanation-container' >
            <img onClick={()=>openExplanationHandler(index)} src={explanationIndex === index ? arrowDown :  arrow} alt='arrow' />
            <span onClick={()=>openExplanationHandler(index)} >
            Relevant text from document
            </span>
        </div>
        </Col>
       {(explanationIndex === index) && <Col lg={12} className='prior-art-explanation-content-container' >
        <span>
            <p>
            {data?.explanation}
            </p>
        </span>
        </Col>}
    </>}
       
  </Row>
  )
}

export default PriorArtDetails