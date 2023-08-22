import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {

  if (process.env.JWT_SECRET == null) {
    // Server is not correctly configured: define JWT_SECRET in .env.local.
    console.log('Server error: JWT_SECRET is not set.');
    return NextResponse.json({ message: 'Server error: JWT_SECRET is not set.' }, { status: 500 });
  }

  const token = request.cookies.get('token');
  if (token == null) {
    // User not logged in
    return NextResponse.json({ userName: null }, { status: 200 });
  }

  try {
    // Validate token and return userName
    const data = jwt.verify(token.value, process.env.JWT_SECRET);
    if (data == null) throw 'Unauthorized';
    const userName = (data as { userName: string } ).userName;
    if (userName == null) throw 'Unauthorized';
    console.log('Autologon: ' + userName);
    return NextResponse.json({ userName: userName }, { status: 200 });
  } catch(err) {
    // login error
    console.log('Invalid jwt token used.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}

