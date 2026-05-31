import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

import sosRoutes from './Routes/sos_routes.js';
import disasterRoutes from './Routes/disasterRoutes.js';
import rainfallRoutes from './Routes/RainfallRoutes.js';
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('CORS not allowed'), false);
  },
  credentials: true
}));

app.get('/', (req, res) => {
  res.json({ message: 'ResQ AI Backend Server', version: '1.0.0' });
});

app.use('/api', sosRoutes);
app.use('/api', disasterRoutes);
app.use('/api', rainfallRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
