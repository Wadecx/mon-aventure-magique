import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    console.log('🔄 Synchronisation des vidéos pour:', user.email)

    // Récupérer tous les projets en processing pour cet utilisateur
    const processingProjects = await prisma.project.findMany({
      where: {
        userId: user.id,
        status: 'processing',
        revidJobId: { not: null }
      }
    })

    console.log(`📊 ${processingProjects.length} projet(s) en cours trouvé(s)`)

    let syncedCount = 0
    const errors: string[] = []

    for (const project of processingProjects) {
      try {
        console.log(`🔍 Vérification du projet ${project.revidJobId}...`)

        // Fetch depuis la page publique Revid
        const revidUrl = `https://www.revid.ai/view/${project.revidJobId}`

        const response = await fetch(`${process.env.NEXTAUTH_URL}/api/videos/fetch-revid?url=${encodeURIComponent(revidUrl)}`)

        if (!response.ok) {
          console.log(`⏭️  Projet ${project.revidJobId} pas encore prêt`)
          continue
        }

        const data = await response.json()

        if (data.videoUrl) {
          console.log(`✅ Vidéo trouvée pour ${project.revidJobId}`)

          // Vérifier si la vidéo existe déjà
          const existingVideo = await prisma.video.findUnique({
            where: { projectId: project.id }
          })

          if (!existingVideo) {
            // Créer la vidéo
            await prisma.video.create({
              data: {
                projectId: project.id,
                videoUrl: data.videoUrl,
                thumbnailUrl: data.thumbnailUrl || null,
                duration: data.duration || null
              }
            })

            // Mettre à jour le projet
            await prisma.project.update({
              where: { id: project.id },
              data: { status: 'completed' }
            })

            syncedCount++
            console.log(`🎉 Vidéo synchronisée: ${project.revidJobId}`)
          } else {
            console.log(`⏭️  Vidéo déjà existante pour ${project.revidJobId}`)
          }
        }
      } catch (error) {
        const errorMsg = `Erreur pour ${project.revidJobId}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        console.error(`❌ ${errorMsg}`)
        errors.push(errorMsg)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${syncedCount} vidéo(s) synchronisée(s)`,
      syncedCount,
      totalProcessing: processingProjects.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    console.error('❌ Erreur sync:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    )
  }
}
