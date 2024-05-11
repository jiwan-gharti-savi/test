import React, { Component } from "react";
import Modal from "react-modal";
import cancel_icon from "../../assets/icons/cancel.svg";
import { Col, Container, Row } from "reactstrap";
import MyButton from "../../Elements/MyButton/MyButton";
import "./Template.css";
import arrow from "../../assets/icons/arrow_submit.svg";
import BlueArrow from "../../assets/icons/blue_arrow_submit.svg";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import apiServices from "../../../services/apiServices";
import ImageUploader from "./ImageUploader/ImageUploader";
import noDataImage from "../../assets/icons/not_create.svg";
import { toast } from "react-toastify";
import loading_icon from "../../assets/icons/loading.gif";
import DragAndDrop from "./DragAndDrop/DragAndDrop";

class Template extends Component {
  constructor(props) {
    super(props);
    this.state = {
      companyTabs: 1,
      userTabs: 1,
      projectTabs: 1,
      tab: 0,

      companyTabData: [
        {
          brief_description: "",
          summary: "",
          detailed_description: "",
          base64_image: "",
          name: "",
        },
      ],
      userTabData: [
        {
          brief_description: "",
          summary: "",
          detailed_description: "",
          base64_image: "",
          name: "",
        },
      ],
      projectTabData: [
        {
          brief_description: "",
          summary: "",
          detailed_description: "",
          base64_image: "",
          name: "",
        },
      ],
      summaryWordLimitExceed: false,
      isLoading: true,
    };
  }

  componentWillMount = () => {
    this.getStoredTemplatedata();
  };

