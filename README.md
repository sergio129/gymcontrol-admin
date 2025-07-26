# GYMControl Admin

Sistema administrativo para gestión de gimnasio desarrollado con React, TypeScript, Node.js y PostgreSQL.

## 🚀 Características

- **Gestión de Afiliados**: CRUD completo con información personal, tipos de membresía y estados
- **Sistema de Pagos**: Registro manual de pagos con cálculo automático de vencimientos
- **Dashboard**: Estadísticas y métricas del gimnasio
- **Alertas**: Notificaciones de pagos vencidos y próximos a vencer
- **Autenticación**: Sistema seguro con JWT
- **Responsive**: Diseño adaptable para desktop y móvil

## 🛠️ Tecnologías

### Frontend
- React 18 con TypeScript
- Tailwind CSS para estilos
- React Router para navegación
- React Hook Form para formularios
- Axios para peticiones HTTP
- React Toastify para notificaciones

### Backend
- Node.js con Express y TypeScript
- Prisma ORM con PostgreSQL
- JWT para autenticación
- Bcrypt para encriptación
- Helmet para seguridad
- Morgan para logs

## 📦 Instalación Local

### Prerequisitos
- Node.js >= 16.0.0
- npm >= 8.0.0
- Base de datos PostgreSQL

### Configuración

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd gymcontrol-admin
```

2. **Instalar dependencias**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. **Configurar variables de entorno**

Backend (`backend/.env`):
```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=tu_api_key"
JWT_SECRET="tu_jwt_secret_muy_seguro"
NODE_ENV="development"
PORT=5000
```

Frontend (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

4. **Configurar base de datos**
```bash
cd backend
npx prisma db push
npm run seed
```

5. **Iniciar en modo desarrollo**
```bash
# Desde la raíz del proyecto
npm run dev
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🌐 Despliegue en Vercel

### Preparación

1. **Conectar repositorio a Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub

2. **Configurar variables de entorno en Vercel**
   
   En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:

   ```
   DATABASE_URL = prisma+postgres://accelerate.prisma-data.net/?api_key=tu_api_key
   JWT_SECRET = tu_jwt_secret_super_seguro_para_produccion
   NODE_ENV = production
   PORT = 3000
   FRONTEND_URL = https://tu-app.vercel.app
   ```

3. **Configurar la base de datos**
   
   Asegúrate de que tu base de datos PostgreSQL esté configurada y ejecuta:
   ```bash
   npx prisma db push
   npm run seed
   ```

### Configuración automática

El proyecto incluye `vercel.json` que configura automáticamente:
- Build del frontend con React
- Deploy del backend como función serverless
- Ruteo correcto entre frontend y API
- Variables de entorno de producción

### Estructura de URLs

Después del despliegue:
- **Frontend**: `https://tu-app.vercel.app`
- **API**: `https://tu-app.vercel.app/api/*`

## 📱 Funcionalidades Principales

### Gestión de Afiliados
- Registro y edición de información personal
- Tipos de membresía: Mensual o Anual  
- Activación/desactivación de usuarios
- Historial de pagos por afiliado
- Cálculo automático de fechas de vencimiento

### Sistema de Pagos
- Registro manual de pagos desde la plataforma
- Búsqueda de afiliados para procesar pagos
- Cálculo automático de próximas fechas de pago
- Diferentes tipos de pago: Mensual, Anual, Inscripción, Multa, Otros
- Historial completo de transacciones

### Dashboard
- Métricas principales del gimnasio
- Afiliados activos/inactivos
- Ingresos mensuales y anuales
- Alertas de pagos vencidos

### Características Técnicas
- **Moneda**: Pesos Colombianos (COP)
- **Idioma**: Español
- **Cálculo de vencimientos**: Basado en fecha de inscripción
- **Seguridad**: Autenticación JWT, rate limiting, helmet
- **Responsivo**: Optimizado para dispositivos móviles

## 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Rate limiting para prevenir ataques
- Helmet para headers de seguridad
- Validación de datos en frontend y backend
- Encriptación de contraseñas con bcrypt

## 📚 Estructura del Proyecto

```
gymcontrol-admin/
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios para API
│   │   ├── types/         # Interfaces TypeScript
│   │   └── utils/         # Utilidades
├── backend/               # API Node.js
│   ├── src/
│   │   ├── routes/        # Rutas de la API
│   │   ├── middleware/    # Middlewares
│   │   ├── services/      # Lógica de negocio
│   │   └── prisma/        # Schema de base de datos
└── vercel.json           # Configuración de Vercel
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev                # Inicia frontend y backend
npm run dev:frontend      # Solo frontend
npm run dev:backend       # Solo backend

# Producción
npm run build             # Build completo
npm run build:frontend    # Build solo frontend
npm run build:backend     # Build solo backend
```

## 📋 Notas Importantes

- **Pagos Electrónicos**: No implementados aún. Actualmente solo soporta pagos manuales.
- **Cron Jobs**: Las alertas automáticas están deshabilitadas en Vercel (serverless).
- **Base de Datos**: Usa Prisma Accelerate para mejor rendimiento en producción.
- **Límites**: Rate limiting configurado para 100 requests/15min en producción.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas sobre el proyecto, por favor abre un issue en GitHub.

---

Desarrollado con ❤️ para la gestión eficiente de gimnasios

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
