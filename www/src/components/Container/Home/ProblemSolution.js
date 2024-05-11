import React,{useState, useRef, useEffect} from "react";
import { Container, Row, Col } from "reactstrap";
import MyButton from "../../Elements/MyButton/MyButton";
import "./Home.scss";
import CountdownTimer from "../Counter/CountdownTimer";
import apiServices from "../../../services/apiServices";
import { toast } from "react-toastify";

const ProblemSolution = ({
  problem,
  solution,
  userFileUUID,
  loadingNovelty,
  noveltyRetry,
  problemtInputHandler,
  solutionHandler,
  uploadRefrenceFiles,
  noveltyHandler,
  props,
}) => {

const [textareaHeights, setTextareaHeights] = useState({
  problem: '100px',
  solution: '100px',
  // Add more textareas as needed
});

const textAreaRefs = {
  problem: useRef(null),
  solution: useRef(null),
  // Initialize more refs as needed
};

const fetchNovelity = async()=>{
    try{
        noveltyHandler('noveltyRetry', false);
        noveltyHandler('loadingNovelty', true);
        let payload ={
            user_file_uuid : userFileUUID
        } ;
        const novelty = await apiServices.getData(
            "post",
             props.project?.api_config?.endpoints?.get_novelty,
             payload
        )
        noveltyHandler('loadingNovelty', false);
        if(novelty?.status === "Error"){
            let toastData = props.project?.config?.toasterStyle;
            toastData["autoClose"] = 1500;
            toast.error(
              "Failed to generate please retry.",
              props.project?.config?.toasterStyle
            );
            noveltyHandler('noveltyRetry', true);
        }else{
            noveltyHandler('novelty',  novelty?.response?.data?.novelty);
            if(novelty?.response?.data?.other.length > 0 && novelty?.response?.data?.other?.[0] !== "Please provide other classifications."){

              let secondaryfilter =  novelty?.response?.data?.other
              secondaryfilter = secondaryfilter.join(" | ");
              noveltyHandler('secondaryClassCode', secondaryfilter);
            }
            if(novelty?.response?.data?.primary !==  "Please provide the primary classification."){
              noveltyHandler('primaryClassCode', novelty?.response?.data?.primary);
            }
        }
    }catch(e){
        console.log(e);
    }
}

  const handleTextareaResize = (event) => {
    const { name, scrollHeight } = event.target;
    updateTextareaHeight(name, scrollHeight);
  };

  const updateTextareaHeight = (name, scrollHeight) => {
    const minHeight = parseInt(textareaHeights[name], 10) || 100;
    const newHeight = `${Math.max(minHeight, scrollHeight)}px`;
    setTextareaHeights(prevHeights => ({
      ...prevHeights,
      [name]: newHeight
    }));
  };

  // Adjust textarea heights based on their initial content
  useEffect(() => {
    // Ensuring that textareas have time to properly render their content
    const timeoutId = setTimeout(() => {
      if (textAreaRefs.problem.current) {
        const newHeight = `${textAreaRefs.problem.current.scrollHeight - 99}`;
        updateTextareaHeight("problem", newHeight);
      }
      if (textAreaRefs.solution.current) {
        const newHeight = `${textAreaRefs.solution.current.scrollHeight - 99}`;
        updateTextareaHeight("solution", newHeight);
      }
    }, 100); // Slight delay to ensure content is fully rendered

    return () => clearTimeout(timeoutId);
  }, []);


  const onChangehandler = (type, val) =>{
    if(type === 'problem'){
      problemtInputHandler("problem", val)
    }if(type === 'solution'){
      solutionHandler("solution", val)
    }
    if(val.trim().length === 0){
      setTextareaHeights(prevHeights => ({
        ...prevHeights,
        [type]: '100px'
      }));
  }

  }


  return (
    <Container fluid>
      {uploadRefrenceFiles ? (
        <Row>
          <Col lg={12}>
            <div className="home-input-box-heading">
              <span>Analyzing input</span>
            </div>
            <div className="problem-solution-countdown-container" >
            <CountdownTimer
              targetDate={props?.project?.expectedTimeout?.document_upload}
              sectionType={"Reference Content"}
              abstractCount = {3}
            />
            </div>

          </Col>
        </Row>
      ) : (
        <>
          <Row>
            <Col  lg={12} >
            <div className="home-input-box-heading interpretation-invention">
                <span>IP Author interpretation of the invention</span>
              </div>
            </Col>
            <Col lg={12}>
              <div className="home-input-box-heading">
                <span>Problem</span>
              </div>
              <div className="textarea-cont">
                <textarea
                  name = "problem"
                  className="home-textarea-containers home-textarea-input-for-uploads"
                  type="text"
                  placeholder="Problem"
                  style={{ height: textareaHeights.problem, resize: "revert-layer", }}
                  onChange={(event) =>
                    onChangehandler("problem", event.target.value)
                  }
                  onInput={handleTextareaResize}
                  value={problem}
                  ref={textAreaRefs.problem}
                ></textarea>
              </div>
            </Col>
            <Col lg={12}>
              <div className="home-input-box-heading">
                <span>Solution</span>
              </div>
              <div className="textarea-cont">
                <textarea
                  name = "solution"
                  className="home-textarea-containers home-textarea-input-for-uploads"
                  type="text"
                  style={{ height: textareaHeights.solution, resize: "revert-layer", }}
                  placeholder="Solution"
                  onChange={(event) =>
                    onChangehandler("solution", event.target.value)
                  }
                  onInput={handleTextareaResize}
                  value={solution}
                  ref={textAreaRefs.solution}
                ></textarea>
              </div>
            </Col>
          </Row>
          <Row className="analyse-input-button-container">
            <MyButton
              text={noveltyRetry ? 'Retry Identifying Novelty' : "Identifying the novelty"} 
              className={`create-button ${loadingNovelty ? " not-allowed-cursor" : noveltyRetry ? " home-page-retry-button" : ""}`}
              onClick={fetchNovelity}
              disabled={loadingNovelty}
            ></MyButton>
          </Row>
        </>
      )}
    </Container>
  );
};

export default ProblemSolution;
