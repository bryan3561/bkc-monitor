"use strict";

const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const validateRequest = require('../middlewares/validateRequest');
const otherSchemas = require('../utils/validationSchemas/otherSchemas');

// Rutas para logs

/**
 * @route   POST /api/v1/logs
 * @desc    Crear un nuevo log
 * @access  Private
 */
router.post('/',
  validateRequest(otherSchemas.createLogSchema),
  logController.createLog
);

/**
 * @route   GET /api/v1/logs/execution/:executionId
 * @desc    Obtener logs para una ejecución específica
 * @access  Private
 */
router.get('/execution/:executionId',
  logController.getLogsByExecution
);

/**
 * @route   GET /api/v1/logs/task/:taskId
 * @desc    Obtener logs para una tarea específica
 * @access  Private
 */
router.get('/task/:taskId',
  logController.getLogsByTask
);

/**
 * @route   GET /api/v1/logs/integration/:integrationId
 * @desc    Obtener logs para una integración específica
 * @access  Private
 */
router.get('/integration/:integrationId',
  logController.getLogsByIntegration
);

/**
 * @route   GET /api/v1/logs/integration/:integrationId/errors
 * @desc    Obtener errores recientes para una integración
 * @access  Private
 */
router.get('/integration/:integrationId/errors',
  logController.getRecentErrors
);

/**
 * @route   GET /api/v1/logs/integration/:integrationId/distribution
 * @desc    Obtener la distribución de logs por nivel para una integración
 * @access  Private
 */
router.get('/integration/:integrationId/distribution',
  logController.getLogLevelDistribution
);

module.exports = router;