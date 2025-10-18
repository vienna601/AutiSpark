import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Loader, Play, Square } from 'lucide-react';

export default function TavusVideoChat({ 
  isActive, 
  onConversationStart, 
  onConversationEnd,
  question,
  goal,
  tavusService 
}) {
  const [conversationId, setConversationId] = useState(null);
  const [conversationUrl, setConversationUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const iframeRef = useRef(null);

  const startConversation = async () => {
    if (!tavusService) {
      setError('Tavus service not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🎬 Starting Tavus video conversation...');
      
      const conversation = await tavusService.createSpeakingConversation(
        `Practice speaking with a student`,
        {
          question: question || "What is your name?",
          goal: goal || "practice speaking clearly",
          studentLevel: 'beginner',
          encouragementNeeded: true
        }
      );

      console.log('✅ Tavus conversation created:', conversation);
      
      setConversationId(conversation.conversationId);
      setConversationUrl(conversation.conversationUrl);
      setIsConnected(true);
      
      if (onConversationStart) {
        onConversationStart(conversation.conversationId);
      }
      
    } catch (error) {
      console.error('❌ Error starting Tavus conversation:', error);
      setError(`Failed to start video chat: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = async () => {
    if (conversationId && tavusService) {
      try {
        console.log('🛑 Ending Tavus conversation...');
        
        // Get transcript before ending
        const transcript = await tavusService.getConversationTranscript(conversationId);
        
        await tavusService.endSpeakingConversation(conversationId);
        
        if (onConversationEnd) {
          onConversationEnd(conversationId, transcript);
        }
        
        setConversationId(null);
        setConversationUrl(null);
        setIsConnected(false);
        console.log('✅ Tavus conversation ended');
      } catch (error) {
        console.error('❌ Error ending conversation:', error);
      }
    }
  };

  // Auto-start conversation when activated
  useEffect(() => {
    if (isActive && !conversationId && !isLoading) {
      startConversation();
    }
  }, [isActive]);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      if (conversationId) {
        endConversation();
      }
    };
  }, [conversationId]);

  if (!isActive) {
    return (
      <div style={{
        background: '#f3f4f6',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        border: '2px dashed #d1d5db',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <VideoOff size={64} color="#9ca3af" style={{ marginBottom: '16px' }} />
        <h3 style={{ 
          color: '#6b7280', 
          margin: '0 0 8px 0', 
          fontFamily: 'Comfortaa, cursive',
          fontSize: '20px'
        }}>
          Tavus AI Video Coach
        </h3>
        <p style={{ 
          color: '#9ca3af', 
          margin: 0, 
          fontSize: '14px', 
          fontFamily: 'Comfortaa, cursive' 
        }}>
          Click "Start Practice" to begin a video conversation with your AI speaking tutor
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#fee2e2',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        border: '2px solid #fecaca',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <VideoOff size={64} color="#dc2626" style={{ marginBottom: '16px' }} />
        <h3 style={{ 
          color: '#dc2626', 
          margin: '0 0 8px 0', 
          fontFamily: 'Comfortaa, cursive',
          fontSize: '18px'
        }}>
          Video Connection Error
        </h3>
        <p style={{ 
          color: '#7f1d1d', 
          margin: '0 0 16px 0', 
          fontSize: '14px', 
          fontFamily: 'Comfortaa, cursive',
          maxWidth: '300px'
        }}>
          {error}
        </p>
        <button
          onClick={startConversation}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'Comfortaa, cursive',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Play size={16} />
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
        padding: '32px',
        textAlign: 'center',
        border: '2px solid #ddd6fe',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '16px' 
        }}>
          <Loader size={64} color="#8b5cf6" className="spinning" />
        </div>
        <h3 style={{ 
          color: '#7c3aed', 
          margin: '0 0 8px 0', 
          fontFamily: 'Comfortaa, cursive',
          fontSize: '18px'
        }}>
          Starting Video Chat...
        </h3>
        <p style={{ 
          color: '#6d28d9', 
          margin: 0, 
          fontSize: '14px', 
          fontFamily: 'Comfortaa, cursive' 
        }}>
          Your AI video coach is getting ready to practice speaking with you!
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '3px solid #10b981',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      height: '500px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Video Header */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Video size={24} />
          <div>
            <div style={{ 
              fontWeight: '700', 
              fontSize: '16px', 
              fontFamily: 'Comfortaa, cursive' 
            }}>
              Riley - AI Speaking Coach
            </div>
            <div style={{ 
              fontSize: '12px', 
              opacity: 0.9,
              fontFamily: 'Comfortaa, cursive'
            }}>
              {isConnected ? '🟢 Live Video Chat' : 'Connecting...'}
            </div>
          </div>
        </div>
        
        <button
          onClick={endConversation}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'Comfortaa, cursive',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.target.style.background = '#b91c1c'}
          onMouseOut={(e) => e.target.style.background = '#dc2626'}
        >
          <PhoneOff size={16} />
          End Call
        </button>
      </div>

      {/* Video Container */}
      <div style={{
        position: 'relative',
        flex: 1,
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {conversationUrl ? (
          <iframe
            ref={iframeRef}
            src={conversationUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="camera; microphone; autoplay; encrypted-media; fullscreen"
            title="Tavus AI Speaking Coach"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : (
          <div style={{
            textAlign: 'center',
            color: 'white'
          }}>
            <Loader size={48} className="spinning" style={{ marginBottom: '16px' }} />
            <h3 style={{ 
              margin: '0 0 8px 0', 
              fontFamily: 'Comfortaa, cursive',
              fontSize: '18px'
            }}>
              Loading Video Chat...
            </h3>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              opacity: 0.8,
              fontFamily: 'Comfortaa, cursive'
            }}>
              Your AI coach will appear shortly
            </p>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div style={{
        background: '#f8fafc',
        padding: '12px 20px',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ 
          fontSize: '13px', 
          color: '#64748b',
          fontFamily: 'Comfortaa, cursive'
        }}>
          💬 Speak naturally and take your time • Practice question: "{question}"
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: isConnected ? '#10b981' : '#f59e0b',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            fontFamily: 'Comfortaa, cursive'
          }}>
            {isConnected ? '🎥 LIVE' : '⏳ CONNECTING'}
          </div>
        </div>
      </div>
    </div>
  );
}
