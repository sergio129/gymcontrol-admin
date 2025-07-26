import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todas las alertas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, isRead } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { alertDate: 'desc' }
      }),
      prisma.alert.count({ where })
    ]);

    res.json({
      alerts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Marcar alerta como leída
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await prisma.alert.update({
      where: { id },
      data: { isRead: true }
    });

    res.json(alert);
  } catch (error) {
    console.error('Error marcando alerta como leída:', error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: 'Alerta no encontrada' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Marcar todas las alertas como leídas
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const result = await prisma.alert.updateMany({
      where: { isRead: false },
      data: { isRead: true }
    });

    res.json({ 
      message: 'Todas las alertas han sido marcadas como leídas',
      count: result.count 
    });
  } catch (error) {
    console.error('Error marcando todas las alertas como leídas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar alerta
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.alert.delete({
      where: { id }
    });

    res.json({ message: 'Alerta eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando alerta:', error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: 'Alerta no encontrada' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar alertas leídas
router.delete('/read/all', authenticateToken, async (req, res) => {
  try {
    const result = await prisma.alert.deleteMany({
      where: { isRead: true }
    });

    res.json({ 
      message: 'Alertas leídas eliminadas exitosamente',
      count: result.count 
    });
  } catch (error) {
    console.error('Error eliminando alertas leídas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener resumen de alertas
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const [totalAlerts, unreadAlerts, alertsByType] = await Promise.all([
      prisma.alert.count(),
      prisma.alert.count({ where: { isRead: false } }),
      prisma.alert.groupBy({
        by: ['alertType'],
        _count: { alertType: true },
        where: { isRead: false }
      })
    ]);

    const summary = {
      total: totalAlerts,
      unread: unreadAlerts,
      byType: alertsByType.reduce((acc: any, item) => {
        acc[item.alertType] = item._count.alertType;
        return acc;
      }, {})
    };

    res.json(summary);
  } catch (error) {
    console.error('Error obteniendo resumen de alertas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
