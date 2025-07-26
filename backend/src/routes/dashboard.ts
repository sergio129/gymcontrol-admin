import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Dashboard principal con estadísticas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    
    // Alertas de vencimiento (5 días antes)
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + 5);

    const [
      totalMembers,
      activeMembers,
      inactiveMembers,
      membersWithPaymentsDue,
      membersWithOverduePayments,
      monthlyRevenue,
      totalPaymentsThisMonth,
      unreadAlerts,
      recentPayments
    ] = await Promise.all([
      // Total de afiliados
      prisma.member.count(),
      
      // Afiliados activos
      prisma.member.count({ where: { isActive: true } }),
      
      // Afiliados inactivos
      prisma.member.count({ where: { isActive: false } }),
      
      // Afiliados con pagos próximos a vencer (5 días)
      prisma.member.count({
        where: {
          isActive: true,
          nextPaymentDate: {
            lte: alertDate,
            gte: today
          }
        }
      }),
      
      // Afiliados con pagos vencidos
      prisma.member.count({
        where: {
          isActive: true,
          nextPaymentDate: {
            lt: today
          }
        }
      }),
      
      // Ingresos del mes actual
      prisma.payment.aggregate({
        where: {
          paymentDate: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: {
          amount: true
        }
      }),
      
      // Total de pagos este mes
      prisma.payment.count({
        where: {
          paymentDate: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      
      // Alertas no leídas
      prisma.alert.count({ where: { isRead: false } }),
      
      // Pagos recientes (últimos 5)
      prisma.payment.findMany({
        take: 5,
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
      })
    ]);

    // Estadísticas por tipo de pago este mes
    const paymentsByType = await prisma.payment.groupBy({
      by: ['paymentType'],
      _sum: {
        amount: true
      },
      _count: {
        paymentType: true
      },
      where: {
        paymentDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      }
    });

    // Afiliados próximos a vencer con detalles
    const membersDueSoon = await prisma.member.findMany({
      where: {
        isActive: true,
        nextPaymentDate: {
          lte: alertDate,
          gte: today
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        document: true,
        nextPaymentDate: true,
        monthlyFee: true
      },
      orderBy: { nextPaymentDate: 'asc' },
      take: 10
    });

    // Afiliados con pagos vencidos con detalles
    const membersOverdue = await prisma.member.findMany({
      where: {
        isActive: true,
        nextPaymentDate: {
          lt: today
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        document: true,
        nextPaymentDate: true,
        monthlyFee: true
      },
      orderBy: { nextPaymentDate: 'asc' },
      take: 10
    });

    const dashboard = {
      // Estadísticas generales
      stats: {
        totalMembers,
        activeMembers,
        inactiveMembers,
        membersWithPaymentsDue,
        membersWithOverduePayments,
        monthlyRevenue: Number(monthlyRevenue._sum.amount) || 0,
        totalPaymentsThisMonth,
        unreadAlerts
      },
      
      // Ingresos por tipo de pago
      paymentsByType: paymentsByType.map(pt => ({
        type: pt.paymentType,
        amount: Number(pt._sum.amount) || 0,
        count: pt._count.paymentType
      })),
      
      // Alertas de vencimiento
      alerts: {
        membersDueSoon,
        membersOverdue
      },
      
      // Actividad reciente
      recentPayments
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Estadísticas mensuales
router.get('/monthly-stats/:year', authenticateToken, async (req, res) => {
  try {
    const { year } = req.params;
    const yearNumber = parseInt(year);

    const monthlyStats = [];

    for (let month = 0; month < 12; month++) {
      const startDate = new Date(yearNumber, month, 1);
      const endDate = new Date(yearNumber, month + 1, 0, 23, 59, 59);

      const [revenue, paymentsCount, newMembers] = await Promise.all([
        prisma.payment.aggregate({
          where: {
            paymentDate: {
              gte: startDate,
              lte: endDate
            }
          },
          _sum: {
            amount: true
          }
        }),
        
        prisma.payment.count({
          where: {
            paymentDate: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        
        prisma.member.count({
          where: {
            registrationDate: {
              gte: startDate,
              lte: endDate
            }
          }
        })
      ]);

      monthlyStats.push({
        month: month + 1,
        monthName: new Date(yearNumber, month).toLocaleString('es-ES', { month: 'long' }),
        revenue: Number(revenue._sum.amount) || 0,
        paymentsCount,
        newMembers
      });
    }

    res.json({ year: yearNumber, monthlyStats });
  } catch (error) {
    console.error('Error obteniendo estadísticas mensuales:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

export default router;
