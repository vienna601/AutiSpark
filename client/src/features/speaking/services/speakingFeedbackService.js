export class SpeakingFeedbackService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_SPEAKING_API_KEY;
    this.apiUrl = import.meta.env.VITE_GEMINI_SPEAKING_API_URL;

    console.log("🎤 SpeakingFeedbackService initialized");
    console.log("API Key available:", !!this.apiKey);
    console.log("API URL:", this.apiUrl);
  }

  async analyzeSpeechAttempt(question, spokenText, goal, token) {
    try {
      console.log("🤖 Analyzing speech attempt...");

      if (!this.apiKey) {
        console.error("❌ No API key found!");
        throw new Error("Gemini API key not configured");
      }

      const analysisPrompt = this.createSpeechPrompt(
        question,
        spokenText,
        goal
      );

      const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: analysisPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 30000,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API Error Response:", errorText);
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        console.error("❌ Unexpected response structure:", data);
        return this.getDefaultSpeechFeedback();
      }

      const feedbackText = data.candidates[0].content.parts[0].text;
      const parsedFeedback = this.parseSpeechFeedback(feedbackText);

      // 🔽 Save feedback to backend
      await fetch("http://localhost:8000/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // from Auth0
        },
        body: JSON.stringify({
          type: "speaking",
          question_or_prompt: question,
          goal,
          student_response: spokenText,
          feedback: parsedFeedback,
        }),
      });

      return parsedFeedback;
    } catch (error) {
      console.error("❌ Error in analyzeSpeechAttempt:", error);
      return this.getDefaultSpeechFeedback();
    }
  }

  createSpeechPrompt(question, spokenText, goal) {
    return `You are an AI speech therapy tutor for children with autism. Analyze this speaking exercise and provide encouraging feedback.

QUESTION: "${question}"
GOAL: "${goal}"
STUDENT'S RESPONSE: "${spokenText || "No response yet"}"

Provide feedback in this EXACT JSON format (no markdown, no extra text):

{
  "overallScore": 8,
  "encouragement": "Great job trying to speak! I can hear you thinking about your answer.",
  "strengths": [
    "You spoke clearly",
    "You tried to answer the question",
    "Your voice was confident"
  ],
  "suggestions": [
    {
      "type": "clarity",
      "suggestion": "Try speaking a little slower",
      "example": "Take a breath between words: 'My... name... is... Sarah'"
    }
  ],
  "nextSteps": [
    "Try adding one more word to your answer",
    "Practice saying it again with a smile",
    "Take your time - there's no rush"
  ],
  "conversationTips": [
    "Look at the person when you speak",
    "It's okay to pause and think"
  ],
  "pronunciationHelp": [],
  "confidenceLevel": "good"
}

Return ONLY the JSON object. No markdown. No backticks. No explanatory text.`;
  }

  parseSpeechFeedback(feedbackText) {
    try {
      let cleanText = feedbackText.trim();

      // Remove markdown code blocks
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText
          .replace(/^```json\s*\n?/, "")
          .replace(/\n?\s*```$/, "");
      } else if (cleanText.startsWith("```")) {
        cleanText = cleanText
          .replace(/^```\s*\n?/, "")
          .replace(/\n?\s*```$/, "");
      }

      // Extract JSON
      const firstBrace = cleanText.indexOf("{");
      if (firstBrace > 0) {
        cleanText = cleanText.substring(firstBrace);
      }

      const lastBrace = cleanText.lastIndexOf("}");
      if (lastBrace !== -1 && lastBrace < cleanText.length - 1) {
        cleanText = cleanText.substring(0, lastBrace + 1);
      }

      const parsed = JSON.parse(cleanText);

      if (!parsed.overallScore || !parsed.encouragement) {
        return this.getDefaultSpeechFeedback();
      }

      return parsed;
    } catch (error) {
      console.error("❌ JSON parsing failed:", error);
      return this.getDefaultSpeechFeedback();
    }
  }

  getDefaultSpeechFeedback() {
    return {
      overallScore: 8,
      encouragement:
        "Great job practicing your speaking! Every time you try, you're getting better.",
      strengths: [
        "You're being brave by practicing",
        "Your effort is wonderful",
      ],
      suggestions: [
        {
          type: "practice",
          suggestion: "Keep practicing - you're doing great!",
          example: "Try saying one word at a time: 'My... name... is...'",
        },
      ],
      nextSteps: [
        "Take your time when speaking",
        "Practice in front of a mirror",
        "Remember to breathe",
      ],
      conversationTips: [
        "It's okay to think before you speak",
        "Everyone learns at their own pace",
      ],
      pronunciationHelp: [],
      confidenceLevel: "good",
    };
  }

  async getEncouragement(currentProgress) {
    try {
      const encouragementPrompt = `You are an encouraging speech therapy AI for children with autism. Give brief, positive encouragement.

PROGRESS: "${currentProgress || "just started"}"

Provide encouragement in this EXACT JSON format (no markdown, no extra text):

{
  "message": "You're doing wonderful! I love hearing you practice.",
  "tip": "Remember to take your time - there's no rush at all.",
  "motivation": "Every word you say is progress!"
}

Return ONLY the JSON object.`;

      const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: encouragementPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 30000,
          },
        }),
      });

      if (!response.ok) {
        return this.getDefaultEncouragement();
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        return this.getDefaultEncouragement();
      }

      const result = data.candidates[0].content.parts[0].text;

      // Clean and parse
      let cleanText = result.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText
          .replace(/^```json\s*\n?/, "")
          .replace(/\n?\s*```$/, "");
      }

      const firstBrace = cleanText.indexOf("{");
      const lastBrace = cleanText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      const parsed = JSON.parse(cleanText);
      return parsed;
    } catch (error) {
      console.error("❌ Error getting encouragement:", error);
      return this.getDefaultEncouragement();
    }
  }

  getDefaultEncouragement() {
    const encouragements = [
      {
        message: "You're doing great! Keep practicing.",
        tip: "Take your time and speak at your own pace.",
        motivation: "Every word is progress!",
      },
      {
        message: "I love hearing you practice speaking!",
        tip: "Remember to breathe and relax.",
        motivation: "You're getting better every day!",
      },
      {
        message: "Wonderful effort! Keep going.",
        tip: "It's okay to pause and think.",
        motivation: "Your voice matters!",
      },
    ];

    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }

  async generateSpeakingQuestion(difficulty = "beginner", topic = "personal") {
    try {
      const questionPrompt = `Generate a speaking practice question for a child with autism at ${difficulty} level about ${topic}.

Requirements:
- Simple, clear question
- Age-appropriate
- Encourages verbal response
- Not overwhelming

Return in this EXACT JSON format (no markdown, no extra text):
{
  "question": "What is your name?",
  "goal": "practice saying your name clearly",
  "expectedResponse": "short answer with 1-3 words",
  "hints": [
    "Take your time",
    "Say it slowly: 'My name is...'",
    "It's okay to practice a few times"
  ],
  "followUpQuestions": [
    "Can you say it again?",
    "That's a nice name!"
  ]
}

Return ONLY the JSON object.`;

      const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: questionPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 30000,
          },
        }),
      });

      if (!response.ok) {
        return this.getDefaultQuestion();
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;

      // Clean and parse
      let cleanText = result.trim();
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/```json\n?/, "").replace(/\n?```$/, "");
      }

      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    } catch (error) {
      console.error("❌ Error generating question:", error);
    }

    return this.getDefaultQuestion();
  }

  getDefaultQuestion() {
    const questions = [
      {
        question: "What is your name?",
        goal: "practice saying your name clearly",
        expectedResponse: "short answer with 1-3 words",
        hints: [
          "Take your time",
          "Say it slowly: 'My name is...'",
          "It's okay to practice a few times",
        ],
        followUpQuestions: ["Can you say it again?", "That's a nice name!"],
      },
      {
        question: "What is your favorite color?",
        goal: "practice naming colors",
        expectedResponse: "name of a color",
        hints: [
          "Think of colors like red, blue, green",
          "Say: 'My favorite color is...'",
          "You can point to something that color",
        ],
        followUpQuestions: [
          "That's a beautiful color!",
          "Can you find something that color?",
        ],
      },
      {
        question: "How are you feeling today?",
        goal: "practice expressing emotions",
        expectedResponse: "feeling word like happy, okay, good",
        hints: [
          "Think about how you feel right now",
          "Words like happy, sad, okay, good",
          "You can say: 'I feel...'",
        ],
        followUpQuestions: [
          "Thank you for sharing!",
          "It's good to talk about feelings",
        ],
      },
    ];

    return questions[Math.floor(Math.random() * questions.length)];
  }

  async testConnection() {
    try {
      console.log("🧪 Testing Gemini API connection for speaking...");

      if (!this.apiKey) {
        console.error("❌ No API key configured!");
        return false;
      }

      const requestUrl = `${this.apiUrl}?key=${this.apiKey}`;

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Respond with exactly this JSON: {"test": "success", "message": "Speaking service working!"}',
                },
              ],
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Speaking service test response:", data);
        return true;
      } else {
        const errorText = await response.text();
        console.error(
          "❌ Speaking service test failed:",
          response.status,
          errorText
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Speaking service test error:", error);
      return false;
    }
  }
}
