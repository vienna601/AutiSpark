const TAVUS_API_KEY = import.meta.env.VITE_TAVUS_API_KEY
const TAVUS_REPLICA_ID = import.meta.env.VITE_TAVUS_REPLICA_ID
const TAVUS_PERSONA_ID = import.meta.env.VITE_TAVUS_PERSONA_ID
const TAVUS_API_URL = import.meta.env.VITE_TAVUS_API_URL

export class TavusService {
  static async createConversation(readingGoal = "reading comprehension") {
    // Debug logging
    console.log('🔧 Tavus Debug Info:')
    console.log('API Key exists:', !!TAVUS_API_KEY)
    console.log('API Key length:', TAVUS_API_KEY?.length || 0)
    console.log('Replica ID exists:', !!TAVUS_REPLICA_ID)
    console.log('Persona ID exists:', !!TAVUS_PERSONA_ID)
    console.log('API URL:', TAVUS_API_URL)

    if (!TAVUS_API_KEY || !TAVUS_REPLICA_ID) {
      console.warn('❌ Tavus API credentials not configured')
      console.log('Missing:', {
        apiKey: !TAVUS_API_KEY,
        replicaId: !TAVUS_REPLICA_ID,
        personaId: !TAVUS_PERSONA_ID
      })
      return null
    }

    // Simplified request body with only supported fields
    const requestBody = {
      replica_id: TAVUS_REPLICA_ID,
      conversation_name: `Reading Session ${Date.now()}`
    }

    // Only add persona_id if it exists
    if (TAVUS_PERSONA_ID) {
      requestBody.persona_id = TAVUS_PERSONA_ID
    }

    console.log('📤 Sending Tavus request:', {
      url: `${TAVUS_API_URL}/conversations`,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': TAVUS_API_KEY ? '***' : 'MISSING'
      },
      bodySize: JSON.stringify(requestBody).length,
      hasPersonaId: !!TAVUS_PERSONA_ID,
      requestBody: requestBody
    })

