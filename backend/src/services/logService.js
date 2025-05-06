"use strict";

const Log = require('../models/Log');
const { Types } = require('mongoose');

// Servicio para manejar las operaciones de logs
class LogService {
  /**
   * Crea un nuevo log en la base de datos
   * @param {Object} logData - Datos del log a crear
   * @returns {Promise<Object>} - El log creado
   */
  async createLog(logData) {
    try {
      const log = new Log(logData);
      return await log.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene logs para una ejecución específica
   * @param {string} executionId - ID de la ejecución
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} - Logs de la ejecución
   */
  async getLogsByExecution(executionId, options = {}) {
    try {
      const { page = 1, limit = 100, level, taskId, search, sortOrder = 'asc' } = options;
      const skip = (page - 1) * limit;
      
      // Construir la consulta
      const query = { executionId: executionId };
      
      // Filtrar por nivel si se proporciona
      if (level && level !== 'all') {
        query.level = level;
      }
      
      // Filtrar por tarea si se proporciona
      if (taskId) {
        query.taskId = taskId;
      }
      
      // Filtrar por búsqueda de texto si se proporciona
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { message: searchRegex },
          { 'details.message': searchRegex }
        ];
      }
      
      // Ordenamiento por timestamp
      const sort = { timestamp: sortOrder === 'desc' ? -1 : 1 };
      
      // Ejecutar la consulta
      const logs = await Log.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      
      // Obtener el total de documentos para paginación
      const total = await Log.countDocuments(query);
      
      return {
        data: logs,
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
   * Obtiene logs para una tarea específica
   * @param {string} taskId - ID de la tarea
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} - Logs de la tarea
   */
  async getLogsByTask(taskId, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 100, 
        level, 
        executionId,
        search, 
        sortOrder = 'asc' 
      } = options;
      
      const skip = (page - 1) * limit;
      
      // Construir la consulta
      const query = { taskId: taskId };
      
      // Filtrar por nivel si se proporciona
      if (level && level !== 'all') {
        query.level = level;
      }
      
      // Filtrar por ejecución si se proporciona
      if (executionId) {
        query.executionId = executionId;
      }
      
      // Filtrar por búsqueda de texto si se proporciona
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { message: searchRegex },
          { 'details.message': searchRegex }
        ];
      }
      
      // Ordenamiento por timestamp
      const sort = { timestamp: sortOrder === 'desc' ? -1 : 1 };
      
      // Ejecutar la consulta
      const logs = await Log.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      
      // Obtener el total de documentos para paginación
      const total = await Log.countDocuments(query);
      
      return {
        data: logs,
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
   * Obtiene logs para una integración específica
   * @param {string} integrationId - ID de la integración
   * @param {Object} options - Opciones de filtrado y paginación
   * @returns {Promise<Object>} - Logs de la integración
   */
  async getLogsByIntegration(integrationId, options = {}) {
    try {
      const { 
        page = 1, 
        limit = 100, 
        level, 
        taskId, 
        executionId,
        search,
        startDate,
        endDate,
        sortOrder = 'desc' 
      } = options;
      
      const skip = (page - 1) * limit;
      
      // Construir la consulta
      const query = { integrationId: integrationId };
      
      // Filtrar por nivel si se proporciona
      if (level && level !== 'all') {
        query.level = level;
      }
      
      // Filtrar por tarea si se proporciona
      if (taskId) {
        query.taskId = taskId;
      }
      
      // Filtrar por ejecución si se proporciona
      if (executionId) {
        query.executionId = executionId;
      }
      
      // Filtrar por fechas si se proporcionan
      if (startDate || endDate) {
        query.timestamp = {};
        
        if (startDate) {
          query.timestamp.$gte = new Date(startDate);
        }
        
        if (endDate) {
          query.timestamp.$lte = new Date(endDate);
        }
      }
      
      // Filtrar por búsqueda de texto si se proporciona
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { message: searchRegex },
          { 'details.message': searchRegex }
        ];
      }
      
      // Ordenamiento por timestamp
      const sort = { timestamp: sortOrder === 'desc' ? -1 : 1 };
      
      // Ejecutar la consulta
      const logs = await Log.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      
      // Obtener el total de documentos para paginación
      const total = await Log.countDocuments(query);
      
      return {
        data: logs,
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
   * Obtiene errores recientes para una integración
   * @param {string} integrationId - ID de la integración
   * @param {number} limit - Número máximo de errores a devolver
   * @returns {Promise<Array>} - Lista de errores recientes
   */
  async getRecentErrors(integrationId, limit = 50) {
    try {
      return await Log.find({
        integrationId,
        level: 'error'
      })
      .sort({ timestamp: -1 })
      .limit(limit);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene la distribución de logs por nivel para una integración
   * @param {string} integrationId - ID de la integración
   * @returns {Promise<Object>} - Distribución de logs por nivel
   */
  async getLogLevelDistribution(integrationId) {
    try {
      // Obtener la distribución usando agregación de MongoDB
      const distribution = await Log.aggregate([
        { $match: { integrationId: new Types.ObjectId(integrationId) } },
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $project: { level: '$_id', count: 1, _id: 0 } }
      ]);
      
      // Formatear el resultado para asegurar que todos los niveles estén representados
      const result = {
        debug: 0,
        info: 0,
        warning: 0,
        error: 0
      };
      
      distribution.forEach(item => {
        result[item.level] = item.count;
      });
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina logs antiguos para una integración
   * @param {string} integrationId - ID de la integración
   * @param {Date} olderThan - Fecha límite
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async deleteOldLogs(integrationId, olderThan) {
    try {
      const result = await Log.deleteMany({
        integrationId,
        timestamp: { $lt: olderThan }
      });
      
      return {
        success: true,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Borra todos los logs asociados a una integración
   * @param {string} integrationId - ID de la integración
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async clearLogsForIntegration(integrationId) {
    try {
      const result = await Log.deleteMany({ integrationId });
      
      return {
        success: true,
        message: `Se eliminaron ${result.deletedCount} logs`,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new LogService();