import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

import { getDatabase } from '_lib/database';

export async function POST(request: NextRequest) {
  if (process.env.JWT_SECRET == null) {
    // Server is not correctly configured: define JWT_SECRET in .env.local.
    console.log('Server error: JWT_SECRET is not set.');
    return NextResponse.json({ message: 'Server error: JWT_SECRET is not set.' }, { status: 500 });
  }

  const { userName, password } = await request.json();
  if (userName == null || password == null) {
    console.log('Server error: invalid API usage');
     return NextResponse.json({ message: 'Server error: invalid API usage' }, { status: 500 });
  }


  const passwordHash = getDatabase().selectUserPasswordHash(userName);
  if (passwordHash == null ||
      bcrypt.compareSync(password, passwordHash) == false) {
        console.log('Invalid user/password: ' + userName + ', ' + password);
        return NextResponse.json({ message: 'Nom ou mot de passe invalide.' }, { status: 401 });
      }

  const user = getDatabase().selectUser(userName);

  console.log('User login: ' + user.userName);
  const token = jwt.sign({ userName: user.userName }, process.env.JWT_SECRET, { expiresIn: '7d' });
  var expires = new Date(); expires.setDate(expires.getDate() + 30);
  var response = NextResponse.json(user, { status: 200 });
  response.cookies.set('token', token, { path: '/', expires: expires, sameSite: "strict" } );
  return response;
}
