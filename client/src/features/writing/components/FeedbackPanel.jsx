import React, { useState, useEffect } from 'react';
import { 
  Star, 
  CheckCircle, 
  TrendingUp, 
  FileText, 
  AlertTriangle,
  Lightbulb,
  MessageCircle,
  Sparkles,
  Heart,
  Target,
  Zap
} from 'lucide-react';

export default function FeedbackPanel({ feedback, isAnalyzing, realTimeFeedback }) {
  const [showRealTime, setShowRealTime] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (realTimeFeedback) {
      setShowRealTime(true);
      setAnimationKey(prev => prev + 1);
      // Auto-hide real-time feedback after 10 seconds
      const timer = setTimeout(() => {
        setShowRealTime(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [realTimeFeedback]);

  if (isAnalyzing) {
    return (
      <div className="feedback-panel analyzing">
        <div className="analyzing-content">
          <div className="spinner-container">
            <div className="spinner"></div>
            <Sparkles className="sparkle-icon" size={20} />
          </div>
          <h3 className="analyzing-title">Analyzing your writing...</h3>
          <p className="analyzing-subtitle">I'm reading through your work and preparing helpful feedback!</p>
          <div className="analyzing-steps">
            <div className="step active">📝 Reading your writing</div>
            <div className="step active">🤔 Understanding your ideas</div>
            <div className="step active">✨ Preparing encouragement</div>
          </div>
        </div>
      </div>
    );
  }

  if (!feedback && !showRealTime) {
    return (
      <div className="feedback-panel waiting">
        <div className="waiting-content">
          <MessageCircle className="waiting-icon" size={48} />
          <h3 className="waiting-title">Ready to help!</h3>
          <p className="waiting-subtitle">Start writing and I'll give you live encouragement. Click "Get Feedback" when you're ready for detailed help!</p>
          <div className="writing-tips">
            <h4>💡 Quick Tips:</h4>
            <ul>
              <li>Take your time</li>
              <li>Use describing words</li>
              <li>Share your ideas</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-panel">
      {/* Real-time feedback */}
      {showRealTime && realTimeFeedback && (
        <div key={`realtime-${animationKey}`} className="real-time-feedback">
          <div className="real-time-header">
            <Zap className="real-time-icon" size={18} />
            <span>Live Encouragement</span>
          </div>
          <div className="real-time-content">
            <p className="real-time-message">{realTimeFeedback.message}</p>
            {realTimeFeedback.suggestion && (
              <p className="real-time-suggestion">
                <Lightbulb size={16} />
                {realTimeFeedback.suggestion}
              </p>
            )}
            {realTimeFeedback.progressNote && (
              <p className="real-time-progress">
                <Heart size={16} />
                {realTimeFeedback.progressNote}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main feedback */}
      {feedback && (
        <div className="main-feedback">
          <div className="feedback-header">
            <Sparkles className="feedback-icon" size={24} />
            <h3 className="feedback-title">Your Writing Feedback</h3>
          </div>
          
          {/* Overall Score */}
          <div className="score-card">
            <div className="score-display">
              <div className="score-number">{feedback.overallScore}</div>
              <div className="score-total">/10</div>
              <div className="score-stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={`star ${i < Math.ceil(feedback.overallScore / 2) ? 'filled' : ''}`}
                  />
                ))}
              </div>
            </div>
            <div className="score-encouragement">
              <p>{feedback.encouragement}</p>
            </div>
          </div>

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div className="feedback-section strengths">
              <div className="section-header">
                <CheckCircle className="section-icon" size={20} />
                <h4>What You Did Great!</h4>
              </div>
              <div className="strengths-grid">
                {feedback.strengths.map((strength, index) => (
                  <div key={index} className="strength-item">
                    <div className="strength-icon">🌟</div>
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {feedback.suggestions && feedback.suggestions.length > 0 && (
            <div className="feedback-section suggestions">
              <div className="section-header">
                <Target className="section-icon" size={20} />
                <h4>Ways to Make It Even Better</h4>
              </div>
              <div className="suggestions-list">
                {feedback.suggestions.map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <div className="suggestion-content">
                      <div className="suggestion-main">
                        <strong>{suggestion.suggestion}</strong>
                      </div>
                      {suggestion.example && (
                        <div className="suggestion-example">
                          <span className="example-label">Example:</span>
                          <span className="example-text">{suggestion.example}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar Check */}
          {feedback.grammarCheck && feedback.grammarCheck.errors > 0 && (
            <div className="feedback-section grammar">
              <div className="section-header">
                <FileText className="section-icon" size={20} />
                <h4>Grammar Helpers</h4>
              </div>
              <div className="grammar-corrections">
                {feedback.grammarCheck.corrections.map((correction, index) => (
                  <div key={index} className="correction-item">
                    <div className="correction-change">
                      <span className="correction-before">{correction.original}</span>
                      <span className="correction-arrow">→</span>
                      <span className="correction-after">{correction.corrected}</span>
                    </div>
                    <div className="correction-explanation">{correction.explanation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {feedback.nextSteps && feedback.nextSteps.length > 0 && (
            <div className="feedback-section next-steps">
              <div className="section-header">
                <TrendingUp className="section-icon" size={20} />
                <h4>What to Try Next</h4>
              </div>
              <div className="next-steps-list">
                {feedback.nextSteps.map((step, index) => (
                  <div key={index} className="next-step-item">
                    <div className="step-number">{index + 1}</div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Writing Tips */}
          {feedback.writingTips && feedback.writingTips.length > 0 && (
            <div className="feedback-section tips">
              <div className="section-header">
                <Lightbulb className="section-icon" size={20} />
                <h4>Writing Tips</h4>
              </div>
              <div className="tips-list">
                {feedback.writingTips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <span className="tip-icon">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Scores */}
          <div className="additional-scores">
            <div className="score-item">
              <div className="score-label">Creativity</div>
              <div className="score-value">{feedback.creativityScore}/10</div>
              <div className="score-bar">
                <div 
                  className="score-fill creativity" 
                  style={{ width: `${(feedback.creativityScore / 10) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="score-item">
              <div className="score-label">Level</div>
              <div className="score-badge">{feedback.vocabularyLevel}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
