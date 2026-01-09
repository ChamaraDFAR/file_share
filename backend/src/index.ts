import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fileRoutes from './routes/file.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import contactRoutes from './routes/contact.routes';
import sendRoutes from './routes/send.routes';
import logRoutes from './routes/log.routes';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api', rateLimiter(60000, 100)); // 100 requests per minute

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/files', fileRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/send', sendRoutes);
app.use('/api/logs', logRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
