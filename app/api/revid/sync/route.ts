import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Synchronisation manuelle avec Revid...')

    // Récupérer tous les projets en processing
    const processingProjects = await prisma.project.findMany({
      where: {
        status: 'processing',
        revidJobId: { not: null }
      }
    })

    console.log(`📊 ${processingProjects.length} projet(s) en cours de traitement`)

    const revidApiKey = process.env.REVID_API_KEY
    if (!revidApiKey) {
      return NextResponse.json(
        { error: 'REVID_API_KEY not configured' },
        { status: 500 }
      )
    }

    const results = []

    for (const project of processingProjects) {
      console.log(`🔍 Vérification du projet ${project.id} (Revid: ${project.revidJobId})`)

      try {
        // Appeler l'API Revid pour obtenir le statut
        const url = `https://www.revid.ai/api/public/v2/render/${project.revidJobId}`
        console.log(`📡 Appel API Revid: ${url}`)

        const response = await fetch(url, {
          headers: {
            'key': revidApiKey
          }
        })

        console.log(`📊 Statut HTTP:`, response.status)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`❌ Erreur API Revid pour ${project.revidJobId}:`, response.status, errorText)

          // Essayer l'ancien endpoint
          console.log(`🔄 Tentative avec l'ancien endpoint...`)
          const oldUrl = `https://www.revid.ai/api/public/render/${project.revidJobId}`
          const oldResponse = await fetch(oldUrl, {
            headers: { 'key': revidApiKey }
          })

          if (!oldResponse.ok) {
            console.error(`❌ Ancien endpoint échoué aussi:`, oldResponse.status)
            continue
          }

          const oldData = await oldResponse.json()
          console.log(`📦 Réponse (ancien endpoint):`, JSON.stringify(oldData, null, 2))
          continue
        }

        const data = await response.json()
        console.log(`📦 Réponse Revid:`, JSON.stringify(data, null, 2))

        // Vérifier le statut
        if (data.status === 'completed' && data.videoUrl) {
          console.log(`✅ Vidéo terminée pour ${project.id}`)

          // Mettre à jour le projet
          await prisma.project.update({
            where: { id: project.id },
            data: { status: 'completed' }
          })

          // Créer la vidéo
          const video = await prisma.video.create({
            data: {
              projectId: project.id,
              videoUrl: data.videoUrl,
              thumbnailUrl: data.cover || null,
              duration: data.duration ? parseInt(data.duration) : null
            }
          })

          results.push({
            projectId: project.id,
            status: 'completed',
            videoId: video.id
          })
        } else if (data.status === 'failed') {
          console.log(`❌ Génération échouée pour ${project.id}`)

          await prisma.project.update({
            where: { id: project.id },
            data: { status: 'failed' }
          })

          results.push({
            projectId: project.id,
            status: 'failed'
          })
        } else {
          console.log(`⏳ Projet ${project.id} toujours en cours...`)
          results.push({
            projectId: project.id,
            status: data.status || 'processing'
          })
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${project.id}:`, error)
        results.push({
          projectId: project.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: 'Synchronisation terminée',
      processed: processingProjects.length,
      results
    })
  } catch (error) {
    console.error('❌ Sync error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    )
  }
}
