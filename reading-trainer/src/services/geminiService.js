const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta'

export class GeminiService {
  static async generateFeedback(readingData) {
    if (!GEMINI_API_KEY) {
      console.warn('❌ Gemini API key not configured')
      return "Great job reading! Keep practicing!"
    }

    const prompt = this.createFeedbackPrompt(readingData)
    
    // Use the correct model name for the current API
    const model = 'gemini-1.5-flash'
    const url = `${GEMINI_API_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`

    console.log('📤 Sending Gemini request:', {
      model,
      url: url.replace(GEMINI_API_KEY, '***'),
      promptLength: prompt.length
    })

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 200,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      })

      console.log('📥 Gemini response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Gemini API Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Gemini response received:', {
        hasContent: !!data.candidates?.[0]?.content?.parts?.[0]?.text,
        candidatesCount: data.candidates?.length || 0
      })

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const feedback = data.candidates[0].content.parts[0].text.trim()
        console.log('🎯 Generated feedback:', feedback)
        return feedback
      } else {
        console.warn('⚠️ No valid content in Gemini response:', data)
        return this.getFallbackFeedback(readingData)
      }
      
    } catch (error) {
      console.error('Error generating Gemini feedback:', error)
      return this.getFallbackFeedback(readingData)
    }
  }

  static createFeedbackPrompt(readingData) {
    const { 
      correctAnswers, 
      incorrectAnswers, 
      timeSpent, 
      difficulty, 
      currentGoal, 
      recentAnswerCorrect,
      currentPage,
      totalPages
    } = readingData

    return `You are an encouraging reading tutor for children with autism. Based on this reading session data, provide a short, positive, and specific piece of feedback (1-2 sentences max):

Reading Session:
- Current goal: ${currentGoal}
- Page: ${currentPage + 1} of ${totalPages}
- Correct answers: ${correctAnswers}
- Practice attempts: ${incorrectAnswers}
- Time spent: ${timeSpent} seconds
- Difficulty level: ${difficulty}
- Most recent answer: ${recentAnswerCorrect ? 'correct' : 'needs practice'}

Guidelines:
- Be extremely encouraging and positive
- Use simple, clear language appropriate for children
- Focus on effort and progress, not just correctness
- If they got something wrong, frame it as "practice" or "learning"
- Keep it under 30 words
- Make it personal and specific to their performance

Example good feedback:
- "Wow! You're really thinking carefully about each question. I can see you're becoming a stronger reader!"
- "Great job taking your time! Every good reader practices, and you're doing fantastic!"
- "I love how you're working through these questions. You're getting better with each story!"

Generate encouraging feedback now:`
  }

  static formatFeedback(rawFeedback) {
    // Clean up and format the feedback
    return rawFeedback
      .trim()
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .substring(0, 200) // Limit length
  }

  static getFallbackFeedback(readingData) {
    const { recentAnswerCorrect, correctAnswers } = readingData
    
    if (recentAnswerCorrect) {
      return correctAnswers === 1 
        ? "Excellent! You got that one right! You're becoming such a strong reader!" 
        : "Amazing work! You're really understanding these stories well!"
    } else {
      return "Good thinking! Every reader practices, and you're doing a wonderful job learning!"
    }
  }

  static async generateTavusScript(readingData) {
    if (!GEMINI_API_KEY) {
      return this.getFallbackTavusScript(readingData)
    }

    const prompt = `
Generate a short, encouraging script for a video tutor speaking to an autistic child during reading practice.

Reading session data:
- Progress: Page ${readingData.currentPage + 1} of ${readingData.totalPages}
- Correct answers: ${readingData.correctAnswers}
- Recent performance: ${readingData.recentAnswerCorrect ? 'Got the last question right!' : 'Still working on the last question'}

Guidelines:
- 15-25 words maximum
- Warm, encouraging tone
- Use simple, clear language
- Include specific praise for their effort
- End with motivation to continue

Script:
    `

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 100,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || this.getFallbackTavusScript(readingData)
    } catch (error) {
      console.error('Error generating Tavus script:', error)
      return this.getFallbackTavusScript(readingData)
    }
  }

  static getFallbackTavusScript(readingData) {
    const scripts = [
      "Great job reading! You're doing amazing work today. Let's keep going!",
      "I love how you're thinking about each question. You're such a smart reader!",
      "Wonderful progress! Reading is fun when we practice together like this!",
      "You're getting better at this every day. I'm so proud of your hard work!",
      "Keep up the great reading! You're learning so much from these stories!"
    ]
    
    return scripts[Math.floor(Math.random() * scripts.length)]
  }

  static async evaluateReadingPerformance(readingData, storyContext) {
    if (!GEMINI_API_KEY) {
      return this.getFallbackEvaluation(readingData)
    }

    const prompt = this.createEvaluationPrompt(readingData, storyContext)

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 300,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const evaluation = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      return this.parseEvaluation(evaluation)
    } catch (error) {
      console.error('Error generating evaluation:', error)
      return this.getFallbackEvaluation(readingData)
    }
  }

  static createEvaluationPrompt(readingData, storyContext) {
    const { 
      currentPage, 
      totalPages, 
      correctAnswers, 
      incorrectAnswers, 
      timeSpent, 
      difficulty,
      currentGoal,
      recentAnswers = []
    } = readingData

    const { title, content, questions } = storyContext

    return `
You are an expert reading assessment AI for autistic children. Evaluate this child's reading session and provide structured feedback.

STORY CONTEXT:
Title: "${title}"
Current page: ${currentPage + 1} of ${totalPages}
Difficulty: ${difficulty}
Learning goal: ${currentGoal}

PERFORMANCE DATA:
- Correct answers: ${correctAnswers}
- Incorrect answers: ${incorrectAnswers}
- Time spent: ${Math.round(timeSpent / 60)} minutes
- Recent answers: ${recentAnswers.slice(-3).map(a => a.correct ? 'correct' : 'incorrect').join(', ')}

STORY CONTENT (current page):
"${content[currentPage]?.text || 'No content available'}"

Evaluate the child's performance and respond in this JSON format:
{
  "performance_level": "excellent|good|needs_support|struggling",
  "comprehension_score": 0-100,
  "engagement_level": "high|medium|low",
  "areas_of_strength": ["specific strengths"],
  "areas_for_improvement": ["gentle suggestions"],
  "next_recommended_action": "continue|review|easier_content|break",
  "specificPraise": "What specifically to praise",
  "encouragement": "Encouraging message for good performance",
  "guidance": "Gentle guidance for struggles",
  "support": "Extra support message",
  "tavus_speaking_points": [
    "First key point for Tavus to mention",
    "Second key point for Tavus to mention",
    "Third key point for Tavus to mention"
  ]
}

Focus on:
- Pattern recognition in their answers
- Reading comprehension progress
- Engagement with story content
- Age-appropriate expectations for autistic children
- Specific, actionable feedback for the Tavus avatar to deliver
    `
  }

  static async evaluateAnswer(answerData) {
    const { userAnswer, correctAnswer, questionContext, storyData } = answerData

    const prompt = `
Evaluate this child's answer to a reading comprehension question:

QUESTION: "${questionContext.question}"
CORRECT ANSWER: "${correctAnswer}"
CHILD'S ANSWER: "${userAnswer}"
STORY CONTEXT: "${questionContext.storyContext}"

Respond in JSON format:
{
  "is_correct": boolean,
  "partial_credit": 0-100,
  "reasoning_quality": "excellent|good|partial|poor",
  "shows_understanding": boolean,
  "tavus_response": "Immediate response for Tavus to give",
  "follow_up_suggestions": ["suggestions for further questions"],
  "praise_points": ["specific things to praise"],
  "learning_opportunities": ["what to focus on next"]
}

Consider:
- Partial understanding even if answer isn't exactly correct
- Effort and reasoning shown
- Age-appropriate expectations
- Encourage continued engagement
    `

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 250 }
        })
      })

      const data = await response.json()
      const evaluation = data.candidates?.[0]?.content?.parts?.[0]?.text
      return this.parseEvaluation(evaluation)
    } catch (error) {
      console.error('Error evaluating answer:', error)
      return this.getFallbackAnswerEvaluation(userAnswer, correctAnswer)
    }
  }

  static parseEvaluation(rawEvaluation) {
    try {
      // Try to parse as JSON first
      const jsonMatch = rawEvaluation.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      
      // Fallback to manual parsing if JSON fails
      return this.manualParseEvaluation(rawEvaluation)
    } catch (error) {
      console.error('Error parsing evaluation:', error)
      return this.getDefaultEvaluation()
    }
  }

  static manualParseEvaluation(text) {
    // Extract key information manually if JSON parsing fails
    const performance_level = text.includes('excellent') ? 'excellent' 
      : text.includes('struggling') ? 'struggling'
      : text.includes('needs_support') ? 'needs_support' 
      : 'good'

    return {
      performance_level,
      comprehension_score: 75,
      engagement_level: 'medium',
      areas_of_strength: ['Showing effort'],
      areas_for_improvement: ['Continue practicing'],
      next_recommended_action: 'continue',
      specificPraise: "Great job thinking about the story!",
      encouragement: "You're doing wonderful work!",
      guidance: "Let's think about this together!",
      support: "Reading takes practice, and you're doing great!",
      tavus_speaking_points: [
        "I can see you're really thinking about this story",
        "Your effort is amazing",
        "Let's keep reading together"
      ]
    }
  }

  static getFallbackEvaluation(readingData) {
    const accuracy = readingData.correctAnswers / (readingData.correctAnswers + readingData.incorrectAnswers) || 0
    
    let performance_level = 'good'
    if (accuracy > 0.8) performance_level = 'excellent'
    else if (accuracy < 0.4) performance_level = 'struggling'
    else if (accuracy < 0.6) performance_level = 'needs_support'

    return {
      performance_level,
      comprehension_score: Math.round(accuracy * 100),
      engagement_level: 'medium',
      areas_of_strength: ['Engaged with the story'],
      areas_for_improvement: ['Keep practicing'],
      next_recommended_action: 'continue',
      specificPraise: "You're working so hard on these stories!",
      encouragement: "I love how you think about each question!",
      guidance: "Let's work through this together!",
      support: "Every reader needs practice, and you're doing great!",
      tavus_speaking_points: [
        "I'm so proud of how hard you're working",
        "You're really thinking about these stories",
        "Reading with you is so much fun"
      ]
    }
  }

  static getFallbackAnswerEvaluation(userAnswer, correctAnswer) {
    const is_correct = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
    
    return {
      is_correct,
      partial_credit: is_correct ? 100 : 25,
      reasoning_quality: 'good',
      shows_understanding: true,
      tavus_response: is_correct 
        ? "That's exactly right! Great job!" 
        : "Good thinking! Let's talk about this together.",
      follow_up_suggestions: ["Ask about character feelings", "Discuss story events"],
      praise_points: ["Effort shown", "Engagement with story"],
      learning_opportunities: ["Continue reading", "Practice comprehension"]
    }
  }

  static async analyzeConversationTranscript(transcriptData) {
    if (!GEMINI_API_KEY) {
      return this.getFallbackTranscriptAnalysis(transcriptData)
    }

    const prompt = this.createTranscriptAnalysisPrompt(transcriptData)
    const model = 'gemini-1.5-flash'
    const url = `${GEMINI_API_URL}/models/${model}:generateContent?key=${GEMINI_API_KEY}`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      return this.parseTranscriptAnalysis(analysisText)
    } catch (error) {
      console.error('Error analyzing transcript:', error)
      return this.getFallbackTranscriptAnalysis(transcriptData)
    }
  }

  static createTranscriptAnalysisPrompt(transcriptData) {
    const studentMessages = transcriptData.filter(msg => msg.speaker === 'Student')
    const alexMessages = transcriptData.filter(msg => msg.speaker === 'Alex')
    
    return `Analyze this conversation transcript between an AI reading tutor (Alex) and an autistic child (Student). Provide insights into the child's learning needs.

TRANSCRIPT:
${transcriptData.map(entry => 
  `[${entry.timestamp.toLocaleTimeString()}] ${entry.speaker}: ${entry.text}`
).join('\n')}

ANALYSIS FOCUS:
- Reading comprehension indicators
- Communication patterns
- Engagement levels  
- Areas where student needs support
- Student strengths and capabilities
- Social-emotional indicators
- Attention and focus patterns

Respond in JSON format:
{
  "engagement_level": "high|medium|low",
  "comprehension_indicators": ["list of positive signs"],
  "communication_patterns": {
    "response_time": "quick|normal|slow",
    "complexity": "simple|moderate|complex",
    "confidence": "high|medium|low"
  },
  "help_areas": [
    {
      "area": "specific area (e.g., 'Reading Fluency', 'Confidence', 'Comprehension')",
      "priority": "high|medium|low", 
      "evidence": "what in transcript suggests this",
      "suggestion": "specific supportive action"
    }
  ],
  "strengths": [
    {
      "strength": "specific strength",
      "evidence": "transcript evidence",
      "encouragement": "how to build on this"
    }
  ],
  "real_time_insights": [
    {
      "insight": "immediate observation",
      "action": "suggested tutor response",
      "timing": "when to implement"
    }
  ],
  "autism_specific_observations": {
    "sensory_indicators": "any signs of sensory processing",
    "routine_preferences": "patterns in responses",
    "special_interests": "topics that sparked engagement"
  },
  "recommendations": {
    "immediate": "what tutor should do right now",
    "short_term": "adjustments for this session",
    "long_term": "learning plan considerations"
  }
}`
  }

  static parseTranscriptAnalysis(rawAnalysis) {
    try {
      const jsonMatch = rawAnalysis.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
      return this.generateFallbackTranscriptAnalysis()
    } catch (error) {
      console.error('Error parsing transcript analysis:', error)
      return this.generateFallbackTranscriptAnalysis()
    }
  }

  static getFallbackTranscriptAnalysis(transcriptData = []) {
    const studentMessages = transcriptData.filter(msg => msg.speaker === 'Student')
    
    return {
      engagement_level: studentMessages.length > 2 ? 'medium' : 'low',
      comprehension_indicators: ['Responding to questions', 'Engaging with story'],
      communication_patterns: {
        response_time: 'normal',
        complexity: 'simple',
        confidence: 'medium'
      },
      help_areas: [
        {
          area: 'Reading Confidence',
          priority: 'medium',
          evidence: 'Some hesitation in responses',
          suggestion: 'Provide more encouragement and praise'
        },
        {
          area: 'Comprehension Support',
          priority: 'low',
          evidence: 'Following story progression',
          suggestion: 'Continue with current level complexity'
        }
      ],
      strengths: [
        {
          strength: 'Active Participation',
          evidence: 'Responding to tutor prompts',
          encouragement: 'Praise their engagement'
        },
        {
          strength: 'Story Interest',
          evidence: 'Asking questions about content',
          encouragement: 'Build on their curiosity'
        }
      ],
      real_time_insights: [
        {
          insight: 'Student is engaged with the reading activity',
          action: 'Continue with current pace and encouragement',
          timing: 'ongoing'
        }
      ],
      autism_specific_observations: {
        sensory_indicators: 'No obvious sensory concerns noted',
        routine_preferences: 'Responds well to structured interaction',
        special_interests: 'Shows interest in animal characters'
      },
      recommendations: {
        immediate: 'Continue encouraging participation',
        short_term: 'Maintain current reading level and pace',
        long_term: 'Consider incorporating more animal-themed stories'
      }
    }
  }

  static generateRealTimeInsight(transcriptEntry, conversationHistory) {
    const insights = {
      hesitation: {
        insight: 'Student showing hesitation - may need confidence boost',
        action: 'Provide extra encouragement and time to respond',
        priority: 'medium'
      },
      engagement: {
        insight: 'High engagement with story content',
        action: 'Continue current approach, ask follow-up questions',
        priority: 'low'
      },
      comprehension: {
        insight: 'Showing good story comprehension',
        action: 'Gradually increase question complexity',
        priority: 'low'
      },
      confusion: {
        insight: 'May be confused about story content',
        action: 'Simplify language, provide visual cues',
        priority: 'high'
      }
    }

    // Analyze the entry for key indicators
    if (transcriptEntry.text.includes('um') || transcriptEntry.text.includes('...')) {
      return insights.hesitation
    }
    if (transcriptEntry.type === 'question' && transcriptEntry.engagement === 'high') {
      return insights.engagement
    }
    if (transcriptEntry.shows_comprehension) {
      return insights.comprehension
    }

    return {
      insight: 'Student participating in reading activity',
      action: 'Continue with supportive guidance',
      priority: 'low'
    }
  }
}
