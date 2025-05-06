"use strict";

const Joi = require('joi');

// Esquemas de validación para tareas
const taskSchemas = {
  // Esquema para crear una nueva tarea
  createTaskSchema: {
    body: Joi.object({
      name: Joi.string().required().trim().min(3).max(100)
        .messages({
          'string.empty': 'El nombre no puede estar vacío',
          'string.min': 'El nombre debe tener al menos {#limit} caracteres',
          'string.max': 'El nombre no puede exceder los {#limit} caracteres',
          'any.required': 'El nombre es obligatorio'
        }),
      description: Joi.string().trim().allow(''),
      integrationId: Joi.string().required()
        .messages({
          'string.empty': 'El ID de integración no puede estar vacío',
          'any.required': 'El ID de integración es obligatorio'
        }),
      type: Joi.string().required().valid('extract', 'transform', 'load', 'validate', 'notify', 'custom')
        .messages({
          'any.required': 'El tipo es obligatorio',
          'any.only': 'El tipo debe ser uno de: extract, transform, load, validate, notify, custom'
        }),
      status: Joi.string().valid('pending', 'running', 'completed', 'failed', 'warning', 'skipped').default('pending'),
      order: Joi.number().min(0),
      dependsOn: Joi.array().items(Joi.string()).default([]),
      config: Joi.object().default({}),
      timeout: Joi.number().min(1000).default(3600000), // 1 hora por defecto
      retryStrategy: Joi.object({
        attempts: Joi.number().min(0).default(3),
        backoff: Joi.number().min(1000).default(60000) // 1 minuto por defecto
      }).default({ attempts: 3, backoff: 60000 })
    })
  },
  
  // Esquema para actualizar una tarea existente
  updateTaskSchema: {
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
      type: Joi.string().valid('extract', 'transform', 'load', 'validate', 'notify', 'custom')
        .messages({
          'any.only': 'El tipo debe ser uno de: extract, transform, load, validate, notify, custom'
        }),
      status: Joi.string().valid('pending', 'running', 'completed', 'failed', 'warning', 'skipped'),
      order: Joi.number().min(0),
      dependsOn: Joi.array().items(Joi.string()),
      config: Joi.object(),
      timeout: Joi.number().min(1000),
      retryStrategy: Joi.object({
        attempts: Joi.number().min(0),
        backoff: Joi.number().min(1000)
      })
    }).min(1) // Al menos un campo debe ser proporcionado
      .messages({
        'object.min': 'Se debe proporcionar al menos un campo para actualizar'
      })
  },
  
  // Esquema para actualizar el orden de las tareas
  updateTasksOrderSchema: {
    body: Joi.object({
      tasks: Joi.array().items(
        Joi.object({
          taskId: Joi.string().required()
            .messages({
              'string.empty': 'El ID de la tarea no puede estar vacío',
              'any.required': 'El ID de la tarea es obligatorio'
            }),
          newOrder: Joi.number().min(0).required()
            .messages({
              'number.base': 'El orden debe ser un número',
              'number.min': 'El orden debe ser al menos {#limit}',
              'any.required': 'El orden es obligatorio'
            })
        })
      ).min(1).required()
        .messages({
          'array.min': 'Se debe proporcionar al menos una tarea',
          'any.required': 'Se requiere un array de tareas'
        })
    })
  },
  
  // Esquema para actualizar el estado de una tarea
  updateStatusSchema: {
    params: Joi.object({
      id: Joi.string().required()
        .messages({
          'string.empty': 'El ID no puede estar vacío',
          'any.required': 'El ID es obligatorio'
        })
    }),
    body: Joi.object({
      status: Joi.string().required().valid('pending', 'running', 'completed', 'failed', 'warning', 'skipped')
        .messages({
          'any.required': 'El estado es obligatorio',
          'any.only': 'El estado debe ser uno de: pending, running, completed, failed, warning, skipped'
        })
    })
  }
};

module.exports = taskSchemas;