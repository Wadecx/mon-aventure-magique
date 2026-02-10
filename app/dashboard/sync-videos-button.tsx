'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SyncVideosButton() {
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleSync = async () => {
    setSyncing(true)
    setMessage('')

    try {
      const response = await fetch('/api/revid/sync', {
        method: 'POST'
      })

      const data = await response.json()

      if (response.ok) {
        const completedCount = data.results?.filter((r: any) => r.status === 'completed').length || 0
        setMessage(`✅ ${completedCount} vidéo(s) récupérée(s)`)

        // Rafraîchir la page pour afficher les nouvelles vidéos
        router.refresh()
      } else {
        setMessage(`❌ Erreur: ${data.error}`)
      }
    } catch (error) {
      setMessage('❌ Erreur lors de la synchronisation')
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {syncing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Synchronisation...
          </>
        ) : (
          '🔄 Récupérer mes vidéos'
        )}
      </button>
      {message && (
        <p className={`text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
