"use strict";

const Execution = require('../models/Execution');
const Integration = require('../models/Integration');
const Task = require('../models/Task');

// Servicio para manejar las ejecuciones de integraciones
class ExecutionService {
  /**
   * Inicia una nueva ejecución para una integración
   * @param {string} integrationId - ID de la integración
   * @param {string} executionType - Tipo de ejecución (scheduled, manual, api-triggered)
   * @param {string} triggeredBy - Usuario o sistema que inició la ejecución
   * @returns {Promise<Object>} - La ejecución creada
   */
  async startExecution(integrationId, executionType = 'manual', triggeredBy = 'system') {
    try {
      // Verificar que la integración existe
      const integration = await Integration.findById(integrationId);
      
      if (!integration) {
        const error = new Error('Integration not found');
        error.statusCode = 404;
        throw error;
      }
      
      // Crear una nueva ejecución
      const execution = new Execution({
        integrationId,
        executionType,
        triggeredBy,
        status: 'running',
        startTime: new Date()
      });
      
      // Guardar la ejecución
      await execution.save();
      
      // Actualizar la última ejecución en la integración
      integration.lastExecution = {
        startTime: execution.startTime,
        status: 'running'
      };
      
      await integration.save();
      
      // Contar las tareas para actualizar el resumen
      const totalTasks = await Task.countDocuments({ integrationId });
      execution.summary.totalTasks = totalTasks;
      await execution.save();
      
      return execution;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Finaliza una ejecución existente
   * @param {string} executionId - ID de la ejecución
   * @param {string} status - Estado final de la ejecución
   * @param {Object} resultData - Datos del resultado
   * @returns {Promise<Object>} - La ejecución actualizada
   */
  async completeExecution(executionId, status, resultData = {}) {
    try {
      const execution = await Execution.findById(executionId);
      
      if (!execution) {
        const error = new Error('Execution not found');
        error.statusCode = 404;
        throw error;
      }
      
      // Actualizar la ejecución
      execution.status = status;
      execution.endTime = new Date();
      execution.resultData = resultData;
      
      // Calcular la duración
      if (execution.startTime) {
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      }
      
      await execution.save();
      
      // Actualizar la integración
      const integration = await Integration.findById(execution.integrationId);
      
      if (integration) {
        // Actualizar la última ejecución
        integration.lastExecution = {
          startTime: execution.startTime,
          endTime: execution.endTime,
          status: execution.status
        };
        
        // Actualizar estado de la integración basado en la ejecución
        if (status === 'failed') {
          integration.status = 'error';
        } else if (status === 'warning') {
          integration.status = 'warning';
        } else if (status === 'completed' && integration.status === 'error') {
          integration.status = 'active'; // Si estaba en error y ahora completó correctamente
        }
        
        await integration.save();
      }
      
      return execution;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todas las ejecuciones para una integración específica
   * @param {string} integrationId - ID de la integración
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Array>} - Lista de ejecuciones
   */
  async getExecutionsByIntegration(integrationId, options = {}) {
    try {
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;
      
      const executions = await Execution.find({ integrationId })
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Execution.countDocuments({ integrationId });
      
      return {
        data: executions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene una ejecución por su ID
   * @param {string} executionId - ID de la ejecución
   * @returns {Promise<Object>} - La ejecución encontrada
   */
  async getExecutionById(executionId) {
    try {
      const execution = await Execution.findById(executionId)
        .populate('integrationId', 'name type');
      
      if (!execution) {
        const error = new Error('Execution not found');
        error.statusCode = 404;
        throw error;
      }
      
      return execution;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene las ejecuciones recientes de todas las integraciones
   * @param {number} limit - Número máximo de ejecuciones a devolver
   * @returns {Promise<Array>} - Lista de ejecuciones recientes
   */
  async getRecentExecutions(limit = 20) {
    try {
      return await Execution.find({})
        .sort({ startTime: -1 })
        .limit(limit)
        .populate('integrationId', 'name type status');
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancela una ejecución en curso
   * @param {string} executionId - ID de la ejecución
   * @returns {Promise<Object>} - La ejecución actualizada
   */
  async cancelExecution(executionId) {
    try {
      const execution = await Execution.findById(executionId);
      
      if (!execution) {
        const error = new Error('Execution not found');
        error.statusCode = 404;
        throw error;
      }
      
      if (execution.status !== 'running' && execution.status !== 'pending') {
        const error = new Error('Cannot cancel execution that is not running or pending');
        error.statusCode = 400;
        throw error;
      }
      
      execution.status = 'cancelled';
      execution.endTime = new Date();
      
      // Calcular la duración
      if (execution.startTime) {
        execution.duration = execution.endTime.getTime() - execution.startTime.getTime();
      }
      
      await execution.save();
      
      // Actualizar la integración
      const integration = await Integration.findById(execution.integrationId);
      
      if (integration) {
        // Actualizar la última ejecución
        integration.lastExecution = {
          startTime: execution.startTime,
          endTime: execution.endTime,
          status: 'cancelled'
        };
        
        await integration.save();
      }
      
      return execution;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ExecutionService();
