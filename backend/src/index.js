"use strict";

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// Importar logger
const logger = require('./utils/logger');

// Importar conexión a la base de datos
const database = require('../config/database');

// Importar módulos de rutas
const integrationRoutes = require('./routes/integrationRoutes');
const taskRoutes = require('./routes/taskRoutes');
const executionRoutes = require('./routes/executionRoutes');
const logRoutes = require('./routes/logRoutes');

// Importar middleware personalizado
const errorHandler = require('./middlewares/errorHandler');
const requestLogger = require('./middlewares/requestLogger');

// Inicializar la aplicación
const app = express();

// Configuración de middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));
app.use(requestLogger);

// Rutas de la API
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/executions', executionRoutes);
app.use('/api/v1/logs', logRoutes);

// Ruta para verificar que el servidor está ejecutándose
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'BKC Monitor API running',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Conexión a la base de datos e iniciar el servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await database.connect();
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      logger.info(`Servidor iniciado en el puerto ${PORT}`);
      logger.info(`Entorno: ${process.env.NODE_ENV}`);
      logger.info(`Base de datos conectada: ${database.getDbUri()}`);
    });
  } catch (error) {
    logger.error(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

// Manejar señales para una salida limpia
process.on('SIGINT', async () => {
  logger.info('Señal SIGINT recibida. Cerrando el servidor...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Señal SIGTERM recibida. Cerrando el servidor...');
  await database.disconnect();
  process.exit(0);
});

// Iniciar el servidor
startServer();

module.exports = app; // Para pruebas
