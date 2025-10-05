import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function PlacementPage() {
  const { user, getAccessTokenSilently, signout } = useAuth();
  const navigate = useNavigate();
  const [scores, setScores] = useState({ reading: 0, writing: 0, speaking: 0 });
  const [message, setMessage] = useState("");

  const handleLogout = () => {
    signout();
    navigate("/login");
  };

  const handleSubmit = async () => {
    try {
      const token = await getAccessTokenSilently({
        audience: "https://dev-27p4sca2smt73jw6.us.auth0.com/api/v2/",
      });
      console.log("Token being sent:", token);
      console.log("User ID being sent:", user.sub);

      const res = await fetch("http://localhost:8000/api/placement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user.sub,
          readingScore: scores.reading,
          writingScore: scores.writing,
          speakingScore: scores.speaking,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`${data.message} | Level: ${data.level}`);
      } else {
        setMessage(`Error: ${data.detail || data.message}`);
      }
    } catch (error) {
      console.error("Error submitting placement:", error);
      setMessage("Error submitting placement test.");
    }
  };
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
