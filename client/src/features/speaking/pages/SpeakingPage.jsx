import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MessageCircle,
  Play,
  Square,
  Mic,
  MicOff,
} from "lucide-react";
import { SpeakingFeedbackService } from "../services/speakingFeedbackService";
import { TavusSpeakingService } from "../services/tavusSpeakingService";
import TavusVideoChat from "../components/TavusVideoChat";
import SpeakingPrompt from "../components/SpeakingPrompt";
import { useAuth } from "../../auth/hooks/useAuth";
import "../speaking.css";

export default function SpeakingPage() {
  // Services
  const [speakingService] = useState(new SpeakingFeedbackService());
  const [tavusService] = useState(new TavusSpeakingService());
  const { getAccessTokenSilently } = useAuth();

  // Speaking session state
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [encouragement, setEncouragement] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Tavus conversation state
  const [conversationId, setConversationId] = useState(null);
  const [conversationActive, setConversationActive] = useState(false);

  // Error handling
  const [error, setError] = useState(null);

  // Initialize with a default question
  useEffect(() => {
    loadDefaultQuestion();
    loadEncouragement();
    testServices();
  }, []);

  const testServices = async () => {
    if (import.meta.env.DEV) {
      console.log("🧪 Testing speaking services...");
      const geminiTest = await speakingService.testConnection();
      const tavusTest = await tavusService.testConnection();
      console.log("🧪 Gemini test:", geminiTest ? "✅" : "❌");
      console.log("🧪 Tavus test:", tavusTest ? "✅" : "❌");
    }
  };

  const loadDefaultQuestion = async () => {
    try {
      const question = await speakingService.generateSpeakingQuestion(
        "beginner",
        "personal"
      );
      setCurrentQuestion(question);
    } catch (error) {
      console.error("Error loading question:", error);
      setCurrentQuestion({
        question: "What is your name?",
        goal: "practice saying your name clearly",
        hints: [
          "Take your time",
          "Say it slowly: 'My name is...'",
          "It's okay to practice a few times",
        ],
      });
    }
  };

  const loadEncouragement = async () => {
    try {
      const encouragementData = await speakingService.getEncouragement(
        "just started"
      );
      setEncouragement(encouragementData);
    } catch (error) {
      console.error("Error loading encouragement:", error);
    }
  };

  const startPractice = () => {
    setIsSessionActive(true);
    setConversationActive(true);
    setFeedback(null);
    setError(null);
  };

  const endPractice = () => {
    setIsSessionActive(false);
    setConversationActive(false);
    setConversationId(null);
  };

  const generateNewQuestion = async () => {
    setIsLoading(true);
    try {
      const question = await speakingService.generateSpeakingQuestion(
        "beginner",
        "personal"
      );
      setCurrentQuestion(question);
      setFeedback(null);
    } catch (error) {
      console.error("Error generating new question:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationStart = (newConversationId) => {
    console.log("🎬 Tavus conversation started:", newConversationId);
    setConversationId(newConversationId);
  };

  const handleConversationEnd = async (endedConversationId, transcript) => {
    console.log("🛑 Tavus conversation ended:", endedConversationId);
    console.log("📝 Tavus transcript:", transcript);

    // Analyze the conversation if we have a transcript
    if (transcript && transcript.messages && transcript.messages.length > 0) {
      try {
        // Extract student responses from transcript
        const studentResponses = transcript.messages
          .filter((msg) => msg.speaker === "user" || msg.speaker === "human")
          .map((msg) => msg.text)
          .join(" ");

        if (studentResponses) {
          const handleAnalyze = async () => {
            const token = await getAccessTokenSilently();
            const feedbackData = await speakingService.analyzeSpeechAttempt(
              currentQuestion?.question || "Speaking practice",
              studentResponses,
              currentQuestion?.goal || "practice speaking",
              token
            );
            console.log("Feedback received:", feedback);
            setFeedback(feedbackData);
          };

          await handleAnalyze();
        }
      } catch (error) {
        console.error("Error analyzing speech:", error);
      }
    }

    setConversationId(null);
    setConversationActive(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#a8c4c3",
        padding: "20px",
        fontFamily: "Comfortaa, cursive",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div
              style={{
                width: "61px",
                height: "62px",
                borderRadius: "20px",
                border: "5px solid rgba(246, 233, 226, 0.85)",
                background: "#c7d9b2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🎤
            </div>
            <h1
              style={{
                color: "#524944",
                fontSize: "25px",
                fontWeight: "700",
                margin: 0,
              }}
            >
              Speaking Practice
            </h1>
          </div>

          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "#524944",
              fontSize: "20px",
              fontWeight: "700",
              textDecoration: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              transition: "background-color 0.2s",
            }}
          >
            <ArrowLeft size={20} />
            Go Back Home
          </Link>
        </div>

        {/* Main Content Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "30px",
            alignItems: "start",
          }}
        >
          {/* Left Column - Question and Controls */}
          <div>
            {/* Speaking Prompt */}
            <SpeakingPrompt
              question={currentQuestion?.question}
              goal={currentQuestion?.goal}
              hints={currentQuestion?.hints}
              onNewQuestion={generateNewQuestion}
              isLoading={isLoading}
            />

            {/* Controls */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "15px",
                marginBottom: "20px",
              }}
            >
              {!isSessionActive ? (
                <button
                  onClick={startPractice}
                  style={{
                    background:
                      "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "16px 32px",
                    fontSize: "18px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "Comfortaa, cursive",
                    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(16, 185, 129, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(16, 185, 129, 0.3)";
                  }}
                >
                  <Play size={20} />
                  Start Video Practice
                </button>
              ) : (
                <button
                  onClick={endPractice}
                  style={{
                    background:
                      "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    padding: "16px 32px",
                    fontSize: "18px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "Comfortaa, cursive",
                    boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow =
                      "0 6px 20px rgba(220, 38, 38, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow =
                      "0 4px 12px rgba(220, 38, 38, 0.3)";
                  }}
                >
                  <Square size={20} />
                  End Video Practice
                </button>
              )}
            </div>

            {/* Encouragement */}
            {encouragement && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  borderRadius: "12px",
                  padding: "20px",
                  textAlign: "center",
                  border: "2px solid rgba(16, 185, 129, 0.2)",
                  marginBottom: "20px",
                }}
              >
                <h3
                  style={{
                    color: "#10b981",
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "12px",
                    fontFamily: "Comfortaa, cursive",
                  }}
                >
                  {encouragement.message}
                </h3>
                <p
                  style={{
                    color: "#374151",
                    fontSize: "14px",
                    marginBottom: "8px",
                    fontFamily: "Comfortaa, cursive",
                  }}
                >
                  💡 {encouragement.tip}
                </p>
                <p
                  style={{
                    color: "#6b7280",
                    fontSize: "12px",
                    fontStyle: "italic",
                    margin: 0,
                    fontFamily: "Comfortaa, cursive",
                  }}
                >
                  {encouragement.motivation}
                </p>
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div
                style={{
                  background: "white",
                  borderRadius: "16px",
                  padding: "24px",
                  border: "2px solid #8b5cf6",
                  boxShadow: "0 4px 12px rgba(139, 92, 246, 0.1)",
                }}
              >
                <h3
                  style={{
                    color: "#8b5cf6",
                    fontSize: "20px",
                    fontWeight: "600",
                    marginBottom: "16px",
                    fontFamily: "Comfortaa, cursive",
                  }}
                >
                  🎉 Great Video Practice Session!
                </h3>
                <p
                  style={{
                    color: "#374151",
                    fontSize: "16px",
                    marginBottom: "16px",
                    fontFamily: "Comfortaa, cursive",
                  }}
                >
                  {feedback.encouragement}
                </p>

                {feedback.strengths && feedback.strengths.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h4
                      style={{
                        color: "#10b981",
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "8px",
                        fontFamily: "Comfortaa, cursive",
                      }}
                    >
                      ✨ What you did well:
                    </h4>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "20px",
                        color: "#6b7280",
                        fontFamily: "Comfortaa, cursive",
                      }}
                    >
                      {feedback.strengths.map((strength, index) => (
                        <li
                          key={index}
                          style={{ fontSize: "12px", marginBottom: "4px" }}
                        >
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {feedback.nextSteps && feedback.nextSteps.length > 0 && (
                  <div>
                    <h4
                      style={{
                        color: "#8b5cf6",
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "8px",
                        fontFamily: "Comfortaa, cursive",
                      }}
                    >
                      🎯 Next time try:
                    </h4>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "20px",
                        color: "#6b7280",
                        fontFamily: "Comfortaa, cursive",
                      }}
                    >
                      {feedback.nextSteps.map((step, index) => (
                        <li
                          key={index}
                          style={{ fontSize: "12px", marginBottom: "4px" }}
                        >
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Tavus Video Chat */}
          <div>
            <TavusVideoChat
              isActive={conversationActive}
              onConversationStart={handleConversationStart}
              onConversationEnd={handleConversationEnd}
              question={currentQuestion?.question}
              goal={currentQuestion?.goal}
              tavusService={tavusService}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
