import React, { useState } from "react";

export default function HelpPanel({ feedbackService }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    try {
      const response = await feedbackService.askQuestion(question);
      setAnswer(response.answer || "No answer returned.");
    } catch (error) {
      console.error(error);
      setAnswer("Error: Unable to get help at the moment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="help-panel">
      <div className="help-header">
        <h3>Ask for Help</h3>
      </div>

      <div className="help-input-area">
        <textarea
          className="help-input"
          placeholder="Ask me anything about writing..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <button onClick={handleAsk} className="send-button">
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </div>

      {answer && (
        <div className="quick-questions-box">
          <h4>AI Reply:</h4>
          <p style={{ fontFamily: "Comfortaa", color: "#524944" }}>{answer}</p>
        </div>
      )}
    </div>
  );
}
