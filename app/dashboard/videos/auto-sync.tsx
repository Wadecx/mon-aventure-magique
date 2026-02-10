'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AutoSync() {
  const router = useRouter()

  useEffect(() => {
    const syncVideos = async () => {
      try {
        console.log('🔄 Auto-sync: Démarrage de la synchronisation automatique...')

        const response = await fetch('/api/videos/sync', {
          method: 'POST',
        })

        if (response.ok) {
          const data = await response.json()
          console.log('✅ Auto-sync:', data.message)

          // Rafraîchir la page si de nouvelles vidéos ont été synchronisées
          if (data.syncedCount > 0) {
            router.refresh()
          }
        }
      } catch (error) {
        console.error('❌ Auto-sync error:', error)
      }
    }

    // Lancer la synchronisation après un court délai
    const timer = setTimeout(() => {
      syncVideos()
    }, 500)

    return () => clearTimeout(timer)
  }, [router])

  return null // Ce composant ne rend rien visuellement
}
