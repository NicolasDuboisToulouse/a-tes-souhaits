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

  if (userName === 'admin' && password == 'admin') {
    const token = jwt.sign({ userName: userName }, process.env.JWT_SECRET, { expiresIn: '7d' });
    var expires = new Date(); expires.setDate(expires.getDate() + 30);
    response.setHeader('Set-Cookie', serialize('token', token, { path: '/', expires: expires } ));
    response.status(200).json({ userName: userName });
    console.log('User login: ' + userName);
  } else {
    console.log('Invalid user/password: ' + userName + ', ' + password);
    response.status(401).json({ message: 'Nom ou mot de passe invalide.' });
  }
}
