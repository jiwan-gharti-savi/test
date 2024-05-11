import React from "react";

function Abstract() {
  return (
    <div>
      {" "}
      <div className="details-skeleton-section"> 
        <div className="container detail-skeleton-container">
          <div className="detail-left-section">
            <div className="original-document-block skeleton-small-box"> 
            </div> 
          </div>
          
          <div className="detail-right-section">
            <div className="abstract-skeleton-part skeleton-small-box"></div>
            <div className="family-members-block">
              <div className="each-field skeleton-progress-bar-md">
                <div className="skeleton-small-box progess-value"></div>
              </div>
              <div className="each-value skeleton-progress-bar-md">
                <div className="skeleton-small-box progess-value"></div>
              </div>
            </div>

            <div className="family-members-block">
              <div className="each-field skeleton-progress-bar-md">
                <div className="skeleton-small-box progess-value"></div>
              </div>
              <div className="each-value skeleton-progress-bar-md">
                <div className="skeleton-small-box progess-value"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Abstract;
