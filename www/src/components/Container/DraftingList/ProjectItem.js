// ProjectItem.js
import "./drafting.css";
import default_image from "../../assets/icons/default_image.png";
import menuIcon from "../../assets/icons/menu_projects.svg";
import deleteIcon from "../../assets/icons/delete.svg";
import unArchive from "../../assets/icons/unarchive.svg";
import archive from "../../assets/icons/archive.svg";
import LoadingScreen from "../../LoadingScreen/loadingScreen";
import React from "react";

const ProjectItem = ({
  project,
  projectID,
  projectType,
  navigateHandler,
  hideMenu,
  menuButtonToggleHandler,
  isMenuOverlay,
  archiveProjectHandler,
  deleteProjectButtonHandler,
}) => {
  const { invention_title, created_at, project_id, is_archive } = project;

  return (
    <div
      className="each-item"
      onClick={() => navigateHandler(project_id)}
      onMouseLeave={hideMenu}
      onMouseEnter={hideMenu}
      style={{
        display:
          (projectType === "inactive" && is_archive) ||
          (projectType === "active" && !is_archive)
            ? ""
            : "none",
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="project-item-project-completion-tags"
      >
        <span className="prior-art-tile">Prior art</span>
        <span className="claims-tile">Claims</span>
        <span className="patent-tile">Patent</span>
      </div>

      <div className="last-active-heading-container">
        <p>2 days ago</p>
      </div>
      {projectID === project_id && <LoadingScreen />}
      <div className="each-item-overlay-toggle-btn">
        <img
          src={menuIcon}
          alt="menu_icon"
          className="each-item-overlay-menu_icon"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={(e) => menuButtonToggleHandler(e, project_id)}
        />
      </div>
      {isMenuOverlay === project_id && (
        <div className="each-item-overlay" onMouseLeave={hideMenu}>
          <div className="overlay-container">
            <div
              className="overlay-menu-item"
              onClick={(e) =>
                archiveProjectHandler(
                  e,
                  project_id,
                  is_archive ? "unarchive" : "archive"
                )
              }
            >
              <img src={is_archive ? unArchive : archive} alt="inactive" />
              {is_archive ? "Unarchive" : "Archive"}
            </div>
            {is_archive && (
              <div
                className="overlay-menu-item"
                onClick={(e) => deleteProjectButtonHandler(e, project_id)}
              >
                <img src={deleteIcon} alt="rename" />
                Delete Project
              </div>
            )}
          </div>
        </div>
      )}
      <div className="each-item-title">
        <span>{invention_title}</span>
      </div>
      <div className="each-item-image">
        <img
          src={default_image}
          alt="sample1_icon"
          className="each_item_icon"
        />
      </div>
      <span className="history-date">{created_at}</span>
    </div>
  );
};

export default ProjectItem;
