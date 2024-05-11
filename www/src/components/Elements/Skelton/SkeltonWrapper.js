import React from "react";
import Skeleton from "react-loading-skeleton";

function Box(props) {
  return (
    <div
      style={{
        width: "100%",
        background:props.background,
        padding : props.padding,
        margin: props.margin,
        borderRadius : props.borderRadius,
        // height : "100%"
        height : props.height
      }}
    >
      {props.children}
    </div>
  );
}

const SkeltonWrapper = (props) => {
  return (
    <Box{...props} >
      <Skeleton height={props.skeltonHeight} />
    </Box>
  );
};

export default SkeltonWrapper;
