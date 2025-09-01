'use client'

import { useState } from 'react'

export default function TestAPIPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testAPI = async (endpoint: string) => {
    setLoading(true)
    try {
      const response = await fetch(endpoint)
      const data = await response.json()
      setResults((prev: any) => ({ ...prev, [endpoint]: { status: response.status, data } }))
    } catch (error) {
      setResults((prev: any) => ({ ...prev, [endpoint]: { error: error instanceof Error ? error.message : 'Unknown error' } }))
    } finally {
      setLoading(false)
    }
  }

  const testEndpoints = [
    '/api/student/assignments',
    '/api/student/schedule',
    '/api/complaints',
    '/api/certificates',
    '/api/meetings',
    '/api/materials'
  ]

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4">
        {testEndpoints.map(endpoint => (
          <div key={endpoint} className="border p-4 rounded">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">{endpoint}</h3>
              <button
                onClick={() => testAPI(endpoint)}
                disabled={loading}
                className="btn-primary"
              >
                Test
              </button>
            </div>
            {results[endpoint] && (
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(results[endpoint], null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
