import React, { useState, useEffect, useRef } from "react";
import Abstract from "../../fallbackContainer/abstract/abstract";
import classes from "../patentDetails.module.css";
import { Container, Row, Col } from "reactstrap";
import info from "../../../assets/icons/info_orange.svg";
import MyButton from "../../../Elements/MyButton/MyButton";
import white_arrow from "../../../assets/icons/arrow_submit.svg";
import blue_arrow from "../../../assets/icons/blue_arrow_submit.svg";
import "./History.scss";
import copyIcon from "../../../assets/icons/copy.svg";
import tickIcon from "../../../assets/icons/tick.png";
import downArrow from "../../../assets/icons/arrow-down.svg";

const HistoryTab = (props) => {
  const {
    sectionDataType,
    setHistory,
    loading_section,
    loadingClaims,
    selectedVersion,
    versionData,
    initialLoadingClaim,
  } = props;

  const [activeType, setActiveType] = useState(null);
  const [expandedItems, setExpandedItems] = useState({});
  const [shouldShowMore, setShouldShowMore] = useState({});
  // Initialize an array of refs
  const elementRefs = useRef([]);

  useEffect(() => {
    elementRefs.current = elementRefs.current.slice(
      0,
      props.sectionDataType.length
    );
    props.sectionDataType.forEach((_, i) => {
      if (!elementRefs.current[i]) {
        elementRefs.current[i] = React.createRef();
      }
    });

    const measureHeight = () => {
      props.sectionDataType.forEach((data, index) => {
        const node = elementRefs.current[index].current;
        if (node) {
          const lineHeight = parseInt(
            window.getComputedStyle(node).lineHeight,
            10
          );
          const maxHeight = lineHeight * 3;
          const actualHeight = node.scrollHeight;
          setShouldShowMore((prev) => {
            const newState = { ...prev, [data.id]: actualHeight > maxHeight };
            return newState;
          });
        }
      });
    };

    // Delay the initial measure to allow the DOM to settle
    setTimeout(measureHeight, 0);

    const handleResize = () => {
      measureHeight();
    };

    window.addEventListener("resize", handleResize); // Add resize listener

    return () => {
      window.removeEventListener("resize", handleResize); // Clean up on unmount
    };
  }, [props.sectionDataType]); // Ensure this runs when sectionDataType changes

  const toggleExpanded = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipBoard = (e, text, id) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    if (activeType === id) {
      setActiveType(null);
    } else {
      setActiveType(id);
    }

    setTimeout(() => {
      setActiveType(null);
    }, 1000);
  };

  const copyElement = (data, id) => {
    return (
      <div
        onClick={(e) => copyToClipBoard(e, data, id)}
        className="history-copy-button-cont"
      >
        <img src={id === activeType ? tickIcon : copyIcon} alt="copy" />
        {id === activeType ? "Copied" : "Copy"}
      </div>
    );
  };

  const promptButton = (data) => {
    return (
      <MyButton
        className={`hs-version-num prompt-button prompt-button-new regen-button  ${
          (data?.status ? data?.status : data?.is_error) == "Error"
            ? "p_retry retry-hover"
            : " right_hover_image  prompt-button-top"
        }`}
        onClick={(event) => {
          if (!loading_section) {
            props.promptHandlerHistory(
              data.prompt,
              selectedVersion,
              data.id,
              data?.status ? data?.status : data?.is_error,
              data.is_redraft,
              data.section_history_id,
              event,
              data
            );
          }
        }}
        text={
          (data?.status ? data?.status : data?.is_error) == "Error" &&
          data.is_redraft &&
          props.editText == "Claims"
            ? "Re Draft"
            : (data?.status ? data?.status : data?.is_error) == "Error"
            ? "Retry"
            : "Prompt"
        }
        rightImage={white_arrow}
        rightImageClass="custom-right-icon"
        rightHoverImage={`${
          (data?.status ? data?.status : data?.is_error) == "Error"
            ? white_arrow
            : blue_arrow
        }`}
      />
    );
  };
  return (
    <>
      <Col lg={12} md={12} sm={12} xs={12} className="history-tab-container">
        {
          <>
            {(loading_section || loadingClaims) && (
              <div className="history-tab-loading-skelton-container">
                <Abstract />
              </div>
            )}
            {sectionDataType.map((data, index) => {
              return (
                <div
                  className="errorOnEditPage"
                  key={data.id}
                  onClick={() => {
                    if (true) {
                      props.editHandlerHistory(
                        index,
                        data.data,
                        data.section_history_id,
                        data.is_error,
                        data,
                        true
                      );
                    }
                  }}
                >
                  <div className="history-each-section">
                    {/* render on overload */}
                    {(data?.status ? data?.status : data?.is_error) ==
                      "Error" && (
                      <div className={classes.generateCaution}>
                        {" "}
                        <span className={classes.infoSpan}>
                          {" "}
                          <img className={classes.info} src={info} />{" "}
                        </span>
                        {data.message
                          ? data.message
                          : "We're sorry, but we couldn't process your request at this time. Please try again shortly."}
                        <span className={classes.genrateOverlayText}>
                          {data.message_long
                            ? data.message_long
                            : "Failed to process your request."}
                        </span>
                      </div>
                    )}

                    <div className="history-button-cont">
                      {selectedVersion !== index && (
                        <span className="hs-version-num selected_version_new">
                          <span className="version-title">
                            Version #{data.id}
                          </span>
                        </span>
                      )}

                      {selectedVersion == index && (
                        <span className="hs-version-num selected_version selected_version_new">
                          <span className="version-title">
                            Version #{data.id}
                          </span>
                        </span>
                      )}
                      {(data?.status ? data?.status : data?.is_error) ==
                        "Error" && promptButton(data)}

                      {data?.prompt && data?.["is_prompt"] && (
                        <div className="each-history-icon-section">
                          {copyElement(data?.prompt, data.id)}
                        </div>
                      )}
                    </div>
                    <br />
                    {(data?.prompt || data?.data) && (
                      <div className="history-prompt-container">
                        <div className="hs-title">
                          <span
                            ref={elementRefs.current[index]}
                            style={{
                              display: expandedItems[data.id]
                                ? "block"
                                : "-webkit-box",
                            }}
                          >
                            {data.prompt}
                          </span>

                          {shouldShowMore[data.id] && (
                            <p
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpanded(data.id);
                              }}
                              className="history-tab-more-button"
                            >
                              {expandedItems[data.id] ? "Less" : "More"}
                              <img
                                className={`prompt-more-arrow ${
                                  expandedItems[data.id] ? " open" : ""
                                }`}
                                src={downArrow}
                                alt="arrow"
                              />
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        }
      </Col>
    </>
  );
};

export default HistoryTab;
