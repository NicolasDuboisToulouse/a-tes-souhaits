import Database from 'better-sqlite3';
import * as bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize } from 'cookie';


export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  if (process.env.JWT_SECRET == null) {
    // Server is not correctly configured: define JWT_SECRET in .env.local.
    console.log('Server error: JWT_SECRET is not set.');
    response.status(500).json({ message: 'Server error: JWT_SECRET is not set.' });
    return;
  }

  const { userName, password } = request.body;
  if (userName == null || password == null) {
    console.log('Server error: invalid API usage');
    response.status(500).json({ message: 'Server error: invalid API usage' });
  }

  const db = new Database('database/data/database.db', { readonly: false, fileMustExist: true });
  db.pragma('journal_mode = WAL');

  const user = db.prepare("SELECT userName, passwordHash FROM users WHERE userName=?").get(userName) as any;
  if (user == null ||
    bcrypt.compareSync(password, user.passwordHash) == false) {
      console.log('Invalid user/password: ' + userName + ', ' + password);
      response.status(401).json({ message: 'Nom ou mot de passe invalide.' });
      return;
    }

  const token = jwt.sign({ userName: userName }, process.env.JWT_SECRET, { expiresIn: '7d' });
  var expires = new Date(); expires.setDate(expires.getDate() + 30);
  response.setHeader('Set-Cookie', serialize('token', token, { path: '/', expires: expires } ));
  response.status(200).json({ userName: userName });
  console.log('User login: ' + userName);
}
