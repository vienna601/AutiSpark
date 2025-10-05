import { useState, useRef, useEffect } from 'react';
import { 
  Edit3, 
  Save, 
  RotateCcw, 
  CheckCircle, 
  MessageSquare, 
  Lightbulb,
  Star,
  TrendingUp,
  Eye,
  FileText
} from 'lucide-react';
import { WritingFeedbackService } from '../services/writingFeedbackService';

export default function WritingInterface() {
  const [currentPrompt, setCurrentPrompt] = useState({
    prompt: "Write about your favorite animal. What does it look like? What does it like to do?",
    goal: "write a structured response",
    expectedLength: "3-5 sentences",
    tips: ["Start with a sentence about your name", "Use describing words like colors and sizes"]
  });
  const [studentText, setStudentText] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const textAreaRef = useRef(null);
  const recognitionRef = useRef(null);
  const writingService = useRef(new WritingFeedbackService());

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        
        if (finalTranscript) {
          setStudentText(prev => prev + finalTranscript);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Update counts when text changes
    const words = studentText.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    setCharacterCount(studentText.length);
  }, [studentText]);

  const handleTextChange = (e) => {
    setStudentText(e.target.value);
  };

  const startSpeechToText = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopSpeechToText = () => {
    if (recognitionRef.current && isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    }
  };

  const analyzeWriting = async () => {
    if (!studentText.trim()) {
      alert('Please write something first!');
      return;
    }

    setIsAnalyzing(true);
    setShowFeedback(true);
    
    try {
      const result = await writingService.current.analyzeWriting(
        currentPrompt.prompt,
        studentText,
        currentPrompt.goal
      );
      setFeedback(result);
    } catch (error) {
      console.error('Error analyzing writing:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateNewPrompt = async () => {
    try {
      const newPrompt = await writingService.current.generatePrompt('beginner', 'personal');
      setCurrentPrompt(newPrompt);
      resetWriting();
    } catch (error) {
      console.error('Error generating prompt:', error);
    }
  };

  const resetWriting = () => {
    setStudentText('');
    setFeedback(null);
    setShowFeedback(false);
    setWordCount(0);
    setCharacterCount(0);
    if (isListening) {
      stopSpeechToText();
    }
  };

  const saveWriting = () => {
    const writingData = {
      prompt: currentPrompt.prompt,
      text: studentText,
      feedback: feedback,
      timestamp: new Date().toISOString(),
      wordCount,
      characterCount
    };
    
    // Save to localStorage for now
    const savedWritings = JSON.parse(localStorage.getItem('autispark_writings') || '[]');
    savedWritings.push(writingData);
    localStorage.setItem('autispark_writings', JSON.stringify(savedWritings));
    
    alert('Writing saved successfully!');
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto h-full">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Edit3 className="text-purple-600" />
            Writing Practice
          </h1>
          <p className="text-gray-600">Express your thoughts and get personalized feedback</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full" style={{ height: 'calc(100% - 100px)' }}>
          {/* Left Column - Writing Area */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Prompt Card */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-purple-200 p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Prompt</h2>
                <button
                  onClick={generateNewPrompt}
                  className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200"
                >
                  New Prompt
                </button>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-3 mb-3">
                <MessageSquare className="text-purple-600 mb-2" size={20} />
                <p className="text-gray-700 font-medium">{currentPrompt.prompt}</p>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Goal: {currentPrompt.goal}
                </span>
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                  Length: {currentPrompt.expectedLength}
                </span>
              </div>

              {currentPrompt.tips && (
                <div className="mt-3">
                  <div className="flex items-center gap-1 mb-2">
                    <Lightbulb className="text-yellow-500" size={16} />
                    <span className="text-sm font-medium text-gray-700">Tips:</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {currentPrompt.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Writing Area */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-purple-200 p-4 flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Your Writing</h3>
                <div className="flex gap-2">
                  <button
                    onClick={isListening ? stopSpeechToText : startSpeechToText}
                    className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                      isListening 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <MessageSquare size={16} />
                    {isListening ? 'Stop Dictation' : 'Start Dictation'}
                  </button>
                  
                  <button
                    onClick={analyzeWriting}
                    disabled={!studentText.trim() || isAnalyzing}
                    className="bg-purple-600 text-white px-4 py-1 rounded-lg text-sm hover:bg-purple-700 disabled:bg-gray-400"
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Get Feedback'}
                  </button>
                </div>
              </div>

              <textarea
                ref={textAreaRef}
                value={studentText}
                onChange={handleTextChange}
                placeholder="Start writing here... You can type or use the dictation button to speak your ideas!"
                className="flex-1 w-full p-4 border border-gray-200 rounded-lg text-lg leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-400"
                style={{ minHeight: '200px' }}
              />

              {/* Writing Stats */}
              <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                <div className="flex gap-4">
                  <span>{wordCount} words</span>
                  <span>{characterCount} characters</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={saveWriting}
                    disabled={!studentText.trim()}
                    className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <Save size={16} />
                    Save
                  </button>
                  
                  <button
                    onClick={resetWriting}
                    className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-200"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Video Chat Area */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border-2 border-purple-200 p-4">
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">AI Writing Coach</h3>
                <Eye className="text-purple-600" size={20} />
              </div>

              {/* Video placeholder - Replace with actual Tavus integration */}
              <div className="flex-1 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="text-purple-600" size={32} />
                  </div>
                  <p className="text-purple-700 font-medium">AI Coach Ready</p>
                  <p className="text-purple-600 text-sm">Start writing to begin conversation</p>
                </div>
              </div>

              {/* Feedback Panel */}
              {showFeedback && (
                <div className="space-y-3">
                  {isAnalyzing ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <p className="text-gray-600 text-sm">Analyzing your writing...</p>
                    </div>
                  ) : feedback && (
                    <div className="space-y-3">
                      {/* Score */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-green-700 font-medium">Overall Score</span>
                          <div className="flex items-center gap-1">
                            <Star className="text-yellow-500 fill-current" size={16} />
                            <span className="text-green-700 font-bold">{feedback.overallScore}/10</span>
                          </div>
                        </div>
                        <p className="text-green-700 text-sm">{feedback.encouragement}</p>
                      </div>

                      {/* Strengths */}
                      {feedback.strengths && feedback.strengths.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="text-blue-700 font-medium mb-2 flex items-center gap-1">
                            <CheckCircle size={16} />
                            What you did well:
                          </h4>
                          <ul className="space-y-1">
                            {feedback.strengths.map((strength, index) => (
                              <li key={index} className="text-blue-700 text-sm flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Next Steps */}
                      {feedback.nextSteps && feedback.nextSteps.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                          <h4 className="text-purple-700 font-medium mb-2 flex items-center gap-1">
                            <TrendingUp size={16} />
                            Next steps:
                          </h4>
                          <ul className="space-y-1">
                            {feedback.nextSteps.map((step, index) => (
                              <li key={index} className="text-purple-700 text-sm flex items-start gap-2">
                                <span className="text-purple-500">•</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Grammar Check */}
                      {feedback.grammarCheck && feedback.grammarCheck.errors > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <h4 className="text-yellow-700 font-medium mb-2 flex items-center gap-1">
                            <FileText size={16} />
                            Grammar suggestions:
                          </h4>
                          <div className="space-y-2">
                            {feedback.grammarCheck.corrections.map((correction, index) => (
                              <div key={index} className="text-sm">
                                <div className="text-yellow-800">
                                  <span className="line-through text-red-600">{correction.original}</span>
                                  {' → '}
                                  <span className="text-green-600">{correction.corrected}</span>
                                </div>
                                <p className="text-yellow-700 text-xs mt-1">{correction.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
