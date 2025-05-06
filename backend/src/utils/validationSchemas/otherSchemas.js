"use strict";

const Joi = require('joi');

// Esquemas de validación para otras entidades (ejecuciones, logs, etc.)
const otherSchemas = {
  // Esquema para iniciar una ejecución
  startExecutionSchema: {
    params: Joi.object({
      integrationId: Joi.string().required()
        .messages({
          'string.empty': 'El ID de integración no puede estar vacío',
          'any.required': 'El ID de integración es obligatorio'
        })
    }),
    body: Joi.object({
      executionType: Joi.string().valid('scheduled', 'manual', 'api-triggered').default('manual')
        .messages({
          'any.only': 'El tipo de ejecución debe ser uno de: scheduled, manual, api-triggered'
        }),
      triggeredBy: Joi.string().default('system')
    })
  },
  
  // Esquema para completar una ejecución
  completeExecutionSchema: {
    params: Joi.object({
      executionId: Joi.string().required()
        .messages({
          'string.empty': 'El ID de ejecución no puede estar vacío',
          'any.required': 'El ID de ejecución es obligatorio'
        })
    }),
    body: Joi.object({
      status: Joi.string().required().valid('completed', 'failed', 'warning')
        .messages({
          'any.required': 'El estado es obligatorio',
          'any.only': 'El estado debe ser uno de: completed, failed, warning'
        }),
      resultData: Joi.object().default({})
    })
  },
  
  // Esquema para crear un log
  createLogSchema: {
    body: Joi.object({
      taskId: Joi.string().allow(null),
      executionId: Joi.string().required()
        .messages({
          'string.empty': 'El ID de ejecución no puede estar vacío',
          'any.required': 'El ID de ejecución es obligatorio'
        }),
      integrationId: Joi.string().required()
        .messages({
          'string.empty': 'El ID de integración no puede estar vacío',
          'any.required': 'El ID de integración es obligatorio'
        }),
      level: Joi.string().valid('debug', 'info', 'warning', 'error').default('info')
        .messages({
          'any.only': 'El nivel debe ser uno de: debug, info, warning, error'
        }),
      message: Joi.string().required()
        .messages({
          'string.empty': 'El mensaje no puede estar vacío',
          'any.required': 'El mensaje es obligatorio'
        }),
      details: Joi.any().allow(null),
      source: Joi.string().default('system'),
      context: Joi.object().default({})
    })
  }
};

module.exports = otherSchemas;