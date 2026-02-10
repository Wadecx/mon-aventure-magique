import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🗑️  Suppression de la vidéo de test...\n')

  const deletedVideo = await prisma.video.deleteMany({
    where: {
      videoUrl: 'https://test-video-url.mp4'
    }
  })

  console.log(`✅ ${deletedVideo.count} vidéo(s) de test supprimée(s)`)

  // Remettre le projet en processing
  await prisma.project.updateMany({
    where: {
      revidJobId: 'uwjRGhkFoTxH4vdyAiht'
    },
    data: {
      status: 'processing'
    }
  })

  console.log('✅ Projet remis en statut "processing"')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
