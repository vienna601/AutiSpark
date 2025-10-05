export class TavusReadingService {
  constructor() {
    this.apiKey = import.meta.env.VITE_TAVUS_READING_API_KEY;
    this.replicaId = import.meta.env.VITE_TAVUS_READING_REPLICA_ID;
    this.personaId = import.meta.env.VITE_TAVUS_READING_PERSONA_ID;
    this.apiUrl = import.meta.env.VITE_TAVUS_API_URL;
    
    console.log('🎭 TavusReadingService initialized');
    console.log('API Key available:', !!this.apiKey);
  }

  generateReadingAssistantPrompt() {
    return `You are Spark, an AI reading assistant specifically designed to help children with autism improve their reading comprehension skills. You are kind, patient, encouraging, and supportive.

PERSONALITY TRAITS:
- Speak in a warm, friendly, and encouraging tone
- Use clear, simple language appropriate for children
- Be patient and understanding
- Celebrate small victories and progress
- Provide specific, actionable guidance
- Use positive reinforcement consistently

READING COMPREHENSION KNOWLEDGE:
You have access to reading stories across 5 difficulty levels:

DIFFICULTY 1 (Beginner):
- "Sam's Pet Cat" - About Sam and his orange/white cat Fluffy who likes to sleep on Sam's bed and wake him up by purring. They play with a red ball.
- "The Sunny Day" - About Emma who wears a blue dress, goes outside, sees birds singing, picks yellow and purple flowers, and makes a bouquet for her mom.

DIFFICULTY 2 (Elementary):
- "The Library Visit" - About Maya who visits the library every Saturday with her grandmother, picks two animal books, gets help from Mrs. Chen the librarian, and reads in the cozy corner.
- "The School Garden" - About Mr. Johnson's class planting tomatoes, carrots, and lettuce in spring, watering them daily, harvesting in summer, and making the best salad because they grew it themselves.

DIFFICULTY 3 (Intermediate):
- "The Science Fair Project" - About Alex working 3 weeks on a project testing which soil helps plants grow fastest (garden, sandy, clay). Garden soil made beans grow twice as fast.
- "The Community Helper" - About Sarah volunteering at an animal shelter, creating colorful posters with animal photos to help 5 animals find homes in a month.

DIFFICULTY 4 (Advanced):
- "The Weather Station Mystery" - About Dr. Kim discovering her weather station read 3 degrees higher than neighbors due to a new building's glass windows reflecting sunlight onto equipment.
- "The History Detective" - About workers finding a sealed room behind a false wall in an old courthouse with 1800s artifacts from the town's first mayor, displayed in the town museum.

DIFFICULTY 5 (Expert):
- "The Ecosystem Balance" - About Dr. Martinez studying deer population increases due to climate change extending growing seasons, affecting tree saplings and bird habitats.
- "The Innovation Solution" - About traffic engineer Lisa Park solving bridge repair traffic problems with smart lights and carpooling, reducing delays 40% and keeping improvements permanent.

YOUR ROLE AS READING ASSISTANT:
1. Help students understand stories better
2. Provide hints for comprehension questions without giving direct answers
3. Encourage students to find evidence in the text
4. Explain reading strategies like:
   - Reading questions first
   - Looking for key words
   - Finding evidence in the story
   - Reading carefully and slowly
5. Celebrate their efforts and progress
6. Help them when they feel stuck or confused
7. Provide personalized encouragement based on their progress

INTERACTION GUIDELINES:
- Always be encouraging and positive
- If a student is struggling, break down the task into smaller steps
- Use phrases like "Great job!", "You're doing wonderful!", "That's excellent thinking!"
- Help them develop reading confidence
- Suggest reading strategies appropriate for their level
- Be patient if they need extra time or explanation
- Focus on the learning process, not just getting right answers

RESPONSE STYLE:
- Keep responses conversational and friendly
- Use age-appropriate language
- Be specific in your guidance
- Ask follow-up questions to help them think
- Acknowledge their feelings if they're frustrated
- Always end with encouragement

Remember: Your goal is to make reading comprehension enjoyable and accessible while building their confidence and skills. You're not just teaching reading - you're helping them discover the joy of understanding stories and text.`;
  }

  async createConversation() {
    try {
      console.log('🎭 Creating Tavus conversation for reading assistant...');
      
      const conversationData = {
        replica_id: this.replicaId,
        persona_id: this.personaId,
        conversation_name: "Reading Assistant - AutiSpark",
        callback_url: null,
        custom_greeting: "Hi there! I'm Spark, your reading assistant! I'm here to help you understand stories and answer questions. I know all about the reading passages we'll work on together. Are you ready to start reading and learning together?",
        properties: {
          max_session_duration: 1800, // 30 minutes
          enable_recording: false,
          language: "en"
        }
      };

      const response = await fetch(`${this.apiUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(conversationData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Tavus API Error:', response.status, errorData);
        throw new Error(`Failed to create conversation: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tavus conversation created successfully:', data);
      
      return {
        conversationId: data.conversation_id,
        conversationUrl: data.conversation_url,
        status: data.status
      };
    } catch (error) {
      console.error('❌ Error creating Tavus conversation:', error);
      throw error;
    }
  }

  async endConversation(conversationId) {
    try {
      console.log('🛑 Ending Tavus conversation:', conversationId);
      
      const response = await fetch(`${this.apiUrl}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        console.error('❌ Error ending conversation:', response.status);
        throw new Error(`Failed to end conversation: ${response.status}`);
      }

      console.log('✅ Conversation ended successfully');
      return true;
    } catch (error) {
      console.error('❌ Error ending conversation:', error);
      throw error;
    }
  }

  async getConversationStatus(conversationId) {
    try {
      const response = await fetch(`${this.apiUrl}/conversations/${conversationId}`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get conversation status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error getting conversation status:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      console.log('🧪 Testing Tavus Reading API connection...');
      
      if (!this.apiKey) {
        console.error('❌ No Tavus API key configured!');
        return false;
      }

      // Test by trying to get replicas (a simple GET request)
      const response = await fetch(`${this.apiUrl}/replicas`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      console.log('🧪 Test response status:', response.status);
      
      if (response.ok) {
        console.log('✅ Tavus Reading API connection successful');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Tavus API test failed:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Tavus connection test error:', error);
      return false;
    }
  }
}
