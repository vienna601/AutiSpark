import React, { useState } from 'react';
import '../ReadingPage.css';

export default function ReadingPage() {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleAnswerClick = (answer) => {
    setSelectedAnswer(answer);
    console.log('Selected answer:', answer);
  };

  return (
    <div className="reading-page">
      {/* Header */}
      <div className="header">
        {/* Left side - Icon and Title */}
        <div className="header-left">
          {/* Icon Container */}
          <div className="icon-container">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#524944" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              <path d="M8 7h8"/>
              <path d="M8 11h8"/>
            </svg>
          </div>

          {/* Reading Heading */}
          <div className="page-heading">
            Reading
          </div>
        </div>

        {/* Right side - Go back home */}
        <a href="/HomePage" className="home-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#524944" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Go back home
        </a>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Section - Story Area */}
        <div className="story-section">
          {/* Story Title */}
          <div className="story-title">
            Mitten the Kitten
          </div>

          {/* Story Content */}
          <div className="story-content">
            {/* Photo Placeholder */}
            <div className="photo-placeholder">
              (photo)
            </div>

            {/* Story Text */}
            <div className="story-text">
              The cat, Mittens, sat on the sunny windowsill. He watched a red bird hop on the green grass outside. Mittens wiggled his tail, dreaming of a chase.
              The cat, Mittens, sat on the sunny windowsill. He watched a red bird hop on the green grass outside. Mittens wiggled his tail, dreaming of a chase.
              The cat, Mittens, sat on the sunny windowsill. He watched a red bird hop on the green grass outside. Mittens wiggled his tail, dreaming of a chase.
              The cat, Mittens, sat on the sunny windowsill. He watched a red bird hop on the green grass outside. Mittens wiggled his tail, dreaming of a chase.
              The cat, Mittens, sat on the sunny windowsill. He watched a red bird hop on the green grass outside. Mittens wiggled his tail, dreaming of a chase.
            </div>
          </div>

          {/* Question Section */}
          <div className="question-section">
            <div className="question-label">Question 1: What was the tone used?</div>

            <div className="answer-buttons">
              <button
                className={`answer-button ${selectedAnswer === 'teach' ? 'selected' : ''}`}
                onClick={() => handleAnswerClick('teach')}
              >
                <div className="button-image" style={{backgroundImage: 'url(/teach.jpg)'}}></div>
                <span className="button-text">teach</span>
              </button>
              <button
                className={`answer-button ${selectedAnswer === 'score' ? 'selected' : ''}`}
                onClick={() => handleAnswerClick('score')}
              >
                <div className="button-image" style={{backgroundImage: 'url(/score.jpg)'}}></div>
                <span className="button-text">score</span>
              </button>
              <button
                className={`answer-button ${selectedAnswer === 'argue' ? 'selected' : ''}`}
                onClick={() => handleAnswerClick('argue')}
              >
                <div className="button-image" style={{backgroundImage: 'url(/argue.jpg)'}}></div>
                <span className="button-text">argue</span>
              </button>
              <button
                className={`answer-button ${selectedAnswer === 'warn' ? 'selected' : ''}`}
                onClick={() => handleAnswerClick('warn')}
              >
                <div className="button-image" style={{backgroundImage: 'url(/warn.jpg)'}}></div>
                <span className="button-text">warn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Video and Goal */}
        <div className="right-section">
          {/* Video Block */}
          <div className="video-block">
            <div className="video-text">
              (video of sb speaking)
            </div>
          </div>

          {/* Goal Block */}
          <div className="goal-block">
            <div className="goal-text">
              Goal:<br/>
              identify emotion
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}