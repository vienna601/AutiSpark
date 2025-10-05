import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { WritingFeedbackService } from '../services/writingFeedbackService';
import "../writing.css";
import logoIcon from '../../../assets/logo.png';

export default function WritingPage() {
  const navigate = useNavigate();
  const [currentPrompt] = useState({
    prompt: "Write about your favorite animal. What does it look like? What does it like to do?",
    goal: "write a structured response",
    expectedLength: "3-5 sentences",
    level: "Beginner",
    tips: ["Start with a sentence about your name", "Use describing words like colors and sizes"]
  });
  
  const [studentResponse, setStudentResponse] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        
        if (finalTranscript) {
          setStudentResponse(prev => prev + finalTranscript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Update word count
  useEffect(() => {
    const words = studentResponse.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [studentResponse]);

  const handleTextChange = (e) => {
    setStudentResponse(e.target.value);
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const resetWriting = () => {
    setStudentResponse('');
    setWordCount(0);
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const saveWriting = () => {
    const writingData = {
      prompt: currentPrompt.prompt,
      text: studentResponse,
      timestamp: new Date().toISOString(),
      wordCount
    };
    
    const savedWritings = JSON.parse(localStorage.getItem('autispark_writings') || '[]');
    savedWritings.push(writingData);
    localStorage.setItem('autispark_writings', JSON.stringify(savedWritings));
    
    alert('Writing saved successfully!');
  };

  return (
    <div className="writing-page">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="logo-icon">
            <img src={logoIcon} alt="Logo" className="logo-image" />
          </div>
          <div className="icon-container">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#524944" strokeWidth="2">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
          </div>
          <div className="page-heading">Writing</div>
        </div>

        <a href="/" className="home-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#524944" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Go back home
        </a>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Section - Writing Area */}
        <div className="writing-section">
          {/* Prompt Card */}
          <div className="prompt-card">
            <h2 className="prompt-heading">Today's Writing Prompt</h2>
            
            <p className="prompt-text">{currentPrompt.prompt}</p>
            
            <div className="prompt-details">
              <div className="detail-item">
                <span className="detail-label">Goal:</span>
                <span className="detail-value">{currentPrompt.goal}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Expected Length:</span>
                <span className="detail-value">{currentPrompt.expectedLength}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Level:</span>
                <span className="detail-value">{currentPrompt.level}</span>
              </div>
            </div>

            <div className="helpful-tips">
              <h4>Helpful Tips:</h4>
              <ul>
                {currentPrompt.tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Writing Input Card */}
          <div className="writing-input-card">
            <div className="writing-header">
              <h3>Your Writing</h3>
              <div className="writing-controls">
                <button
                  onClick={toggleSpeechRecognition}
                  className={`control-btn ${isListening ? 'listening' : ''}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                  {isListening ? 'Stop Dictation' : 'Start Dictation'}
                </button>
              </div>
            </div>

            <div className="comment-hint">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#89a8c4" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>comment: {currentPrompt.tips[0]}</span>
            </div>

            <textarea
              className="writing-textarea"
              placeholder="Start writing here... You can type or use the microphone to speak your ideas!"
              value={studentResponse}
              onChange={handleTextChange}
              rows={10}
            />

            <div className="writing-footer">
              <div className="word-count">
                {wordCount} words • {studentResponse.length} characters
              </div>
              
              <div className="action-buttons">
                <button
                  onClick={saveWriting}
                  disabled={!studentResponse.trim()}
                  className="save-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  Save
                </button>
                
                <button
                  onClick={resetWriting}
                  className="reset-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                  </svg>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Help */}
        <div className="help-section">
          {/* Ask for Help Panel */}
          <div className="help-panel">
            <div className="help-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <h3>Ask for Help</h3>
            </div>
            
            <div className="help-input-area">
              <textarea
                className="help-input"
                placeholder="Ask me anything about writing! Like 'How do I start?' or 'I'm stuck, what should I write?'"
                rows={3}
              />
              <button className="send-button">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>

            <div className="quick-questions-box">
              <h4>Quick Questions:</h4>
              <div className="quick-questions-list">
                <button className="quick-question">How do I start writing?</button>
                <button className="quick-question">I'm stuck, what should I do?</button>
                <button className="quick-question">How do I get ideas?</button>
                <button className="quick-question">What should I write about?</button>
                <button className="quick-question">How long should my writing be?</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}