import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const revidUrl = searchParams.get('url')

    if (!revidUrl) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 })
    }

    console.log('🔍 Récupération depuis Revid:', revidUrl)

    // Fetch la page Revid
    const response = await fetch(revidUrl)

    if (!response.ok) {
      return NextResponse.json({ error: 'Vidéo non trouvée' }, { status: 404 })
    }

    const html = await response.text()

    // Extraire l'URL de la vidéo et la thumbnail depuis le HTML
    const videoUrlMatch = html.match(/https:\/\/cdn\.revid\.ai\/renders\/[^"]+\.mp4/)
    const thumbnailMatch = html.match(/https:\/\/cdn\.revid\.ai\/thumbnails\/[^"]+\.(jpeg|jpg|png)/)

    if (!videoUrlMatch) {
      return NextResponse.json({ error: 'Vidéo pas encore disponible' }, { status: 404 })
    }

    const videoUrl = videoUrlMatch[0]
    const thumbnailUrl = thumbnailMatch ? thumbnailMatch[0] : null

    console.log('✅ Vidéo trouvée:', videoUrl)

    return NextResponse.json({
      videoUrl,
      thumbnailUrl,
      duration: null
    })

  } catch (error) {
    console.error('❌ Erreur fetch Revid:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    )
  }
}
