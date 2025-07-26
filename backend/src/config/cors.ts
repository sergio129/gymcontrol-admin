// Configuración de CORS para Vercel
export const corsConfig = {
  production: {
    origin: [
      'https://gymcontrol-admin.vercel.app',
      'https://gymcontrol-admin-*.vercel.app',
      /\.vercel\.app$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },
  development: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
};

export const getCorsConfig = () => {
  return process.env.NODE_ENV === 'production' 
    ? corsConfig.production 
    : corsConfig.development;
};
