import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'
import { User } from '_lib/user';
import { getDbStatement } from '_lib/server/database';
import { ApplicationError } from '_lib/server/applicationError';


export class LoginError extends ApplicationError {
  static readonly UNAUTHORIZED = 401;

  constructor(message: string = 'Unauthorized', status:number = LoginError.UNAUTHORIZED) {
    super(message, status);
  }
}

//
// Perform login by the cookie 'token'
// Return a User or throw an Error.
// if 'token' not set and allowsNotConnected is set to true, will return an invalid user.
//
export function tokenLogOn(options?: { allowsNotConnected: boolean }) : User {
  if (process.env.JWT_SECRET == null) {
    // Server is not correctly configured: define JWT_SECRET in .env.local.
    throw new ApplicationError('Server error: JWT_SECRET is not set.', ApplicationError.SERVER_ERROR);
  }

  const token = cookies().get('token');
  if (token == null) {
    // User not logged in
    if (options && options.allowsNotConnected) {
      return new User();
    } else {
      throw new LoginError('Unauthorized: Not logged in.');
    }
  }

  try {
    // Validate token and return userName
    const data = jwt.verify(token.value, process.env.JWT_SECRET);
    if (data == null) throw new LoginError();
    const userName = (data as { userName: string } ).userName;
    if (userName == null) throw new LoginError();
    const user = getUser(userName);
    if (user.isValid() == false) throw new LoginError();
    return user;
  } catch(err) {
    // login error
    console.log('Invalid jwt token used.');
    throw new LoginError();
  }
}

//
// Perform login by user/password
// Return the NextResponse to provide to client or throw an Error.
//
export function login({userName, password}: {userName: string, password: string}) : NextResponse {
  if (process.env.JWT_SECRET == null) {
    // Server is not correctly configured: define JWT_SECRET in .env.local.
    throw new ApplicationError('Server error: JWT_SECRET is not set.', ApplicationError.SERVER_ERROR);
  }

  if (userName == null || password == null) {
    throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
  }

  const passwordHash = getDbStatement('selectUserPasswordHash', 'SELECT passwordHash FROM users WHERE userName=?', {pluck:true}).get<string>(userName);
  if (passwordHash == null || bcrypt.compareSync(password, passwordHash) == false) {
    console.log('Invalid user/password: ' + userName + ', ' + password);
    throw new LoginError('Nom ou mot de passe invalide.');
  }

  const user = getUser(userName);

  console.log('User login: ' + user.userName);
  const token = jwt.sign({ userName: user.userName }, process.env.JWT_SECRET, { expiresIn: '7d' });
  var expires = new Date(); expires.setDate(expires.getDate() + 30);
  var response = NextResponse.json(user, { status: 200 });
  response.cookies.set('token', token, { path: '/', expires: expires, sameSite: "strict" } );
  return response;
}

//
// Set user password
// on failure, throw a Error
//
export function setPassword(userName: string, password: string, firstLogin: boolean = false) {
  if (userName == null || password == null) {
    throw new ApplicationError('Client Error: invalid API usage.', ApplicationError.CLIENT_ERROR);
  }
  const passwordHash = getPasswordHash(password);
  if (getDbStatement('updateUserPasswordHash', 'UPDATE users SET passwordHash=?, firstLogin=? WHERE userName=?')
    .run(passwordHash, firstLogin? 1 : 0, userName) == false
  ) {
    throw new ApplicationError('Server error: Password update failed.', ApplicationError.SERVER_ERROR);
  }
}

//
// Generate a password hash
//
export function getPasswordHash(password: string) : string {
  return bcrypt.hashSync(password, 10);
}

//
// Select a user from database
// Return an invalid user on failure
//
export function getUser(userName: string) : User {
  const userData = getDbStatement('selectUser', 'SELECT userName, displayName, firstLogin, isAdmin FROM users WHERE userName=?')
    .get<{userName: string, displayName: string, firstLogin: number, isAdmin: number}>(userName);
  return User.fromObject(userData);
}
