'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function AutoSync({ hasProcessingProjects }: { hasProcessingProjects: boolean }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    // Si pas de projets en cours, ne rien faire
    if (!hasProcessingProjects) return

    console.log('🔄 Démarrage du polling automatique...')

    // Fonction de synchronisation
    const checkVideos = async () => {
      if (isChecking) return

      setIsChecking(true)
      try {
        const response = await fetch('/api/revid/sync', {
          method: 'POST'
        })

        if (response.ok) {
          const data = await response.json()
          const completedCount = data.results?.filter((r: any) => r.status === 'completed').length || 0

          if (completedCount > 0) {
            console.log(`✅ ${completedCount} nouvelle(s) vidéo(s) récupérée(s)`)
            // Rafraîchir la page
            router.refresh()
          }
        }
      } catch (error) {
        console.error('Auto-sync error:', error)
      } finally {
        setIsChecking(false)
      }
    }

    // DÉSACTIVÉ : Vérifier toutes les 30 secondes
    // const interval = setInterval(checkVideos, 30000)

    // DÉSACTIVÉ : Vérifier immédiatement au montage
    // checkVideos()

    const interval = null as any

    // Nettoyer l'interval au démontage
    return () => clearInterval(interval)
  }, [hasProcessingProjects, router, isChecking])

  if (!hasProcessingProjects) return null

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">
            Vérification automatique des vidéos en cours... (toutes les 30 secondes)
          </p>
        </div>
      </div>
    </div>
  )
}
