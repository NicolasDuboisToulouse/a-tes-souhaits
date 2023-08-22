import Database from 'better-sqlite3';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

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

  const db = new Database('database/data/database.db', { readonly: false, fileMustExist: true });
  db.pragma('journal_mode = WAL');

  const user = db.prepare("SELECT userName, passwordHash FROM users WHERE userName=?").get(userName) as any;
  if (user == null ||
    bcrypt.compareSync(password, user.passwordHash) == false) {
      console.log('Invalid user/password: ' + userName + ', ' + password);
      return NextResponse.json({ message: 'Nom ou mot de passe invalide.' }, { status: 401 });
    }

  console.log('User login: ' + userName);
  const token = jwt.sign({ userName: userName }, process.env.JWT_SECRET, { expiresIn: '7d' });
  var expires = new Date(); expires.setDate(expires.getDate() + 30);
  var response = NextResponse.json({ userName: userName }, { status: 200 });
  response.cookies.set('token', token, { path: '/', expires: expires, sameSite: "strict" } );
  return response;
}
