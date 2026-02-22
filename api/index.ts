
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req;
  
  if (path === '/api/v1/health' || path === '/health') {
    return res.status(200).json({ 
      status: 'ok',
      message: 'Pink Money Bag API is running!'
    });
  }
  
  if (path === '/' || path === '') {
    return res.status(200).json({ 
      message: 'Welcome to Pink Money Bag API!',
      health: '/api/v1/health'
    });
  }
  
  res.status(404).json({ error: 'Not found' });
}
