'use client'

import { useState } from 'react'

interface VideoPlayerProps {
  video: {
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
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition">
      {/* Lecteur vidéo ou thumbnail */}
      <div className="relative aspect-video bg-gray-900">
        {isPlaying ? (
          <video
            controls
            autoPlay
            className="w-full h-full"
            poster={video.thumbnailUrl || undefined}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        ) : (
          <>
            {video.thumbnailUrl ? (
              <img
                src={video.thumbnailUrl}
                alt="Thumbnail vidéo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                <svg
                  className="h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            )}

            {/* Bouton play superposé */}
            <button
              onClick={() => setIsPlaying(true)}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition group"
            >
              <div className="w-16 h-16 flex items-center justify-center bg-white rounded-full shadow-lg group-hover:scale-110 transition">
                <svg
                  className="w-8 h-8 text-indigo-600 ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>

            {/* Durée */}
            {video.duration && (
              <span className="absolute bottom-2 right-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded">
                {Math.floor(video.duration / 60)}:
                {(video.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 truncate">
          Vidéo générée
        </h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {video.project.prompt}
        </p>
        <p className="mt-2 text-xs text-gray-400">
          {new Date(video.createdAt).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        {/* Actions */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setIsPlaying(true)}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            Lire
          </button>
          <a
            href={video.videoUrl}
            download
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Télécharger
          </a>
        </div>
      </div>
    </div>
  )
}
