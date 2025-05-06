"use strict";

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio de logs existe
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configuración de formatos
const { format } = winston;
const logFormat = format.printf(({ level, message, timestamp, ...meta }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
  }`;
});

// Crear el logger con winston
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    logFormat
  ),
  defaultMeta: { service: 'bkc-monitor-api' },
  transports: [
    // Escribir logs de nivel error a error.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
    // Escribir todos los logs a combined.log
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    })
  ]
});

// Si no estamos en producción, también log a la consola
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.simple()
    )
  }));
}

// Agregar algunos métodos de ayuda
logger.logApiRequest = (req, res, responseTime) => {
  const { method, originalUrl, ip, body } = req;
  logger.info(`API Request - ${method} ${originalUrl}`, {
    method,
    url: originalUrl,
    ip,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ...(Object.keys(body).length > 0 && process.env.NODE_ENV !== 'production' 
      ? { body } 
      : {})
  });
};

logger.logApiError = (req, err) => {
  const { method, originalUrl, ip, body } = req;
  logger.error(`API Error - ${method} ${originalUrl}`, {
    method,
    url: originalUrl,
    ip,
    errorMessage: err.message,
    errorStack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    ...(Object.keys(body).length > 0 && process.env.NODE_ENV !== 'production' 
      ? { body } 
      : {})
  });
};

// Capturar excepciones y rechazos de promesas no manejados
logger.exceptions.handle(
  new winston.transports.File({ 
    filename: path.join(logDir, 'exceptions.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  })
);

if (process.env.NODE_ENV !== 'production') {
  logger.exceptions.handle(
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      )
    })
  );
}

// Exportar el logger
module.exports = logger;