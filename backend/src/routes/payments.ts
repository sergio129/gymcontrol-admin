import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Obtener pagos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, memberId, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (memberId) {
      where.memberId = memberId as string;
    }

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) {
        where.paymentDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.paymentDate.lte = new Date(endDate as string);
      }
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { paymentDate: 'desc' },
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              document: true
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      payments,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo pagos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener pago por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        member: true
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error obteniendo pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Registrar nuevo pago
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { memberId, amount, paymentType = 'MONTHLY', paymentDate, description } = req.body;

    if (!memberId || !amount) {
      return res.status(400).json({ 
        message: 'ID del afiliado y monto son requeridos' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        message: 'El monto debe ser mayor a 0' 
      });
    }

    // Verificar que el afiliado existe
    const member = await prisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return res.status(404).json({ message: 'Afiliado no encontrado' });
    }

    const paymentDateObj = paymentDate ? new Date(paymentDate) : new Date();
    let nextPaymentDate: Date | null = null;

    // Calcular próxima fecha de pago basada en la fecha de registro y tipo de membresía
    if (paymentType === 'MONTHLY' || paymentType === 'ANNUAL') {
      const registrationDate = new Date(member.registrationDate);
      nextPaymentDate = new Date(registrationDate);
      
      if (paymentType === 'ANNUAL') {
        // Para pagos anuales, buscar el próximo aniversario después de la fecha de pago
        while (nextPaymentDate <= paymentDateObj) {
          nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
        }
      } else {
        // Para pagos mensuales, buscar el próximo mes después de la fecha de pago
        while (nextPaymentDate <= paymentDateObj) {
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }
      }
    }

    // Crear el pago y actualizar el afiliado en una transacción
    const result = await prisma.$transaction(async (tx: any) => {
      // Crear pago
      const payment = await tx.payment.create({
        data: {
          memberId,
          amount: Number(amount),
          paymentType,
          description: description || null,
          paymentDate: paymentDateObj
        }
      });

      // Actualizar fechas en el afiliado si es pago mensual o anual
      if (paymentType === 'MONTHLY' || paymentType === 'ANNUAL') {
        await tx.member.update({
          where: { id: memberId },
          data: {
            lastPaymentDate: paymentDateObj,
            nextPaymentDate
          }
        });
      }

      return payment;
    });

    const paymentWithMember = await prisma.payment.findUnique({
      where: { id: result.id },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            document: true
          }
        }
      }
    });

    res.status(201).json(paymentWithMember);
  } catch (error) {
    console.error('Error registrando pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar pago
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, paymentType, description } = req.body;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        amount: amount ? Number(amount) : undefined,
        paymentType: paymentType || undefined,
        description: description !== undefined ? description : undefined
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            document: true
          }
        }
      }
    });

    res.json(payment);
  } catch (error) {
    console.error('Error actualizando pago:', error);
    if ((error as any).code === 'P2025') {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Eliminar pago
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información del pago antes de eliminarlo
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { member: true }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    await prisma.$transaction(async (tx) => {
      // Eliminar el pago
      await tx.payment.delete({
        where: { id }
      });

      // Si era un pago mensual, recalcular fechas del afiliado
      if (payment.paymentType === 'MONTHLY') {
        const lastMonthlyPayment = await tx.payment.findFirst({
          where: {
            memberId: payment.memberId,
            paymentType: 'MONTHLY'
          },
          orderBy: { paymentDate: 'desc' }
        });

        let lastPaymentDate: Date | null = null;
        let nextPaymentDate: Date | null = null;

        if (lastMonthlyPayment) {
          lastPaymentDate = lastMonthlyPayment.paymentDate;
          nextPaymentDate = new Date(lastPaymentDate);
          nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        }

        await tx.member.update({
          where: { id: payment.memberId },
          data: {
            lastPaymentDate,
            nextPaymentDate
          }
        });
      }
    });

    res.json({ message: 'Pago eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando pago:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener resumen de pagos por mes
router.get('/reports/monthly', authenticateToken, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;
    
    const startDate = new Date(Number(year), month ? Number(month) - 1 : 0, 1);
    const endDate = month 
      ? new Date(Number(year), Number(month), 0, 23, 59, 59)
      : new Date(Number(year), 11, 31, 23, 59, 59);

    const payments = await prisma.payment.findMany({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
            document: true
          }
        }
      }
    });

    const summary = {
      totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      totalPayments: payments.length,
      paymentsByType: payments.reduce((acc: any, p) => {
        acc[p.paymentType] = (acc[p.paymentType] || 0) + 1;
        return acc;
      }, {}),
      payments
    };

    res.json(summary);
  } catch (error) {
    console.error('Error obteniendo reporte mensual:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
