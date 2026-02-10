import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📊 Vérification de la base de données...\n')

  const projects = await prisma.project.findMany({
    include: {
      video: true,
      user: {
        select: {
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  })

  console.log(`📁 Total projets récents: ${projects.length}\n`)

  for (const project of projects) {
    console.log('---')
    console.log(`🆔 ID: ${project.id}`)
    console.log(`👤 User: ${project.user.email}`)
    console.log(`📊 Status: ${project.status}`)
    console.log(`🔗 RevidJobId: ${project.revidJobId || 'N/A'}`)
    console.log(`🎬 Vidéo: ${project.video ? '✅ Oui' : '❌ Non'}`)
    if (project.video) {
      console.log(`   URL: ${project.video.videoUrl}`)
    }
    console.log(`⏰ Créé: ${project.createdAt}`)
    console.log('')
  }

  const videos = await prisma.video.findMany({
    include: {
      project: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`🎥 Total vidéos: ${videos.length}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
