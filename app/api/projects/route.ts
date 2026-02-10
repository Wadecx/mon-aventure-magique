import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ projects: [] })
    }

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des projets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 API Projects - Début de la requête')

    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      )
    }

    const { imageUrl, prompt } = await request.json()
    console.log('📦 Données reçues:', { imageUrl, prompt })

    // Validation
    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Créer le projet en BDD avec status 'pending'
    const project = await prisma.project.create({
      data: {
        userId: user.id,
        imageUrl,
        prompt,
        status: 'pending'
      }
    })

    console.log('🆔 Project créé en BDD:', project.id)

    // Appeler l'API Revid pour créer la vidéo
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    console.log('🚀 Appel de l\'API Revid...')

    const revidResponse = await fetch(`${baseUrl}/api/revid/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        imageUrl,
        prompt,
      }),
    })

    console.log('📡 Statut Revid response:', revidResponse.status)

    if (!revidResponse.ok) {
      const errorData = await revidResponse.json()
      console.error('❌ Erreur Revid:', errorData)

      // Marquer le projet comme failed
      await prisma.project.update({
        where: { id: project.id },
        data: { status: 'failed' }
      })

      throw new Error(errorData.error || 'Erreur lors de la génération')
    }

    const revidData = await revidResponse.json()
    console.log('✅ Données Revid reçues:', revidData)

    // Mettre à jour le projet avec le jobId et passer en 'processing'
    await prisma.project.update({
      where: { id: project.id },
      data: {
        revidJobId: revidData.jobId,
        status: 'processing'
      }
    })

    console.log('✅ Projet mis à jour avec le jobId:', revidData.jobId)

    return NextResponse.json(
      {
        message: 'Projet créé avec succès',
        projectId: project.id,
        jobId: revidData.jobId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Create project error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: `Erreur lors de la création du projet: ${errorMessage}` },
      { status: 500 }
    )
  }
}
