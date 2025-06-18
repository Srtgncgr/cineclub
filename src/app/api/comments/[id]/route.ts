import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

// PUT - Yorum düzenleme
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
    }

    const resolvedParams = await params
    const commentId = resolvedParams.id
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Yorum içeriği boş olamaz' }, { status: 400 })
    }

    // Yorumun var olup olmadığını ve kullanıcının sahibi olup olmadığını kontrol et
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: true }
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 })
    }

    if (existingComment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Bu yorumu düzenleme yetkiniz yok' }, { status: 403 })
    }

    // Yorumu güncelle
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Yorum başarıyla güncellendi',
      comment: updatedComment
    })

  } catch (error) {
    console.error('Comment update error:', error)
    return NextResponse.json(
      { error: 'Yorum güncellenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Yorum silme
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmanız gerekiyor' }, { status: 401 })
    }

    const resolvedParams = await params
    const commentId = resolvedParams.id

    // Yorumun var olup olmadığını ve kullanıcının sahibi olup olmadığını kontrol et
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { user: true }
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 })
    }

    if (existingComment.userId !== session.user.id) {
      return NextResponse.json({ error: 'Bu yorumu silme yetkiniz yok' }, { status: 403 })
    }

    // Yorumu sil (cascade olarak yanıtları da silinir)
    await prisma.comment.delete({
      where: { id: commentId }
    })

    // Film yorum sayısını güncelle
    const remainingComments = await prisma.comment.count({
      where: { movieId: existingComment.movieId }
    })

    await prisma.movie.update({
      where: { id: existingComment.movieId },
      data: { commentCount: remainingComments }
    })

    return NextResponse.json({
      message: 'Yorum başarıyla silindi'
    })

  } catch (error) {
    console.error('Comment deletion error:', error)
    return NextResponse.json(
      { error: 'Yorum silinirken bir hata oluştu' },
      { status: 500 }
    )
  }
} 