import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { AutoSync } from './auto-sync'
import { SyncVideosButton } from './sync-videos-button'

async function getDashboardStats() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!user) {
    return {
      totalProjects: 0,
      processingProjects: 0,
      completedVideos: 0,
      pendingProjects: 0,
    }
  }

  const [totalProjects, processingProjects, completedVideos, pendingProjects] = await Promise.all([
    prisma.project.count({ where: { userId: user.id } }),
    prisma.project.count({ where: { userId: user.id, status: 'processing' } }),
    prisma.video.count({
      where: {
        project: {
          userId: user.id,
          status: 'completed'
        }
      }
    }),
    prisma.project.count({ where: { userId: user.id, status: 'pending' } }),
  ])

  return {
    totalProjects,
    processingProjects,
    completedVideos,
    pendingProjects,
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  return (
    <div className="px-4 sm:px-0">
      {/* Auto-sync component */}
      <AutoSync hasProcessingProjects={stats.processingProjects > 0} />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-sm text-gray-600">
          Vue d'ensemble de vos projets et vidéos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-indigo-600">
                  {stats.totalProjects}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Projets total
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-yellow-600">
                  {stats.processingProjects}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    En cours
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-green-600">
                  {stats.completedVideos}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Vidéos terminées
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-3xl font-bold text-gray-600">
                  {stats.pendingProjects}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    En attente
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/dashboard/projects/new"
            className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Créer un nouveau projet
          </Link>
          <Link
            href="/dashboard/videos"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Voir mes vidéos
          </Link>
          <SyncVideosButton />
        </div>
      </div>
    </div>
  )
}
