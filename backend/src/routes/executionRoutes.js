"use strict";

const express = require('express');
const router = express.Router();
const executionController = require('../controllers/executionController');
const validateRequest = require('../middlewares/validateRequest');
const otherSchemas = require('../utils/validationSchemas/otherSchemas');

// Rutas para ejecuciones

/**
 * @route   POST /api/v1/executions/integration/:integrationId
 * @desc    Iniciar una nueva ejecución para una integración
 * @access  Private
 */
router.post('/integration/:integrationId',
  validateRequest(otherSchemas.startExecutionSchema),
  executionController.startExecution
);

/**
 * @route   PUT /api/v1/executions/:executionId/complete
 * @desc    Completar una ejecución existente
 * @access  Private
 */
router.put('/:executionId/complete',
  validateRequest(otherSchemas.completeExecutionSchema),
  executionController.completeExecution
);

/**
 * @route   GET /api/v1/executions/integration/:integrationId
 * @desc    Obtener ejecuciones para una integración específica
 * @access  Private
 */
router.get('/integration/:integrationId',
  executionController.getExecutionsByIntegration
);

/**
 * @route   GET /api/v1/executions/:executionId
 * @desc    Obtener una ejecución por su ID
 * @access  Private
 */
router.get('/:executionId',
  executionController.getExecutionById
);

/**
 * @route   GET /api/v1/executions/recent
 * @desc    Obtener ejecuciones recientes de todas las integraciones
 * @access  Private
 */
router.get('/recent/all',
  executionController.getRecentExecutions
);

/**
 * @route   PUT /api/v1/executions/:executionId/cancel
 * @desc    Cancelar una ejecución en curso
 * @access  Private
 */
router.put('/:executionId/cancel',
  executionController.cancelExecution
);

module.exports = router;