import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageCircle } from 'lucide-react';

export default function TavusReadingAssistant({ 
  selectedStory, 
  currentQuestion, 
  currentQuestionIndex, 
  showResults, 
  score
}) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
  const videoRef = useRef(null);
  const conversationRef = useRef(null);

  // Generate conversation context for logging
  const generateContextInfo = () => {
    let contextInfo = "Reading Session Context:\n";
    
    if (!selectedStory) {
      contextInfo += "- Student is selecting a story\n";
    } else if (showResults) {
      const percentage = Math.round((score / selectedStory.questions.length) * 100);
      contextInfo += `- Completed "${selectedStory.title}"\n`;
      contextInfo += `- Score: ${score}/${selectedStory.questions.length} (${percentage}%)\n`;
    } else if (currentQuestion) {
      const questionNumber = currentQuestionIndex + 1;
      contextInfo += `- Reading: "${selectedStory.title}"\n`;
      contextInfo += `- Question ${questionNumber}/${selectedStory.questions.length}\n`;
      contextInfo += `- Current question: "${currentQuestion.question}"\n`;
    } else {
      contextInfo += `- Selected: "${selectedStory.title}"\n`;
    }
    
    return contextInfo;
  };

  const startTavusCall = async () => {
    const apiKey = import.meta.env.VITE_TAVUS_READING_API_KEY;
    const replicaId = import.meta.env.VITE_TAVUS_READING_REPLICA_ID;
    const apiUrl = import.meta.env.VITE_TAVUS_API_URL;
    
    if (!apiKey || !replicaId || !apiUrl) {
      setConnectionError('Tavus configuration incomplete - using demo mode');
      await initializeVideoCall('demo-url', 'demo-id');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      console.log('🎬 Starting Tavus conversation...');
      console.log(generateContextInfo());
      
      const requestBody = {
        replica_id: replicaId,
        conversation_name: `Reading Session - ${Date.now()}`,
        properties: {
          max_call_duration: 1800,
          participant_left_timeout: 60,
          participant_absent_timeout: 120,
          enable_recording: false,
          language: "english"
        }
      };

      const response = await fetch(`${apiUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Tavus conversation creation failed:', response.status, errorText);
        await initializeVideoCall('demo-url', 'demo-id');
        return;
      }

      const data = await response.json();
      console.log('✅ Tavus conversation created:', data);
      
      const conversationUrl = data.conversation_url || data.join_url || data.video_url || 'demo-url';
      await initializeVideoCall(conversationUrl, data.conversation_id || data.id || 'demo-id');
      
    } catch (error) {
      console.error('❌ Error starting Tavus call:', error);
      await initializeVideoCall('demo-url', 'demo-id');
    }
  };

  const initializeVideoCall = async (conversationUrl, conversationId) => {
    try {
      // Get user's camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      conversationRef.current = {
        url: conversationUrl,
        id: conversationId,
        stream: stream
      };
      
      setIsCallActive(true);
      setIsConnecting(false);
      
      console.log('✅ Video call initialized with Alex');
      
    } catch (error) {
      console.error('❌ Error accessing camera/microphone:', error);
      setConnectionError('Camera/microphone access needed for video chat');
      setIsConnecting(false);
    }
  };

  const endCall = async () => {
    try {
      if (conversationRef.current) {
        if (conversationRef.current.stream) {
          conversationRef.current.stream.getTracks().forEach(track => track.stop());
        }
        
        const apiKey = import.meta.env.VITE_TAVUS_READING_API_KEY;
        const apiUrl = import.meta.env.VITE_TAVUS_API_URL;
        
        if (apiKey && conversationRef.current.id && conversationRef.current.id !== 'demo-id') {
          await fetch(`${apiUrl}/conversations/${conversationRef.current.id}/end`, {
            method: 'POST',
            headers: { 'x-api-key': apiKey },
          });
        }
        
        conversationRef.current = null;
      }
      
      setIsCallActive(false);
      setIsMuted(false);
      setIsMicMuted(false);
      
      console.log('✅ Call ended successfully');
    } catch (error) {
      console.error('❌ Error ending call:', error);
    }
  };

  const toggleMute = () => {
    if (conversationRef.current?.stream) {
      const audioTracks = conversationRef.current.stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleMicrophone = () => {
    if (conversationRef.current?.stream) {
      const audioTracks = conversationRef.current.stream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMicMuted;
      });
    }
    setIsMicMuted(!isMicMuted);
  };

  useEffect(() => {
    return () => {
      if (conversationRef.current?.stream) {
        conversationRef.current.stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="tavus-fullscreen">
      <div className="tavus-header">
        <div className="assistant-info">
          <MessageCircle size={20} />
          <div>
            <h3>Alex - Reading Helper</h3>
            <span className="status">
              {isCallActive ? 'Connected' : 'Ready to chat'}
            </span>
          </div>
        </div>
        
        {isCallActive && (
          <div className="call-controls">
            <button
              onClick={toggleMute}
              className={`control-btn ${isMuted ? 'muted' : ''}`}
              title={isMuted ? "Unmute Alex" : "Mute Alex"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <button
              onClick={toggleMicrophone}
              className={`control-btn ${isMicMuted ? 'muted' : ''}`}
              title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
            <button
              onClick={endCall}
              className="control-btn end-call"
            >
              <PhoneOff size={18} />
            </button>
          </div>
        )}
      </div>
      
      <div className="tavus-content">
        {!isCallActive ? (
          <div className="call-setup">
            <div className="alex-avatar">
              <div className="avatar-circle">
                <span>👨‍🏫</span>
              </div>
            </div>
            
            <h2>Meet Alex!</h2>
            <p className="intro-text">
              Hi! I'm Alex, your reading helper. I can answer questions about the story, 
              give you hints, and help you understand what you're reading.
            </p>

            {connectionError && (
              <div className="error-message">
                <small>{connectionError}</small>
              </div>
            )}

            <button
              onClick={startTavusCall}
              disabled={isConnecting}
              className="start-call-btn"
            >
              {isConnecting ? (
                <>
                  <div className="spinner" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone size={20} />
                  Start Video Chat
                </>
              )}
            </button>

            <div className="features">
              <h4>I can help you with:</h4>
              <ul>
                <li>📖 Understanding the story</li>
                <li>💡 Getting hints for questions</li>
                <li>🎯 Finding the right answers</li>
                <li>🌟 Celebrating your progress</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="active-call">
            <div className="video-grid">
              <div className="alex-video">
                {conversationRef.current?.url !== 'demo-url' ? (
                  <iframe
                    src={conversationRef.current.url}
                    className="tavus-iframe"
                    frameBorder="0"
                    allow="camera; microphone"
                    title="Alex - Reading Assistant"
                  />
                ) : (
                  <div className="alex-placeholder">
                    <div className="alex-avatar-large">
                      <span>👨‍🏫</span>
                    </div>
                    <h3>Alex is here!</h3>
                    <p>Demo Mode - Ask me about your reading!</p>
                  </div>
                )}
              </div>
              
              <div className="user-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="local-video"
                />
                <div className="video-label">You</div>
              </div>
            </div>

            <div className="chat-info">
              <h4>💬 Live with Alex!</h4>
              <p>You can ask me questions about the story anytime.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
