import React,{useState,useEffect, useRef} from "react";
import { Container, Row, Col } from "reactstrap";
import MyButton from "../../Elements/MyButton/MyButton";
import Abstract from "../fallbackContainer/abstract/abstract";

const Novelity = ({ novelty, loadingNovelty, noveltyHandler }) => {

  const [textareaHeights, setTextareaHeights] = useState({
    novelty: '100px'
    // Add more textareas as needed
  });

  const textAreaRefs = {
    novelty: useRef(null),
    // Initialize more refs as needed
  };

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
    const timeoutId = setTimeout(() => {
      if (textAreaRefs.novelty.current) {
        const newHeight = `${textAreaRefs.novelty.current.scrollHeight - 100}`;
        updateTextareaHeight("novelty", newHeight );
      }
    }, 100); // Slight delay to ensure content is fully rendered

    return () => clearTimeout(timeoutId);
  }, []);


  const onChangeHandler = (val) =>{
    noveltyHandler("novelty",val);
    if(val.trim().length === 0){
      setTextareaHeights(prevHeights => ({
        ...prevHeights,
        novelty: '100px'
      }));
  }
}

  return (
    <Row>
      <Col lg={12}>
        <div className="home-input-box-heading">
          <span>Novelty</span>
        </div>
        {loadingNovelty ? (
          <div className="home-abstract-container" > 
            <Abstract />
          </div>
        ) : (
          <div className="textarea-cont">
            <textarea
             name = 'novelty'
              className="home-textarea-containers home-textarea-input-for-uploads"
              type="text"
              style={{ height: textareaHeights.novelty, resize: "revert-layer", }}
              placeholder="Novelty"
              onChange={(event) =>
                onChangeHandler(event.target.value)
              }
              ref={textAreaRefs.novelty}
              onInput={handleTextareaResize}
              value={novelty}
            ></textarea>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default Novelity;
