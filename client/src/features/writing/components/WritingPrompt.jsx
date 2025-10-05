import React from 'react';
import { MessageSquare, Target, Clock, Lightbulb, RefreshCw } from 'lucide-react';

export default function WritingPrompt({ prompt, onNewPrompt, isGenerating }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-purple-200">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-gray-800">Today's Writing Prompt</h2>
        <button
          onClick={onNewPrompt}
          disabled={isGenerating}
          className="flex items-center gap-2 text-sm bg-purple-100 text-purple-700 px-3 py-2 rounded-lg hover:bg-purple-200 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <RefreshCw className={isGenerating ? 'animate-spin' : ''} size={16} />
          {isGenerating ? 'Generating...' : 'New Prompt'}
        </button>
      </div>
      
      {/* Main Prompt */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <MessageSquare className="text-purple-600 mt-1" size={24} />
          <div>
            <p className="text-gray-800 font-medium text-lg leading-relaxed">
              {prompt.prompt}
            </p>
          </div>
        </div>
      </div>

      {/* Prompt Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
          <Target className="text-blue-600" size={18} />
          <div>
            <div className="text-blue-800 font-medium text-sm">Goal</div>
            <div className="text-blue-700 text-sm">{prompt.goal}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-green-50 rounded-lg p-3">
          <Clock className="text-green-600" size={18} />
          <div>
            <div className="text-green-800 font-medium text-sm">Expected Length</div>
            <div className="text-green-700 text-sm">{prompt.expectedLength}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-yellow-50 rounded-lg p-3">
          <Lightbulb className="text-yellow-600" size={18} />
          <div>
            <div className="text-yellow-800 font-medium text-sm">Level</div>
            <div className="text-yellow-700 text-sm">Beginner</div>
          </div>
        </div>
      </div>

      {/* Tips */}
      {prompt.tips && prompt.tips.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="text-yellow-600" size={18} />
            <span className="text-yellow-800 font-medium">Helpful Tips:</span>
          </div>
          <ul className="space-y-2">
            {prompt.tips.map((tip, index) => (
              <li key={index} className="text-yellow-700 flex items-start gap-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
