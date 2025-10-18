export class TavusSpeakingService {
  constructor() {
    this.apiKey = import.meta.env.VITE_TAVUS_SPEAKING_API_KEY;
    this.replicaId = import.meta.env.VITE_TAVUS_SPEAKING_REPLICA_ID;
    this.personaId = import.meta.env.VITE_TAVUS_SPEAKING_PERSONA_ID;
    this.apiUrl = import.meta.env.VITE_TAVUS_API_URL;
    
    console.log('🎬 TavusSpeakingService initialized');
    console.log('API Key available:', !!this.apiKey);
    console.log('Replica ID:', this.replicaId);
    console.log('Persona ID:', this.personaId);
    console.log('API URL:', this.apiUrl);
  }

  async createSpeakingConversation(prompt, context = {}) {
    try {
      console.log('🎬 Creating Tavus speaking conversation...');
      
      if (!this.apiKey || !this.replicaId) {
        console.error('❌ Missing Tavus credentials for speaking');
        throw new Error('Tavus speaking credentials not configured');
      }

      const conversationPrompt = this.createSpeakingPrompt(prompt, context);
      
      // Build the request payload without callback_url to avoid the null error
      const requestPayload = {
        replica_id: this.replicaId,
        conversation_name: `speaking_practice_${Date.now()}`,
        properties: {
          max_call_duration: 300, // 5 minutes
          participant_left_timeout: 120,
          participant_absent_timeout: 30,
          enable_recording: false,
          enable_transcription: true,
          language: 'english'
        },
        custom_greeting: conversationPrompt
      };

      // Only add persona_id if it exists and is not a placeholder
      if (this.personaId && !this.personaId.includes('your-')) {
        requestPayload.persona_id = this.personaId;
      }

      console.log('📦 Tavus request payload:', requestPayload);
      
      const response = await fetch(`${this.apiUrl}/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Tavus API Error:', errorData);
        throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      console.log('✅ Tavus conversation created:', data);
      
      return {
        conversationId: data.conversation_id,
        conversationUrl: data.conversation_url,
        status: data.status
      };
    } catch (error) {
      console.error('❌ Error creating Tavus speaking conversation:', error);
      throw error;
    }
  }

  createSpeakingPrompt(prompt, context) {
    const { 
      question = "What is your name?",
      goal = "practice speaking clearly",
      studentLevel = "beginner",
      encouragementNeeded = true
    } = context;

    return `You are Riley, a warm and patient AI speech therapy tutor for children with autism. You're helping a student practice speaking.

CURRENT QUESTION: "${question}"
GOAL: ${goal}
STUDENT LEVEL: ${studentLevel}

Guidelines for this session:
- Speak slowly and clearly with a gentle, encouraging tone
- Give the student plenty of time to think and respond
- Celebrate any attempt to speak, even if it's not perfect
- Use simple, supportive language
- Be patient and never rush the student
- If they seem stuck, offer gentle prompts like "Take your time" or "You can do it"

Start by asking the question in a warm, friendly way. Wait for their response and then give encouraging feedback. Remember that every attempt is progress!

Example interaction:
You: "Hi there! I'm so happy to practice speaking with you today. ${question} Take all the time you need."
[Wait for response]
You: "Wonderful! Thank you for sharing that with me. You spoke very clearly!"

Keep the conversation natural, supportive, and focused on building their confidence.`;
  }

  async getSpeakingConversationStatus(conversationId) {
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
      return null;
    }
  }

  async endSpeakingConversation(conversationId) {
    try {
      const response = await fetch(`${this.apiUrl}/conversations/${conversationId}/end`, {
        method: 'POST',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to end conversation: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Conversation ended:', data);
      return data;
    } catch (error) {
      console.error('❌ Error ending conversation:', error);
      return null;
    }
  }

  async getConversationTranscript(conversationId) {
    try {
      // Wait a moment for transcription to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await fetch(`${this.apiUrl}/conversations/${conversationId}/transcript`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get transcript: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Got conversation transcript:', data);
      return data;
    } catch (error) {
      console.error('❌ Error getting transcript:', error);
      return null;
    }
  }

  async testConnection() {
    try {
      console.log('🧪 Testing Tavus speaking API connection...');
      
      if (!this.apiKey) {
        console.error('❌ No Tavus API key configured!');
        return false;
      }

      const response = await fetch(`${this.apiUrl}/replicas`, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Tavus speaking service test successful:', data);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Tavus speaking test failed:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Tavus speaking test error:', error);
      return false;
    }
  }
}
