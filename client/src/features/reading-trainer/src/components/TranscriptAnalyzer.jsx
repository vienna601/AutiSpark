import { useState, useEffect } from 'react'
import { FileText, Brain, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { GeminiService } from '../services/geminiService'

export default function TranscriptAnalyzer({ conversationId, isActive }) {
  const [transcript, setTranscript] = useState([])
  const [analysis, setAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [helpAreas, setHelpAreas] = useState([])
  const [strengths, setStrengths] = useState([])
  const [realTimeInsights, setRealTimeInsights] = useState([])

  // Mock transcript data - in real implementation, this would come from Tavus WebSocket
  useEffect(() => {
    if (isActive && conversationId) {
      // Simulate receiving transcript data
      const mockTranscript = [
        {
          timestamp: new Date(),
          speaker: 'Alex',
          text: "Hi there! I'm so excited to read with you today! What's your name?",
          type: 'greeting'
        },
        {
          timestamp: new Date(Date.now() + 5000),
          speaker: 'Student',
          text: "Um... my name is... Sarah",
          type: 'response',
          confidence: 0.7,
          hesitation: true
        },
        {
          timestamp: new Date(Date.now() + 10000),
          speaker: 'Alex',
          text: "Hi Sarah! That's a beautiful name. Are you ready to read about the happy cat?",
          type: 'encouragement'
        },
        {
          timestamp: new Date(Date.now() + 15000),
          speaker: 'Student',
          text: "Yes! I like cats. Do you think the cat is friendly?",
          type: 'question',
          engagement: 'high',
          shows_comprehension: true
        }
      ]
      
      setTranscript(mockTranscript)
      analyzeTranscript(mockTranscript)
    }
  }, [isActive, conversationId])

  const analyzeTranscript = async (transcriptData) => {
    if (!transcriptData.length) return

    setIsAnalyzing(true)
    
    try {
      const analysis = await GeminiService.analyzeConversationTranscript(transcriptData)
      setAnalysis(analysis)
      setHelpAreas(analysis.help_areas || [])
      setStrengths(analysis.strengths || [])
      setRealTimeInsights(analysis.real_time_insights || [])
    } catch (error) {
      console.error('Error analyzing transcript:', error)
      // Fallback analysis
      setAnalysis(generateFallbackAnalysis(transcriptData))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateFallbackAnalysis = (transcriptData) => {
    const studentMessages = transcriptData.filter(msg => msg.speaker === 'Student')
    
    return {
      engagement_level: 'medium',
      comprehension_indicators: ['Asking questions', 'Responding to prompts'],
      help_areas: [
        { area: 'Confidence', priority: 'medium', suggestion: 'Encourage more self-assurance' },
        { area: 'Fluency', priority: 'low', suggestion: 'Practice reading aloud' }
      ],
      strengths: [
        { strength: 'Engagement', evidence: 'Asking questions about the story' },
        { strength: 'Comprehension', evidence: 'Making connections to story content' }
      ],
      real_time_insights: [
        { insight: 'Student shows good story engagement', action: 'Continue current approach' }
      ]
    }
  }

  const addTranscriptEntry = (entry) => {
    setTranscript(prev => {
      const updated = [...prev, entry]
      // Re-analyze every few entries
      if (updated.length % 3 === 0) {
        analyzeTranscript(updated)
      }
      return updated
    })
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      minute: '2-digit', 
      second: '2-digit' 
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="transcript-analyzer bg-white rounded-xl shadow-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-800">Live Analysis</h3>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-blue-600">
            <Brain className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Analyzing...</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col gap-4">
        {/* Real-time Insights */}
        {realTimeInsights.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Live Insights
            </h4>
            <div className="space-y-1">
              {realTimeInsights.slice(-2).map((insight, index) => (
                <div key={index} className="text-sm text-blue-700">
                  • {insight.insight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help Areas */}
        {helpAreas.length > 0 && (
          <div className="bg-amber-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Areas for Support
            </h4>
            <div className="space-y-2">
              {helpAreas.map((area, index) => (
                <div key={index} className={`text-xs p-2 rounded border ${getPriorityColor(area.priority)}`}>
                  <div className="font-medium">{area.area}</div>
                  <div className="text-xs mt-1">{area.suggestion}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {strengths.length > 0 && (
          <div className="bg-green-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              Student Strengths
            </h4>
            <div className="space-y-1">
              {strengths.map((strength, index) => (
                <div key={index} className="text-sm text-green-700">
                  <span className="font-medium">{strength.strength}:</span> {strength.evidence}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transcript */}
        <div className="flex-1 bg-gray-50 rounded-lg p-3 overflow-hidden">
          <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Conversation Transcript
          </h4>
          <div className="overflow-y-auto h-full space-y-2 text-xs">
            {transcript.map((entry, index) => (
              <div key={index} className={`p-2 rounded ${
                entry.speaker === 'Alex' 
                  ? 'bg-purple-100 border-l-2 border-purple-400' 
                  : 'bg-blue-100 border-l-2 border-blue-400'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-700">{entry.speaker}</span>
                  <span className="text-gray-500">{formatTime(entry.timestamp)}</span>
                </div>
                <div className="text-gray-800">{entry.text}</div>
                {/* Analysis markers */}
                {entry.hesitation && (
                  <div className="mt-1 text-orange-600 text-xs">⚠️ Hesitation detected</div>
                )}
                {entry.shows_comprehension && (
                  <div className="mt-1 text-green-600 text-xs">✅ Shows comprehension</div>
                )}
                {entry.engagement === 'high' && (
                  <div className="mt-1 text-blue-600 text-xs">🎯 High engagement</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {analysis && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Engagement: <span className="font-medium">{analysis.engagement_level}</span></span>
            <span>Messages: <span className="font-medium">{transcript.length}</span></span>
          </div>
        </div>
      )}
    </div>
  )
}
