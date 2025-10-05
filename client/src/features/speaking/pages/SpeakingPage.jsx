// SpeechTherapyPage.jsx
import React from "react";
import { Home, MessageCircle } from "lucide-react";
import "../speaking.css";

export default function SpeakingPage() {
  return (
    <div className="speech-page">
      {/* Header */}
      <div className="header">
        {/* Left side - Icon and Title */}
        <div className="header-left">
          {/* Green Icon */}
          <div className="icon-container">
            <MessageCircle size={30} color="#524944" />
          </div>

          {/* Speech Heading */}
          <div className="speech-heading">Speech</div>
        </div>

        {/* Right side - Go back home */}
        <a href="/HomePage" className="home-link">
          <Home size={20} color="#524944" />
          Go back home
        </a>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Rectangle */}
        <div className="left-rectangle">
          {/* Question Text */}
          <div className="question-text">What is your name?</div>

          {/* Gray Response Area */}
          <div className="response-area"></div>
        </div>

        {/* Right Side - Three Blocks */}
        <div className="right-blocks">
          {/* Encouragement Block */}
          <div className="info-block">
            <div className="block-text">encouragement</div>
          </div>

          {/* Helpful Hints Block */}
          <div className="info-block">
            <div className="block-text">helpful hints</div>
          </div>

          {/* Goal Block */}
          <div className="info-block">
            <div className="block-text">goal: complete a conversation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
