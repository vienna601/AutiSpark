import { Target, Star, BookOpen, Brain, MessageSquare, CheckCircle } from 'lucide-react'

export default function GoalDisplay() {
  const currentGoal = "identify emotion"
  
  const geminiQuestions = [
    {
      id: 1,
      question: "How do you think Whiskers felt when he met the blue bird?",
      type: "emotion",
      difficulty: "easy"
    },
    {
      id: 2,
      question: "What made the garden special in the story?",
      type: "comprehension",
      difficulty: "medium"
    },
    {
      id: 3,
      question: "Can you describe what you would do if you met a friendly dragon?",
      type: "creative",
      difficulty: "hard"
    }
  ]
  
  return (
    <div className="goal-card p-4 h-full flex flex-col overflow-hidden">
      {/* Compact Goals Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Goals & AI Questions</h3>
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-lg font-bold text-purple-700 capitalize bg-white rounded-lg p-2 border-2 border-purple-200">
            {currentGoal}
          </div>
          
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((star, index) => (
              <Star 
                key={index}
                className={`w-4 h-4 ${index < 3 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          
          <p className="text-xs text-gray-500">3/5 completed today!</p>
        </div>
      </div>

      {/* Compact AI Questions */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2">
          {geminiQuestions.slice(0, 2).map((q, index) => (
            <div key={q.id} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  q.difficulty === 'easy' ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 mb-2">{q.question}</p>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      q.type === 'emotion' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {q.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <button className="mt-2 w-full px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs text-gray-600 transition-colors">
                Think & Answer
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <div className="text-center text-xs text-gray-600">
            💡 AI-Generated Questions
          </div>
        </div>
      </div>
    </div>
  )
}
