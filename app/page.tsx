import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center space-y-8 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          SaaS Vidéo IA
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Créez des vidéos personnalisées automatiquement avec l'intelligence artificielle
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </main>
  )
}
