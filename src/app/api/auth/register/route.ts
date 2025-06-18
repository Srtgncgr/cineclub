import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received registration request:', body);
    const { email, password, username, displayName } = body;

    if (!email || !password || !username) {
      console.error('Missing fields in request:', { email, password, username });
      return new NextResponse('Missing fields', { status: 400 });
    }

    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return new NextResponse('Email already in use', { status: 409 });
    }
    
    const existingUserByUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUserByUsername) {
      return new NextResponse('Username already in use', { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        displayName: displayName || username,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('[REGISTER_POST]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
