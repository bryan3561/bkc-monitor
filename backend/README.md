# BKC-Monitor Backend API

API para gestionar y monitorizar integraciones de sistemas.

## Requisitos previos

- Node.js (v16.x o superior)
- MongoDB (v5.x o superior)
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone <repo-url>
cd bkc-monitor/backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
   - Copiar el archivo `.env.example` a `.env`
   - Editar el archivo `.env` con los valores correspondientes

## Scripts disponibles

- `npm start`: Inicia el servidor en modo producción
- `npm run dev`: Inicia el servidor en modo desarrollo con recarga automática
- `npm run seed`: Pobla la base de datos con datos de prueba
- `npm test`: Ejecuta los tests
- `npm run lint`: Ejecuta el linter para verificar el código
- `npm run lint:fix`: Ejecuta el linter y corrige problemas automáticamente

## Endpoints de la API

### Integraciones

- `GET /api/v1/integrations`: Obtiene todas las integraciones
- `GET /api/v1/integrations/:id`: Obtiene una integración por ID
- `POST /api/v1/integrations`: Crea una nueva integración
- `PUT /api/v1/integrations/:id`: Actualiza una integración existente
- `DELETE /api/v1/integrations/:id`: Elimina una integración
- `PATCH /api/v1/integrations/:id/status`: Actualiza el estado de una integración
- `GET /api/v1/integrations/stats/overview`: Obtiene estadísticas de las integraciones

### Tareas

- `GET /api/v1/tasks/integration/:integrationId`: Obtiene todas las tareas para una integración
- `GET /api/v1/tasks/:id`: Obtiene una tarea por ID
- `POST /api/v1/tasks`: Crea una nueva tarea
- `PUT /api/v1/tasks/:id`: Actualiza una tarea existente
- `DELETE /api/v1/tasks/:id`: Elimina una tarea
- `PUT /api/v1/tasks/order/update`: Actualiza el orden de múltiples tareas
- `PATCH /api/v1/tasks/:id/status`: Actualiza el estado de una tarea

### Ejecuciones

- `POST /api/v1/executions/integration/:integrationId`: Inicia una nueva ejecución
- `PUT /api/v1/executions/:executionId/complete`: Completa una ejecución existente
- `GET /api/v1/executions/integration/:integrationId`: Obtiene ejecuciones para una integración
- `GET /api/v1/executions/:executionId`: Obtiene una ejecución por ID
- `GET /api/v1/executions/recent/all`: Obtiene ejecuciones recientes de todas las integraciones
- `PUT /api/v1/executions/:executionId/cancel`: Cancela una ejecución en curso

### Logs

- `POST /api/v1/logs`: Crea un nuevo log
- `GET /api/v1/logs/execution/:executionId`: Obtiene logs para una ejecución
- `GET /api/v1/logs/task/:taskId`: Obtiene logs para una tarea
- `GET /api/v1/logs/integration/:integrationId`: Obtiene logs para una integración
- `GET /api/v1/logs/integration/:integrationId/errors`: Obtiene errores recientes para una integración
- `GET /api/v1/logs/integration/:integrationId/distribution`: Obtiene la distribución de logs por nivel

## Estructura del proyecto

```
backend/
├── config/             # Configuraciones (BD, etc.)
├── logs/               # Archivos de logs (generados)
├── scripts/            # Scripts de utilidad
├── src/
│   ├── controllers/    # Controladores de la API
│   ├── middlewares/    # Middlewares personalizados
│   ├── models/         # Modelos de datos (Mongoose)
│   ├── routes/         # Definición de rutas
│   ├── services/       # Lógica de negocio
│   ├── utils/          # Utilidades y helpers
│   └── index.js        # Punto de entrada
├── .env                # Variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## Licencia

Este proyecto está bajo licencia ISC.
