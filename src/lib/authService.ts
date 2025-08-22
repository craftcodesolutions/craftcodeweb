import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function signToken(payload: { userId: string }) {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
      if (err) return reject(err);
      if (!token) return reject(new Error('Token generation failed'));
      resolve(token);
    });
  });
}

export async function verifyToken(token: string) {
  return new Promise<{ userId: string }>((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded as { userId: string });
    });
  });
}