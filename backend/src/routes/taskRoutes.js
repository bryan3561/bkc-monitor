"use strict";

const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const validateRequest = require('../middlewares/validateRequest');
const taskSchemas = require('../utils/validationSchemas/taskSchemas');

// Rutas para tareas

/**
 * @route   POST /api/v1/tasks
 * @desc    Crear una nueva tarea
 * @access  Private
 */
router.post('/',
  validateRequest(taskSchemas.createTaskSchema),
  taskController.createTask
);

/**
 * @route   GET /api/v1/tasks/integration/:integrationId
 * @desc    Obtener todas las tareas para una integración específica
 * @access  Private
 */
router.get('/integration/:integrationId',
  taskController.getTasksByIntegration
);

/**
 * @route   GET /api/v1/tasks/:id
 * @desc    Obtener una tarea por su ID
 * @access  Private
 */
router.get('/:id',
  taskController.getTaskById
);

/**
 * @route   PUT /api/v1/tasks/:id
 * @desc    Actualizar una tarea existente
 * @access  Private
 */
router.put('/:id',
  validateRequest(taskSchemas.updateTaskSchema),
  taskController.updateTask
);

/**
 * @route   DELETE /api/v1/tasks/:id
 * @desc    Eliminar una tarea por su ID
 * @access  Private
 */
router.delete('/:id',
  taskController.deleteTask
);

/**
 * @route   PUT /api/v1/tasks/order
 * @desc    Actualizar el orden de múltiples tareas
 * @access  Private
 */
router.put('/order/update',
  validateRequest(taskSchemas.updateTasksOrderSchema),
  taskController.updateTasksOrder
);

/**
 * @route   PATCH /api/v1/tasks/:id/status
 * @desc    Actualizar el estado de una tarea
 * @access  Private
 */
router.patch('/:id/status',
  validateRequest(taskSchemas.updateStatusSchema),
  taskController.updateTaskStatus
);

module.exports = router;