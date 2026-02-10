'use client'

import { logout } from './actions'

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md transition"
    >
      Déconnexion
    </button>
  )
}
