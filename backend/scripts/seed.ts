import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Verificar si ya existe un administrador
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: 'admin@gymcontrol.com' }
    });

    if (existingAdmin) {
      console.log('El administrador ya existe en la base de datos');
      return;
    }

    // Crear el usuario administrador por defecto
    const hashedPassword = await bcryptjs.hash('admin123', 10);
    
    const admin = await prisma.admin.create({
      data: {
        email: 'admin@gymcontrol.com',
        password: hashedPassword,
        name: 'Administrador'
      }
    });

    console.log('✅ Usuario administrador creado exitosamente:');
    console.log('📧 Email: admin@gymcontrol.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Nombre:', admin.name);

    // Crear algunos miembros de ejemplo
    const members = await prisma.member.createMany({
      data: [
        {
          firstName: 'Juan',
          lastName: 'Pérez',
          document: '12345678',
          email: 'juan.perez@email.com',
          phone: '123-456-7890',
          address: 'Calle 123, Ciudad',
          monthlyFee: 80000.00, // 80,000 COP
          isActive: true
        },
        {
          firstName: 'Ana',
          lastName: 'García',
          document: '87654321',
          email: 'ana.garcia@email.com',
          phone: '123-456-7892',
          address: 'Avenida 456, Ciudad',
          monthlyFee: 100000.00, // 100,000 COP
          registrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
          isActive: true
        },
        {
          firstName: 'Carlos',
          lastName: 'López',
          document: '11223344',
          email: 'carlos.lopez@email.com',
          phone: '123-456-7894',
          address: 'Plaza 789, Ciudad',
          monthlyFee: 90000.00, // 90,000 COP
          registrationDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 días atrás
          isActive: false
        }
      ]
    });

    console.log(`✅ ${members.count} miembros de ejemplo creados`);

    // Crear algunos pagos de ejemplo
    const membersData = await prisma.member.findMany();
    
    for (const member of membersData) {
      // Crear pago del mes actual
      await prisma.payment.create({
        data: {
          memberId: member.id,
          amount: member.monthlyFee,
          paymentDate: new Date(),
          paymentType: 'MONTHLY',
          description: 'Pago mensual'
        }
      });

      // Si el miembro tiene más de 30 días, crear pago anterior
      if (member.registrationDate < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) {
        await prisma.payment.create({
          data: {
            memberId: member.id,
            amount: member.monthlyFee,
            paymentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            paymentType: 'MONTHLY',
            description: 'Pago mes anterior'
          }
        });
      }
    }

    console.log('✅ Pagos de ejemplo creados');

    // Crear algunas alertas de ejemplo
    const inactiveMembers = await prisma.member.findMany({
      where: { isActive: false }
    });

    for (const member of inactiveMembers) {
      await prisma.alert.create({
        data: {
          memberId: member.id,
          alertType: 'MEMBER_INACTIVE',
          message: `El miembro ${member.firstName} ${member.lastName} está inactivo`,
          isRead: false
        }
      });
    }

    console.log('✅ Alertas de ejemplo creadas');
    console.log('\n🎉 Base de datos inicializada correctamente!');

  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
