import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import memberRoutes from './routes/members';
import paymentRoutes from './routes/payments';
import alertRoutes from './routes/alerts';
import dashboardRoutes from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';
import { getCorsConfig } from './config/cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configurado para Vercel
app.use(cors(getCorsConfig()));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 100 : 1000 // más límite en desarrollo
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Manejo de errores
app.use(errorHandler);

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Para Vercel, exportar la app
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  // Solo iniciar servidor en desarrollo
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV}`);
    
    // En desarrollo, podemos iniciar servicios adicionales
    // startAlertService(); // Deshabilitado para Vercel
  });
}

export default app;
