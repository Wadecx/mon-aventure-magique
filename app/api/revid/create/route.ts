import { NextRequest, NextResponse } from 'next/server'
// TODO: Importer Prisma
// import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { projectId, imageUrl, prompt, webhook } = await request.json()

    console.log('📝 Revid API - Données reçues:', { projectId, imageUrl, prompt })

    // Validation
    if (!projectId || !imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Convertir l'URL locale en URL complète si nécessaire
    const fullImageUrl = imageUrl.startsWith('http')
      ? imageUrl
      : `${process.env.NEXTAUTH_URL}${imageUrl}`

    console.log('🖼️  Image URL complète:', fullImageUrl)

    // Préparer le payload Revid
    const revidPayload = {
      webhook: webhook || `${process.env.NEXTAUTH_URL}/api/webhooks/revid`,
      frameRate: 30,
      resolution: '720p',
      frameDurationMultiplier: 18,
      creationParams: {
        mediaType: 'movingImage',
        metadata: null,
        flowType: 'prompt-to-video',
        slug: 'create-cartoon-video',
        slugNew: '',
        isCopiedFrom: false,
        hasToGenerateVoice: true,
        hasToTranscript: false,
        hasToSearchMedia: true,
        hasAvatar: false,
        hasWebsiteRecorder: false,
        hasTextSmallAtBottom: false,
        ratio: '9 / 16',
        selectedAudio: 'Izzamuzzic',
        selectedVoice: 'FvmvwvObRqIHojkEGh5N',
        selectedAvatar: fullImageUrl,
        selectedAvatarType: 'image/png',
        websiteToRecord: '',
        hasToGenerateCover: false,
        coverTextType: 'layers',
        nbGenerations: 1,
        disableCaptions: false,
        characters: [],
        imageGenerationModel: 'ultra',
        videoGenerationModel: 'base',
        avatarImageModel: 'good',
        hasEnhancedGeneration: true,
        hasEnhancedGenerationPro: true,
        useLegacyVoiceModel: false,
        musicGenerationModel: 'base',
        captionPresetName: 'Wrap 1',
        captionPositionName: 'bottom',
        sourceType: 'contentScraping',
        selectedStoryStyle: {
          value: 'custom',
          label: 'General',
        },
        durationSeconds: 40,
        generationPreset: 'PIXAR',
        generationMusicPrompt: '',
        hasToGenerateMusic: false,
        isOptimizedForChinese: false,
        generationUserPrompt: '',
        hasToGenerateMusicWithLyrics: false,
        enableNsfwFilter: false,
        addStickers: false,
        typeMovingImageAnim: 'dynamic',
        hasToGenerateSoundEffects: false,
        prompt: prompt,
        promptCustomRules:
          'You are a cartoon story writer.\n      You need to generate a cartoon story based on the prompt you receive.\n      There should be a maximum of 2 characters in the story.\n      Make sure the story is interesting and engaging.\n      The story should have an introduction, a middle and an end. First scene should be an introduction, last scene should be a conclusion.\n      Scenes should be coherent and flow together seamlessly.\n      Be inspired by famous cartoon storytelling.\n      There must be continuity between the scenes, the story should be coherent and the characters should evolve.\n      Some scenes can have lip-sync\n      ',
        promptTargetDuration: 30,
        selectedCharacters: ['645caf74-f4ea-4352-86f1-880b8ade7ca6'],
        lang: '',
        voiceSpeed: 1,
        disableAudio: false,
        disableVoice: false,
        inputMedias: [],
        hasToGenerateVideos: true,
        audioUrl: 'https://cdn.revid.ai/audio/_izzamuzzic.mp3',
        watermark: null,
        estimatedCreditsToConsume: 152,
      },
    }

    // TODO: Appeler l'API Revid
    const revidApiKey = process.env.REVID_API_KEY
    console.log('🔑 API Key présente:', !!revidApiKey)

    if (!revidApiKey) {
      console.warn('⚠️  REVID_API_KEY not configured, returning mock response')
      return NextResponse.json({
        message: 'Génération de vidéo lancée (mode test)',
        jobId: 'mock-job-id',
      })
    }

    console.log('🚀 Envoi de la requête à Revid...')
    console.log('📦 Payload:', JSON.stringify(revidPayload, null, 2))

    const revidResponse = await fetch('https://www.revid.ai/api/public/v2/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'key': revidApiKey,
      },
      body: JSON.stringify(revidPayload),
    })

    console.log('📡 Statut de la réponse Typeframes:', revidResponse.status)

    const responseText = await revidResponse.text()
    console.log('📄 Réponse brute:', responseText)

    if (!revidResponse.ok) {
      console.error('❌ Typeframes API error:', responseText)
      throw new Error(`Erreur API Typeframes (${revidResponse.status}): ${responseText.substring(0, 500)}`)
    }

    let responseData
    try {
      responseData = JSON.parse(responseText)
      console.log('✅ Réponse Typeframes:', responseData)
    } catch (parseError) {
      console.error('❌ Impossible de parser la réponse JSON:', responseText.substring(0, 500))
      throw new Error(`Réponse non-JSON de Typeframes: ${responseText.substring(0, 200)}`)
    }

    // Revid retourne un "pid" (project id) qui est le jobId
    const jobId = responseData.pid || responseData.jobId

    if (!jobId) {
      console.error('❌ Aucun pid/jobId dans la réponse Revid')
      throw new Error('Aucun jobId reçu de Revid')
    }

    // Retourner le projectId et le jobId pour la mise à jour
    return NextResponse.json({
      message: 'Génération de vidéo lancée',
      jobId,
      projectId,
    })
  } catch (error) {
    console.error('❌ Revid create error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue'
    return NextResponse.json(
      { error: `Erreur lors de la génération de la vidéo: ${errorMessage}` },
      { status: 500 }
    )
  }
}
