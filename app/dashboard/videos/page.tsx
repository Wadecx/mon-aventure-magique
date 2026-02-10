import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { VideoPlayer } from './video-player'
// import { SyncButton } from './sync-button'
import { AutoSync } from './auto-sync'

async function getUserVideos() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return []
  }

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
    orderBy: { createdAt: 'desc' }
  })

  return videos
}

type Video = {
  id: string
  videoUrl: string
  thumbnailUrl: string | null
  duration: number | null
  createdAt: Date
  project: {
    prompt: string
    imageUrl: string
    createdAt: Date
  }
}

export default async function VideosPage() {
  const videos = await getUserVideos()

  return (
    <div className="px-4 sm:px-0">
      <AutoSync />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes vidéos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Toutes vos vidéos générées et terminées
        </p>
        {/* <SyncButton /> */}
      </div>

      {videos.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Aucune vidéo disponible
          </h3>
          <p className="mt-2 text-gray-600">
            Vos vidéos terminées apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video: Video) => (
            <VideoPlayer key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
