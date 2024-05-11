import React from "react";
import { connect } from "react-redux";
// import mermaid from "mermaid";
import "./Mermaid.css";
import downloadIcon from "../../assets/icons/download_blue_icon.svg";
import axios from "axios";
import {
  enableDiaExport,
  disableDiaExport,
  patentExported,
  patentExporting,
} from "../../../store/action";
import apiServices from "../../../services/apiServices";
import LoadingScreen from "../../LoadingScreen/loadingScreen";
import loading_icon from "../../assets/icons/loading.gif";
import Abstract from "../fallbackContainer/abstract/abstract";
import download_thin from "../../assets/icons/download_thin.svg";
import preview_icon from "../../assets/icons/maximize.svg";
var dia_count = 0;
var diagramsBase64 = {};
var obj = {};
function generateUniqueID() {
  const timestamp = Date.now().toString(36); // Convert the current timestamp to a base36 string
  const randomString = Math.random().toString(36).substring(2, 10); // Generate a random string
  return `${timestamp}-${randomString}`;
}
class Mermaid extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: false,
      isFlowchartButtons: false,
      hasInitiatedExport: false,
      count: 0,
      diagramsBase64: [],
    };
    this.mermaidRef = React.createRef();
    this.uniqueID = generateUniqueID();
    this.exportInProgress = false;
    this.count = 0;
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   // Compare the current props and the next props or state
  //   // If they are the same, prevent re-rendering
  //   if (
  //     this.props.download === nextProps.download &&
  //     this.props.saveHandler === nextProps.saveHandler
  //   ) {
  //     return false;
  //   }
  //   return true;
  // }

  componentDidMount() {
    if (this.props?.preview) {
      window.mermaid.initialize(this.props.project?.mermaid_config);
    }
    window.mermaid.contentLoaded();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.enableExporting !== this.props.enableExporting) {
      this.downloadPNG();
    }

    if (window.mermaid) {
      document.getElementById("mermaidHolder")?.removeAttribute("mermaid-NaN");
      window.mermaid.contentLoaded();
    }
  }

  handleTextAreaChange = (event) => {
    this.setState({
      preContent: event.target.value,
    });
  };

  downloadPNG = async (e) => {
    if (e) {
      e.stopPropagation();
    }
    let is_diagram_valid = true;
    try {
      const svgElem = document.querySelector(`#${"id_"+ this.stringToBinaryUniqueID(this.checkFigureName(this.props?.diagramName))} > svg`);
      let bbox = {};
      try{
        bbox = svgElem.getBoundingClientRect();
      }
      catch(e){
        is_diagram_valid = false;
        bbox = {width:450, height:1350};
      }
      const desiredWidth = 4096;
      const scaleValue = Math.max(1, desiredWidth / bbox.width);
      window
        .html2canvas(document.querySelector("#" + "id_"+this.stringToBinaryUniqueID(this.checkFigureName(this.props?.diagramName))), {
          scale: scaleValue,
          useCORS: true,
          width: bbox.width,
          height: bbox.height,
          windowWidth: bbox.width,
          windowHeight: bbox.height,
          x: 0,
          y: 0,
        })
        .then((canvas) => {
          canvas.toBlob(async (blob) => {
            // Converted this to an arrow function

            let payload;
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
              try {
                // Error handling for Axios call
                let base64data = reader?.result;
                if (is_diagram_valid == false) {
                  base64data = "";
                }
                // let obj;
                if (
                  this.props?.diagramType == "block" &&
                  !this.props?.embodiment
                ) {
                  obj = { ...obj, block_diagrams: obj.block_diagrams || [] };
                  obj.block_diagrams.push({
                    name: this.checkFigureName(this.props?.diagramName),
                    mermaid: base64data,
                  });
                } else if (this.props?.embodiment) {
                  let type = this.props?.embodimentType;
                  // obj = { [type]: base64data };
                } else {
                  obj = { ...obj, flowcharts: obj.flowcharts || [] };
                  obj.flowcharts.push({
                    name: this.checkFigureName(this.props?.diagramName),
                    mermaid: base64data,
                  });
                  // obj = { [this.props?.diagramName]: base64data };
                }

                diagramsBase64 = { ...diagramsBase64, ...obj };

                if (this.props?.isDiaExport) {
                  dia_count = dia_count + 1;
                  if (dia_count == this.props.diaCount) {
                    this.exportHandler();
                    // this.props.disableExport();
                    dia_count = 0;
                  }
                }
              } catch (axiosError) {
                console.error("Axios error:", axiosError);
              }
            };
            if (!this.props?.isDiaExport) {
              window.saveAs(
                blob,
                `${
                  this.checkFigureName(this.props?.diagramName)
                }.png`
              );
            }
          });
        });
    } catch (e) {
      console.log("export error");
      this.props.disableExport();
    }
  };

  exportHandler = async () => {
    try {
      this.props.patentExporting();
      let payload = {
        project_id: this.props?.projectId,
        ...diagramsBase64,
        claim_section_history_id: this.props?.selectedClaimVersionId
          ? this.props?.selectedClaimVersionId
          : "",
        figures_base64 : this.props?.templateFigBase64 ? this.props?.templateFigBase64 : "",
      };

      const url_id = this.props.match?.params?.id;

      let file = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.export_project,
        payload,
        null,
        "blob"
      );

      const filename = "IPAuthor - " + this.props.inventionTitle + ".docx";
      const blob = new Blob([file], {
        type: "application/octet-stream",
      });

      // Create a temporary URL for the generated document
      const url = window.URL.createObjectURL(blob);

      // Create a link element and simulate a click to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();

      // Clean up the temporary URL and the link element
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      diagramsBase64 = {};
      obj = {};
      this.props.patentExported();
      this.props.disableExport();
    } catch (e) {
      this.props.patentExported();
      this.props.disableExport();
      console.log(e);
    }
  };

  checkFigureName = (name)=>{
    let str = name ? name.toString() : "";
    let lowerStr = str.toLowerCase()
   
   // Regular Expression to check if "fig." (case-insensitive) is followed by an integer
   const regex = /fig\.\s*\d+/i;
   
   // Check if the pattern exists in the string
   if (!regex.test(lowerStr)) {
     // If "fig." is not found before an integer, prepend "FIG. " to the string
     str = "FIG. " + str;
   }
   
   return(str)
  }

  stringToBinaryUniqueID =(input) =>{
    let binaryString = '';
  
    for (let i = 0; i < input.length; i++) {
      const binaryChar = input.charCodeAt(i).toString(2);
      const paddedBinaryChar = binaryChar.padStart(8, '0');
      binaryString += paddedBinaryChar;
    }
    const uniqueID = binaryString;
  
    return uniqueID;
  }

  downloadSVG = async (e) => {
    try {
      e?.preventDefault();
      e?.stopPropagation();

      const svgContent =
        this.mermaidRef.current.querySelector("svg:first-of-type").outerHTML;
      const blob = new Blob([svgContent], {
        type: "image/svg+xml;charset=utf-8",
      });

      // Convert the blob to a base64 string to send data into backend

      // const reader = new FileReader();
      // reader.readAsDataURL(blob);
      // reader.onloadend = async function() {
      //   const base64data = reader.result;

      //    // Construct the payload
      //   const payload = {
      //     project_id: this.props.match?.params?.id,
      //     flowchart: base64data
      //   };

      //   // Send the data as JSON
      //   let response = await axios.post(
      //     this.props.project?.api_config?.endpoints?.export_project,
      //     payload
      //   );

      //   console.log(response.data);
      // };

      // Save SVG to user's machine
      window.saveAs(blob, "FIG 1.svg");
    } catch (e) {
      console.error(e);
    }
  };

  saveHandler = (e) => {
    e.stopPropagation();
    this.setState((prev) => ({
      isFlowchartButtons: !prev.isFlowchartButtons,
    }));
  };

  render() {    
    let content = this.props?.preContent;
    const outputString = content?.replace("mermaid", "");
    content = outputString;
    content = content?.replace(/\n\n.*$/, "");
    content =
      this.props?.diagramType == "block"
        ? ` %%{initialize: {'flowchart': {'title': '${
          this.checkFigureName(this.props?.diagramName)
          }','refnum': false, 'arrowMarkerAbsolute': false, 'wrappingWidth': 160, 'minWidth':100, 'minHeight':80} }}%%\n` +
          content
        : ` %%{initialize: { 'flowchart': {'title': '${
          this.checkFigureName(this.props?.diagramName)
          }', 'refnum': true, 'arrowMarkerAbsolute': false, 'wrappingWidth': 320, 'minWidth':100} }}%%\n` +
          content;

    return (
      content && (
        <div className="mermaid-container">
          {this.props?.preview ? (
            ""
          ) : (
            <div className="flow-Chart-Download">
              {/* <img
              onClick={(e) => this.downloadPNG(e, uniqueID)}
              src={download_thin}
              alt="download"
            /> */}
              <div
                className={`flow-chart-download-cont`}
                onClick={(e) => {
                  this.downloadPNG(e);
                }}
              >
                <div>
                  <img src={download_thin} />
                  Download
                </div>
              </div>
            </div>
          )}
          <div ref={this.mermaidRef} className="mermaid" id={"id_"+this.stringToBinaryUniqueID(this.checkFigureName(this.props?.diagramName))}>
            {content}
          </div>
          {/* <textarea value={this.state.preContent} onChange={this.handleTextAreaChange} /> */}
        </div>
      )
    );
  }
}

const mapStateToProps = (state) => {
  return {
    project: state.projectData,
    isDiaExport: state.flowChartRed.exportDia,
    diaCount: state.countDiagramsRed.DiaCount,
  };
};
const mapDispatchToProps = (dispatch) => {
  return {
    enableExport: (data) => dispatch(enableDiaExport(data)),
    disableExport: (data) => dispatch(disableDiaExport(data)),
    patentExporting: (data) => dispatch(patentExporting(data)),
    patentExported: (data) => dispatch(patentExported(data)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Mermaid);
