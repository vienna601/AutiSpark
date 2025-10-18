import React, { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Loader } from 'lucide-react';

export default function TavusSpeakingAssistant({ 
  isActive, 
  onConversationStart, 
  onConversationEnd,
  question,
  goal,
  tavusService 
}) {
  const [conversationId, setConversationId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationUrl, setConversationUrl] = useState(null);
  const iframeRef = useRef(null);

  const startConversation = async () => {
    if (!tavusService) {
      setError('Tavus service not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🎬 Starting Tavus conversation...');
      
      const conversation = await tavusService.createSpeakingConversation(
        `Practice speaking with a student`,
        {
          question,
          goal,
          studentLevel: 'beginner',
          encouragementNeeded: true
        }
      );

      setConversationId(conversation.conversationId);
      setConversationUrl(conversation.conversationUrl);
      
      if (onConversationStart) {
        onConversationStart(conversation.conversationId);
      }
      
      console.log('✅ Conversation started:', conversation);
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      setError(`Failed to start conversation: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = async () => {
    if (conversationId && tavusService) {
      try {
        console.log('🛑 Ending conversation...');
        
        // Get transcript before ending
        const transcript = await tavusService.getConversationTranscript(conversationId);
        
        await tavusService.endSpeakingConversation(conversationId);
        
        if (onConversationEnd) {
          onConversationEnd(conversationId, transcript);
        }
        
        setConversationId(null);
        setConversationUrl(null);
        console.log('✅ Conversation ended');
      } catch (error) {
        console.error('❌ Error ending conversation:', error);
      }
    }
  };

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
        padding: '24px',
        textAlign: 'center',
        border: '2px dashed #d1d5db'
      }}>
        <VideoOff size={48} color="#9ca3af" />
        <h3 style={{ color: '#6b7280', margin: '16px 0 8px 0' }}>
          AI Speaking Coach
        </h3>
        <p style={{ color: '#9ca3af', margin: 0, fontSize: '14px' }}>
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
        <h3 style={{ color: '#dc2626', margin: '16px 0 8px 0' }}>
          Connection Error
        </h3>
        <p style={{ color: '#7f1d1d', margin: '0 0 16px 0', fontSize: '14px' }}>
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
            cursor: 'pointer'
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
        <h3 style={{ color: '#7c3aed', margin: '0 0 8px 0' }}>
          Starting Conversation...
        </h3>
        <p style={{ color: '#6d28d9', margin: 0, fontSize: '14px' }}>
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
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Video Header */}
      <div style={{
        background: '#10b981',
        color: 'white',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Video size={20} />
          <span style={{ fontWeight: '600', fontSize: '14px' }}>
            AI Speaking Coach
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
            gap: '4px'
          }}
        >
          <PhoneOff size={14} />
          End
        </button>
      </div>

      {/* Video Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '300px',
        background: '#1f2937'
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
            title="Tavus Speaking Practice"
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white'
          }}>
            <Loader size={32} className="spinning" />
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
              Loading video chat...
            </p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{
        background: '#f9fafb',
        padding: '12px 16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            💬 Speak naturally and take your time
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              background: conversationId ? '#10b981' : '#9ca3af',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '600'
            }}>
              {conversationId ? 'CONNECTED' : 'CONNECTING'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
