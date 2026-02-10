import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucune image fournie' },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Le fichier doit être une image' },
        { status: 400 }
      )
    }

    // Convertir l'image en base64 pour Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`

    // Cloudinary upload
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`

    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', base64Image)
    cloudinaryFormData.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default')

    const cloudinaryResponse = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    })

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json()
      console.error('Cloudinary error:', errorData)
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload vers Cloudinary' },
        { status: 500 }
      )
    }

    const cloudinaryData = await cloudinaryResponse.json()
    const imageUrl = cloudinaryData.secure_url

    console.log('✅ Image uploadée sur Cloudinary:', imageUrl)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'upload de l\'image' },
      { status: 500 }
    )
  }
}