  getStoredTemplatedata = async () => {
    try {
      this.setState({ isLoading: true });
      let data = {
        project_id: this.props.match?.params?.id,
      };

      let storedData = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.select_figure_data,
        data
      );

      console.log("storedData=>", storedData);

      if (storedData.status === "Success") {
        if (storedData?.["response"]?.company.length > 0) {
          this.setState({ companyTabData: storedData?.["response"]?.company });
        }
        if (storedData?.["response"]?.user.length > 0) {
          this.setState({ userTabData: storedData?.["response"]?.user });
        }
        if (storedData?.["response"]?.project.length > 0) {
          this.setState({ projectTabData: storedData?.["response"]?.project });
        }
      }
      this.setState({ isLoading: false });
    } catch (e) {
      console.log(e);
      this.setState({ isLoading: false });
    }
  };

  checkFigureName = (data, type) => {
    for (let i = 0; i < data.length; i++) {
      let emptyValue = 0;
      for (let obj of data) {
        let keysArr = Object.keys(obj);
        for (let key of keysArr) {
          if (obj[key] == ""|| obj[key] == null || obj[key] == undefined) {
            emptyValue++;
          }
        }
        if (emptyValue > 0 && emptyValue < 5) {
          return [false, type];
        }
      }
    }
    return [true, type];
  };

  handleSubmit = async () => {
    try {
      let submit = true;
      let data = {
        project_id: this.props.match?.params?.id,
        access_level:
          this.state.tab === 0
            ? "project"
            : this.state.tab === 1
            ? "user"
            : this.state.tab === 2
            ? "company"
            : "",
      };
      data.company = this.state.companyTabData;

      data.user = this.state.userTabData;

      data.project = this.state.projectTabData;

      for (let i = 1; i <= 3; i++) {
        let type, tabTypeData;
        switch (i) {
          case 1:
            type = "company";
            tabTypeData = this.state.companyTabData;
            break;
          case 2:
            type = "user";
            tabTypeData = this.state.userTabData;
            break;
          case 3:
            type = "project";
            tabTypeData = this.state.projectTabData;
            break;
        }
        let emptyType;
        let submitFlag;
        if (tabTypeData.length > 0 && submit) {
          [submit, emptyType] = this.checkFigureName(tabTypeData, type);
        }
        if (!submit) {
          let toastData = this.props.project?.config?.toasterStyle;
          toastData["autoClose"] = 1500;
          toast.error(
            `Please fill all the fields in ${emptyType} tab`,
            toastData
          );
          return;
        }
      }

      if (this.state.summaryWordLimitExceed) {
        let toastData = this.props.project?.config?.toasterStyle;
        toastData["autoClose"] = 1500;
        toast.error(`Summary should not be more then 400 words`, toastData);
        return;
      }

      let storeData = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.update_figure_data,
        data
      );

      if (storeData.status == "Success") {
        let toastData = this.props.project?.config?.toasterStyle;
        toastData["autoClose"] = 1500;
        toast.info(`Changes have been saved successfully`, toastData);
        this.props.templateHandler();
      } else {
        let toastData = this.props.project?.config?.toasterStyle;
        toastData["autoClose"] = 1500;
        toast.error(`Failed to save data please retry`, toastData);
      }
    } catch (e) {
      console.log(e);
    }
  };

  handleInputChange = (event, index, type, base64) => {
    let name, value;
    if (type === "base64_image") {
      name = "base64_image";
      value = base64;
    } else {
      ({ name, value } = event.target);
    }

    if (type === "summary") {
      if (value.trim().split(/\s+/).length > 400) {
        this.setState({
          summaryWordLimitExceed: true,
        });
      } else {
        this.setState({
          summaryWordLimitExceed: false,
        });
      }
    }

    if (this.state.tab === 0) {
      this.setState((prevState) => {
        const projectTabData = [...prevState.projectTabData];
        projectTabData[index] = {
          ...projectTabData[index],
          [name]: value,
        };
        return { projectTabData };
      });
    } else if (this.state.tab === 1) {
      this.setState((prevState) => {
        const userTabData = [...prevState.userTabData];
        userTabData[index] = {
          ...userTabData[index],
          [name]: value,
        };
        return { userTabData };
      });
    } else if (this.state.tab === 2) {
      this.setState((prevState) => {
        const companyTabData = [...prevState.companyTabData];
        companyTabData[index] = {
          ...companyTabData[index],
          [name]: value,
        };
        return { companyTabData };
      });
    }
  };

  handleAddFigure = () => {
    let tab = this.state.tab;
    if (tab === 0) {
      this.setState((prevState) => ({
        projectTabData: [
          ...prevState.projectTabData,
          {
            brief_description: "",
            summary: "",
            detailed_description: "",
            base64_image: "",
            name: "",
          },
        ],
      }));

      this.setState({
        projectTabs: this.state.projectTabs + 1,
      });
    } else if (tab === 1) {
      this.setState((prevState) => ({
        userTabData: [
          ...prevState.userTabData,
          {
            brief_description: "",
            summary: "",
            detailed_description: "",
            base64_image: "",
            name: "",
          },
        ],
      }));

      this.setState({
        userTabs: this.state.userTabs + 1,
      });
    } else if (tab === 2) {
      this.setState((prevState) => ({
        companyTabData: [
          ...prevState.companyTabData,
          {
            brief_description: "",
            summary: "",
            detailed_description: "",
            base64_image: "",
            name: "",
          },
        ],
      }));
      this.setState({
        companyTabs: this.state.companyTabs + 1,
      });
    }
  };

  handleDeleteFigure = (index) => {
    let tab = this.state.tab;
    if (tab === 0) {
      this.setState((prevState) => ({
        projectTabData: prevState.projectTabData.filter((_, i) => i !== index),
      }));

      this.setState({
        projectTabs: this.state.projectTabs - 1,
      });
    } else if (tab === 1) {
      this.setState((prevState) => ({
        userTabData: prevState.userTabData.filter((_, i) => i !== index),
      }));

      this.setState({
        userTabs: this.state.userTabs - 1,
      });
    } else if (tab === 2) {
      this.setState((prevState) => ({
        companyTabData: prevState.companyTabData.filter((_, i) => i !== index),
      }));
      this.setState({
        companyTabs: this.state.companyTabs - 1,
      });
    }
  };

  imageUploadHandler = (index, type, base64) => {
    console.log("IMAGE UPLOAD==>", index, type, base64);
    this.handleInputChange(null, index, type, base64);
  };

  tabPanel = () => {
    let selectedTab =
      this.state.tab === 0
        ? this.state.projectTabData
        : this.state.tab === 1
        ? this.state.userTabData
        : this.state.tab === 2
        ? this.state.companyTabData
        : [];

    return (
      <Container className="prompt-main-container">
        <Row>
          <div
            className={
              selectedTab.length > 0
                ? "prompt-cont prompt-cont-template"
                : "prompt-cont prompt-cont-template  prompt-cont-flex-center"
            }
          >
            {this.state.isLoading ? (
              <>
                <div className="template-loading-icon-container ">
                  <img src={loading_icon} alt="loading" />
                </div>
              </>
            ) : selectedTab.length > 0 ? (
              <div className="form-outer-container" >
                {selectedTab.map((data, index) => {
                  return (
                    <div className="form-container" >
                      <form className="template-form">
                        <span
                          onClick={() => this.handleDeleteFigure(index)}
                          className="template-cancel-form-button"
                        >
                          X
                        </span>
                        <Col className="d-flex flex-column gap-2 mt-1">
                          <label htmlFor="name">Figure name</label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={(e) =>
                              this.handleInputChange(e, index, "name")
                            }
                            required
                          />
                        </Col>
                        <Col className="d-flex flex-column gap-2 mt-3">
                          <label htmlFor="name">
                            {data.name} Brief description
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="brief_description"
                            value={data.brief_description}
                            onChange={(e) =>
                              this.handleInputChange(
                                e,
                                index,
                                "brief_description"
                              )
                            }
                            required
                          />
                        </Col>

                        <Col className="d-flex flex-column gap-2 mt-3">
                          <label htmlFor="summary">{data.name} Summary</label>
                          <textarea
                            className="template-summary-textarea"
                            type="text"
                            id="name"
                            name="summary"
                            value={data.summary}
                            onChange={(e) =>
                              this.handleInputChange(e, index, "summary")
                            }
                            required
                          />
                          <div className="template-summary-word-limit-cont">
                            <span className="template-summary-word-limit">
                              {data.summary
                                ? data.summary.trim().split(/\s+/).length
                                : 0}
                              /400
                            </span>
                            {data.summary.trim().split(/\s+/).length > 400 && (
                              <span className="template-summary-word-limit-exceed template-summary-word-limit">
                                Word limit exceeded more then 400 words
                              </span>
                            )}
                          </div>
                        </Col>
                        <Row>
                          <Col sm={6} className="mt-3">
                            <label
                              className="tempalte-textarea-label"
                              htmlFor="figure-upload"
                            >
                              {data.name} Upload Figure
                            </label>
                            {/* <ImageUploader
                                imageUploadHandler={this.imageUploadHandler}
                                data={data}
                                index={index}
                                htmlFor={"figure-upload"}
                              /> */}
                            <DragAndDrop
                              imageUploadHandler={this.imageUploadHandler}
                              data={data}
                              index={index}
                              htmlFor={"figure-upload"}
                              // enableMultipleTypes = {true}
                            />
                          </Col>
                          <Col sm={6} className="d-flex flex-column gap-2 mt-3">
                            <label
                              className="tempalte-textarea-label"
                              htmlFor="detailed_description"
                            >
                              {data.name} Detailed Description
                            </label>
                            <textarea
                              className="detailed-description-textarea"
                              id="detailed_description"
                              name="detailed_description"
                              value={data.detailed_description}
                              onChange={(e) =>
                                this.handleInputChange(
                                  e,
                                  index,
                                  "detailed_description"
                                )
                              }
                              required
                            ></textarea>
                          </Col>
                        </Row>
                      </form>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data-image-cont">
                <img
                  className="template-no-data-image"
                  src={noDataImage}
                  alt="noDataImage"
                />
                <span>Add figure form</span>
              </div>
            )}
            <Row className="generate-button-section template-bottom-buttons">
              <Col>
                <MyButton
                  text="Add figure"
                  className="generate-button"
                  onClick={this.handleAddFigure}
                />
              </Col>
              <Col className="button-options ">
                <MyButton
                  text="Cancel"
                  className="clear-button"
                  onClick={()=> this.props.templateHandler(true)}
                />
                <MyButton
                  text="Submit"
                  className="generate-button"
                  disabled={this.props.isInputExceed}
                  onClick={this.handleSubmit}
                />
              </Col>
            </Row>
          </div>
        </Row>
      </Container>
    );
  };

  render() {
    return (
      <Container>
        <Modal
          isOpen={true}
          className="react-modal prompt-model template-modal"
          appElement={document.getElementById("root")}
        >
          <Tabs
            defaultIndex={0}
            onSelect={(index) => this.setState({ tab: index })}
          >
            <TabList>
              <Tab focusTabOnClick={"false"}>Project</Tab>
              <Tab focusTabOnClick={"false"}>User</Tab>
              <Tab focusTabOnClick={"false"}>Company</Tab>
            </TabList>
            {
              <div className="template-outer-container">
                <TabPanel>{this.tabPanel()}</TabPanel>
                <TabPanel>{this.tabPanel()}</TabPanel>
                <TabPanel>{this.tabPanel()}</TabPanel>
              </div>
            }
          </Tabs>
        </Modal>
      </Container>
    );
  }
}

export default Template;
