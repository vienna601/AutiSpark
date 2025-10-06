import React from "react";
import {
  MessageSquare,
  Target,
  Clock,
  Lightbulb,
  RefreshCw,
} from "lucide-react";

export default function WritingPrompt({ prompt, onNewPrompt, isGenerating }) {
  return (
    <div className="prompt-card">
      <div className="prompt-header">
        <h2 className="prompt-heading">Today's Writing Prompt</h2>
        <button
          onClick={onNewPrompt}
          disabled={isGenerating}
          className="generate-btn"
        >
          <RefreshCw className={isGenerating ? "rotate-icon" : ""} size={16} />
          {isGenerating ? "Generating..." : "New Prompt"}
        </button>
      </div>

      <div className="prompt-main">
        <div className="prompt-icon">
          <MessageSquare size={22} color="#524944" />
        </div>
        <p className="prompt-text">{prompt.prompt}</p>
      </div>

      <div className="prompt-details">
        <div className="detail-item">
          <Target size={16} color="#3B82F6" />
          <div>
            <span className="detail-label">Goal:</span>{" "}
            <span className="detail-value">{prompt.goal}</span>
          </div>
        </div>
        <div className="detail-item">
          <Clock size={16} color="#10B981" />
          <div>
            <span className="detail-label">Expected Length:</span>{" "}
            <span className="detail-value">{prompt.expectedLength}</span>
          </div>
        </div>
        <div className="detail-item">
          <Lightbulb size={16} color="#F59E0B" />
          <div>
            <span className="detail-label">Level:</span>{" "}
            <span className="detail-value">{prompt.level || "Beginner"}</span>
          </div>
        </div>
      </div>

      {prompt.tips && prompt.tips.length > 0 && (
        <div className="helpful-tips">
          <h4>Helpful Tips:</h4>
          <ul>
            {prompt.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
