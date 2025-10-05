import React, { useState } from "react";
import { Home, MessageCircle } from "lucide-react";
import TavusVideo from "../../reading-trainer/src/components/TavusVideo";
import "../speaking.css";

export default function SpeakingPage() {
  const [feedback, setFeedback] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [transcriptData, setTranscriptData] = useState([]);

  const handleFeedbackGenerated = (feedbackData) => {
    setFeedback(feedbackData);
  };

  const handleTranscriptUpdate = (transcriptEntry) => {
    setTranscriptData((prev) => [...prev, transcriptEntry]);
  };
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
        <div className="left-rectangle">
          <div className="question-text">What is your name?</div>
          <div className="response-area">
            <TavusVideo
              readingProgress={{
                currentPage: 0,
                totalPages: 1,
                shouldGenerateFeedback: true,
                correctAnswers: 0,
                incorrectAnswers: 0,
              }}
              onFeedbackGenerated={handleFeedbackGenerated}
              onTranscriptUpdate={handleTranscriptUpdate}
              onConversationStart={setConversationId}
              currentGoal="speaking practice"
              storyContext={{
                title: "Conversation Practice",
                difficulty: "beginner",
                content: [{ text: "Let's practice introducing ourselves." }],
              }}
            />
          </div>
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
