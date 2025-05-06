"use strict";

const logService = require('../services/logService');

// Controlador para manejar las operaciones de logs
class LogController {
  /**
   * Crea un nuevo log
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async createLog(req, res, next) {
    try {
      const logData = req.body;
      const newLog = await logService.createLog(logData);
      
      res.status(201).json({
        status: 'success',
        message: 'Log created successfully',
        data: newLog
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene logs para una ejecución específica
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getLogsByExecution(req, res, next) {
    try {
      const { executionId } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 100,
        level: req.query.level,
        taskId: req.query.taskId,
        search: req.query.search,
        sortOrder: req.query.sortOrder || 'asc'
      };
      
      const result = await logService.getLogsByExecution(executionId, options);
      
      res.status(200).json({
        status: 'success',
        message: 'Logs retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene logs para una tarea específica
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getLogsByTask(req, res, next) {
    try {
      const { taskId } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 100,
        level: req.query.level,
        executionId: req.query.executionId,
        search: req.query.search,
        sortOrder: req.query.sortOrder || 'asc'
      };
      
      const result = await logService.getLogsByTask(taskId, options);
      
      res.status(200).json({
        status: 'success',
        message: 'Logs retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene logs para una integración específica
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getLogsByIntegration(req, res, next) {
    try {
      const { integrationId } = req.params;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 100,
        level: req.query.level,
        taskId: req.query.taskId,
        executionId: req.query.executionId,
        search: req.query.search,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        sortOrder: req.query.sortOrder || 'desc'
      };
      
      const result = await logService.getLogsByIntegration(integrationId, options);
      
      res.status(200).json({
        status: 'success',
        message: 'Logs retrieved successfully',
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene errores recientes para una integración
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getRecentErrors(req, res, next) {
    try {
      const { integrationId } = req.params;
      const limit = parseInt(req.query.limit) || 50;
      const errors = await logService.getRecentErrors(integrationId, limit);
      
      res.status(200).json({
        status: 'success',
        message: 'Recent errors retrieved successfully',
        data: errors
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene la distribución de logs por nivel para una integración
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getLogLevelDistribution(req, res, next) {
    try {
      const { integrationId } = req.params;
      const distribution = await logService.getLogLevelDistribution(integrationId);
      
      res.status(200).json({
        status: 'success',
        message: 'Log level distribution retrieved successfully',
        data: distribution
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LogController();