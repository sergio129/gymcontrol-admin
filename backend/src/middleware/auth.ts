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
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const decoded = jwt.verify(token, jwtSecret) as { adminId: string };
    
    // Verificar que el admin existe
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Token inválido' });
    }

    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(403).json({ message: 'Token inválido' });
  }
};
