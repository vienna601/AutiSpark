import React, { useState, useEffect } from 'react';
import { Book, Brain, MessageCircle, ChevronRight, Star, Trophy, Target, Lightbulb } from 'lucide-react';
import { READING_STORIES, DIFFICULTY_LEVELS } from '../data/readingStories';
import { ReadingComprehensionService } from '../services/readingComprehensionService';
import { TavusReadingService } from '../services/tavusReadingService';

const ReadingPage = () => {
  // State management
  const [selectedDifficulty, setSelectedDifficulty] = useState(1);
  const [selectedStory, setSelectedStory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // AI Assistant states
  const [geminiHint, setGeminiHint] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [encouragement, setEncouragement] = useState(null);
  
  // Tavus states
  const [tavusConversation, setTavusConversation] = useState(null);
  const [showTavus, setShowTavus] = useState(false);
  const [tavusLoading, setTavusLoading] = useState(false);

  // Services
  const [readingService] = useState(new ReadingComprehensionService());
  const [tavusService] = useState(new TavusReadingService());

  // Get stories for current difficulty
  const stories = READING_STORIES[`difficulty${selectedDifficulty}`] || [];
  const currentStory = selectedStory;
  const currentQuestion = currentStory?.questions[currentQuestionIndex];

  // Initialize Tavus when component mounts
  useEffect(() => {
    const initializeTavus = async () => {
      try {
        const isConnected = await tavusService.testConnection();
        if (isConnected) {
          console.log('✅ Tavus service ready');
        }
      } catch (error) {
        console.error('❌ Tavus initialization failed:', error);
      }
    };

    initializeTavus();
  }, [tavusService]);

  // Handle story selection
  const handleStorySelect = (story) => {
    setSelectedStory(story);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCompletedQuestions([]);
    setScore(0);
    setShowResults(false);
    setGeminiHint(null);
    setShowHint(false);
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  // Submit answer
  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correct;
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setCompletedQuestions([...completedQuestions, {
      questionId: currentQuestion.id,
      selected: selectedAnswer,
      correct: currentQuestion.correct,
      isCorrect
    }]);

    setShowExplanation(true);

    // Get explanation from Gemini
    try {
      const explanation = await readingService.getExplanation(
        currentStory.story,
        currentQuestion.question,
        currentQuestion.options[currentQuestion.correct],
        currentQuestion.options[selectedAnswer],
        isCorrect
      );
      
      setGeminiHint(explanation);
    } catch (error) {
      console.error('Error getting explanation:', error);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentStory.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setGeminiHint(null);
      setShowHint(false);
    } else {
      setShowResults(true);
    }
  };

  // Get hint from Gemini
  const handleGetHint = async () => {
    if (showHint || showExplanation) return;

    try {
      const hint = await readingService.getReadingHints(
        currentStory.story,
        currentQuestion.question,
        selectedAnswer !== null ? currentQuestion.options[selectedAnswer] : null
      );
      
      setGeminiHint(hint);
      setShowHint(true);
    } catch (error) {
      console.error('Error getting hint:', error);
    }
  };

  // Start Tavus conversation
  const handleStartTavus = async () => {
    if (tavusConversation) {
      setShowTavus(true);
      return;
    }

    setTavusLoading(true);
    try {
      const conversation = await tavusService.createConversation();
      setTavusConversation(conversation);
      setShowTavus(true);
    } catch (error) {
      console.error('Error starting Tavus conversation:', error);
      alert('Unable to start video assistant. Please try again later.');
    } finally {
      setTavusLoading(false);
    }
  };

  // End Tavus conversation
  const handleEndTavus = async () => {
    if (tavusConversation) {
      try {
        await tavusService.endConversation(tavusConversation.conversationId);
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
    }
    setTavusConversation(null);
    setShowTavus(false);
  };

  // Reset to story selection
  const handleBackToStories = () => {
    setSelectedStory(null);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      {/* Tavus Video Assistant - Fixed Position */}
      {showTavus && tavusConversation && (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-2xl border-4 border-purple-200">
          <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <span className="font-semibold">Spark - Reading Assistant</span>
            </div>
            <button
              onClick={handleEndTavus}
              className="text-white hover:text-red-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="w-80 h-60">
            <iframe
              src={tavusConversation.conversationUrl}
              className="w-full h-full rounded-b-lg"
              frameBorder="0"
              allow="camera; microphone"
            />
          </div>
        </div>
      )}

      {/* Tavus Assistant Button - Fixed Position */}
      {!showTavus && (
        <button
          onClick={handleStartTavus}
          disabled={tavusLoading}
          className="fixed top-4 right-4 z-40 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
        >
          <MessageCircle size={20} />
          {tavusLoading ? 'Starting...' : 'Reading Assistant'}
        </button>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Book className="text-purple-600" size={48} />
            <h1 className="text-4xl font-bold text-gray-800">Reading Comprehension</h1>
          </div>
          <p className="text-xl text-gray-600">
            Choose your difficulty level and practice reading stories!
          </p>
        </div>

        {!selectedStory ? (
          <>
            {/* Difficulty Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Target className="text-purple-600" />
                Choose Your Level
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {DIFFICULTY_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedDifficulty(level.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      selectedDifficulty === level.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        selectedDifficulty === level.id ? 'bg-purple-500' : 'bg-gray-400'
                      }`}>
                        {level.id}
                      </div>
                    </div>
                    <h3 className="font-semibold text-lg">{level.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Story Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Choose a Story - Level {selectedDifficulty}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stories.map((story) => (
                  <div
                    key={story.id}
                    className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 cursor-pointer"
                    onClick={() => handleStorySelect(story)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{story.title}</h3>
                      <ChevronRight className="text-purple-600" size={24} />
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {story.story.substring(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-600 font-semibold">
                        {story.questions.length} Questions
                      </span>
                      <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                        Start Reading
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : showResults ? (
          // Results Screen
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <Trophy className="text-yellow-500 mx-auto mb-4" size={64} />
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Great Job!</h2>
              <p className="text-xl text-gray-600">You completed "{currentStory.title}"</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {score} / {currentStory.questions.length}
              </div>
              <p className="text-lg text-gray-700">Questions Correct</p>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleBackToStories}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Choose Another Story
              </button>
            </div>
          </div>
        ) : (
          // Question Interface
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Story Text */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{currentStory.title}</h2>
                  <div className="text-sm text-purple-600 font-semibold">
                    Question {currentQuestionIndex + 1} of {currentStory.questions.length}
                  </div>
                </div>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {currentStory.story}
                  </p>
                </div>
              </div>

              {/* Question */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {currentQuestion.question}
                </h3>
                
                <div className="space-y-3 mb-6">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showExplanation}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                        selectedAnswer === index
                          ? showExplanation
                            ? index === currentQuestion.correct
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-red-500 bg-red-50 text-red-700'
                            : 'border-purple-500 bg-purple-50 text-purple-700'
                          : showExplanation && index === currentQuestion.correct
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                      } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold mr-3">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={handleGetHint}
                    disabled={showHint || showExplanation}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lightbulb size={20} />
                    Get Hint
                  </button>

                  {!showExplanation ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {currentQuestionIndex < currentStory.questions.length - 1 ? 'Next Question' : 'See Results'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* AI Assistant Panel */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="text-purple-600" />
                  <h3 className="text-lg font-bold text-gray-800">AI Reading Helper</h3>
                </div>

                {geminiHint && (showHint || showExplanation) && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
                    {showHint && (
                      <>
                        <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-1">
                          <Lightbulb size={16} />
                          Reading Hint
                        </h4>
                        <p className="text-blue-800 mb-2">{geminiHint.hint}</p>
                        <p className="text-sm text-blue-600 italic">{geminiHint.readingTip}</p>
                      </>
                    )}
                    
                    {showExplanation && (
                      <>
                        <h4 className="font-semibold text-purple-700 mb-2">Explanation</h4>
                        <p className="text-purple-800 mb-2">{geminiHint.explanation}</p>
                        <p className="text-sm text-green-600 font-medium">{geminiHint.encouragement}</p>
                      </>
                    )}
                  </div>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Progress</h4>
                  <div className="bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="bg-purple-600 rounded-full h-2 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / currentStory.questions.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {currentStory.questions.length}
                  </p>
                </div>

                {/* Score */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-purple-700">Score:</span>
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500" size={16} />
                      <span className="font-bold text-purple-700">{score}</span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mt-4 text-sm text-gray-600">
                  <p className="mb-2">💡 <strong>Tips:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Read the story carefully</li>
                    <li>Look for key words in the question</li>
                    <li>Find evidence in the text</li>
                    <li>Use the hint if you need help</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingPage;
