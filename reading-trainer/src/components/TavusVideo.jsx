import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Volume2, VolumeX, Loader, MessageCircle, Wifi, WifiOff, HelpCircle, AlertCircle } from 'lucide-react'
import { TavusService } from '../services/tavusService'
import { EvaluationService } from '../services/evaluationService'
import { validateEnvironment } from '../utils/envValidator'

export default function TavusVideo({ 
  readingProgress, 
  onFeedbackGenerated, 
  currentGoal = "reading comprehension",
  storyContext = null,
  onQuestionAnswered = null,
  onTranscriptUpdate = null
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [conversationUrl, setConversationUrl] = useState(null)
  const [lastMessage, setLastMessage] = useState('')
  const [connectionError, setConnectionError] = useState(null)
  const [isInteractiveMode, setIsInteractiveMode] = useState(false)
  const [currentEvaluation, setCurrentEvaluation] = useState(null)
  const [envValid, setEnvValid] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')
  const wsRef = useRef(null)
  const iframeRef = useRef(null)

  const fallbackMessages = [
    "Hi there! I'm so excited to read with you today!",
    "You're doing such a great job with these stories!",
    "I love how you think about each question!",
    "Reading is so much fun when we do it together!",
    "You're becoming such a strong reader!"
  ]

  // Validate environment on mount
  useEffect(() => {
    const isValid = validateEnvironment()
    setEnvValid(isValid)
    
    if (isValid) {
      initializeTavusConversation()
    } else {
      setConnectionError('Environment variables not configured')
      setDebugInfo('Check browser console for details')
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
      if (conversationId) {
        TavusService.endConversation(conversationId)
      }
    }
  }, [])

  // Enhanced effect for reading progress with Gemini evaluation
  useEffect(() => {
    if (readingProgress && readingProgress.shouldGenerateFeedback && conversationId && storyContext) {
      handleReadingProgressWithEvaluation()
    }
  }, [readingProgress, conversationId, storyContext])

  const initializeTavusConversation = async () => {
    setIsConnecting(true)
    setConnectionError(null)
    setDebugInfo('Connecting to Tavus...')

    try {
      console.log('🚀 Initializing Tavus conversation...')
      const conversation = await TavusService.createConversation(currentGoal)
      
      if (conversation && conversation.conversation_id) {
        console.log('✅ Tavus conversation created successfully')
        setConversationId(conversation.conversation_id)
        setConversationUrl(conversation.conversation_url)
        
        if (conversation.conversation_url) {
          setIsConnected(true)
          setLastMessage("Hi there! I'm Alex, and I'm so excited to read with you today!")
          setDebugInfo('Connected successfully!')
        } else {
          throw new Error('No conversation URL received from Tavus')
        }
      } else {
        throw new Error('Failed to create conversation - no response from Tavus')
      }
    } catch (error) {
      console.error('❌ Error initializing Tavus conversation:', error)
      setConnectionError(`Connection failed: ${error.message}`)
      setDebugInfo(`Error: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  const setupWebSocketConnection = (convId) => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    wsRef.current = TavusService.createWebSocketConnection(
      convId,
      handleWebSocketMessage,
      handleWebSocketError
    )
  }

  const handleWebSocketMessage = (data) => {
    console.log('Received WebSocket message:', data)
    
    // Handle transcript data
    if (data.type === 'transcript' && data.content) {
      const transcriptEntry = {
        timestamp: new Date(),
        speaker: data.speaker || 'Student',
        text: data.content,
        type: data.messageType || 'response',
        confidence: data.confidence || 1.0,
        ...(data.analysis && { analysis: data.analysis })
      }
      
      // Forward to transcript analyzer
      if (onTranscriptUpdate) {
        onTranscriptUpdate(transcriptEntry)
      }
    }
    
    if (data.type === 'message' && data.content) {
      setLastMessage(data.content)
      if (onFeedbackGenerated) {
        onFeedbackGenerated(data.content)
      }
      
      // Add Alex's message to transcript
      if (onTranscriptUpdate) {
        onTranscriptUpdate({
          timestamp: new Date(),
          speaker: 'Alex',
          text: data.content,
          type: 'response'
        })
      }
    }
    
    if (data.type === 'conversation_started') {
      setIsConnected(true)
      setIsPlaying(true)
    }
  }

  const handleWebSocketError = (error) => {
    console.error('WebSocket error:', error)
    setIsConnected(false)
    setConnectionError('Connection lost to reading helper')
  }

  const handleReadingProgressWithEvaluation = async () => {
    try {
      const { evaluation, tavusFeedback } = await EvaluationService.evaluateReading(
        readingProgress, 
        storyContext
      )

      setCurrentEvaluation(evaluation)

      await TavusService.deliverEvaluationFeedback(
        conversationId,
        evaluation,
        {
          currentPage: readingProgress.currentPage,
          totalPages: readingProgress.totalPages,
          storyTitle: storyContext.title,
          recentAnswerCorrect: readingProgress.recentAnswerCorrect,
          questionAsked: readingProgress.questionAsked
        }
      )

      if (onFeedbackGenerated) {
        onFeedbackGenerated({
          evaluation,
          tavusFeedback,
          type: 'progress_feedback'
        })
      }
    } catch (error) {
      console.error('Error handling reading progress evaluation:', error)
    }
  }

  const reconnect = () => {
    setConnectionError(null)
    initializeTavusConversation()
  }

  return (
    <div className="video-card p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-800">
          Reading Helper - Alex
        </h3>
        <div className="flex items-center gap-2">
          {!envValid && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Config Error</span>
            </div>
          )}
          
          {isConnecting && (
            <div className="flex items-center gap-2 text-blue-600">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">Connecting...</span>
            </div>
          )}
          
          {isConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="text-xs">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-xs">Disconnected</span>
            </div>
          )}
        </div>
      </div>
      
      {/* MASSIVE Video Container with proper CSS class */}
      <div className="tavus-video-container flex-1 mb-3" style={{ minHeight: '75vh' }}>
        {conversationUrl && isConnected ? (
          <iframe
            ref={iframeRef}
            src={conversationUrl}
            className="w-full h-full"
            allow="camera; microphone; autoplay"
            allowFullScreen
            frameBorder="0"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              borderRadius: '12px',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        ) : (
          <div className="video-placeholder">
            <div className="text-9xl mb-8">👩‍🏫</div>
            <div className="text-center px-6">
              <h4 className="text-3xl font-semibold text-white mb-6">Meet Alex, Your Reading Tutor!</h4>
              {!envValid && (
                <div>
                  <p className="text-xl text-white mb-4">Configuration Error</p>
                  <p className="text-sm text-gray-200">Check console for details</p>
                </div>
              )}
              {connectionError && envValid && (
                <div className="space-y-6">
                  <p className="text-xl text-white">Alex is taking a quick break</p>
                  <button
                    onClick={reconnect}
                    className="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors text-xl font-semibold"
                  >
                    Wake up Alex
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Video Controls - Only show when connected */}
        {conversationUrl && isConnected && (
          <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between pointer-events-auto">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10 text-gray-700" />
              ) : (
                <Play className="w-10 h-10 text-gray-700 ml-1" />
              )}
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all shadow-lg"
            >
              {isMuted ? (
                <VolumeX className="w-10 h-10 text-gray-700" />
              ) : (
                <Volume2 className="w-10 h-10 text-gray-700" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Speech Bubble */}
      <div className="relative bg-white rounded-xl p-4 shadow-lg">
        <div className="absolute -top-2 left-6 w-4 h-4 bg-white transform rotate-45"></div>
        <div className="flex items-start gap-3">
          <MessageCircle className="w-6 h-6 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-lg text-gray-700 font-medium leading-relaxed">
              {lastMessage || (isConnected ? "I'm here to help you read! Ask me anything!" : fallbackMessages[0])}
            </p>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
        <p className="text-sm text-purple-700">
          {!envValid ? (
            "❌ Configuration error. Check browser console for missing environment variables."
          ) : isConnected ? (
            "✅ Connected to Alex! She's ready to help with your reading."
          ) : connectionError ? (
            <span className="flex items-center gap-2">
              <span>❌ {connectionError}</span>
              <button
                onClick={reconnect}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Reconnect
              </button>
            </span>
          ) : (
            "💡 Configure Tavus API keys to enable AI-powered reading helper"
          )}
        </p>
        {debugInfo && (
          <p className="text-xs text-gray-500 mt-1">Debug: {debugInfo}</p>
        )}
      </div>
    </div>
  )
}
