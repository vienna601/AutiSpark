import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Volume2, MessageCircle, BookOpen } from 'lucide-react'
import { GeminiService } from '../services/geminiService'

// Sample stories with variety of content
const sampleStories = [
  {
    title: "The Happy Cat",
    pages: [
      {
        content: "Once upon a time, there was a happy cat named Whiskers. Whiskers loved to play in the sunny garden with colorful flowers and tall trees.",
        image: "🐱",
        question: "What was the cat's name?",
        answers: ["Whiskers", "Fluffy", "Mittens", "Shadow"],
        correctAnswer: 0
      },
      {
        content: "Whiskers would chase butterflies through the garden. The butterflies were orange and yellow, dancing in the warm sunlight.",
        image: "🦋",
        question: "What colors were the butterflies?",
        answers: ["blue and green", "orange and yellow", "purple and red", "black and white"],
        correctAnswer: 1
      },
      {
        content: "One day, Whiskers met a little blue bird sitting on a branch. The bird could sing the most beautiful songs that made everyone smile.",
        image: "🐦",
        question: "What could the bird do?",
        answers: ["dance", "paint", "sing", "run fast"],
        correctAnswer: 2
      }
    ]
  },
  {
    title: "The Magic Garden",
    pages: [
      {
        content: "In a secret garden behind an old stone wall, magical flowers grew that could change colors with the seasons.",
        image: "🌺",
        question: "What was special about the flowers?",
        answers: ["they were very big", "they could change colors", "they smelled like cookies", "they grew at night"],
        correctAnswer: 1
      },
      {
        content: "A young girl named Luna discovered the garden while exploring. She loved to read books under the rainbow tree.",
        image: "🌈",
        question: "What did Luna like to do in the garden?",
        answers: ["plant seeds", "chase butterflies", "read books", "pick flowers"],
        correctAnswer: 2
      }
    ]
  },
  {
    title: "The Friendly Dragon",
    pages: [
      {
        content: "Deep in the mountains lived a small green dragon named Spark. Unlike other dragons, Spark was very gentle and kind to everyone.",
        image: "🐲",
        question: "What color was the dragon?",
        answers: ["red", "blue", "green", "purple"],
        correctAnswer: 2
      },
      {
        content: "Spark loved to help the village children by lighting their campfires with his breath and telling them exciting adventure stories.",
        image: "🔥",
        question: "How did Spark help the children?",
        answers: ["gave them gold", "lit their campfires", "built their houses", "taught them to fly"],
        correctAnswer: 1
      }
    ]
  }
]

