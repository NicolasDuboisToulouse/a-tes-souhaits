import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'
import { User } from '_lib/user';
import { getDatabase } from '_lib/server/database';

//
// Create a NextResponse from an error object throwed by other functions
//
export function errorResponse(error: any): NextResponse {
  if (error && error.message && error.status) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  } else {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}

//
// Perform login by the cookie 'token'
// Return a User or throw an object { message, status }
// if 'token' not set and allowsNotConnected is set to true,
// the promise will be accepted with an invalid user.
//
export function tokenLogOn(options?: { allowsNotConnected: boolean }) : User {
  if (process.env.JWT_SECRET == null) {
    // Server is not correctly configured: define JWT_SECRET in .env.local.
    console.log('Server error: JWT_SECRET is not set.');
    throw { message: 'Server error: JWT_SECRET is not set.', status: 500 };
  }

  const token = cookies().get('token');
  if (token == null) {
    // User not logged in
    if (options && options.allowsNotConnected) {
      return new User();
    } else {
      throw { message: 'Unauthorized.', status: 401 };
    }
  }

  try {
    // Validate token and return userName
    const data = jwt.verify(token.value, process.env.JWT_SECRET);
    if (data == null) throw 'Unauthorized';
    const userName = (data as { userName: string } ).userName;
    if (userName == null) throw 'Unauthorized';
    const user = getDatabase().selectUser(userName);
    if (user.isValid() == false) throw 'Unauthorized';
    return user;
  } catch(err) {
    // login error
    console.log('Invalid jwt token used.');
    throw { message: 'Unauthorized.', status: 401 };
  }
}

//
// Perform login by user/password
// Return the NextResponse to provide to client or throw an object { message, status }
//
export function login({userName, password}: {userName: string, password: string}) : NextResponse {
  if (process.env.JWT_SECRET == null) {
    // Server is not correctly configured: define JWT_SECRET in .env.local.
    console.log('Server error: JWT_SECRET is not set.');
    throw { message: 'Server error: JWT_SECRET is not set.', status: 500 };
  }

  if (userName == null || password == null) {
    console.log('Server error: invalid API usage.');
    throw { message: 'Server error: invalid API usage.', status: 500 };
  }

  const passwordHash = getDatabase().selectUserPasswordHash(userName);
  if (passwordHash == null || bcrypt.compareSync(password, passwordHash) == false) {
    console.log('Invalid user/password: ' + userName + ', ' + password);
    throw { message: 'Nom ou mot de passe invalide.', status: 401 };
  }

  const user = getDatabase().selectUser(userName);

  console.log('User login: ' + user.userName);
  const token = jwt.sign({ userName: user.userName }, process.env.JWT_SECRET, { expiresIn: '7d' });
  var expires = new Date(); expires.setDate(expires.getDate() + 30);
  var response = NextResponse.json(user, { status: 200 });
  response.cookies.set('token', token, { path: '/', expires: expires, sameSite: "strict" } );
  return response;
}

//
// Set user password
// throw an object { message, status } on error
//
export function setPassword(user: User, password: string) {
  if (user == null || password == null) {
    throw { message: 'Server error: invalid API usage', status: 500 };
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  if (getDatabase().updateUserPasswordHash(user, passwordHash) == false) {
    throw { message: 'Internal server error', status: 500 };
  }
}
