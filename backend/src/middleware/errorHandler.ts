import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Error de validación de Prisma
  if (error.code === 'P2002') {
    return res.status(400).json({
      message: 'Ya existe un registro con estos datos únicos',
      error: 'Duplicate field'
    });
  }

  // Error de registro no encontrado
  if (error.code === 'P2025') {
    return res.status(404).json({
      message: 'Registro no encontrado',
      error: 'Record not found'
    });
  }

  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token inválido',
      error: 'Invalid token'
    });
  }

  // Error de JWT expirado
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expirado',
      error: 'Token expired'
    });
  }

  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Datos de entrada inválidos',
      error: error.message
    });
  }

  // Error genérico del servidor
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
};
