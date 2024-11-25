import { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL || 'https://your-app-name.herokuapp.com'
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export default corsOptions;