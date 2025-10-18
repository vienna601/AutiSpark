import React from 'react';
import { CheckCircle, Star, Target, Lightbulb } from 'lucide-react';

export default function FeedbackBubble({ feedback, onClose }) {
  if (!feedback) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'white',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '400px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      border: '2px solid #10b981',
      zIndex: 1000,
      fontFamily: 'Comfortaa, cursive'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle size={24} color="#10b981" />
          <h3 style={{
            color: '#10b981',
            fontSize: '18px',
            fontWeight: '600',
            margin: 0
          }}>
            Speaking Feedback
          </h3>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '4px'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Overall Score */}
      {feedback.overallScore && (
        <div style={{
          background: '#f0fdf4',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            marginBottom: '4px'
          }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                fill={i < Math.floor(feedback.overallScore / 2) ? '#fbbf24' : 'none'}
                color="#fbbf24"
              />
            ))}
          </div>
          <div style={{
            color: '#10b981',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Score: {feedback.overallScore}/10
          </div>
        </div>
      )}

      {/* Encouragement */}
      {feedback.encouragement && (
        <div style={{
          marginBottom: '16px'
        }}>
          <p style={{
            color: '#374151',
            fontSize: '14px',
            lineHeight: '1.5',
            margin: 0,
            textAlign: 'center',
            fontStyle: 'italic'
          }}>
            "{feedback.encouragement}"
          </p>
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths && feedback.strengths.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px'
          }}>
            <CheckCircle size={16} color="#10b981" />
            <h4 style={{
              color: '#10b981',
              fontSize: '14px',
              fontWeight: '600',
              margin: 0
            }}>
              What you did well:
            </h4>
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '22px',
            color: '#6b7280',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            {feedback.strengths.slice(0, 3).map((strength, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Steps */}
      {feedback.nextSteps && feedback.nextSteps.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px'
          }}>
            <Target size={16} color="#8b5cf6" />
            <h4 style={{
              color: '#8b5cf6',
              fontSize: '14px',
              fontWeight: '600',
              margin: 0
            }}>
              Try next time:
            </h4>
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '22px',
            color: '#6b7280',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            {feedback.nextSteps.slice(0, 2).map((step, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Conversation Tips */}
      {feedback.conversationTips && feedback.conversationTips.length > 0 && (
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px'
          }}>
            <Lightbulb size={16} color="#f59e0b" />
            <h4 style={{
              color: '#f59e0b',
              fontSize: '14px',
              fontWeight: '600',
              margin: 0
            }}>
              Speaking tips:
            </h4>
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '22px',
            color: '#6b7280',
            fontSize: '12px',
            lineHeight: '1.4'
          }}>
            {feedback.conversationTips.slice(0, 2).map((tip, index) => (
              <li key={index} style={{ marginBottom: '4px' }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
