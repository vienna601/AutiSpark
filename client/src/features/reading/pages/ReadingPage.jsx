import React, { useState, useEffect } from "react";
import {
  Book,
  Brain,
  MessageCircle,
  ChevronRight,
  Star,
  Trophy,
  Target,
  Lightbulb,
} from "lucide-react";
import { READING_STORIES, DIFFICULTY_LEVELS } from "../data/readingStories";
import { ReadingComprehensionService } from "../services/readingComprehensionService";
import TavusReadingAssistant from "../components/TavusReadingAssistant";
import { testAPIConnections } from "../utils/testConfig";
import "../ReadingPage.css";

export default function ReadingPage() {
  // State management
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // AI Assistant states
  const [geminiHint, setGeminiHint] = useState(null);
  const [showHint, setShowHint] = useState(false);

  // Services
  const [readingService] = useState(new ReadingComprehensionService());

  // Get stories for current difficulty
  const stories = READING_STORIES[`difficulty${selectedDifficulty}`] || [];
  const currentStory = selectedStory;
  const currentQuestion = currentStory?.questions[currentQuestionIndex];

  // Handle story selection
  const handleStorySelect = (story) => {
    setSelectedStory(story);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCompletedQuestions([]);
    setScore(0);
    setShowResults(false);
    setGeminiHint(null);
    setShowHint(false);
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correct;

    if (isCorrect) {
      setScore(score + 1);
    }

    setCompletedQuestions([
      ...completedQuestions,
      {
        questionId: currentQuestion.id,
        selected: selectedAnswer,
        correct: currentQuestion.correct,
        isCorrect,
      },
    ]);

    setShowExplanation(true);

    // Get explanation from Gemini
    try {
      const explanation = await readingService.getExplanation(
        currentStory.story,
        currentQuestion.question,
        currentQuestion.options[currentQuestion.correct],
        currentQuestion.options[selectedAnswer],
        isCorrect
      );

      setGeminiHint(explanation);
    } catch (error) {
      console.error("Error getting explanation:", error);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentStory.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setGeminiHint(null);
      setShowHint(false);
    } else {
      setShowResults(true);
    }
  };

  // Get hint from Gemini
  const handleGetHint = async () => {
    if (showHint || showExplanation) return;

    try {
      const hint = await readingService.getReadingHints(
        currentStory.story,
        currentQuestion.question,
        selectedAnswer !== null ? currentQuestion.options[selectedAnswer] : null
      );

      setGeminiHint(hint);
      setShowHint(true);
    } catch (error) {
      console.error("Error getting hint:", error);
    }
  };

  // Reset to story selection
  const handleBackToStories = () => {
    setSelectedStory(null);
    setShowResults(false);
  };

  // Initialize services and test connections
  useEffect(() => {
    if (import.meta.env.DEV) {
      const apiStatus = testAPIConnections();
      console.log("🔧 API Status:", apiStatus);
    }
  }, []);

  return (
    <div className="reading-page">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="icon-container">
            <Book size={32} stroke="#8b5cf6" />
          </div>
          <div className="page-heading">Reading Comprehension</div>
        </div>
        <a href="/" className="home-link">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Go back home
        </a>
      </div>

      {!selectedStory ? (
        <>
          {/* Difficulty Selection */}
          <div className="difficulty-section">
            <h2 className="difficulty-title">
              <Target size={24} stroke="#8b5cf6" />
              Choose Your Level
            </h2>
            <div className="difficulty-grid">
              {DIFFICULTY_LEVELS.map((level) => (
                <div
                  key={level.id}
                  className={`difficulty-card ${
                    selectedDifficulty === level.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedDifficulty(level.id)}
                >
                  <div className="difficulty-number">{level.id}</div>
                  <h3
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.125rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {level.name}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {level.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Story Selection */}
          <div className="story-selection">
            <h2 className="difficulty-title">
              Choose a Story - Level {selectedDifficulty}
            </h2>
            <div className="story-grid">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="story-card"
                  onClick={() => handleStorySelect(story)}
                >
                  <div className="story-header">
                    <h3 className="story-title">{story.title}</h3>
                    <ChevronRight size={24} stroke="#8b5cf6" />
                  </div>
                  <p className="story-preview">
                    {story.story.substring(0, 150)}...
                  </p>
                  <div className="story-footer">
                    <span className="question-count">
                      {story.questions.length} Questions
                    </span>
                    <button className="start-button">Start Reading</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : showResults ? (
        // Results Screen
        <div className="results-screen">
          <Trophy size={64} className="results-icon" />
          <h2 className="results-title">Great Job!</h2>
          <p className="results-subtitle">
            You completed "{currentStory.title}"
          </p>

          <div className="results-score">
            <div className="score-display">
              {score} / {currentStory.questions.length}
            </div>
            <p className="score-description">Questions Correct</p>
          </div>

          <div className="results-actions">
            <button onClick={handleBackToStories} className="back-button">
              Choose Another Story
            </button>
          </div>
        </div>
      ) : (
        // Reading Interface with Split Screen
        <div className="reading-interface">
          {/* Left Section - Reading Content */}
          <div className="reading-content">
            <div className="story-section">
              <div className="story-header-reading">
                <h2 className="story-title-reading">{currentStory.title}</h2>
                <div className="question-progress">
                  Question {currentQuestionIndex + 1} of{" "}
                  {currentStory.questions.length}
                </div>
              </div>

              <div className="story-content">
                <div className="photo-placeholder">(story illustration)</div>
                <div className="story-text">{currentStory.story}</div>
              </div>

              <div className="question-section">
                <div className="question-label">{currentQuestion.question}</div>

                <div className="answer-buttons">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showExplanation}
                      className={`answer-button ${
                        selectedAnswer === index
                          ? showExplanation
                            ? index === currentQuestion.correct
                              ? "correct"
                              : "incorrect"
                            : "selected"
                          : showExplanation && index === currentQuestion.correct
                          ? "correct"
                          : ""
                      }`}
                    >
                      <div className="button-image"></div>
                      <span className="button-text">{option}</span>
                    </button>
                  ))}
                </div>

                <div className="action-buttons">
                  <button
                    onClick={handleGetHint}
                    disabled={showHint || showExplanation}
                    className="hint-button"
                  >
                    <Lightbulb size={20} />
                    Get Hint
                  </button>

                  {!showExplanation ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="submit-button"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="next-button"
                    >
                      {currentQuestionIndex < currentStory.questions.length - 1
                        ? "Next Question"
                        : "See Results"}
                    </button>
                  )}
                </div>
              </div>

              {/* AI Assistant Panel */}
              <div className="ai-assistant">
                <div className="assistant-header">
                  <Brain size={20} stroke="#3b82f6" />
                  <h3 className="assistant-title">AI Reading Helper</h3>
                </div>

                {geminiHint && (showHint || showExplanation) && (
                  <>
                    {showHint && (
                      <div className="hint-display">
                        <h4 className="hint-title">
                          <Lightbulb size={16} />
                          Reading Hint
                        </h4>
                        <p className="hint-content">{geminiHint.hint}</p>
                        <p className="hint-tip">{geminiHint.readingTip}</p>
                      </div>
                    )}

                    {showExplanation && (
                      <div className="explanation-display">
                        <h4 className="explanation-title">Explanation</h4>
                        <p className="explanation-content">
                          {geminiHint.explanation}
                        </p>
                        <p className="explanation-encouragement">
                          {geminiHint.encouragement}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Progress */}
                <div className="progress-section">
                  <h4 className="progress-title">Progress</h4>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${
                          ((currentQuestionIndex + 1) /
                            currentStory.questions.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <p className="progress-text">
                    Question {currentQuestionIndex + 1} of{" "}
                    {currentStory.questions.length}
                  </p>
                </div>

                {/* Score */}
                <div className="score-section">
                  <div className="score-row">
                    <span className="score-label">Score:</span>
                    <div className="score-value">
                      <Star size={16} fill="#f59e0b" stroke="#f59e0b" />
                      <span className="score-number">{score}</span>
                    </div>
                  </div>
                </div>

                {/* Reading Tips */}
                <div className="tips-section">
                  <p className="tips-title">
                    💡 <strong>Tips:</strong>
                  </p>
                  <ul className="tips-list">
                    <li>Read the story carefully</li>
                    <li>Look for key words in the question</li>
                    <li>Find evidence in the text</li>
                    <li>Use the hint if you need help</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Tavus Video Assistant */}
          <div className="tavus-section">
            <TavusReadingAssistant
              selectedStory={selectedStory}
              currentQuestion={currentQuestion}
              currentQuestionIndex={currentQuestionIndex}
              showResults={showResults}
              score={score}
            />
          </div>
        </div>
      )}
    </div>
  );
}
