import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  try {
    // Crear administrador por defecto
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.admin.upsert({
      where: { email: 'admin@gymcontrol.com' },
      update: {},
      create: {
        email: 'admin@gymcontrol.com',
        password: adminPassword,
        name: 'Administrador Principal'
      }
    });

    console.log('✅ Admin creado:', admin.email);

    // Crear algunos afiliados de ejemplo
    const members = await Promise.all([
      prisma.member.upsert({
        where: { document: '12345678' },
        update: {},
        create: {
          firstName: 'Juan',
          lastName: 'Pérez',
          document: '12345678',
          email: 'juan.perez@email.com',
          phone: '+54 9 11 1234-5678',
          address: 'Av. Corrientes 1234, CABA',
          birthDate: new Date('1990-05-15'),
          monthlyFee: 5000,
          lastPaymentDate: new Date('2024-12-01'),
          nextPaymentDate: new Date('2025-01-01'),
          isActive: true
        }
      }),
      
      prisma.member.upsert({
        where: { document: '87654321' },
        update: {},
        create: {
          firstName: 'María',
          lastName: 'González',
          document: '87654321',
          email: 'maria.gonzalez@email.com',
          phone: '+54 9 11 8765-4321',
          address: 'Av. Santa Fe 5678, CABA',
          birthDate: new Date('1985-08-22'),
          monthlyFee: 6000,
          lastPaymentDate: new Date('2024-11-15'),
          nextPaymentDate: new Date('2024-12-15'),
          isActive: true
        }
      }),

      prisma.member.upsert({
        where: { document: '11223344' },
        update: {},
        create: {
          firstName: 'Carlos',
          lastName: 'Rodríguez',
          document: '11223344',
          email: 'carlos.rodriguez@email.com',
          phone: '+54 9 11 1122-3344',
          address: 'Av. Rivadavia 9999, CABA',
          birthDate: new Date('1988-12-10'),
          monthlyFee: 4500,
          lastPaymentDate: new Date('2024-10-20'),
          nextPaymentDate: new Date('2024-11-20'),
          isActive: true
        }
      }),

      prisma.member.upsert({
        where: { document: '99887766' },
        update: {},
        create: {
          firstName: 'Ana',
          lastName: 'Martínez',
          document: '99887766',
          email: 'ana.martinez@email.com',
          phone: '+54 9 11 9988-7766',
          address: 'Av. Cabildo 2468, CABA',
          birthDate: new Date('1992-03-07'),
          monthlyFee: 5500,
          isActive: false
        }
      })
    ]);

    console.log(`✅ ${members.length} afiliados creados`);

    // Crear algunos pagos de ejemplo
    const juan = await prisma.member.findUnique({ where: { document: '12345678' } });
    const maria = await prisma.member.findUnique({ where: { document: '87654321' } });

    if (juan && maria) {
      const payments = await Promise.all([
        // Pagos de Juan
        prisma.payment.create({
          data: {
            memberId: juan.id,
            amount: 5000,
            paymentType: 'MONTHLY',
            paymentDate: new Date('2024-12-01'),
            description: 'Pago mensual diciembre'
          }
        }),
        
        prisma.payment.create({
          data: {
            memberId: juan.id,
            amount: 5000,
            paymentType: 'MONTHLY',
            paymentDate: new Date('2024-11-01'),
            description: 'Pago mensual noviembre'
          }
        }),

        // Pagos de María
        prisma.payment.create({
          data: {
            memberId: maria.id,
            amount: 6000,
            paymentType: 'MONTHLY',
            paymentDate: new Date('2024-11-15'),
            description: 'Pago mensual noviembre'
          }
        }),

        prisma.payment.create({
          data: {
            memberId: maria.id,
            amount: 6000,
            paymentType: 'MONTHLY',
            paymentDate: new Date('2024-10-15'),
            description: 'Pago mensual octubre'
          }
        })
      ]);

      console.log(`✅ ${payments.length} pagos creados`);
    }

    console.log('🎉 Seed completado exitosamente');
    
    console.log('\n📋 Datos de acceso:');
    console.log('Email: admin@gymcontrol.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
