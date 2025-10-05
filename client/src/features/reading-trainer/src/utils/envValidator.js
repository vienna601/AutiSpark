export function validateEnvironment() {
  const required = {
    'VITE_TAVUS_API_KEY': import.meta.env.VITE_TAVUS_API_KEY,
    'VITE_TAVUS_REPLICA_ID': import.meta.env.VITE_TAVUS_REPLICA_ID,
    'VITE_TAVUS_API_URL': import.meta.env.VITE_TAVUS_API_URL,
    'VITE_GEMINI_API_KEY': import.meta.env.VITE_GEMINI_API_KEY,
    'VITE_GEMINI_API_URL': import.meta.env.VITE_GEMINI_API_URL
  }

  // Optional (nice to have but not required)
  console.log('🔍 Environment Validation:')
  
  const missing = []
  const present = []

  for (const [key, value] of Object.entries(required)) {
    if (!value || value === 'undefined') {
      missing.push(key)
      console.log(`❌ ${key}: MISSING`)
    } else {
      present.push(key)
      console.log(`✅ ${key}: ${value.substring(0, 10)}...`)
    }
  }

  if (missing.length > 0) {
    console.warn('⚠️ Missing environment variables:', missing)
    console.log('💡 Make sure to:')
    console.log('   1. Create a .env file in your project root')
    console.log('   2. Add all required variables')
    console.log('   3. Restart your dev server after adding variables')
    return false
  }

  console.log('✅ All environment variables are configured!')
  return true
}
