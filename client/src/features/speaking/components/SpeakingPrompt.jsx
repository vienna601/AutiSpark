import React from 'react';
import { MessageCircle, Target, Lightbulb, RefreshCw } from 'lucide-react';

export default function SpeakingPrompt({ 
  question, 
  goal, 
  hints, 
  onNewQuestion, 
  isLoading 
}) {
  return (
    <div style={{
      background: '#f6e9e2',
      borderRadius: '20px',
      padding: '30px',
      marginBottom: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <MessageCircle size={24} color="#8fa773" />
          <h2 style={{
            color: '#8fa773',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0,
            fontFamily: 'Comfortaa, cursive'
          }}>
            Speaking Practice
          </h2>
        </div>
        
        {onNewQuestion && (
          <button
            onClick={onNewQuestion}
            disabled={isLoading}
            style={{
              background: '#8fa773',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'Comfortaa, cursive',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            New Question
          </button>
        )}
      </div>

      {/* Question */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        border: '2px solid rgba(143, 167, 115, 0.2)'
      }}>
        <h3 style={{
          color: '#8fa773',
          fontSize: '28px',
          fontWeight: '700',
          margin: '0 0 16px 0',
          fontFamily: 'Comfortaa, cursive',
          textAlign: 'center'
        }}>
          {question || "What is your name?"}
        </h3>
        
        {goal && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
            color: '#6b7280',
            fontSize: '16px',
            fontFamily: 'Comfortaa, cursive'
          }}>
            <Target size={16} />
            <span>Goal: {goal}</span>
          </div>
        )}
      </div>

      {/* Hints */}
      {hints && hints.length > 0 && (
        <div style={{
          background: 'rgba(143, 167, 115, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(143, 167, 115, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <Lightbulb size={18} color="#8fa773" />
            <h4 style={{
              color: '#8fa773',
              fontSize: '16px',
              fontWeight: '600',
              margin: 0,
              fontFamily: 'Comfortaa, cursive'
            }}>
              Helpful Hints:
            </h4>
          </div>
          
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            color: '#524944',
            fontFamily: 'Comfortaa, cursive'
          }}>
            {hints.map((hint, index) => (
              <li key={index} style={{
                fontSize: '14px',
                lineHeight: '1.5',
                marginBottom: '8px'
              }}>
                {hint}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
