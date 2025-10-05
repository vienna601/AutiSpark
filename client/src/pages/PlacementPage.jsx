import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/App.css";
import "../styles/PlacementPage.css";

import logoIcon from "../assets/logo.png";
import speechIcon from "../assets/speaking.png";
import writingIcon from "../assets/writing.png";
import readingIcon from "../assets/reading.png";

const PlacementPage = () => {
  const navigate = useNavigate();

  return (
    <div className="placementpage">
      {/* Subtitle */}
      <p className="placementpage-subtitle">
        Please complete the following assessments for the best effects:
      </p>

      {/* Button Container */}
      <div className="button-container">
        {/* Speech */}
        <div className="feature" onClick={() => navigate("/speaking")}>
          <div className="feature-button speech">
            <div
              className="icon"
              style={{ backgroundImage: `url(${speechIcon})` }}
            ></div>
          </div>
          <p className="feature-label">Speech</p>
        </div>

        {/* Writing */}
        <div className="feature" onClick={() => navigate("/writing")}>
          <div className="feature-button writing">
            <div
              className="icon"
              style={{ backgroundImage: `url(${writingIcon})` }}
            ></div>
          </div>
          <p className="feature-label">Writing</p>
        </div>

        {/* Reading */}
        <div className="feature" onClick={() => navigate("/reading")}>
          <div className="feature-button reading">
            <div
              className="icon"
              style={{ backgroundImage: `url(${readingIcon})` }}
            ></div>
          </div>
          <p className="feature-label">Reading</p>
        </div>
      </div>
    </div>
  );
};

export default PlacementPage;
