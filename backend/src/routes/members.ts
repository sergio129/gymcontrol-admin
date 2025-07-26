import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Obtener todos los afiliados
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', isActive } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { document: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          payments: {
            orderBy: { paymentDate: 'desc' },
            take: 1
          },
          _count: {
            select: { payments: true }
          }
        }
      }),
      prisma.member.count({ where })
    ]);

    res.json({
      members,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo afiliados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener afiliado por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    if (!member) {
      return res.status(404).json({ message: 'Afiliado no encontrado' });
    }

    res.json(member);
  } catch (error) {
    console.error('Error obteniendo afiliado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Crear nuevo afiliado
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      document,
      email,
      phone,
      address,
      birthDate,
      monthlyFee,
      notes
    } = req.body;

    if (!firstName || !lastName || !document) {
      return res.status(400).json({ 
        message: 'Nombre, apellido y documento son requeridos' 
      });
    }

    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        document,
        email: email || null,
        phone: phone || null,
        address: address || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        monthlyFee: monthlyFee || 0,
        notes: notes || null
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error creando afiliado:', error);
    if ((error as any).code === 'P2002') {
      return res.status(400).json({ 
        message: 'Ya existe un afiliado con ese documento o email' 
      });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar afiliado
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      document,
      email,
      phone,
      address,
      birthDate,
      monthlyFee,
      notes,
      isActive
    } = req.body;

    const member = await prisma.member.update({
      where: { id },
      data: {
        firstName,
        lastName,
        document,
        email: email || null,
        phone: phone || null,
        address: address || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        monthlyFee: monthlyFee || 0,
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    res.json(member);
  } catch (error) {
    console.error('Error actualizando afiliado:', error);
    if ((error as any).code === 'P2002') {
      return res.status(400).json({ 
        message: 'Ya existe un afiliado con ese documento o email' 
      });
    }
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: 'Afiliado no encontrado' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar afiliado
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.member.delete({
      where: { id }
    });

    res.json({ message: 'Afiliado eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando afiliado:', error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: 'Afiliado no encontrado' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Activar/Desactivar afiliado
router.patch('/:id/toggle-status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const member = await prisma.member.findUnique({
      where: { id }
    });

    if (!member) {
      return res.status(404).json({ message: 'Afiliado no encontrado' });
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: { isActive: !member.isActive }
    });

    res.json(updatedMember);
  } catch (error) {
    console.error('Error cambiando estado del afiliado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
