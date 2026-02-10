import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { projectId, videoUrl, thumbnailUrl } = await request.json()

    if (!projectId || !videoUrl) {
      return NextResponse.json(
        { error: 'projectId et videoUrl requis' },
        { status: 400 }
      )
    }

    // Vérifier que le projet existe et appartient à l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: user.id
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Projet non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    // Mettre à jour le projet
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'completed' }
    })

    // Créer la vidéo
    const video = await prisma.video.create({
      data: {
        projectId,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        duration: null
      }
    })

    console.log('✅ Vidéo ajoutée manuellement:', video.id)

    return NextResponse.json({
      message: 'Vidéo ajoutée avec succès',
      video
    })
  } catch (error) {
    console.error('❌ Manual video add error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout de la vidéo' },
      { status: 500 }
    )
  }
}
