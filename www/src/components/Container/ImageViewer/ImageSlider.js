import React, { useRef } from "react";
import "./ImageSlider.css";
import Slider from "react-slick";
import Mermaid from "../FlowChart/Mermaid";

const ImageSlider = React.memo((props) => {
  var settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };



  let flow = props.flowChartText

  const flowClickHandler = (index) => {
    props.switchViewerHandler(index);
  };

  return (
    <Slider {...settings}>
      {flow.map((image,index) => {
        return (
          <div className="slider-div">
            <button className="mermaidButton" onClick={ () =>flowClickHandler(index)}>
              <Mermaid preContent={image} />
            </button>
          </div>
        );
      })}
    </Slider>
  );
});

export default ImageSlider;
