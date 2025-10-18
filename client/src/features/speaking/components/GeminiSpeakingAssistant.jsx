import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Loader, MessageCircle, Send } from 'lucide-react';

export default function GeminiSpeakingAssistant({ 
  isActive, 
  onConversationStart, 
  onConversationEnd,
  question,
  goal,
  speakingService 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startConversation = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Initialize speech recognition if available
      if ('webkitSpeechRecognition' in window) {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onresult = (event) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setCurrentInput(finalTranscript.trim());
            setIsListening(false);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
        
        recognitionRef.current = recognition;
      }
      
      // Start with AI greeting
      const greeting = await getAIResponse(`You are Riley, a warm AI speaking coach for children with autism. Start a conversation about: "${question}". Give a warm greeting and ask the question in a friendly way. Keep it short and encouraging.`);
      
      setMessages([{
        id: 1,
        sender: 'ai',
        text: greeting,
        timestamp: new Date()
      }]);
      
      setIsConnected(true);
      
      if (onConversationStart) {
        onConversationStart(sessionId);
      }
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Failed to start conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    // Create transcript from messages
    const transcript = {
      messages: messages.map(msg => ({
        speaker: msg.sender === 'ai' ? 'assistant' : 'user',
        text: msg.text,
        timestamp: msg.timestamp
      }))
    };
    
    if (onConversationEnd) {
      onConversationEnd(sessionId, transcript);
    }
    
    setIsConnected(false);
    setMessages([]);
    setCurrentInput('');
    setIsListening(false);
  };

  const getAIResponse = async (userMessage) => {
    try {
      // Use the generateSpeakingQuestion method to get responses
      const response = await speakingService.getEncouragement(userMessage);
      
      // If that doesn't work, create a custom response
      const responses = [
        "That's wonderful! Tell me more about that.",
        "I love hearing your thoughts! What else can you share?",
        "You're doing great! Keep talking - I'm listening.",
        "That's really interesting! Can you tell me more?",
        "Excellent! You're practicing so well. What would you like to say next?",
        "I'm enjoying our conversation! Please continue.",
        "You have such great ideas! Tell me more.",
        "That's fantastic! I can tell you're thinking carefully."
      ];
      
      // Return the encouragement message or a random response
      return response?.message || responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
      console.error('Error getting AI response:', error);
      const fallbackResponses = [
        "I'm listening! Please continue sharing with me.",
        "That's wonderful! Tell me more.",
        "You're doing great! Keep going.",
        "I love hearing what you have to say!"
      ];
      return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
  };

  const sendMessage = async () => {
    if (!currentInput.trim()) return;
    
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: currentInput.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    
    // Get AI response
    try {
      const aiResponse = await getAIResponse(currentInput.trim());
      
      const aiMessage = {
        id: messages.length + 2,
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please type your response.');
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isActive) {
    return (
      <div style={{
        background: '#f3f4f6',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        border: '2px dashed #d1d5db'
      }}>
        <VideoOff size={48} color="#9ca3af" />
        <h3 style={{ color: '#6b7280', margin: '16px 0 8px 0', fontFamily: 'Comfortaa, cursive' }}>
          AI Speaking Coach
        </h3>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px', fontFamily: 'Comfortaa, cursive' }}>
          Click "Start Practice" to begin speaking with your AI tutor
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#fee2e2',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        border: '2px solid #fecaca'
      }}>
        <VideoOff size={48} color="#dc2626" />
        <h3 style={{ color: '#dc2626', margin: '16px 0 8px 0', fontFamily: 'Comfortaa, cursive' }}>
          Connection Error
        </h3>
        <p style={{ color: '#7f1d1d', margin: '0 0 16px 0', fontSize: '14px', fontFamily: 'Comfortaa, cursive' }}>
          {error}
        </p>
        <button
          onClick={startConversation}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'Comfortaa, cursive'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        background: '#ede9fe',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        border: '2px solid #ddd6fe'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <Loader size={48} color="#8b5cf6" className="spinning" />
        </div>
        <h3 style={{ color: '#7c3aed', margin: '0 0 8px 0', fontFamily: 'Comfortaa, cursive' }}>
          Starting Conversation...
        </h3>
        <p style={{ color: '#6d28d9', margin: 0, fontSize: '14px', fontFamily: 'Comfortaa, cursive' }}>
          Your AI speaking coach is getting ready to help you practice!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '2px solid #10b981',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      height: '500px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: '#10b981',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageCircle size={20} />
          <span style={{ fontWeight: '600', fontSize: '14px', fontFamily: 'Comfortaa, cursive' }}>
            Riley - AI Speaking Coach
          </span>
        </div>
        <button
          onClick={endConversation}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'Comfortaa, cursive'
          }}
        >
          <PhoneOff size={14} />
          End
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        background: '#f9fafb'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'ai' ? 'flex-start' : 'flex-end',
              marginBottom: '12px'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '16px',
              background: message.sender === 'ai' ? '#10b981' : '#3b82f6',
              color: 'white',
              fontSize: '14px',
              lineHeight: '1.4',
              fontFamily: 'Comfortaa, cursive'
            }}>
              {message.sender === 'ai' && (
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>
                  Riley says:
                </div>
              )}
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        background: 'white'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your response or use the microphone..."
            style={{
              flex: 1,
              padding: '12px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Comfortaa, cursive',
              resize: 'none',
              minHeight: '20px',
              maxHeight: '80px'
            }}
            rows={1}
          />
          
          <button
            onClick={toggleListening}
            disabled={!recognitionRef.current}
            style={{
              background: isListening ? '#dc2626' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              cursor: recognitionRef.current ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: recognitionRef.current ? 1 : 0.5
            }}
            title={recognitionRef.current ? (isListening ? 'Stop listening' : 'Start listening') : 'Speech recognition not supported'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          
          <button
            onClick={sendMessage}
            disabled={!currentInput.trim()}
            style={{
              background: currentInput.trim() ? '#10b981' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              cursor: currentInput.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={16} />
          </button>
        </div>
        
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          marginTop: '8px',
          textAlign: 'center',
          fontFamily: 'Comfortaa, cursive'
        }}>
          {isConnected ? (
            <span>💚 Connected to Riley • {isListening ? '🎤 Listening...' : 'Type or speak your response'}</span>
          ) : (
            'Connecting...'
          )}
        </div>
      </div>
    </div>
  );
}
