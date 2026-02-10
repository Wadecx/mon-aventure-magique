import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Vous devez fournir ces informations
  const revidJobId = process.argv[2] // Ex: uwjRGhkFoTxH4vdyAiht
  const videoUrl = process.argv[3]    // URL de la vidéo depuis Revid
  const thumbnailUrl = process.argv[4] || null // Optionnel

  if (!revidJobId || !videoUrl) {
    console.error('❌ Usage: npx tsx scripts/add-video-manually.ts <revidJobId> <videoUrl> [thumbnailUrl]')
    console.error('   Exemple: npx tsx scripts/add-video-manually.ts uwjRGhkFoTxH4vdyAiht https://cdn.revid.ai/videos/xxx.mp4')
    process.exit(1)
  }

  console.log('🔍 Recherche du projet avec revidJobId:', revidJobId)

  const project = await prisma.project.findFirst({
    where: { revidJobId }
  })

  if (!project) {
    console.error(`❌ Aucun projet trouvé avec revidJobId: ${revidJobId}`)
    process.exit(1)
  }

  console.log(`✅ Projet trouvé: ${project.id}`)

  // Vérifier si une vidéo existe déjà
  const existingVideo = await prisma.video.findUnique({
    where: { projectId: project.id }
  })

  if (existingVideo) {
    console.log('⚠️  Une vidéo existe déjà pour ce projet')
    console.log(`   Mise à jour de l'URL...`)

    await prisma.video.update({
      where: { id: existingVideo.id },
      data: {
        videoUrl,
        thumbnailUrl
      }
    })
  } else {
    console.log('📹 Création de la vidéo...')

    await prisma.video.create({
      data: {
        projectId: project.id,
        videoUrl,
        thumbnailUrl
      }
    })
  }

  // Mettre à jour le statut du projet
  await prisma.project.update({
    where: { id: project.id },
    data: { status: 'completed' }
  })

  console.log('✅ Vidéo ajoutée avec succès!')
  console.log(`   Vidéo URL: ${videoUrl}`)
  console.log(`   Thumbnail: ${thumbnailUrl || 'N/A'}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
