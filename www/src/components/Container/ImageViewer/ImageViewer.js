import React, { useState, memo } from "react";
import Modal from "./Modal";
import Mermaid from "../FlowChart/Mermaid";
import "./ImageViewer.css";
import next from "../../assets/icons/next.svg";
import previous from "../../assets/icons/previous.svg";
import zoomIn from "../../assets/icons/zoomin.svg";
import zoomOut from "../../assets/icons/zoomout.svg";
import rotate from "../../assets/icons/rotate-ccw.svg";

const ImageViewer = ({
  flowChartText,
  closePreviewHandler,
  previewIndex,
  isOpen,
  typeOfDia,
  diagramName
}) => {
  const [isModalOpen, setModalOpen] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(previewIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [config] = useState({
    title: "FIG. 1",
    titleFont: "",
    theme: "null",
    fontFamily: "Questrial, sans-serif",
    altFontFamily: "Questrial, sans-serif",
    startOnLoad: true,
    arrowMarkerAbsolute: false,
    securityLevel: "sandbox",
    flowchart: {
        titleTopMargin: 50,
        useMaxWidth: true,
        htmlLabels: true,
        nodeSpacing: 20,
        rankSpacing: 40,
        curve: 'linear',
        arrowMarkerAbsolute: true,
        diagramPadding: 40,
        padding: 10,
        defaultRenderer: "dagre-wrapper",
        wrappingWidth: 320,
        minWidth:100
    },
    sequence: {
        showSequenceNumbers: true
    },
    deterministicIds: true,
    deterministicIDSeed: 42,
    useMaxWidth: true,
    wrap: true,
    fontSize: 16
});




  const handleNext = () => {
    if (currentIndex < flowChartText.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(zoomLevel + 0.1);
  };

  const handleZoomOut = () => {
    if (zoomLevel - 0.1 > 0.2) {
      setZoomLevel(zoomLevel - 0.1);
    }
  };

  const handleRotate = () => {
    setRotation(rotation + 90);
  };

  const closeOverLayHandler = () => {
    closePreviewHandler();
  };

  // window.mermaid.contentLoaded();

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });

  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleMouseLeave = () => {
    if (dragging) {
      setDragging(false);
    }
  };

  const handleWheelZoom = (event) => {
    event.preventDefault();

    const currentZoom = zoomLevel;
    const zoomIncrement = event.deltaY > 0 ? -0.1 : 0.1; // Adjust increment based on wheel direction

    // Calculate the new zoom level within the acceptable range
    const newZoom = Math.min(Math.max(currentZoom + zoomIncrement, 0.2), 1.5);
    setZoomLevel(newZoom);
  };


  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Open Modal</button>

      <Modal isOpen={true} onClose={() => closeOverLayHandler()}>
        {/* <h2>Hello, I am a Modal!</h2>
                <p>Insert modal content here.</p> */}
        <div className="mermaid-viewer">
          <div className="mermaid-viewer-cont">
            <div
              className={`mermaid-viewer-container ${
                !dragging ? " mermaid-container-smooth" : ""
              }`}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoomLevel})`,
                transformOrigin: "center center",
              }}
            >
              <Mermaid
                key={currentIndex }
                preContent={flowChartText[currentIndex]}
                config = {config}
                diagramType = {typeOfDia}
                preview = {true}
                diagramName = {diagramName}
              />

              {/* This is the new overlay div */}
              <div
                className={`drag-overlay ${dragging ? "grabbing" : ""}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={(e) => handleWheelZoom(e)}
              ></div>
            </div>

            <div className="toolbar">
              {/* <img onClick={handlePrevious} src={previous} />
              <img
                onClick={handleNext}
                disabled={currentIndex === flowChartText.length - 1}
                src={next}
              /> */}
              <img onClick={handleZoomOut} src={zoomOut} />
              <img onClick={handleZoomIn} src={zoomIn} />
              <img onClick={handleRotate} src={rotate} />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

function areEqual(prevProps, nextProps) {
  return true;
}

export default memo(ImageViewer, areEqual);
