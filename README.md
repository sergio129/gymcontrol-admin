# GYMControl Admin

Sistema administrativo para control de afiliados y pagos de gimnasio.

## Tecnologías

- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS
- **Base de datos**: PostgreSQL
- **ORM**: Prisma

## Estructura del proyecto

```
gymcontrol-admin/
├── backend/          # API REST con Express
├── frontend/         # Aplicación React
└── README.md
```

## Funcionalidades

- 🔐 Autenticación de administrador
- 👥 Gestión de afiliados
- 💳 Control de pagos
- 🛎️ Sistema de alertas automáticas
- 📊 Dashboard administrativo

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno en backend/.env

3. Ejecutar migraciones de base de datos:
```bash
cd backend
npx prisma migrate dev
```

4. Iniciar el proyecto:
```bash
npm run dev
```

## URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
