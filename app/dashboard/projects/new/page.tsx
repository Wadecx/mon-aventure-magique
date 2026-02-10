'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '../image-upload'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [prompt, setPrompt] = useState('')

  const handleImageSelect = (file: File, previewUrl: string) => {
    setImageFile(file)
    setImagePreview(previewUrl)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!imageFile) {
        throw new Error('Veuillez sélectionner une image')
      }

      // 1. Upload de l'image
      const uploadFormData = new FormData()
      uploadFormData.append('image', imageFile)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image')
      }

      const { imageUrl } = await uploadResponse.json()

      // 2. Création du projet avec l'URL de l'image
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          prompt,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création du projet')
      }

      router.push('/dashboard/projects')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nouveau projet</h1>
        <p className="mt-2 text-sm text-gray-600">
          Remplissez les informations pour générer votre vidéo
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <ImageUpload
            onImageSelect={handleImageSelect}
            currentImage={imagePreview}
          />

          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700"
            >
              Prompt / Instructions *
            </label>
            <textarea
              name="prompt"
              id="prompt"
              required
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Décrivez la vidéo que vous souhaitez générer..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Décrivez en détail la vidéo que vous souhaitez générer
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
