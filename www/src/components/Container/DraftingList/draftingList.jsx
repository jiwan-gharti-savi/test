import React, { Component } from "react";
import { connect } from "react-redux";
import "./drafting.css";
import apiServices from "../../../services/apiServices";
import { toast } from "react-toastify";
import Modal from "../ImageViewer/Modal";
import ConfirmDeletion from "../Home/ConfirmDeletion";
import ProjectToggleButtons from "./ProjectToggleButtons";
import ProjectItem from "./ProjectItem";
import NoProjectDataMessage from "./NoProjectData";
import SkeltonLoder from "./SkeltonLoder";
import redInfo from "../../assets/icons/grey_info_red.svg";


class DraftingList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      project: {},
      projectMessage: "",
      isProjectError: "",
      isMenuOverlay: false,
      modifyingProject: false,
      projectID: "",
      loadingProjects: false,
      projectType: "active",
      searchTerm: "",
      isConfirmdeletion: false,
    };
    this.timerId = null;
  }

  componentWillMount() {
    this.fetchProjectData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.user_id !== prevProps.user_id) {
      this.fetchProjectData();
    }
  }

  //To get already stored data from database
  //will be shown on the first page
  fetchProjectData = async (search = false, text) => {
    try {
      let data = {
        id: localStorage.getItem("user_id"),
        role_id: 1,
      };

      let payLoad = {
        user_id: localStorage.getItem("user_id"),
      };

      let response;
      if (search) {
        payLoad.query_text = text;
        payLoad.is_archive = this.state.projectType === "active" ? false : true;
        response = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.search_project_data,
          payLoad
        );
      } else {
        response = await apiServices.getData(
          "post",
          this.props.project?.api_config?.endpoints?.load_all_project,
          payLoad
        );
      }

      if (response["status"] === "Success") {
        this.setState({
          project: response["response"],
        });
      } else if (response["status"] === "Error") {
        this.setState({ isProjectError: true });
      }
      this.setState({ projectMessage: response["message"] });
    } catch (error) {
      this.setState({
        isProjectError: true,
        projectMessage: `unable to get user_id, Please contact to tech : ${error}`,
        project: [],
      });
    }
    this.props.projectFlagHandler();
  };

  navigateHandler = async (id) => {
    try {
      this.props.loadingScreenHandler();
      const { history } = this.props;
      const headers = {
        Authorization: `Bearer ${this.props.token}`,
        "Content-Type": "application/json", // Set the appropriate content type for your requests.
      };

      let payLoad = {
        project_id: id,
      };
      let response = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.is_finished,
        payLoad
      );

      let obj = response["response"];
      let trueKey = null;

      for (const key in obj) {
        if (obj[key] === true) {
          trueKey = key;
          break;
        }
      }

      switch (trueKey) {
        case "project_finish":
          history.push(`patentDetails/${id}`);
          break;
        case "claims":
          history.push(`patentDetails/${id}/edit/Claims/`);
          break;
        case "is_prior_art":
          history.push(`priorArt/${id}`);
          break;
      }
    } catch (e) {
      console.log(e);
    }
  };

  menuButtonToggleHandler = (e, projectId) => {
    this.setState({ isMenuOverlay: projectId });
  };

  hideMenu = () => {
    console.log("hideMenu");
    this.setState({ isMenuOverlay: null });
  };

  toaster = (message, isError = false) => {
    let toastData = this.props.project?.config?.toasterStyle;
    toastData["autoClose"] = 1000;
    if (isError) {
      toast.error(`${message}`, this.props.project?.config?.toasterStyle);
    } else {
      toast.info(`${message}`, this.props.project?.config?.toasterStyle);
    }
  };

  deleteProjectHandler = async () => {
    try {
      let payLoad = {
        project_id: this.state.projectID,
      };
      let response = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.delete_project_data,
        payLoad
      );
      if (response?.status === "Error") {
        this.toaster("Deletion failed. Please try again.", true);
      } else {
        this.toaster("Deletion complete!");
      }
      this.setState({ projectID: "", isConfirmdeletion: false });
      this.fetchProjectData();
    } catch (e) {
      console.log(e);
      this.setState({ projectID: "", isConfirmdeletion: false });
    }
  };

  deleteProjectButtonHandler = async (e, projectId) => {
    try {
      e.stopPropagation();
      e.preventDefault();
      this.setState({ projectID: projectId }, () => {
        this.toggleConfirmdeletion();
      });
    } catch (e) {
      console.log(e);
    }
  };

  archiveProjectHandler = async (e, projectId, type) => {
    try {
      e.stopPropagation();
      e.preventDefault();
      this.setState({ projectID: projectId });
      let payLoad = {
        project_id: projectId,
        type: type,
      };
      let response = await apiServices.getData(
        "post",
        this.props.project?.api_config?.endpoints?.archive_project_data,
        payLoad
      );
      if (response?.status === "Error") {
        this.toaster("Archiving failed. Please try again.", true);
      } else {
        this.toaster("Archive Complete!");
      }
      this.setState({ projectID: "" });
      this.fetchProjectData();
    } catch (e) {
      console.log(e);
      this.setState({ projectID: "" });
    }
  };

  selectedProjectsHandler = async (type) => {
    try {
      switch (type) {
        case "active":
          this.setState({ projectType: "active" }, () => {
            this.fetchProjecthandler(this.state.searchTerm);
          });
          break;
        case "inactive":
          this.setState({ projectType: "inactive" }, () => {
            this.fetchProjecthandler(this.state.searchTerm);
          });
          break;
      }
    } catch (e) {
      console.log(e);
    }
  };

  handleSearchChange = (e) => {
    // Update the search term in the state
    this.setState({ searchTerm: e.target.value });

    // Clear the previous timer
    clearTimeout(this.timerId);

    // Set a new timer to perform the search after a delay (e.g., 300 milliseconds)
    this.timerId = setTimeout(() => {
      this.fetchProjecthandler(e.target.value);
    }, 300);
  };

  fetchProjecthandler = (data) => {
    if (data && data?.trim().length > 0) {
      this.fetchProjectData(true, data);
    } else {
      this.fetchProjectData();
    }
  };

  toggleConfirmdeletion = () => {
    this.setState((pre) => ({
      isConfirmdeletion: !pre.isConfirmdeletion,
    }));
    if (this.state.isConfirmdeletion) {
      this.setState({ projectID: "" });
    }
  };

  clearSearchTerm = () => {
    this.setState({ searchTerm: "" });
    this.fetchProjecthandler();
  };

  render() {
    const {
      project,
      projectType,
      searchTerm,
      projectID,
      isMenuOverlay,
      isConfirmdeletion,
    } = this.state;
    const projectData = project || []; // Default to empty array if project is falsy

    const archiveCount =
      projectData.length > 0 &&
      projectData?.filter((obj) => obj?.is_archive).length;

    return (
      <>
        {this.props.projectLoadingFlag ? (
          <SkeltonLoder />
        ) : (
          <>
            <div className="drafting-list-top-search-bar-buttons">
              <div className="drafting-list-border-line" >

              </div>
              <ProjectToggleButtons
                projectType={projectType}
                selectedProjectsHandler={this.selectedProjectsHandler}
                searchTerm={searchTerm}
                handleSearchChange={this.handleSearchChange}
                clearSearchTerm={this.clearSearchTerm}
              />

            </div>
              {(archiveCount > 0 && this.state.projectType === "inactive" )&&  <div className="preserve-before-delete-container" >
                  <span> <img src={redInfo} alt="redInfo" />Please ensure to export your patent draft and any related prior-art documents before deleting the project. Once the project is deleted, recovery of any data will not be possible.</span>
                </div>}
            <div className="main-footer-grid-container">
              {(archiveCount > 0 && this.state.projectType === "inactive") ||
              (this.state.projectType === "active" &&
                project &&
                project.length > 0) ? (
                projectData.map((project, index) => (
                  <ProjectItem
                    key={index}
                    project={project}
                    projectID={projectID}
                    projectType={projectType}
                    navigateHandler={this.navigateHandler}
                    hideMenu={this.hideMenu}
                    menuButtonToggleHandler={this.menuButtonToggleHandler}
                    isMenuOverlay={isMenuOverlay}
                    archiveProjectHandler={this.archiveProjectHandler}
                    deleteProjectButtonHandler={this.deleteProjectButtonHandler}
                  />
                ))
              ) : (archiveCount === 0 &&
                  this.state.projectType === "inactive") ||
                (project && project.length === 0) ? (
                <NoProjectDataMessage projectType={projectType} />
              ) : (
                ""
              )}
            </div>
          </>
        )}
        <Modal isOpen={isConfirmdeletion} onClose={this.toggleConfirmdeletion}>
          <ConfirmDeletion
            toggleConfirmdeletion={this.toggleConfirmdeletion}
            deleteProjectHandler={this.deleteProjectHandler}
          />
        </Modal>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    project: state.projectData,
    token: state.authReducer.token,
  };
};

export default connect(mapStateToProps)(DraftingList);
