export class WritingFeedbackService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.apiUrl = import.meta.env.VITE_GEMINI_API_URL;
    
    console.log('🔧 WritingFeedbackService initialized');
    console.log('API Key available:', !!this.apiKey);
    console.log('API URL:', this.apiUrl);
  }

  async analyzeWriting(prompt, studentText, goal) {
    try {
      console.log('🤖 Starting Gemini analysis...');
      console.log('Input:', { prompt, studentText, goal });
      
      if (!this.apiKey) {
        console.error('❌ No API key found!');
        throw new Error('Gemini API key not configured');
      }

      const analysisPrompt = this.createWritingPrompt(prompt, studentText, goal);
      console.log('📝 Analysis prompt created, length:', analysisPrompt.length);
      
      const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;
      console.log('🔗 Request URL:', requestUrl.replace(this.apiKey, '[HIDDEN]'));
      
      const requestBody = {
        contents: [{
          parts: [{ text: analysisPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };
      
      console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Full API Response:', JSON.stringify(data, null, 2));
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('❌ Unexpected response structure:', data);
        console.error('❌ Using default feedback due to bad response structure');
        return this.getDefaultFeedback();
      }

      const feedbackText = data.candidates[0].content.parts[0].text;
      console.log('📄 Raw feedback text:', feedbackText);
      
      const parsedFeedback = this.parseFeedback(feedbackText);
      console.log('✅ Final parsed feedback:', parsedFeedback);
      
      return parsedFeedback;
    } catch (error) {
      console.error('❌ COMPLETE ERROR in analyzeWriting:', error);
      console.error('❌ Error stack:', error.stack);
      console.warn('⚠️ Falling back to default feedback');
      return this.getDefaultFeedback();
    }
  }

  createWritingPrompt(prompt, studentText, goal) {
    return `You are an AI writing tutor for children with autism. Analyze this writing exercise and provide specific, encouraging feedback.

WRITING PROMPT: "${prompt}"
GOAL: "${goal}"

STUDENT'S WRITING:
"${studentText}"

Please provide feedback in this EXACT JSON format. DO NOT use markdown formatting, DO NOT add any extra text before or after the JSON:

{
  "overallScore": 9,
  "encouragement": "Wonderful work! Your writing shows great creativity and thoughtfulness. I can tell you put effort into sharing your ideas clearly.",
  "strengths": [
    "You addressed the writing prompt directly and stayed on topic",
    "Your sentences flow well and are easy to understand",
    "You used specific details that help the reader picture what you're describing"
  ],
  "suggestions": [
    {
      "type": "vocabulary",
      "issue": "Could use more varied describing words",
      "suggestion": "Try using different adjectives to make your writing more colorful",
      "example": "Instead of 'nice day', try 'sunny, warm day' or 'peaceful, quiet morning'"
    }
  ],
  "nextSteps": [
    "Try adding one more sentence with a describing word",
    "Think about how things look, sound, or feel",
    "Consider what happens next in your story"
  ],
  "grammarCheck": {
    "errors": 0,
    "corrections": []
  },
  "vocabularyLevel": "beginner",
  "creativityScore": 8,
  "writingTips": [
    "Read your work aloud to check if it sounds natural",
    "Add details that help readers picture your ideas"
  ]
}

CRITICAL: Return ONLY the JSON object. No markdown. No backticks. No explanatory text. Just the raw JSON starting with { and ending with }.`;
  }

  parseFeedback(feedbackText) {
    try {
      console.log('🔍 Parsing feedback text:', feedbackText);
      
      // Clean the response thoroughly
      let cleanText = feedbackText.trim();
      
      // Remove markdown code blocks
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*\n?/, '').replace(/\n?\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*\n?/, '').replace(/\n?\s*```$/, '');
      }
      
      // Remove any text before the first {
      const firstBrace = cleanText.indexOf('{');
      if (firstBrace > 0) {
        cleanText = cleanText.substring(firstBrace);
        console.log('🧹 Removed text before first brace');
      }
      
      // Remove any text after the last }
      const lastBrace = cleanText.lastIndexOf('}');
      if (lastBrace !== -1 && lastBrace < cleanText.length - 1) {
        cleanText = cleanText.substring(0, lastBrace + 1);
        console.log('🧹 Removed text after last brace');
      }
      
      console.log('🧽 Cleaned text:', cleanText);
      
      // Try to parse the JSON
      const parsed = JSON.parse(cleanText);
      console.log('✅ Successfully parsed feedback!');
      console.log('📊 Parsed data:', parsed);
      
      // Validate that we have the expected structure
      if (!parsed.overallScore || !parsed.encouragement) {
        console.warn('⚠️ Parsed JSON missing required fields, using default');
        return this.getDefaultFeedback();
      }
      
      return parsed;
    } catch (error) {
      console.error('❌ JSON parsing failed:', error.message);
      console.error('❌ Failed to parse text:', feedbackText);
      console.warn('⚠️ Using default feedback due to parsing failure');
      return this.getDefaultFeedback();
    }
  }

  getDefaultFeedback() {
    console.warn('⚠️ RETURNING DEFAULT FEEDBACK - API CALL FAILED');
    return {
      overallScore: 8,
      encouragement: "Great job writing! You've shared some wonderful ideas.",
      strengths: [
        "You followed the prompt well",
        "Your writing shows creativity"
      ],
      suggestions: [
        {
          type: "structure",
          issue: "Could add more details",
          suggestion: "Try adding describing words",
          example: "Instead of 'cat', try 'fluffy orange cat'"
        }
      ],
      nextSteps: [
        "Try writing longer sentences",
        "Add more describing words"
      ],
      grammarCheck: {
        errors: 0,
        corrections: []
      },
      vocabularyLevel: "beginner",
      creativityScore: 7,
      writingTips: [
        "Take your time and think about each word",
        "Read your writing out loud to check if it sounds right"
      ]
    };
  }

  async getRealTimeFeedback(currentText, prompt) {
    if (!currentText || currentText.length < 15) return null;

    try {
      console.log('⏱️ Getting real-time feedback for:', currentText);
      
      const feedbackPrompt = `You are an encouraging AI writing tutor for children with autism. The student is currently writing and needs brief encouragement.

WRITING PROMPT: "${prompt}"
CURRENT TEXT: "${currentText}"

Provide brief, positive encouragement in this EXACT JSON format (no markdown, no extra text):

{
  "message": "Great start! I can see you're thinking carefully about the prompt.",
  "suggestion": "Maybe try adding a detail about what you see or how something looks",
  "progressNote": "You're doing wonderful work so far!"
}

Return ONLY the JSON object. No markdown. No backticks. No extra text.`;

      const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: feedbackPrompt }]
          }],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 256,
          }
        })
      });

      if (!response.ok) {
        console.log('Real-time feedback API failed, skipping...');
        return null;
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      console.log('⏱️ Real-time raw response:', result);
      
      // Clean and parse the result
      let cleanText = result.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*\n?/, '').replace(/\n?\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*\n?/, '').replace(/\n?\s*```$/, '');
      }
      
      // Extract JSON
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }
      
      const parsed = JSON.parse(cleanText);
      console.log('✅ Real-time feedback parsed:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Error getting real-time feedback:', error);
      return null;
    }
  }

  async getWritingHints(currentText, prompt, goal) {
    try {
      console.log('💡 Getting writing hints...');
      
      const hintsPrompt = `You are an AI writing tutor for children with autism. Look at what the student has written and give them 3-4 specific, actionable hints for what to do next.

WRITING PROMPT: "${prompt}"
GOAL: "${goal}"
CURRENT TEXT: "${currentText || 'Nothing written yet'}"

Provide helpful hints in this EXACT JSON format (no markdown, no extra text):

{
  "hints": [
    "Start by writing one sentence about your main idea",
    "Add a describing word like 'big', 'colorful', or 'quiet'",
    "Think about what you see, hear, or feel",
    "Write about what happens next"
  ],
  "nextStep": "Try writing your first sentence about the main topic",
  "encouragement": "You're doing great! Take your time and share your ideas."
}

Make the hints specific to what they've written so far. If they haven't written anything, give hints about starting. Return ONLY the JSON object.`;

      const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: hintsPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          }
        })
      });

      if (!response.ok) {
        console.log('Hints API failed, using defaults...');
        return this.getDefaultHints(currentText);
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      console.log('💡 Hints raw response:', result);
      
      // Clean and parse the result
      let cleanText = result.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*\n?/, '').replace(/\n?\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*\n?/, '').replace(/\n?\s*```$/, '');
      }
      
      // Extract JSON
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }
      
      const parsed = JSON.parse(cleanText);
      console.log('✅ Hints parsed:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Error getting hints:', error);
      return this.getDefaultHints(currentText);
    }
  }

  getDefaultHints(currentText) {
    if (!currentText || currentText.length < 10) {
      return {
        hints: [
          "Start by writing one sentence about your main idea",
          "Use simple words that you know well",
          "Think about the question in the prompt",
          "Take your time and write what you think"
        ],
        nextStep: "Try writing your first sentence",
        encouragement: "You can do this! Every writer starts with one word."
      };
    } else {
      return {
        hints: [
          "Add more details to what you've written",
          "Use describing words like colors, sizes, or feelings",
          "Think about what happens next",
          "Read what you wrote and add one more sentence"
        ],
        nextStep: "Keep going with your ideas",
        encouragement: "Great start! You're doing wonderful work."
      };
    }
  }

  async generatePrompt(difficulty = "beginner", topic = "personal") {
    try {
      console.log('🎯 Generating new prompt...', { difficulty, topic });
      
      const promptRequest = `Generate a creative writing prompt for a child with autism at ${difficulty} level about ${topic}.

Requirements:
- Age-appropriate and engaging
- Clear and specific instructions
- Supportive and encouraging tone
- Length appropriate for skill level

Return in this EXACT JSON format (no markdown, no extra text):
{
  "prompt": "Write about your favorite place to visit. What do you see there? What do you like to do there? How does it make you feel?",
  "goal": "write a structured response with details",
  "expectedLength": "4-6 sentences",
  "tips": [
    "Start by naming your favorite place",
    "Use words that describe what you see, hear, or smell", 
    "Tell us what makes this place special to you"
  ]
}

Return ONLY the JSON object, no other text.`;

      const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptRequest }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        console.error('❌ Error generating prompt:', response.status);
        return this.getDefaultPrompt();
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      // Clean and parse the result
      let cleanText = result.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      }
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ Generated new prompt:', parsed);
        return parsed;
      }
    } catch (error) {
      console.error('❌ Error generating prompt:', error);
    }

    return this.getDefaultPrompt();
  }

  getDefaultPrompt() {
    const prompts = [
      {
        prompt: "Write about your favorite animal. What does it look like? What does it like to do?",
        goal: "write a structured response",
        expectedLength: "3-5 sentences",
        tips: [
          "Start with what animal you chose",
          "Use describing words like colors and sizes",
          "Tell us what makes this animal special"
        ]
      },
      {
        prompt: "Describe your perfect day. What would you do from morning to night?",
        goal: "write about experiences and feelings",
        expectedLength: "4-6 sentences",
        tips: [
          "Start with what time you wake up",
          "Think about activities you enjoy",
          "Include how each activity makes you feel"
        ]
      },
      {
        prompt: "Write about a place that makes you happy. What do you see, hear, and feel there?",
        goal: "use sensory details in writing",
        expectedLength: "4-5 sentences",
        tips: [
          "Name the place first",
          "Use words that describe what you experience with your senses",
          "Explain why this place is special to you"
        ]
      }
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  async testConnection() {
    try {
      console.log('🧪 Testing Gemini API connection...');
      console.log('API Key present:', !!this.apiKey);
      console.log('API URL:', this.apiUrl);
      
      if (!this.apiKey) {
        console.error('❌ No API key configured!');
        return false;
      }
      
      const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;
      
      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Respond with exactly this JSON: {\"test\": \"success\", \"message\": \"Hello, AutiSpark! API is working with Gemini 2.5 Flash!\"}" }]
          }]
        })
      });

      console.log('🧪 Test response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Test response data:', data);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Test failed:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Test connection error:', error);
      return false;
    }
  }

  async answerQuestion(question, currentText, prompt, goal) {
    try {
      console.log('❓ Answering student question:', question);
      
      const answerPrompt = `You are a helpful AI writing tutor for children with autism. A student is working on a writing assignment and has asked a question. Provide a clear, encouraging, and specific answer.

WRITING PROMPT: "${prompt}"
GOAL: "${goal}"
CURRENT TEXT: "${currentText || 'Nothing written yet'}"
STUDENT QUESTION: "${question}"

Provide a helpful answer in this EXACT JSON format (no markdown, no extra text):

{
  "answer": "That's a great question! To start writing, you can begin by thinking about the main idea of your story. What is the most important thing you want to tell your reader?",
  "suggestions": [
    "Try writing just one sentence first",
    "Think about what you want to say",
    "Don't worry about making it perfect"
  ],
  "encouragement": "You're asking smart questions! That shows you're thinking like a real writer.",
  "relatedTips": [
    "All good writers start with questions",
    "It's okay to write down your ideas first, then organize them later"
  ]
}

Make your answer specific to their question and current writing situation. Be encouraging and age-appropriate. Return ONLY the JSON object.`;

      const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: answerPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          }
        })
      });

      if (!response.ok) {
        console.log('Question answering API failed, using default...');
        return this.getDefaultAnswer(question);
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      console.log('❓ Question answer raw response:', result);
      
      // Clean and parse the result
      let cleanText = result.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*\n?/, '').replace(/\n?\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*\n?/, '').replace(/\n?\s*```$/, '');
      }
      
      // Extract JSON
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }
      
      const parsed = JSON.parse(cleanText);
      console.log('✅ Question answer parsed:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ Error answering question:', error);
      return this.getDefaultAnswer(question);
    }
  }

  getDefaultAnswer(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('start') || lowerQuestion.includes('begin')) {
      return {
        answer: "Great question! To start writing, read the prompt carefully and think about one main idea you want to share. Then write that idea in one simple sentence.",
        suggestions: [
          "Read the writing prompt again",
          "Think of one main idea",
          "Write one sentence about that idea",
          "Don't worry about spelling at first"
        ],
        encouragement: "Starting is the hardest part, but you can do it!",
        relatedTips: [
          "Every writer starts with just one word",
          "It's okay if your first sentence isn't perfect"
        ]
      };
    } else if (lowerQuestion.includes('ideas') || lowerQuestion.includes('think')) {
      return {
        answer: "When you need ideas, try thinking about your own experiences! What have you seen, done, or felt that relates to the prompt?",
        suggestions: [
          "Think about things you've done",
          "Remember places you've been",
          "Consider how things make you feel",
          "Ask yourself 'what if?' questions"
        ],
        encouragement: "You have lots of great ideas inside you!",
        relatedTips: [
          "Your own experiences make the best stories",
          "There are no wrong ideas when you're brainstorming"
        ]
      };
    } else if (lowerQuestion.includes('stuck') || lowerQuestion.includes('help')) {
      return {
        answer: "Being stuck is normal for all writers! Try taking a deep breath and reading what you've written so far. What comes next?",
        suggestions: [
          "Read your writing out loud",
          "Think about what happens next",
          "Ask yourself 'then what?'",
          "Take a short break and come back"
        ],
        encouragement: "Getting stuck means you're thinking hard - that's good!",
        relatedTips: [
          "Professional writers get stuck too",
          "Sometimes the best ideas come after a short break"
        ]
      };
    } else {
      return {
        answer: "That's a thoughtful question! Remember that writing is about sharing your thoughts and ideas. Take your time and trust yourself.",
        suggestions: [
          "Trust your own ideas",
          "Write what you think",
          "Don't worry about being perfect",
          "Focus on sharing your thoughts clearly"
        ],
        encouragement: "You're asking great questions - that shows you're thinking like a real writer!",
        relatedTips: [
          "Good writers ask lots of questions",
          "Your voice and ideas are important"
        ]
      };
    }
  }
}
