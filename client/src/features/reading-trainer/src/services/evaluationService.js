import { GeminiService } from './geminiService'
import { TavusService } from './tavusService'

export class EvaluationService {
  static async evaluateReading(readingData, storyContext) {
    // Use Gemini to evaluate the child's reading performance
    const evaluation = await GeminiService.evaluateReadingPerformance(readingData, storyContext)
    
    // Convert evaluation into actionable feedback for Tavus
    const tavusFeedback = this.convertEvaluationToFeedback(evaluation, readingData)
    
    return {
      evaluation,
      tavusFeedback
    }
  }

  static convertEvaluationToFeedback(evaluation, readingData) {
    const feedbackMap = {
      'excellent': {
        tone: 'celebration',
        message: evaluation.specificPraise || "You're doing amazing with this story!"
      },
      'good': {
        tone: 'encouragement',
        message: evaluation.encouragement || "Great job! You're really understanding this story!"
      },
      'needs_support': {
        tone: 'gentle_guidance',
        message: evaluation.guidance || "Let's think about this together. You're doing great!"
      },
      'struggling': {
        tone: 'extra_support',
        message: evaluation.support || "That's okay! Reading takes practice. I'm here to help you!"
      }
    }

    return feedbackMap[evaluation.performance_level] || feedbackMap['good']
  }

  static async evaluateAnswer(answer, correctAnswer, questionContext, storyData) {
    return await GeminiService.evaluateAnswer({
      userAnswer: answer,
      correctAnswer,
      questionContext,
      storyData,
      difficulty: storyData.difficulty
    })
  }
}
