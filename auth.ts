import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        if (!email || !password) {
          return null
        }

        // Chercher l'utilisateur dans la base de données
        const user = await prisma.user.findUnique({
          where: { email }
        })

        if (!user) {
          console.log('❌ Utilisateur non trouvé:', email)
          return null
        }

        // Vérifier le mot de passe
        const passwordsMatch = await bcrypt.compare(password, user.passwordHash)

        if (!passwordsMatch) {
          console.log('❌ Mot de passe incorrect pour:', email)
          return null
        }

        console.log('✅ Authentification réussie:', user.email)

        return {
          id: user.id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
        }
      },
    }),
  ],
})
