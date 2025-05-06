"use strict";

const logger = require('../utils/logger');

/**
 * Middleware para registrar solicitudes HTTP
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Siguiente middleware
 */
function requestLogger(req, res, next) {
  // Capturar el tiempo de inicio
  const start = Date.now();
  
  // Cuando la respuesta termine
  res.on('finish', () => {
    // Calcular el tiempo de respuesta
    const responseTime = Date.now() - start;
    logger.logApiRequest(req, res, responseTime);
  });
  
  next();
}

module.exports = requestLogger;
