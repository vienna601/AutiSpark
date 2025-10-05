export const testAPIConnections = () => {
  console.log('🧪 Testing API Configuration...');
  
  // Test Gemini
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const geminiUrl = import.meta.env.VITE_GEMINI_API_URL;
  
  console.log('📚 Gemini Config:');
  console.log('- API Key:', geminiKey ? `${geminiKey.substring(0, 10)}...` : 'Missing');
  console.log('- API URL:', geminiUrl || 'Missing');
  
  // Test Tavus
  const tavusKey = import.meta.env.VITE_TAVUS_READING_API_KEY;
  const tavusReplica = import.meta.env.VITE_TAVUS_READING_REPLICA_ID;
  const tavusUrl = import.meta.env.VITE_TAVUS_API_URL;
  
  console.log('🎭 Tavus Config:');
  console.log('- API Key:', tavusKey ? `${tavusKey.substring(0, 10)}...` : 'Missing');
  console.log('- Replica ID:', tavusReplica || 'Missing');
  console.log('- API URL:', tavusUrl || 'Missing');
  
  return {
    gemini: {
      configured: !!(geminiKey && geminiUrl),
      key: !!geminiKey,
      url: !!geminiUrl
    },
    tavus: {
      configured: !!(tavusKey && tavusReplica && tavusUrl),
      key: !!tavusKey,
      replica: !!tavusReplica,
      url: !!tavusUrl
    }
  };
};

// Test function to be called in development
if (import.meta.env.DEV) {
  testAPIConnections();
}