export default function ReadingInterface({ currentPage, setCurrentPage, onProgressUpdate, feedback }) {
  const [selectedStory, setSelectedStory] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    correctAnswers: 0,
    incorrectAnswers: 0,
    startTime: Date.now(),
    pageStartTime: Date.now()
  })
  const [aiFeedback, setAiFeedback] = useState('')

  const currentStory = sampleStories[selectedStory]
  const currentPageData = currentStory.pages[currentPage] || currentStory.pages[0]
  const totalPages = currentStory.pages.length

  useEffect(() => {
    setSessionStats(prev => ({
      ...prev,
      pageStartTime: Date.now()
    }))
    setSelectedAnswer(null)
    setShowResult(false)
  }, [currentPage, selectedStory])

  const handleAnswerSelect = async (answerIndex) => {
    setSelectedAnswer(answerIndex)
    setShowResult(true)
    
    const isCorrect = answerIndex === currentPageData.correctAnswer
    const timeSpent = Math.floor((Date.now() - sessionStats.pageStartTime) / 1000)
    
    const newStats = {
      ...sessionStats,
      correctAnswers: sessionStats.correctAnswers + (isCorrect ? 1 : 0),
      incorrectAnswers: sessionStats.incorrectAnswers + (isCorrect ? 0 : 1)
    }
    setSessionStats(newStats)

    const readingData = {
      currentPage,
      totalPages,
      correctAnswers: newStats.correctAnswers,
      incorrectAnswers: newStats.incorrectAnswers,
      timeSpent,
      difficulty: 'beginner',
      currentGoal: 'reading comprehension',
      recentAnswerCorrect: isCorrect,
      shouldGenerateFeedback: true
    }

    if (onProgressUpdate) {
      onProgressUpdate(readingData)
    }

    const immediateFeedback = await GeminiService.generateFeedback(readingData)
    setAiFeedback(immediateFeedback)
    
    if (isCorrect) {
      setTimeout(() => {
        if (currentPage < totalPages - 1) {
          setCurrentPage(currentPage + 1)
        } else if (selectedStory < sampleStories.length - 1) {
          setSelectedStory(selectedStory + 1)
          setCurrentPage(0)
        }
        setSelectedAnswer(null)
        setShowResult(false)
        setAiFeedback('')
      }, 3000)
    }
  }

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1)
    } else if (selectedStory < sampleStories.length - 1) {
      setSelectedStory(selectedStory + 1)
      setCurrentPage(0)
    }
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1)
    } else if (selectedStory > 0) {
      setSelectedStory(selectedStory - 1)
      setCurrentPage(sampleStories[selectedStory - 1].pages.length - 1)
    }
    setSelectedAnswer(null)
    setShowResult(false)
  }

  const readAloud = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentPageData.content)
      utterance.rate = 0.8
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  const changeStory = (storyIndex) => {
    setSelectedStory(storyIndex)
    setCurrentPage(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setAiFeedback('')
  }

  return (
    <div className="reading-card p-3 h-full flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <select 
            value={selectedStory} 
            onChange={(e) => changeStory(parseInt(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm bg-white"
          >
            {sampleStories.map((story, index) => (
              <option key={index} value={index}>{story.title}</option>
            ))}
          </select>
        </div>
        
        <button 
          onClick={readAloud}
          className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors text-sm"
        >
          <Volume2 className="w-3 h-3" />
          Read
        </button>
      </div>

      {/* Much Bigger Main Content */}
      <div className="reading-content flex-1 space-y-4 overflow-auto">
        {/* Bigger Story Section */}
        <div className="grid grid-cols-3 gap-4">
          {/* Story Image */}
          <div className="col-span-1">
            <div className="story-image h-32 text-4xl">
              {currentPageData.image}
            </div>
          </div>
          
          {/* Story Text */}
          <div className="col-span-2">
            <div className="text-lg leading-relaxed text-gray-700 p-4 bg-gray-50 rounded-lg">
              {currentPageData.content}
            </div>
          </div>
        </div>

        {/* Bigger Question Section */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-800">Question:</h3>
          <p className="text-lg text-gray-700 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
            {currentPageData.question}
          </p>
          
          {/* Bigger Answer Options */}
          <div className="grid grid-cols-2 gap-3">
            {currentPageData.answers.map((answer, index) => {
              let buttonClass = "px-4 py-3 border-2 rounded-lg text-base cursor-pointer transition-all bg-purple-50 border-purple-200 hover:bg-purple-100"
              
              if (showResult) {
                if (index === currentPageData.correctAnswer) {
                  buttonClass = "px-4 py-3 border-2 rounded-lg text-base bg-green-100 border-green-500 text-green-700"
                } else if (index === selectedAnswer && index !== currentPageData.correctAnswer) {
                  buttonClass = "px-4 py-3 border-2 rounded-lg text-base bg-red-100 border-red-500 text-red-700"
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => !showResult && handleAnswerSelect(index)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  {String.fromCharCode(65 + index)}. {answer}
                </button>
              )
            })}
          </div>

          {/* Result Messages */}
          {showResult && (
            <div className="text-center space-y-3">
              {selectedAnswer === currentPageData.correctAnswer ? (
                <div className="text-green-600 font-semibold text-lg bg-green-50 p-4 rounded-lg">
                  🎉 Excellent! That's correct!
                </div>
              ) : (
                <div className="text-orange-600 font-semibold text-lg bg-orange-50 p-4 rounded-lg">
                  💭 Good try! Let's learn together.
                </div>
              )}
              
              {/* AI Feedback */}
              {aiFeedback && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">{aiFeedback}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compact Stats and Navigation */}
      <div className="mt-3 space-y-2">
        <div className="p-2 bg-gray-50 rounded-lg">
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <span>✅ {sessionStats.correctAnswers}</span>
            <span>🤔 {sessionStats.incorrectAnswers}</span>
            <span>📚 {currentPage + 1}/{totalPages}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <button
            onClick={prevPage}
            disabled={currentPage === 0 && selectedStory === 0}
            className="flex items-center gap-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors disabled:opacity-50 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="text-sm text-gray-500 text-center">
            {currentStory.title}<br/>
            Page {currentPage + 1} of {totalPages}
          </div>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages - 1 && selectedStory === sampleStories.length - 1}
            className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
