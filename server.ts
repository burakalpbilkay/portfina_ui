import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const app = express();
app.use(cors());
app.use(express.json());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.post('/login', async (req: Request, res: Response) => {
  const { token } = req.body as { token?: string };
  if (!token) {
    return res.status(400).json({ error: 'Token missing' });
  }
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    const jwtToken = jwt.sign(user, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h',
    });
    return res.json({ token: jwtToken, user });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export default app;
