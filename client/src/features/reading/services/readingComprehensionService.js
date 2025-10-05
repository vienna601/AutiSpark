export class ReadingComprehensionService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.apiUrl = import.meta.env.VITE_GEMINI_API_URL;
    
    console.log('📚 ReadingComprehensionService initialized');
    console.log('API Key available:', !!this.apiKey);
  }

  // Generate hints for reading comprehension
  async getReadingHints(story, question, userAnswer = null) {
    try {
      console.log('💡 Getting reading hints...');
      
      const hintPrompt = `You are an AI reading tutor for children with autism. Help the student understand the story and question better.

STORY: "${story}"
QUESTION: "${question}"
${userAnswer ? `STUDENT'S CURRENT ANSWER: "${userAnswer}"` : ''}

Provide helpful hints in this EXACT JSON format (no markdown, no extra text):

{
  "hint": "Look for the part in the story where it talks about what the character is doing. What action words do you see?",
  "encouragement": "You're doing great! Take your time to read through the story again.",
  "keyWords": ["action", "doing", "character"],
  "storySection": "Focus on the second paragraph where it describes the main activity.",
  "readingTip": "Try reading the question first, then look for that information in the story."
}

Make the hint specific and encouraging. Point them to the right part of the story without giving away the answer. Return ONLY the JSON object.`;

      const response = await this.makeGeminiRequest(hintPrompt);
      return this.parseJsonResponse(response) || this.getDefaultHint();
    } catch (error) {
      console.error('❌ Error getting reading hints:', error);
      return this.getDefaultHint();
    }
  }

  // Get explanation after answering
  async getExplanation(story, question, correctAnswer, userAnswer, isCorrect) {
    try {
      console.log('📝 Getting explanation...');
      
      const explanationPrompt = `You are an AI reading tutor for children with autism. Explain the answer to help the student learn.

STORY: "${story}"
QUESTION: "${question}"
CORRECT ANSWER: "${correctAnswer}"
STUDENT ANSWER: "${userAnswer}"
WAS CORRECT: ${isCorrect}

Provide an explanation in this EXACT JSON format (no markdown, no extra text):

{
  "explanation": "The correct answer is '${correctAnswer}' because in the story it says '...' This tells us that...",
  "encouragement": "${isCorrect ? 'Excellent work! You found the right answer in the story.' : 'Good try! Let me help you understand the correct answer.'}",
  "learningPoint": "When looking for answers, try to find the exact words or phrases in the story that match the question.",
  "storyEvidence": "The story says: '...' which gives us the answer.",
  "nextTip": "For the next question, remember to read carefully and look for key words."
}

Be encouraging and educational. Help them understand the reading strategy. Return ONLY the JSON object.`;

      const response = await this.makeGeminiRequest(explanationPrompt);
      return this.parseJsonResponse(response) || this.getDefaultExplanation(isCorrect);
    } catch (error) {
      console.error('❌ Error getting explanation:', error);
      return this.getDefaultExplanation(isCorrect);
    }
  }

  // Get encouragement during reading
  async getEncouragement(currentProgress, totalQuestions) {
    try {
      const encouragementPrompt = `Generate brief encouragement for a child with autism working on reading comprehension.

PROGRESS: ${currentProgress}/${totalQuestions} questions completed

Provide encouragement in this EXACT JSON format:

{
  "message": "You're doing wonderful work! Keep reading carefully and thinking about each question.",
  "progress": "You've completed ${currentProgress} out of ${totalQuestions} questions - great progress!",
  "motivation": "Remember, every good reader takes their time to understand the story."
}

Return ONLY the JSON object.`;

      const response = await this.makeGeminiRequest(encouragementPrompt);
      return this.parseJsonResponse(response) || {
        message: "You're doing great! Keep up the good work!",
        progress: `${currentProgress}/${totalQuestions} questions completed`,
        motivation: "Take your time and think carefully about each answer."
      };
    } catch (error) {
      console.error('❌ Error getting encouragement:', error);
      return {
        message: "You're doing great! Keep up the good work!",
        progress: `${currentProgress}/${totalQuestions} questions completed`,
        motivation: "Take your time and think carefully about each answer."
      };
    }
  }

  async makeGeminiRequest(prompt) {
    if (!this.apiKey) {
      throw new Error('No API key available');
    }

    const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;
    
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
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
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', response.status, errorText);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Gemini response received:', data);

    // More flexible response structure handling
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('❌ No candidates in response:', data);
      throw new Error('No candidates in response from Gemini API');
    }

    const candidate = data.candidates[0];
    console.log('🔍 Candidate structure:', candidate);

    // Handle different possible response structures
    let text = null;

    if (candidate.content && candidate.content.parts && Array.isArray(candidate.content.parts) && candidate.content.parts.length > 0) {
      text = candidate.content.parts[0].text;
    } else if (candidate.text) {
      text = candidate.text;
    } else if (candidate.output) {
      text = candidate.output;
    } else if (typeof candidate === 'string') {
      text = candidate;
    }

    if (!text) {
      console.error('❌ No text found in candidate:', candidate);
      // Try to extract any string content from the candidate
      const candidateStr = JSON.stringify(candidate);
      console.log('📄 Full candidate JSON:', candidateStr);
      throw new Error('No text content found in API response');
    }

    console.log('✅ Extracted text:', text);
    return text;
  }

  parseJsonResponse(text) {
    try {
      let cleanText = text.trim();
      
      // Remove markdown code blocks
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\s*\n?/, '').replace(/\n?\s*```$/, '');
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\s*\n?/, '').replace(/\n?\s*```$/, '');
      }
      
      // Extract JSON from text if it's embedded
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }
      
      console.log('🧹 Clean text for parsing:', cleanText);
      const parsed = JSON.parse(cleanText);
      console.log('✅ Parsed JSON:', parsed);
      return parsed;
    } catch (error) {
      console.error('❌ JSON parsing failed:', error);
      console.error('📄 Original text:', text);
      return null;
    }
  }

  getDefaultHint() {
    return {
      hint: "Read the story carefully and look for words that match the question.",
      encouragement: "You're doing great! Take your time.",
      keyWords: ["read", "carefully", "look"],
      storySection: "Focus on the main parts of the story.",
      readingTip: "Read the question first, then find the answer in the story."
    };
  }

  getDefaultExplanation(isCorrect) {
    return {
      explanation: isCorrect ? 
        "Great job! You found the right information in the story." :
        "The answer can be found by reading the story carefully and looking for key details.",
      encouragement: isCorrect ? 
        "Excellent work! You're a great reader." :
        "Good try! Reading comprehension takes practice.",
      learningPoint: "Always look back at the story to find evidence for your answers.",
      storyEvidence: "Look for the specific words or sentences that give you the answer.",
      nextTip: "Keep practicing and you'll get even better at finding answers!"
    };
  }
}
