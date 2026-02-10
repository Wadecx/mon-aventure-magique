'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SyncButton() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSync = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/videos/sync', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(data.message || 'Synchronisation réussie')

        // Rafraîchir la page pour afficher les nouvelles vidéos
        router.refresh()

        // Effacer le message après 3 secondes
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage(data.error || 'Erreur lors de la synchronisation')
      }
    } catch (error) {
      setMessage('Erreur réseau lors de la synchronisation')
      console.error('Sync error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSync}
        disabled={isLoading}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Synchronisation...
          </>
        ) : (
          <>
            <svg
              className="-ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Synchroniser les vidéos
          </>
        )}
      </button>

      {message && (
        <div
          className={`text-sm ${
            message.includes('Erreur') || message.includes('erreur')
              ? 'text-red-600'
              : 'text-green-600'
          }`}
        >
          {message}
        </div>
      )}
    </div>
  )
}
