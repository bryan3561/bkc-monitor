"use strict";

const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const validateRequest = require('../middlewares/validateRequest');
const integrationSchemas = require('../utils/validationSchemas/integrationSchemas');

// Rutas para integraciones

/**
 * @route   POST /api/v1/integrations
 * @desc    Crear una nueva integración
 * @access  Private
 */
router.post('/',
  validateRequest(integrationSchemas.createIntegrationSchema),
  integrationController.createIntegration
);

/**
 * @route   GET /api/v1/integrations
 * @desc    Obtener todas las integraciones con filtros opcionales
 * @access  Private
 */
router.get('/',
  integrationController.getAllIntegrations
);

/**
 * @route   GET /api/v1/integrations/:id
 * @desc    Obtener una integración por su ID
 * @access  Private
 */
router.get('/:id',
  integrationController.getIntegrationById
);

/**
 * @route   PUT /api/v1/integrations/:id
 * @desc    Actualizar una integración existente
 * @access  Private
 */
router.put('/:id',
  validateRequest(integrationSchemas.updateIntegrationSchema),
  integrationController.updateIntegration
);

/**
 * @route   DELETE /api/v1/integrations/:id
 * @desc    Eliminar una integración por su ID
 * @access  Private
 */
router.delete('/:id',
  integrationController.deleteIntegration
);

/**
 * @route   PATCH /api/v1/integrations/:id/status
 * @desc    Actualizar el estado de una integración
 * @access  Private
 */
router.patch('/:id/status',
  validateRequest(integrationSchemas.updateStatusSchema),
  integrationController.updateIntegrationStatus
);

/**
 * @route   GET /api/v1/integrations/stats
 * @desc    Obtener estadísticas de integraciones
 * @access  Private
 */
router.get('/stats/overview',
  integrationController.getIntegrationStats
);

module.exports = router;