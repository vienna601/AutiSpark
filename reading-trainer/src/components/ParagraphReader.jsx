import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  BookOpen, 
  MessageCircle, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  TrendingUp,
  Clock
} from 'lucide-react';
import { ParagraphFeedbackService } from '../services/paragraphFeedbackService';

const sampleParagraphs = [
  {
    id: 1,
    title: "The Friendly Cat",
    text: "Whiskers was a friendly orange cat who lived in a cozy house with his family. Every morning, he would stretch and yawn before padding to the kitchen for breakfast. His favorite food was tuna, and he would purr loudly whenever he smelled it cooking. After eating, Whiskers liked to sit by the sunny window and watch the birds play in the garden.",
    level: "beginner",
    estimatedTime: "2-3 minutes"
  },
  {
    id: 2,
    title: "The School Science Fair",
    text: "Maria was excited about the upcoming science fair at her school. She had been working on her volcano project for three weeks, carefully measuring ingredients and testing different reactions. The night before the fair, she practiced her presentation in front of her family. When the big day arrived, Maria felt nervous but confident as she explained how her volcano worked to the judges.",
    level: "intermediate",
    estimatedTime: "3-4 minutes"
  }
];

export default function ParagraphReader() {
  const [selectedParagraph, setSelectedParagraph] = useState(sampleParagraphs[0]);
  const [isReading, setIsReading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [readingData, setReadingData] = useState({
    startTime: null,
    wpm: 0,
    accuracy: 0,
    pauses: 0,
    repetitions: 0,
    corrections: 0
  });
  const [feedback, setFeedback] = useState(null);
  const [errors, setErrors] = useState([]);
  const [hints, setHints] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const recognitionRef = useRef(null);
  const feedbackService = useRef(new ParagraphFeedbackService());

  const sentences = selectedParagraph.text.match(/[^\.!?]+[\.!?]+/g) || [selectedParagraph.text];

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => prev + ' ' + finalTranscript);
          analyzeCurrentReading(finalTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startReading = () => {
    setIsReading(true);
    setReadingData(prev => ({ ...prev, startTime: Date.now() }));
    setTranscript('');
    setCurrentSentenceIndex(0);
    setErrors([]);
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }

    // Get initial hints for the first sentence
    getHintsForCurrentSentence();
  };

  const stopReading = async () => {
    setIsReading(false);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Calculate final reading statistics
    const endTime = Date.now();
    const duration = (endTime - readingData.startTime) / 1000 / 60; // minutes
    const wordCount = transcript.split(' ').filter(word => word.length > 0).length;
    const wpm = Math.round(wordCount / duration);
    
    const finalData = {
      ...readingData,
      wpm,
      accuracy: calculateAccuracy(),
      duration
    };

    setReadingData(finalData);

    // Get comprehensive feedback from Gemini
    await getFeedback(finalData);
  };

  const resetReading = () => {
    setIsReading(false);
    setTranscript('');
    setCurrentSentenceIndex(0);
    setReadingData({
      startTime: null,
      wpm: 0,
      accuracy: 0,
      pauses: 0,
      repetitions: 0,
      corrections: 0
    });
    setFeedback(null);
    setErrors([]);
    setHints([]);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const analyzeCurrentReading = (newTranscript) => {
    // Simple analysis for real-time feedback
    const words = newTranscript.toLowerCase().split(' ');
    const originalWords = selectedParagraph.text.toLowerCase().split(' ');
    
    // Detect repetitions
    const lastWord = words[words.length - 1];
    const secondLastWord = words[words.length - 2];
    if (lastWord === secondLastWord && lastWord) {
      setReadingData(prev => ({ ...prev, repetitions: prev.repetitions + 1 }));
      addError('repetition', `Repeated the word "${lastWord}"`, 'low');
    }

    // Calculate current accuracy
    const accuracy = calculateAccuracy();
    setReadingData(prev => ({ ...prev, accuracy }));
  };

  const calculateAccuracy = () => {
    if (!transcript) return 0;
    
    const transcriptWords = transcript.toLowerCase().split(' ').filter(w => w.length > 0);
    const originalWords = selectedParagraph.text.toLowerCase().split(' ');
    
    let correct = 0;
    const minLength = Math.min(transcriptWords.length, originalWords.length);
    
    for (let i = 0; i < minLength; i++) {
      if (transcriptWords[i] === originalWords[i]) {
        correct++;
      }
    }
    
    return minLength > 0 ? Math.round((correct / minLength) * 100) : 0;
  };

  const addError = (type, description, severity) => {
    const newError = {
      id: Date.now(),
      type,
      description,
      severity,
      timestamp: new Date().toLocaleTimeString()
    };
    setErrors(prev => [...prev, newError]);
  };

  const getFeedback = async (finalData) => {
    setIsAnalyzing(true);
    try {
      const result = await feedbackService.current.analyzeParagraphReading(
        selectedParagraph,
        transcript,
        finalData
      );
      setFeedback(result);
    } catch (error) {
      console.error('Error getting feedback:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getHintsForCurrentSentence = async () => {
    if (currentSentenceIndex < sentences.length) {
      const currentSentence = sentences[currentSentenceIndex];
      const result = await feedbackService.current.getContextualHints(
        currentSentence,
        errors.slice(-3) // Last 3 errors for context
      );
      setHints(result.hints || []);
    }
  };

  const nextSentence = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
      getHintsForCurrentSentence();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 flex items-center gap-3">
          <BookOpen className="text-blue-600" />
          Paragraph Reading Practice
        </h1>
        
        {/* Paragraph Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose a paragraph:
          </label>
          <select
            value={selectedParagraph.id}
            onChange={(e) => setSelectedParagraph(sampleParagraphs.find(p => p.id === parseInt(e.target.value)))}
            className="border border-gray-300 rounded-md px-3 py-2"
            disabled={isReading}
          >
            {sampleParagraphs.map(paragraph => (
              <option key={paragraph.id} value={paragraph.id}>
                {paragraph.title} ({paragraph.level})
              </option>
            ))}
          </select>
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!isReading ? (
            <button
              onClick={startReading}
              className="bg-green-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Play size={20} />
              Start Reading
            </button>
          ) : (
            <button
              onClick={stopReading}
              className="bg-red-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700"
            >
              <Pause size={20} />
              Stop Reading
            </button>
          )}
          
          <button
            onClick={resetReading}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700"
          >
            <RotateCcw size={20} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Reading Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paragraph Display */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{selectedParagraph.title}</h2>
            <div className="text-lg leading-relaxed text-gray-700 mb-4">
              {sentences.map((sentence, index) => (
                <span
                  key={index}
                  className={`${
                    index === currentSentenceIndex ? 'bg-yellow-200 rounded px-1' : ''
                  } ${index < currentSentenceIndex ? 'text-green-600' : ''}`}
                >
                  {sentence}{' '}
                </span>
              ))}
            </div>
            
            {isReading && (
              <div className="mt-4">
                <button
                  onClick={nextSentence}
                  disabled={currentSentenceIndex >= sentences.length - 1}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                >
                  Next Sentence ({currentSentenceIndex + 1}/{sentences.length})
                </button>
              </div>
            )}
          </div>

          {/* Real-time Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              Reading Progress
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{readingData.wpm}</div>
                <div className="text-sm text-gray-600">WPM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{readingData.accuracy}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{readingData.repetitions}</div>
                <div className="text-sm text-gray-600">Repetitions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{errors.length}</div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
            </div>
          </div>

          {/* Transcript */}
          {transcript && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">What you said:</h3>
              <p className="text-gray-700 italic">"{transcript}"</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Hints */}
          {hints.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <Lightbulb className="text-yellow-600" />
                Helpful Hints
              </h3>
              <ul className="space-y-2">
                {hints.map((hint, index) => (
                  <li key={index} className="text-yellow-700 text-sm">
                    • {hint}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Errors Log */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-red-600" />
              Reading Notes
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {errors.length === 0 ? (
                <p className="text-gray-500 text-sm">No issues detected yet!</p>
              ) : (
                errors.map(error => (
                  <div
                    key={error.id}
                    className={`p-2 rounded text-sm ${
                      error.severity === 'high' ? 'bg-red-100 text-red-700' :
                      error.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}
                  >
                    <div className="font-medium">{error.type}</div>
                    <div className="text-xs">{error.description}</div>
                    <div className="text-xs opacity-75">{error.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Comprehensive Feedback */}
          {feedback && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MessageCircle className="text-green-600" />
                AI Feedback
              </h3>
              
              {isAnalyzing ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Analyzing your reading...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{feedback.overallScore}/10</div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>

                  {/* Encouragement */}
                  <div className="bg-green-50 border border-green-200 rounded p-3">
                    <CheckCircle className="text-green-600 mb-2" size={20} />
                    <p className="text-green-700 text-sm">{feedback.encouragement}</p>
                  </div>

                  {/* Next Steps */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Next Steps:</h4>
                    <ul className="space-y-1">
                      {feedback.nextSteps.map((step, index) => (
                        <li key={index} className="text-sm text-gray-600">
                          • {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Practice Activities */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Practice Activities:</h4>
                    <ul className="space-y-1">
                      {feedback.practiceActivities.map((activity, index) => (
                        <li key={index} className="text-sm text-blue-600">
                          • {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
