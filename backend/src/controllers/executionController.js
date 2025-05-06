"use strict";

const executionService = require('../services/executionService');

// Controlador para manejar las operaciones de ejecuciones
class ExecutionController {
  /**
   * Inicia una nueva ejecución para una integración
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async startExecution(req, res, next) {
    try {
      const { integrationId } = req.params;
      const { executionType, triggeredBy } = req.body;
      
      const execution = await executionService.startExecution(
        integrationId,
        executionType || 'manual',
        triggeredBy || req.user?.username || 'system'
      );
      
      res.status(201).json({
        status: 'success',
        message: 'Execution started successfully',
        data: execution
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Completa una ejecución existente
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async completeExecution(req, res, next) {
    try {
      const { executionId } = req.params;
      const { status, resultData } = req.body;
      
      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Status is required'
        });
      }
      
      const execution = await executionService.completeExecution(
        executionId,
        status,
        resultData || {}
      );
      
      res.status(200).json({
        status: 'success',
        message: 'Execution completed successfully',
        data: execution
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene ejecuciones para una integración específica
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getExecutionsByIntegration(req, res, next) {
    try {
      const { integrationId } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };
      
      const result = await executionService.getExecutionsByIntegration(integrationId, options);
      
      res.status(200).json({
        status: 'success',
        message: 'Executions retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una ejecución por su ID
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getExecutionById(req, res, next) {
    try {
      const { executionId } = req.params;
      const execution = await executionService.getExecutionById(executionId);
      
      res.status(200).json({
        status: 'success',
        message: 'Execution retrieved successfully',
        data: execution
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene ejecuciones recientes de todas las integraciones
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getRecentExecutions(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const executions = await executionService.getRecentExecutions(limit);
      
      res.status(200).json({
        status: 'success',
        message: 'Recent executions retrieved successfully',
        data: executions
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancela una ejecución en curso
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async cancelExecution(req, res, next) {
    try {
      const { executionId } = req.params;
      const execution = await executionService.cancelExecution(executionId);
      
      res.status(200).json({
        status: 'success',
        message: 'Execution cancelled successfully',
        data: execution
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExecutionController();