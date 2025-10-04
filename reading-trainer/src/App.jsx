import { useState } from 'react'
import ReadingInterface from './components/ReadingInterface'
import TavusVideo from './components/TavusVideo'
import GoalDisplay from './components/GoalDisplay'
import TranscriptAnalyzer from './components/TranscriptAnalyzer'
import DebugPanel from './components/DebugPanel'
import './index.css'

function App() {
  const [currentPage, setCurrentPage] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [transcriptData, setTranscriptData] = useState([])

  const handleProgressUpdate = (progressData) => {
    console.log('📊 Reading progress update:', progressData)
  }

  const handleFeedbackGenerated = (feedbackData) => {
    console.log('💬 Feedback generated:', feedbackData)
    setFeedback(feedbackData)
  }

  const handleTranscriptUpdate = (transcriptEntry) => {
    setTranscriptData(prev => [...prev, transcriptEntry])
  }

  const storyContext = {
    title: "The Happy Cat",
    difficulty: "beginner",
    content: [
      { text: "Once upon a time, there was a happy cat named Whiskers." },
      { text: "Whiskers would chase butterflies in the garden." },
      { text: "One day, Whiskers met a little blue bird." }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-2">
      <div className="max-w-full mx-auto">
        <header className="text-center mb-3">
          <h1 className="text-xl font-bold text-gray-800 mb-1">AutiSpark Reading Trainer</h1>
          <p className="text-xs text-gray-600">Personalized reading practice with AI support</p>
        </header>

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" style={{ height: 'calc(100vh - 100px)' }}>
          {/* Left Column - Tavus Video (40% of screen) */}
          <div className="lg:col-span-1 h-full">
            <TavusVideo
              readingProgress={{
                currentPage,
                totalPages: 3,
                shouldGenerateFeedback: true,
                correctAnswers: 0,
                incorrectAnswers: 0
              }}
              onFeedbackGenerated={handleFeedbackGenerated}
              onTranscriptUpdate={handleTranscriptUpdate}
              onConversationStart={setConversationId}
              currentGoal="reading comprehension"
              storyContext={storyContext}
            />
          </div>

          {/* Middle Column - Reading Interface (40% of screen) */}
          <div className="lg:col-span-1 h-full">
            <ReadingInterface
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              onProgressUpdate={handleProgressUpdate}
              feedback={feedback}
            />
          </div>

          {/* Right Column - Analysis & Goals (20% of screen) */}
          <div className="lg:col-span-1 h-full flex flex-col gap-3">
            {/* Transcript Analyzer - Top half */}
            <div style={{ height: '60%' }}>
              <TranscriptAnalyzer 
                conversationId={conversationId}
                transcriptData={transcriptData}
                isActive={!!conversationId}
              />
            </div>

            {/* Goals - Bottom half */}
            <div style={{ height: '40%' }}>
              <GoalDisplay />
            </div>
          </div>
        </div>
      </div>

      <DebugPanel />
    </div>
  )
}

export default App
