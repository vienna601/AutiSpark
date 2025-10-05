export class ParagraphFeedbackService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.apiUrl = import.meta.env.VITE_GEMINI_API_URL;
  }

  async analyzeParagraphReading(paragraph, transcript, readingData) {
    try {
      const prompt = this.createAnalysisPrompt(paragraph, transcript, readingData);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
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
      console.error('Error getting paragraph feedback:', error);
      return this.getDefaultFeedback();
    }
  }

  createAnalysisPrompt(paragraph, transcript, readingData) {
    return `
You are an AI reading tutor for children with autism. Analyze this paragraph reading session and provide specific feedback.

ORIGINAL PARAGRAPH:
"${paragraph.text}"

STUDENT'S READING TRANSCRIPT:
"${transcript}"

READING DATA:
- Words per minute: ${readingData.wpm || 0}
- Accuracy: ${readingData.accuracy || 0}%
- Pauses: ${readingData.pauses || 0}
- Repetitions: ${readingData.repetitions || 0}
- Self-corrections: ${readingData.corrections || 0}

Please provide feedback in this EXACT JSON format:
{
  "overallScore": number (1-10),
  "encouragement": "Positive message about what they did well",
  "nextSteps": [
    "Specific actionable advice 1",
    "Specific actionable advice 2",
    "Specific actionable advice 3"
  ],
  "errors": [
    {
      "type": "word_error|fluency|comprehension|pronunciation",
      "description": "What went wrong",
      "suggestion": "How to fix it",
      "severity": "low|medium|high"
    }
  ],
  "focusAreas": [
    "Area to work on (e.g., 'word recognition', 'fluency', 'expression')"
  ],
  "practiceActivities": [
    "Specific activity suggestion 1",
    "Specific activity suggestion 2"
  ]
}

Keep feedback positive, specific, and appropriate for children with autism. Focus on strengths first, then gentle suggestions for improvement.
`;
  }

  parseFeedback(feedbackText) {
    try {
      // Extract JSON from the response
      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error('Error parsing feedback:', error);
    }
    
    return this.getDefaultFeedback();
  }

  getDefaultFeedback() {
    return {
      overallScore: 7,
      encouragement: "Great job reading that paragraph! You're making good progress.",
      nextSteps: [
        "Try reading a bit slower for better accuracy",
        "Focus on one word at a time",
        "Take breaks when you need them"
      ],
      errors: [],
      focusAreas: ["fluency", "accuracy"],
      practiceActivities: [
        "Practice reading sight words",
        "Read along with audio books"
      ]
    };
  }

  async getContextualHints(currentSentence, previousErrors) {
    try {
      const prompt = `
As a reading tutor, provide helpful hints for this sentence based on previous reading patterns.

CURRENT SENTENCE: "${currentSentence}"
PREVIOUS ERRORS: ${JSON.stringify(previousErrors)}

Provide 2-3 helpful hints in JSON format:
{
  "hints": [
    "Specific hint about this sentence",
    "Another helpful tip"
  ]
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
            parts: [{ text: prompt }]
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
      console.error('Error getting hints:', error);
    }

    return {
      hints: [
        "Take your time with each word",
        "Sound out difficult words slowly"
      ]
    };
  }
}
