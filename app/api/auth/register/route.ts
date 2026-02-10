import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash
      }
    })

    console.log('✅ Utilisateur créé:', user.email)

    return NextResponse.json(
      { message: 'Utilisateur créé avec succès' },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Registration error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
}
