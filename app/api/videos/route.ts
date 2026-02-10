import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    console.log(`📹 Récupération des vidéos pour l'utilisateur: ${session.user.email}`)

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    // Récupérer les vidéos de l'utilisateur (uniquement les projets completed)
    const videos = await prisma.video.findMany({
      where: {
        project: {
          userId: user.id,
          status: 'completed'
        }
      },
      include: {
        project: {
          select: {
            prompt: true,
            imageUrl: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`✅ ${videos.length} vidéo(s) trouvée(s)`)

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('❌ Get videos error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des vidéos' },
      { status: 500 }
    )
  }
}
