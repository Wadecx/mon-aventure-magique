import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Webhook Revid - Début du traitement')

    // TODO: Vérifier la signature du webhook pour la production
    // const signature = request.headers.get('x-revid-signature')
    // const webhookSecret = process.env.REVID_WEBHOOK_SECRET
    // if (!verifySignature(signature, webhookSecret)) {
    //   return NextResponse.json(
    //     { error: 'Signature invalide' },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    console.log('📦 Données reçues du webhook:', JSON.stringify(body, null, 2))

    // Revid envoie : { pid, status, videoUrl, etc. }
    const { pid, status, videoUrl, cover, duration } = body

    if (!pid) {
      console.error('❌ Aucun pid (jobId) fourni')
      return NextResponse.json(
        { error: 'pid (jobId) requis' },
        { status: 400 }
      )
    }

    console.log(`🔍 Recherche du projet avec revidJobId: ${pid}`)

    // Trouver le projet correspondant
    const project = await prisma.project.findFirst({
      where: { revidJobId: pid }
    })

    if (!project) {
      console.error(`❌ Projet non trouvé pour revidJobId: ${pid}`)
      return NextResponse.json(
        { error: 'Projet non trouvé' },
        { status: 404 }
      )
    }

    console.log(`✅ Projet trouvé: ${project.id}`)

    // Mettre à jour le projet et créer la vidéo si terminé
    if (status === 'completed' && videoUrl) {
      console.log('🎬 Vidéo terminée, mise à jour du projet et création de la vidéo')

      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'completed' }
      })

      await prisma.video.create({
        data: {
          projectId: project.id,
          videoUrl: videoUrl,
          thumbnailUrl: cover || null,
          duration: duration ? parseInt(duration) : null
        }
      })

      console.log('✅ Vidéo enregistrée avec succès')
    } else if (status === 'failed') {
      console.log('❌ Génération échouée, mise à jour du statut')

      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'failed' }
      })
    } else if (status === 'processing') {
      console.log('⏳ Vidéo en cours de génération')

      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'processing' }
      })
    }

    return NextResponse.json({ message: 'Webhook traité avec succès' })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}
