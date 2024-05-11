import React from "react";
import GeneratedData from "../GeneratedData/generatedData";
import './patentDetailsEdit.css';

class patentDetailsEdit extends React.Component {

  render() {
  
    const link = window.location.href;
    const parts = link.split("/");
    const url_id = parts[4];
    const url_value = parts[6];
    return(
      <div>
        <GeneratedData {...this.props} id={url_id} editText={url_value} />
      </div>
    );

  }
}


export default patentDetailsEdit;