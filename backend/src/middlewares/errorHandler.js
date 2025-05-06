"use strict";

/**
 * Middleware para manejar errores globalmente
 * @param {Error} err - Error capturado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Siguiente middleware
 */
function errorHandler(err, req, res, next) {
  // Registrar el error en la consola
  console.error('Error:', err);
  
  // Preparar la respuesta
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Internal Server Error';
  const errorStack = process.env.NODE_ENV === 'development' ? err.stack : undefined;
  
  // Verificar si es un error de validación de mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }
  
  // Verificar si es un error de cast de MongoDB (ID inválida)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID format'
    });
  }
  
  // Verificar si es un error de datos duplicados
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return res.status(409).json({
      status: 'error',
      message: `Duplicate value: ${field} with value ${value} already exists`
    });
  }
  
  // Error genérico
  res.status(statusCode).json({
    status: 'error',
    message: errorMessage,
    ...(errorStack && { stack: errorStack })
  });
}

module.exports = errorHandler;