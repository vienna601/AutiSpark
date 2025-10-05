import React, { useState } from 'react';
import { MessageCircle, Send, Lightbulb, Sparkles } from 'lucide-react';

export default function WritingHints({ currentText, prompt, goal, feedbackService }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [error, setError] = useState(null);

  const commonQuestions = [
    "How do I start writing?",
    "I'm stuck, what should I do?",
    "How do I get ideas?",
    "What should I write about?",
    "How long should my writing be?",
    "What if I make mistakes?"
  ];

  const handleQuestionSubmit = async (questionText = question) => {
    console.log('🔥 Question submitted:', questionText);
    console.log('🔥 Feedback service:', feedbackService);
    console.log('🔥 Current text:', currentText);
    console.log('🔥 Prompt:', prompt);
    console.log('🔥 Goal:', goal);
    
    if (!questionText.trim()) {
      console.log('❌ No question text, returning');
      return;
    }

    if (!feedbackService) {
      console.error('❌ No feedback service provided');
      setError('Feedback service not available');
      return;
    }

    if (!feedbackService.answerQuestion) {
      console.error('❌ answerQuestion method not found on feedback service');
      setError('Answer question method not available');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Calling answerQuestion...');
      const response = await feedbackService.answerQuestion(questionText, currentText, prompt, goal);
      console.log('✅ Got response:', response);
      
      // Add to conversation history
      const newConversation = {
        question: questionText,
        answer: response,
        timestamp: Date.now()
      };
      
      setConversationHistory(prev => [newConversation, ...prev]);
      setAnswer(response);
      setQuestion('');
    } catch (error) {
      console.error('❌ Error getting answer:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (quickQuestion) => {
    console.log('🔥 Quick question clicked:', quickQuestion);
    setQuestion(quickQuestion);
    handleQuestionSubmit(quickQuestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleQuestionSubmit();
    }
  };

  const handleSendClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Send button clicked, question:', question);
    handleQuestionSubmit();
  };

  const testAPI = async () => {
    console.log('🧪 Testing API connection...');
    if (feedbackService && feedbackService.testConnection) {
      try {
        const result = await feedbackService.testConnection();
        console.log('🧪 Test result:', result);
        alert(result ? '✅ API works!' : '❌ API failed!');
      } catch (error) {
        console.error('🧪 Test error:', error);
        alert('❌ Test failed: ' + error.message);
      }
    } else {
      console.error('🧪 No test method available');
      alert('❌ No test method available');
    }
  };

  return (
    <div className="qa-panel">
      <div className="qa-header">
        <MessageCircle size={24} />
        <h3>Ask for Help</h3>
        {/* Debug button - remove in production */}
        <button onClick={testAPI} style={{ fontSize: '12px', padding: '4px 8px' }}>
          Test API
        </button>
      </div>
      
      <div className="qa-content">
        {/* Error Display */}
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            color: '#dc2626', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* Question Input */}
        <div className="question-input-section">
          <div className="question-input-container">
            <textarea
              className="question-input"
              placeholder="Ask me anything about writing! Like 'How do I start?' or 'I'm stuck, what should I do?'"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
              disabled={isLoading}
            />
            <button 
              type="button"
              onClick={handleSendClick}
              className="send-button"
              disabled={!question.trim() || isLoading}
              style={{ cursor: (!question.trim() || isLoading) ? 'not-allowed' : 'pointer' }}
            >
              {isLoading ? <Sparkles size={16} className="spinning" /> : <Send size={16} />}
            </button>
          </div>
        </div>

        {/* Quick Questions */}
        <div className="quick-questions">
          <h4>🚀 Quick Questions:</h4>
          <div className="quick-question-buttons">
            {commonQuestions.map((q, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  console.log('🔥 Quick question button clicked:', q);
                  handleQuickQuestion(q);
                }}
                className="quick-question-btn"
                disabled={isLoading}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Current Answer */}
        {answer && (
          <div className="current-answer">
            <div className="answer-content">
              <div className="answer-text">
                <h4>💡 Answer:</h4>
                <p>{answer.answer}</p>
              </div>
              
              {answer.suggestions && answer.suggestions.length > 0 && (
                <div className="answer-suggestions">
                  <h5>Try this:</h5>
                  <ul>
                    {answer.suggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {answer.encouragement && (
                <div className="answer-encouragement">
                  <p>✨ {answer.encouragement}</p>
                </div>
              )}
              
              {answer.relatedTips && answer.relatedTips.length > 0 && (
                <div className="answer-tips">
                  <h5>💭 Remember:</h5>
                  <ul>
                    {answer.relatedTips.map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conversation History */}
        {conversationHistory.length > 1 && (
          <div className="conversation-history">
            <h4>📚 Previous Questions:</h4>
            <div className="history-items">
              {conversationHistory.slice(1, 4).map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-question">
                    <strong>Q:</strong> {item.question}
                  </div>
                  <div className="history-answer">
                    <strong>A:</strong> {item.answer.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="loading-state">
            <div className="loading-spinner">
              <Sparkles size={20} className="spinning" />
            </div>
            <p>Thinking about your question...</p>
          </div>
        )}

        {/* Debug Info - remove in production */}
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          padding: '8px', 
          background: '#f5f5f5', 
          borderRadius: '4px',
          marginTop: '16px'
        }}>
          <div>Feedback Service: {feedbackService ? '✅' : '❌'}</div>
          <div>Answer Method: {feedbackService?.answerQuestion ? '✅' : '❌'}</div>
          <div>Current Text Length: {currentText?.length || 0}</div>
          <div>Prompt: {prompt ? '✅' : '❌'}</div>
          <div>Question Length: {question.length}</div>
          <div>Button Disabled: {(!question.trim() || isLoading) ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
}