    try {
      const response = await fetch(`${TAVUS_API_URL}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY,
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📥 Tavus response status:', response.status)
      console.log('📥 Tavus response headers:', Object.fromEntries(response.headers))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Tavus API error response:', errorText)
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText }
        }
        
        throw new Error(`Tavus API error: ${response.status} - ${errorData.message || errorData.error || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('✅ Tavus conversation created:', {
        conversationId: data.conversation_id,
        conversationUrl: data.conversation_url ? 'URL received' : 'No URL',
        status: data.status,
        fullResponse: data
      })
      
      return data
    } catch (error) {
      console.error('💥 Error creating Tavus conversation:', error)
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
      return null
    }
  }

  static createSystemPrompt(currentGoal) {
    return `You are a warm, encouraging reading tutor specifically trained to work with autistic children. Your name is Alex and you're here to help them learn to read through interactive picture books.

CORE PERSONALITY:s
- Extremely patient, kind, and encouraging
- Use simple, clear language appropriate for children ages 5-10
- Speak slowly and clearly with enthusiasm
- Always celebrate effort, not just correct answers
- Use positive reinforcement constantly

CURRENT LEARNING GOAL: ${currentGoal}

INTERACTION GUIDELINES:
1. ENCOURAGEMENT: Always start with praise for their effort
2. CLARITY: Use simple words and short sentences
3. PATIENCE: Give them time to think and respond
4. CELEBRATION: Make a big deal of progress, no matter how small
5. REDIRECTION: If they struggle, gently guide them back to the story

SPECIFIC RESPONSES:
- When they get an answer RIGHT: "Wow! That's exactly right! You're such a smart reader! I'm so proud of you!"
- When they get an answer WRONG: "That's okay! Reading takes practice. Let's think about what we just read together."
- When they're taking time: "Take your time! I can see you're really thinking about this."
- When they seem frustrated: "You're doing such a great job! Every reader needs practice, and you're getting better!"

READING SUPPORT:
- Help them sound out difficult words
- Connect story elements to their experiences
- Ask simple comprehension questions
- Encourage them to predict what happens next
- Relate characters' emotions to feelings they understand

AUTISM-SPECIFIC CONSIDERATIONS:
- Be consistent in your responses and energy level
- Avoid sudden loud noises or overly excited reactions
- Use visual descriptions when helpful
- Respect if they need processing time
- Maintain a calm, steady presence

Remember: Your goal is to make reading feel safe, fun, and achievable. Every child learns at their own pace, and your job is to meet them where they are with love and encouragement.`
  }

  static async sendMessage(conversationId, message, readingContext = null) {
    if (!TAVUS_API_KEY || !conversationId) {
      return null
    }

    let enhancedMessage = message
    if (readingContext) {
      const contextPrefix = this.createContextualPrefix(readingContext)
      enhancedMessage = `${contextPrefix}\n\n${message}`
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': TAVUS_API_KEY,
        },
        body: JSON.stringify({
          message: enhancedMessage,
          message_type: "text"
        }),
      })

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error sending message to Tavus:', error)
      return null
    }
  }

  static createContextualPrefix(readingContext) {
    const { 
      currentPage, 
      totalPages, 
      correctAnswers, 
      incorrectAnswers, 
      recentAnswerCorrect,
      storyTitle,
      questionAsked 
    } = readingContext

    let prefix = `CONTEXT: We're on page ${currentPage + 1} of ${totalPages} in "${storyTitle}".`
    
    if (questionAsked) {
      prefix += ` They just answered a question about the story.`
    }
    
    if (recentAnswerCorrect !== undefined) {
      prefix += ` Their last answer was ${recentAnswerCorrect ? 'CORRECT' : 'INCORRECT'}.`
    }
    
    prefix += ` Session stats: ${correctAnswers} correct, ${incorrectAnswers} practice answers.`
    
    return prefix
  }

  static async getConversationStatus(conversationId) {
    if (!TAVUS_API_KEY || !conversationId) {
      return null
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/conversations/${conversationId}`, {
        headers: {
          'x-api-key': TAVUS_API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting conversation status:', error)
      return null
    }
  }

  static async endConversation(conversationId) {
    if (!TAVUS_API_KEY || !conversationId) {
      return null
    }

    try {
      const response = await fetch(`${TAVUS_API_URL}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'x-api-key': TAVUS_API_KEY,
        },
      })

      if (!response.ok) {
        throw new Error(`Tavus API error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error ending conversation:', error)
      return null
    }
  }

  static generateEncouragementMessage(scenario, readingContext) {
    const messages = {
      correct_answer: [
        "Amazing work! You really understood that story!",
        "That's exactly right! You're becoming such a strong reader!",
        "Wow! I can tell you were really paying attention to the story!",
        "Perfect! You're getting so good at this!"
      ],
      incorrect_answer: [
        "That's okay! Reading takes practice, and you're doing great!",
        "Let's think about what we read together. You're learning so much!",
        "Good try! Every reader needs practice, and you're working so hard!",
        "I love how you're thinking about the story. Let's look at it again!"
      ],
      new_page: [
        "Great job finishing that page! Ready for the next part of our story?",
        "You're doing so well! Let's see what happens next!",
        "Wonderful reading! I'm excited to continue this story with you!",
        "You're such a good listener! Let's turn the page together!"
      ],
      encouragement: [
        "You're doing such an amazing job reading today!",
        "I love how you're thinking about each question!",
        "You're getting better at reading every single day!",
        "Reading with you is so much fun!"
      ]
    }

    const messageArray = messages[scenario] || messages.encouragement
    const randomMessage = messageArray[Math.floor(Math.random() * messageArray.length)]
    
    return randomMessage
  }

  static createWebSocketConnection(conversationId, onMessage, onError) {
    if (!conversationId) return null

    const wsUrl = `wss://tavusapi.com/v2/conversations/${conversationId}/ws`
    
    try {
      const ws = new WebSocket(wsUrl, [], {
        headers: {
          'x-api-key': TAVUS_API_KEY
        }
      })

      ws.onopen = () => {
        console.log('Tavus WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (onMessage) onMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('Tavus WebSocket error:', error)
        if (onError) onError(error)
      }

      ws.onclose = () => {
        console.log('Tavus WebSocket disconnected')
      }

      return ws
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      return null
    }
  }

  static async deliverEvaluationFeedback(conversationId, evaluation, readingContext) {
    if (!conversationId || !evaluation) return null

    const feedbackMessage = this.createContextualFeedback(evaluation, readingContext)
    
    return await this.sendMessage(conversationId, feedbackMessage, readingContext)
  }

  static createContextualFeedback(evaluation, readingContext) {
    const { performance_level, tavus_speaking_points, specificPraise } = evaluation
    const { currentPage, storyTitle, recentAnswerCorrect } = readingContext

    let contextualMessage = ""

    contextualMessage += `We're reading "${storyTitle}" together on page ${currentPage + 1}. `

    switch (performance_level) {
      case 'excellent':
        contextualMessage += `${specificPraise} You really understand this story! `
        break
      case 'good':
        contextualMessage += `You're doing such a great job with this story! `
        break
      case 'needs_support':
        contextualMessage += `You're working so hard on this. Let's think about it together! `
        break
      case 'struggling':
        contextualMessage += `That's okay! Reading takes practice, and I'm here to help you! `
        break
    }

    if (tavus_speaking_points && tavus_speaking_points.length > 0) {
      contextualMessage += tavus_speaking_points[0] + " "
    }

    if (recentAnswerCorrect === true) {
      contextualMessage += "That last answer was perfect! "
    } else if (recentAnswerCorrect === false) {
      contextualMessage += "Let's talk about that question together. "
    }

    return contextualMessage.trim()
  }

  static async handleQuestionInteraction(conversationId, questionData, evaluation) {
    const { question, userAnswer, correctAnswer, storyContext } = questionData
    
    let responseMessage = ""

    if (evaluation.is_correct) {
      responseMessage = `${evaluation.tavus_response} ${evaluation.praise_points.join('. ')}! `
    } else {
      responseMessage = `${evaluation.tavus_response} ${this.generateGentleCorrection(userAnswer, correctAnswer, storyContext)}`
    }

    if (evaluation.follow_up_suggestions && evaluation.follow_up_suggestions.length > 0) {
      responseMessage += ` ${this.createFollowUpQuestion(evaluation.follow_up_suggestions[0], storyContext)}`
    }

    return await this.sendMessage(conversationId, responseMessage, {
      question,
      userAnswer,
      correctAnswer,
      evaluation: evaluation.performance_level
    })
  }

  static generateGentleCorrection(userAnswer, correctAnswer, storyContext) {
    return `I can see you're thinking about the story. The answer I was looking for was "${correctAnswer}". Let's look back at the story and see where we can find that information together!`
  }

  static createFollowUpQuestion(suggestion, storyContext) {
    const followUpQuestions = {
      'character feelings': "How do you think the character is feeling right now?",
      'story events': "What do you think might happen next in our story?",
      'comprehension': "Can you tell me what's happening in this part of the story?",
      'connection': "Does this remind you of anything from your own life?"
    }

    return followUpQuestions[suggestion.toLowerCase()] || "What's your favorite part of this story so far?"
  }

  static async enableInteractiveMode(conversationId) {
    const interactivePrompt = `
INTERACTIVE MODE ENABLED: The child can now ask you questions directly about the story or reading in general.

When they ask questions:
1. Answer enthusiastically and simply
2. Relate answers back to the current story when possible
3. Encourage them to keep asking questions
4. Use their questions to gauge understanding
5. Praise their curiosity

Example responses:
- "What a great question! In our story..."
- "I love that you're thinking about this! Let me explain..."
- "That's exactly the kind of question good readers ask!"

Stay in character as Alex, their encouraging reading tutor.
    `

    return await this.sendMessage(conversationId, interactivePrompt, { mode: 'interactive' })
  }
}
