"use strict";

const integrationService = require('../services/integrationService');

// Controlador para manejar las operaciones de integración
class IntegrationController {
  /**
   * Crea una nueva integración
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async createIntegration(req, res, next) {
    try {
      const integrationData = req.body;
      const newIntegration = await integrationService.createIntegration(integrationData);
      
      res.status(201).json({
        status: 'success',
        message: 'Integration created successfully',
        data: newIntegration
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene todas las integraciones con filtros opcionales
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getAllIntegrations(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        type: req.query.type,
        tags: req.query.tags ? req.query.tags.split(',') : undefined,
        search: req.query.search
      };
      
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder || 'asc'
      };
      
      const result = await integrationService.getAllIntegrations(filters, options);
      
      res.status(200).json({
        status: 'success',
        message: 'Integrations retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una integración por su ID
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getIntegrationById(req, res, next) {
    try {
      const integrationId = req.params.id;
      const integration = await integrationService.getIntegrationById(integrationId);
      
      res.status(200).json({
        status: 'success',
        message: 'Integration retrieved successfully',
        data: integration
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una integración existente
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async updateIntegration(req, res, next) {
    try {
      const integrationId = req.params.id;
      const updateData = req.body;
      const updatedIntegration = await integrationService.updateIntegration(integrationId, updateData);
      
      res.status(200).json({
        status: 'success',
        message: 'Integration updated successfully',
        data: updatedIntegration
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una integración por su ID
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async deleteIntegration(req, res, next) {
    try {
      const integrationId = req.params.id;
      const result = await integrationService.deleteIntegration(integrationId);
      
      res.status(200).json({
        status: 'success',
        message: 'Integration deleted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el estado de una integración
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async updateIntegrationStatus(req, res, next) {
    try {
      const integrationId = req.params.id;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Status is required'
        });
      }
      
      const updatedIntegration = await integrationService.updateIntegrationStatus(integrationId, status);
      
      res.status(200).json({
        status: 'success',
        message: 'Integration status updated successfully',
        data: updatedIntegration
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene estadísticas de integraciones
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getIntegrationStats(req, res, next) {
    try {
      const stats = await integrationService.getIntegrationStats();
      
      res.status(200).json({
        status: 'success',
        message: 'Integration stats retrieved successfully',
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IntegrationController();