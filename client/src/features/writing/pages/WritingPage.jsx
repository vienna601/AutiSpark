import React, { useState, useRef, useEffect } from "react";
import { Edit3, Save, RotateCcw, Mic, MicOff, Home } from "lucide-react";
import { Link } from "react-router-dom";
import WritingPrompt from "../components/WritingPrompt";
import WritingHints from "../components/WritingHints";
import FeedbackPanel from "../components/FeedbackPanel";
import { WritingFeedbackService } from "../services/writingFeedbackService";
import "../writing.css";

export default function WritingPage() {
  // --- Core States ---
  const [currentPrompt, setCurrentPrompt] = useState({
    prompt:
      "Write about your favorite animal. What does it look like? What does it like to do?",
    goal: "write a structured response",
    expectedLength: "3–5 sentences",
    level: "Beginner",
    tips: [
      "Start with a sentence about your name.",
      "Use describing words like colors and sizes.",
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

  // --- Initialize speech recognition ---
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

      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e) => {
        console.error("Speech recognition error:", e.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // --- Word Count + Real-time feedback ---
  useEffect(() => {
    const words = studentResponse
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    setWordCount(words.length);

    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
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
      }, 2000);
    }
  }, [studentResponse, currentPrompt.prompt]);

  // --- Handlers ---
  const handleTextChange = (e) => setStudentResponse(e.target.value);

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
      setRealTimeFeedback(null);
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
    const data = {
      prompt: currentPrompt.prompt,
      text: studentResponse,
      feedback,
      timestamp: new Date().toISOString(),
      wordCount,
    };
    const saved = JSON.parse(
      localStorage.getItem("autispark_writings") || "[]"
    );
    saved.push(data);
    localStorage.setItem("autispark_writings", JSON.stringify(saved));
    alert("Writing saved successfully!");
  };

  return (
    <div className="writing-page">
      {/* ===== Header ===== */}
      <div className="header">
        <div className="header-left">
          <div className="icon-container">
            <Edit3 size={32} stroke="#524944" />
          </div>
          <div className="page-heading">Writing</div>
        </div>

        <Link to="/" className="home-link">
          <Home size={20} />
          Go back home
        </Link>
      </div>

      {/* ===== Main Content ===== */}
      <div className="main-content">
        {/* Left Section */}
        <div className="writing-section">
          <WritingPrompt
            prompt={currentPrompt}
            onNewPrompt={generateNewPrompt}
            isGenerating={isGeneratingPrompt}
          />

          <div className="writing-input-card">
            <div className="writing-header">
              <h3>Your Writing</h3>
              <div className="writing-controls">
                <button
                  onClick={toggleSpeechRecognition}
                  className={`control-btn ${isListening ? "listening" : ""}`}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  {isListening ? "Stop Dictation" : "Start Dictation"}
                </button>

                <button
                  onClick={analyzeFeedback}
                  disabled={!studentResponse.trim() || isAnalyzing}
                  className="feedback-btn control-btn"
                >
                  {isAnalyzing ? "Analyzing..." : "Get Feedback"}
                </button>
              </div>
            </div>

            <div className="comment-hint">
              <span>
                Tip:{" "}
                {currentPrompt.tips?.[0] ||
                  "Take your time and express your thoughts clearly."}
              </span>
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
                  <Save size={16} /> Save
                </button>
                <button onClick={resetWriting} className="reset-btn">
                  <RotateCcw size={16} /> Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="help-section">
          {/* ✅ Keep only these: Ask for Help + Hints + Feedback */}
          <div className="help-panel">
            <div className="help-header">
              <h3>Ask for Help</h3>
            </div>
            <div className="help-input-area">
              <textarea
                className="help-input"
                placeholder="Ask me anything about writing..."
              />
              <button className="send-button">Send</button>
            </div>

            <div className="quick-questions-box">
              <h4>Quick Questions:</h4>
              <div className="quick-questions-list">
                {[
                  "How do I start my paragraph?",
                  "I'm stuck, what should I do?",
                  "What should I write next?",
                ].map((q, i) => (
                  <button key={i} className="quick-question">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <FeedbackPanel
            feedback={feedback}
            isAnalyzing={isAnalyzing}
            realTimeFeedback={realTimeFeedback}
          />
        </div>
      </div>
    </div>
  );
}
