import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LogoutButton } from './logout-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link
                href="/dashboard"
                className="flex items-center px-2 text-xl font-bold text-indigo-600"
              >
                SaaS Vidéo
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-indigo-600"
                >
                  Tableau de bord
                </Link>
                <Link
                  href="/dashboard/projects"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-indigo-600"
                >
                  Projets
                </Link>
                <Link
                  href="/dashboard/videos"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-indigo-600"
                >
                  Vidéos
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
