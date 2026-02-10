import Link from 'next/link'

// TODO: Récupérer les projets de l'utilisateur depuis la BDD
async function getUserProjects() {
  // const session = await getServerSession(authOptions)
  // const projects = await prisma.project.findMany({
  //   where: { userId: session.user.id },
  //   orderBy: { createdAt: 'desc' }
  // })
  return []
}

type Project = {
  id: string
  firstName: string
  lastName: string
  imageUrl: string
  prompt: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: Date
}

function getStatusBadge(status: Project['status']) {
  const styles = {
    pending: 'bg-gray-100 text-gray-800',
    processing: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }

  const labels = {
    pending: 'En attente',
    processing: 'En cours',
    completed: 'Terminé',
    failed: 'Échoué',
  }

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default async function ProjectsPage() {
  const projects = await getUserProjects()

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes projets</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gérez vos projets de génération de vidéos
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Nouveau projet
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun projet pour le moment
          </h3>
          <p className="text-gray-600 mb-6">
            Créez votre premier projet pour générer une vidéo avec l'IA
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Créer mon premier projet
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <ul className="divide-y divide-gray-200">
            {projects.map((project: Project) => (
              <li key={project.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={project.imageUrl}
                        alt={`${project.firstName} ${project.lastName}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {project.firstName} {project.lastName}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {project.prompt}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(project.status)}
                    <span className="text-sm text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
