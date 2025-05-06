"use strict";

const Joi = require('joi');

// Esquemas de validación para integraciones
const integrationSchemas = {
  // Esquema para crear una nueva integración
  createIntegrationSchema: {
    body: Joi.object({
      name: Joi.string().required().trim().min(3).max(100)
        .messages({
          'string.empty': 'El nombre no puede estar vacío',
          'string.min': 'El nombre debe tener al menos {#limit} caracteres',
          'string.max': 'El nombre no puede exceder los {#limit} caracteres',
          'any.required': 'El nombre es obligatorio'
        }),
      description: Joi.string().trim().allow(''),
      type: Joi.string().required().valid('API', 'DATABASE', 'FILE', 'EVENT', 'OTHER')
        .messages({
          'any.required': 'El tipo es obligatorio',
          'any.only': 'El tipo debe ser uno de: API, DATABASE, FILE, EVENT, OTHER'
        }),
      source: Joi.string().required().trim()
        .messages({
          'string.empty': 'La fuente no puede estar vacía',
          'any.required': 'La fuente es obligatoria'
        }),
      destination: Joi.string().required().trim()
        .messages({
          'string.empty': 'El destino no puede estar vacío',
          'any.required': 'El destino es obligatorio'
        }),
      status: Joi.string().valid('active', 'inactive', 'error', 'warning').default('inactive'),
      frequency: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly', 'custom').default('daily'),
      customFrequency: Joi.string().when('frequency', {
        is: 'custom',
        then: Joi.string().required()
          .messages({
            'any.required': 'La frecuencia personalizada es obligatoria cuando la frecuencia es "custom"'
          }),
        otherwise: Joi.string().allow(null, '')
      }),
      config: Joi.object().default({}),
      healthScore: Joi.number().min(0).max(100).default(100),
      owner: Joi.string().allow(null, ''),
      tags: Joi.array().items(Joi.string().trim()).default([])
    })
  },
  
  // Esquema para actualizar una integración existente
  updateIntegrationSchema: {
    params: Joi.object({
      id: Joi.string().required()
        .messages({
          'string.empty': 'El ID no puede estar vacío',
          'any.required': 'El ID es obligatorio'
        })
    }),
    body: Joi.object({
      name: Joi.string().trim().min(3).max(100)
        .messages({
          'string.min': 'El nombre debe tener al menos {#limit} caracteres',
          'string.max': 'El nombre no puede exceder los {#limit} caracteres'
        }),
      description: Joi.string().trim().allow(''),
      type: Joi.string().valid('API', 'DATABASE', 'FILE', 'EVENT', 'OTHER')
        .messages({
          'any.only': 'El tipo debe ser uno de: API, DATABASE, FILE, EVENT, OTHER'
        }),
      source: Joi.string().trim(),
      destination: Joi.string().trim(),
      status: Joi.string().valid('active', 'inactive', 'error', 'warning'),
      frequency: Joi.string().valid('hourly', 'daily', 'weekly', 'monthly', 'custom'),
      customFrequency: Joi.string().when('frequency', {
        is: 'custom',
        then: Joi.string().required()
          .messages({
            'any.required': 'La frecuencia personalizada es obligatoria cuando la frecuencia es "custom"'
          }),
        otherwise: Joi.string().allow(null, '')
      }),
      config: Joi.object(),
      healthScore: Joi.number().min(0).max(100),
      owner: Joi.string().allow(null, ''),
      tags: Joi.array().items(Joi.string().trim())
    }).min(1) // Al menos un campo debe ser proporcionado
      .messages({
        'object.min': 'Se debe proporcionar al menos un campo para actualizar'
      })
  },
  
  // Esquema para actualizar el estado de una integración
  updateStatusSchema: {
    params: Joi.object({
      id: Joi.string().required()
        .messages({
          'string.empty': 'El ID no puede estar vacío',
          'any.required': 'El ID es obligatorio'
        })
    }),
    body: Joi.object({
      status: Joi.string().required().valid('active', 'inactive', 'error', 'warning')
        .messages({
          'any.required': 'El estado es obligatorio',
          'any.only': 'El estado debe ser uno de: active, inactive, error, warning'
        })
    })
  }
};

module.exports = integrationSchemas;