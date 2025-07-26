import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const startAlertService = () => {
  console.log('🔔 Servicio de alertas iniciado');

  // Ejecutar diariamente a las 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🔍 Verificando alertas de pagos...');
    await checkPaymentAlerts();
  });

  // También ejecutar al iniciar la aplicación
  checkPaymentAlerts();
};

const checkPaymentAlerts = async () => {
  try {
    const today = new Date();
    const alertDaysBefore = parseInt(process.env.ALERT_DAYS_BEFORE || '5');
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + alertDaysBefore);

    // Limpiar alertas existentes del día
    await prisma.alert.deleteMany({
      where: {
        alertDate: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
        }
      }
    });

    // Buscar afiliados con pagos próximos a vencer
    const membersDueSoon = await prisma.member.findMany({
      where: {
        isActive: true,
        nextPaymentDate: {
          gte: today,
          lte: alertDate
        }
      }
    });

    // Buscar afiliados con pagos vencidos
    const membersOverdue = await prisma.member.findMany({
      where: {
        isActive: true,
        nextPaymentDate: {
          lt: today
        }
      }
    });

    const alertsToCreate = [];

    // Crear alertas para pagos próximos a vencer
    for (const member of membersDueSoon) {
      const daysUntilDue = Math.ceil(
        (member.nextPaymentDate!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      alertsToCreate.push({
        memberId: member.id,
        alertType: 'PAYMENT_DUE_SOON' as const,
        message: `${member.firstName} ${member.lastName} (${member.document}) - Pago vence en ${daysUntilDue} día(s)`,
        alertDate: today
      });
    }

    // Crear alertas para pagos vencidos
    for (const member of membersOverdue) {
      const daysOverdue = Math.ceil(
        (today.getTime() - member.nextPaymentDate!.getTime()) / (1000 * 60 * 60 * 24)
      );

      alertsToCreate.push({
        memberId: member.id,
        alertType: 'PAYMENT_OVERDUE' as const,
        message: `${member.firstName} ${member.lastName} (${member.document}) - Pago vencido hace ${daysOverdue} día(s)`,
        alertDate: today
      });
    }

    // Guardar alertas en la base de datos
    if (alertsToCreate.length > 0) {
      await prisma.alert.createMany({
        data: alertsToCreate
      });

      console.log(`✅ Se crearon ${alertsToCreate.length} alertas de pago`);
    } else {
      console.log('✅ No hay alertas de pago para crear');
    }

    // Log de resumen
    console.log(`📊 Resumen de alertas:
    - Pagos próximos a vencer: ${membersDueSoon.length}
    - Pagos vencidos: ${membersOverdue.length}
    - Total alertas creadas: ${alertsToCreate.length}`);

  } catch (error) {
    console.error('❌ Error verificando alertas de pagos:', error);
  }
};

// Función para crear alerta manual
export const createAlert = async (
  memberId: string,
  alertType: 'PAYMENT_DUE_SOON' | 'PAYMENT_OVERDUE' | 'MEMBER_INACTIVE',
  message: string
) => {
  try {
    const alert = await prisma.alert.create({
      data: {
        memberId,
        alertType,
        message,
        alertDate: new Date()
      }
    });

    return alert;
  } catch (error) {
    console.error('Error creando alerta manual:', error);
    throw error;
  }
};

// Función para obtener alertas por afiliado
export const getAlertsByMember = async (memberId: string) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { memberId },
      orderBy: { alertDate: 'desc' }
    });

    return alerts;
  } catch (error) {
    console.error('Error obteniendo alertas del afiliado:', error);
    throw error;
  }
};
