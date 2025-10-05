import React, { useState, useRef, useEffect } from "react";
import {
  Edit3,
  Save,
  RotateCcw,
  Mic,
  MicOff,
  Home,
  Eye,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import WritingPrompt from "../components/WritingPrompt";
import FeedbackPanel from "../components/FeedbackPanel";
import WritingHints from "../components/WritingHints";
import { WritingFeedbackService } from "../services/writingFeedbackService";
import "../writing.css";

export default function WritingPage() {
  const [currentPrompt, setCurrentPrompt] = useState({
    prompt:
      "Write about your favorite animal. What does it look like? What does it like to do?",
    goal: "write a structured response",
    expectedLength: "3-5 sentences",
    tips: [
      "Start with a sentence about your name",
      "Use describing words like colors and sizes",
    ],
  });

  const [studentResponse, setStudentResponse] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [realTimeFeedback, setRealTimeFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const recognitionRef = useRef(null);
  const feedbackService = useRef(new WritingFeedbackService());
  const feedbackTimeoutRef = useRef(null);

  // Add this test function
  const testGeminiConnection = async () => {
    console.log("🧪 Testing Gemini API connection...");
    const result = await feedbackService.current.testConnection();
    if (result) {
      alert("✅ Gemini API connection successful!");
    } else {
      alert("❌ Gemini API connection failed. Check console for details.");
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + " ";
          }
        }

        if (finalTranscript) {
          setStudentResponse((prev) => prev + finalTranscript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
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

  // Update word count and get real-time feedback
  useEffect(() => {
    const words = studentResponse
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);

    // Debounce real-time feedback
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    if (studentResponse.length > 20) {
      feedbackTimeoutRef.current = setTimeout(async () => {
        try {
          const realTime = await feedbackService.current.getRealTimeFeedback(
            studentResponse,
            currentPrompt.prompt
          );
          setRealTimeFeedback(realTime);
        } catch (error) {
          console.error("Error getting real-time feedback:", error);
        }
      }, 2000); // Wait 2 seconds after user stops typing
    }

    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [studentResponse, currentPrompt.prompt]);

  const handleTextChange = (e) => {
    setStudentResponse(e.target.value);
  };

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser");
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

  const generateNewPrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const newPrompt = await feedbackService.current.generatePrompt(
        "beginner",
        "personal"
      );
      setCurrentPrompt(newPrompt);
      // Reset everything when getting new prompt
      setStudentResponse("");
      setFeedback(null);
      setRealTimeFeedback(null);
    } catch (error) {
      console.error("Error generating prompt:", error);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const analyzeFeedback = async () => {
    if (!studentResponse.trim()) {
      alert("Please write something first!");
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await feedbackService.current.analyzeWriting(
        currentPrompt.prompt,
        studentResponse,
        currentPrompt.goal
      );
      setFeedback(result);
      setRealTimeFeedback(null); // Clear real-time feedback when we get full feedback
    } catch (error) {
      console.error("Error getting feedback:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetWriting = () => {
    setStudentResponse("");
    setFeedback(null);
    setRealTimeFeedback(null);
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
      feedback: feedback,
      timestamp: new Date().toISOString(),
      wordCount,
    };

    // Save to localStorage
    const savedWritings = JSON.parse(
      localStorage.getItem("autispark_writings") || "[]"
    );
    savedWritings.push(writingData);
    localStorage.setItem("autispark_writings", JSON.stringify(savedWritings));

    alert("Writing saved successfully!");
  };

  return (
    <div className="writing-page">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <div className="icon-container">
            <Edit3 size={32} color="#524944" />
          </div>
          <div className="page-heading">Writing</div>
          {/* Add test button in development */}
          {import.meta.env.DEV && (
            <button
              onClick={testGeminiConnection}
              className="ml-4 px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              Test API
            </button>
          )}
        </div>

        <Link to="/" className="home-link">
          <Home size={20} />
          Go back home
        </Link>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Section - Prompt and Writing Area */}
        <div className="left-section">
          {/* Writing Prompt */}
          <WritingPrompt
            prompt={currentPrompt}
            onNewPrompt={generateNewPrompt}
            isGenerating={isGeneratingPrompt}
          />

          {/* Writing Area */}
          <div className="prompt-section">
            <div className="prompt-title-container">
              <div className="prompt-title">Your Writing</div>
              <div className="controls">
                <button
                  onClick={toggleSpeechRecognition}
                  className={`control-button ${isListening ? "listening" : ""}`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  {isListening ? "Stop Dictation" : "Start Dictation"}
                </button>

                <button
                  onClick={analyzeFeedback}
                  disabled={!studentResponse.trim() || isAnalyzing}
                  className="analyze-button"
                >
                  {isAnalyzing ? "Analyzing..." : "Get Feedback"}
                </button>
              </div>
            </div>

            {/* Comment hint */}
            <div className="comment-section">
              <MessageSquare className="comment-icon" size={20} />
              <span className="comment-text">
                comment:{" "}
                {currentPrompt.tips?.[0] ||
                  "take your time and express your thoughts clearly."}
              </span>
            </div>

            {/* Text Area */}
            <textarea
              className="response-input"
              placeholder="Start writing here... You can type or use the microphone to speak your ideas!"
              value={studentResponse}
              onChange={handleTextChange}
              rows={12}
            />

            {/* Writing Stats and Controls */}
            <div className="stats-controls">
              <div className="stats">
                {wordCount} words • {studentResponse.length} characters
              </div>

              <div className="action-controls">
                <button
                  onClick={saveWriting}
                  disabled={!studentResponse.trim()}
                  className="save-button"
                >
                  <Save size={16} />
                  Save
                </button>

                <button onClick={resetWriting} className="reset-button">
                  <RotateCcw size={16} />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Hints and Feedback */}
        <div className="right-section">
          {/* AI Writing Hints */}
          <WritingHints
            currentText={studentResponse}
            prompt={currentPrompt.prompt}
            goal={currentPrompt.goal}
            feedbackService={feedbackService.current}
          />

          {/* Feedback Panel */}
          <div className="feedback-container">
            <FeedbackPanel
              feedback={feedback}
              isAnalyzing={isAnalyzing}
              realTimeFeedback={realTimeFeedback}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
