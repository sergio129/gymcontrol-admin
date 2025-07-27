import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Manejar preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    console.log('Request:', req.method, req.url, req.body);

    // Para testing - respuesta simple
    if (req.url === '/api/health') {
      return res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: 'production'
      });
    }

    // Login básico de testing
    if (req.url === '/api/auth/login' && req.method === 'POST') {
      const { email, password } = req.body || {};
      
      console.log('Login attempt:', { email, password });
      
      if (email === 'admin@gymcontrol.com' && password === 'admin123') {
        return res.status(200).json({
          success: true,
          token: 'test-token-for-vercel',
          user: {
            id: 1,
            email: 'admin@gymcontrol.com',
            name: 'Administrador'
          }
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
    }

    // Respuesta por defecto
    res.status(404).json({ 
      error: 'Endpoint no encontrado',
      path: req.url,
      method: req.method
    });
  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
