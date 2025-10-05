export class WritingFeedbackService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.apiUrl = import.meta.env.VITE_GEMINI_API_URL;
  }

  async analyzeWriting(prompt, studentText, goal) {
    try {
      const analysisPrompt = this.createWritingPrompt(prompt, studentText, goal);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: analysisPrompt }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const feedback = data.candidates[0].content.parts[0].text;
      
      return this.parseFeedback(feedback);
    } catch (error) {
      console.error('Error getting writing feedback:', error);
      return this.getDefaultFeedback();
    }
  }

  createWritingPrompt(prompt, studentText, goal) {
    return `
You are an AI writing tutor for children with autism. Analyze this writing exercise and provide specific, encouraging feedback.

WRITING PROMPT: "${prompt}"
GOAL: "${goal}"

STUDENT'S WRITING:
"${studentText}"

Please provide feedback in this EXACT JSON format:
{
  "overallScore": number (1-10),
  "encouragement": "Positive message about what they did well",
  "strengths": [
    "Specific strength 1",
    "Specific strength 2"
  ],
  "suggestions": [
    {
      "type": "grammar|structure|vocabulary|content",
      "issue": "What could be improved",
      "suggestion": "How to improve it",
      "example": "Example of improvement"
    }
  ],
  "nextSteps": [
    "Specific next step 1",
    "Specific next step 2"
  ],
  "grammarCheck": {
    "errors": number,
    "corrections": [
      {
        "original": "incorrect text",
        "corrected": "correct text",
        "explanation": "why this is better"
      }
    ]
  },
  "vocabularyLevel": "beginner|intermediate|advanced",
  "creativityScore": number (1-10)
}

Keep feedback positive, specific, and appropriate for children with autism. Focus on encouragement and gentle guidance.
`;
  }

  parseFeedback(feedbackText) {
    try {
      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing writing feedback:', error);
    }
    
    return this.getDefaultFeedback();
  }

  getDefaultFeedback() {
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
      creativityScore: 7
    };
  }

  async generatePrompt(difficulty = "beginner", topic = "personal") {
    try {
      const promptRequest = `
Generate a writing prompt for a child with autism at ${difficulty} level about ${topic}.

Requirements:
- Age-appropriate and engaging
- Clear and specific instructions
- Supportive and encouraging tone
- Length appropriate for skill level

Return in JSON format:
{
  "prompt": "The writing prompt text",
  "goal": "What the student should focus on",
  "expectedLength": "word count or sentence count",
  "tips": ["helpful tip 1", "helpful tip 2"]
}
`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptRequest }]
          }]
        })
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
    }

    return this.getDefaultPrompt();
  }

  getDefaultPrompt() {
    return {
      prompt: "Write about your favorite animal. What does it look like? What does it like to do?",
      goal: "write a structured response",
      expectedLength: "3-5 sentences",
      tips: [
        "Start with a sentence about your name",
        "Use describing words like colors and sizes"
      ]
    };
  }
}
