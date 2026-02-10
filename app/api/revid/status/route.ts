import { NextRequest, NextResponse } from 'next/server'
// TODO: Importer Prisma
// import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'jobId requis' },
        { status: 400 }
      )
    }

    // TODO: Appeler l'API Revid pour vérifier le statut
    // const revidApiKey = process.env.REVID_API_KEY
    // const revidResponse = await fetch(`https://api.revid.ai/v1/status/${jobId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${revidApiKey}`
    //   }
    // })

    // if (!revidResponse.ok) {
    //   throw new Error('Erreur API Revid')
    // }

    // const { status, videoUrl, thumbnailUrl, duration } = await revidResponse.json()

    // TODO: Si terminé, mettre à jour la BDD
    // if (status === 'completed') {
    //   const project = await prisma.project.findFirst({
    //     where: { revidJobId: jobId }
    //   })
    //
    //   if (project) {
    //     await prisma.project.update({
    //       where: { id: project.id },
    //       data: { status: 'completed' }
    //     })
    //
    //     await prisma.video.create({
    //       data: {
    //         projectId: project.id,
    //         videoUrl,
    //         thumbnailUrl,
    //         duration
    //       }
    //     })
    //   }
    // }

    return NextResponse.json({
      status: 'processing',
      videoUrl: null
    })
  } catch (error) {
    console.error('Revid status error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification du statut' },
      { status: 500 }
    )
  }
}
