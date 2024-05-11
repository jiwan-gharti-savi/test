import React, { useEffect } from "react";
import "./Home.scss";

function ClearButton({ clearTextHandler }) {
  return (
    <button className="clear-button" onClick={clearTextHandler}>
      Clear
    </button>
  );
}

export default ClearButton;
