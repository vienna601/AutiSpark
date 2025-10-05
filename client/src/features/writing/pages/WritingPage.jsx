// WritingPage.jsx
import React, { useState } from "react";
import "../writing.css";

export default function WritingPage() {
  const [studentResponse, setStudentResponse] = useState("");

  return (
    <div className="writing-page">
      {/* Header */}
      <div className="header">
        {/* Left side - Icon and Title */}
        <div className="header-left">
          {/* Icon Container */}
          <div className="icon-container">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#524944"
              strokeWidth="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>

          {/* Writing Heading */}
          <div className="page-heading">Writing</div>
        </div>

        {/* Right side - Go back home */}
        <a href="/HomePage" className="home-link">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#524944"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Go back home
        </a>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Section - Prompt Area */}
        <div className="prompt-section">
          {/* Prompt Title */}
          <div className="prompt-title">Prompt</div>

          {/* Comment Section */}
          <div className="comment-section">
            <svg
              className="comment-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#A8B5C8"
              strokeWidth="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <line x1="9" y1="10" x2="15" y2="10" />
              <line x1="9" y1="14" x2="13" y2="14" />
            </svg>
            <span className="comment-text">
              comment: start with a sentence on your name.
            </span>
          </div>

          {/* Student Response Input */}
          <textarea
            className="response-input"
            placeholder="student writes their response"
            value={studentResponse}
            onChange={(e) => setStudentResponse(e.target.value)}
          />
        </div>

        {/* Right Side - Video and Goal */}
        <div className="right-section">
          {/* Video Block */}
          <div className="video-block">
            <div className="video-text">(video of sb speaking)</div>
          </div>

          {/* Goal Block */}
          <div className="goal-block">
            <div className="goal-text">
              Goal
              <br />
              write a structured response
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
