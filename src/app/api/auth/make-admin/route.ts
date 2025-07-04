import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email gerekli' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { email },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Kullanıcı admin yapıldı',
      user 
    });
  } catch (error) {
    console.error('Admin yapma hatası:', error);
    return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
  }
} 