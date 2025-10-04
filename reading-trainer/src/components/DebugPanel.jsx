import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function DebugPanel() {
  const [showDebug, setShowDebug] = useState(false)
  
  const envVars = {
    'VITE_TAVUS_API_KEY': import.meta.env.VITE_TAVUS_API_KEY,
    'VITE_TAVUS_REPLICA_ID': import.meta.env.VITE_TAVUS_REPLICA_ID,
    'VITE_TAVUS_PERSONA_ID': import.meta.env.VITE_TAVUS_PERSONA_ID,
    'VITE_TAVUS_API_URL': import.meta.env.VITE_TAVUS_API_URL,
    'VITE_GEMINI_API_KEY': import.meta.env.VITE_GEMINI_API_KEY,
    'VITE_GEMINI_API_URL': import.meta.env.VITE_GEMINI_API_URL
  }

  const testTavusConnection = async () => {
    const apiKey = import.meta.env.VITE_TAVUS_API_KEY
    const apiUrl = import.meta.env.VITE_TAVUS_API_URL

    console.log('🧪 Testing Tavus connection...')
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING')
    console.log('API URL:', apiUrl)

    try {
      const response = await fetch(`${apiUrl}/replicas`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
        },
      })

      console.log('Test Response Status:', response.status)
      console.log('Test Response Headers:', Object.fromEntries(response.headers))
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Tavus API is working! Replicas:', data)
      } else {
        const errorText = await response.text()
        console.error('❌ Tavus API Error:', errorText)
      }
    } catch (error) {
      console.error('❌ Network Error:', error)
    }
  }

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-700"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Debug Panel</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Environment Variables:</h4>
          <div className="space-y-1 text-xs">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className={value ? 'text-green-600' : 'text-red-600'}>
                  {value ? '✅' : '❌'}
                </span>
                <span className="font-mono">{key}:</span>
                <span className="text-gray-600">
                  {value ? `${value.substring(0, 10)}...` : 'MISSING'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={testTavusConnection}
          className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Test Tavus Connection
        </button>

        <div className="text-xs text-gray-500">
          Check browser console for detailed logs
        </div>
      </div>
    </div>
  )
}
