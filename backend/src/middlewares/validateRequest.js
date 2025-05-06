"use strict";

/**
 * Middleware para validar datos de solicitudes contra esquemas Joi
 * @param {Object} schema - Esquema Joi para validación
 * @returns {Function} - Middleware de Express
 */
function validateRequest(schema) {
  return (req, res, next) => {
    // Si no se proporciona un esquema, continuar
    if (!schema) {
      return next();
    }

    const validationOptions = {
      abortEarly: false, // Incluir todos los errores
      allowUnknown: true, // Ignorar propiedades desconocidas
      stripUnknown: true // Eliminar propiedades desconocidas
    };

    // Determinar qué parte de la solicitud validar
    const toValidate = {};
    if (schema.body) toValidate.body = req.body;
    if (schema.params) toValidate.params = req.params;
    if (schema.query) toValidate.query = req.query;

    // Realizar validación
    const { error, value } = schema.validate(toValidate, validationOptions);
    
    if (error) {
      // Formatear mensajes de error
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));
      
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors
      });
    }

    // Reemplazar los objetos validados
    if (value.body) req.body = value.body;
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;
    
    next();
  };
}

module.exports = validateRequest;