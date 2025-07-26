import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  adminId?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token de acceso requerido' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: 'Error de configuración del servidor' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as { adminId: string };
    
    // Verificar que el admin existe
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId }
    });

    if (!admin) {
      res.status(401).json({ message: 'Token inválido' });
      return;
    }

    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    res.status(403).json({ message: 'Token inválido' });
  }
};
