import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {

  if (process.env.JWT_SECRET == null) {
    // Server is not correctly configured: define JWT_SECRET in .env.local.
    console.log('Server error: JWT_SECRET is not set.');
    response.status(500).json({ message: 'Server error: JWT_SECRET is not set.' });
    return;
  }

  try {
    if (request.cookies == null || request.cookies.token == null) {
      // User not logged in
      response.status(200).json({ userName: null });
      return;
    }

    // Validate token and return userName
    const data = jwt.verify(request.cookies.token, process.env.JWT_SECRET);
    if (data == null) throw 'Unauthorized';
    const userName = (data as { userName: string } ).userName;
    if (userName == null) throw 'Unauthorized';
    console.log('Autologon: ' + userName);
    response.status(200).json({ userName: userName });
  } catch(err) {
    // login error
    console.log('Invalid jwt token used.');
    response.status(401).json({  message: 'Unauthorized' });
  }
}

