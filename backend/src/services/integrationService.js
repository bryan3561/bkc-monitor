"use strict";

const Integration = require('../models/Integration');

// Servicio para manejar las integraciones
class IntegrationService {
  /**
   * Crea una nueva integración en la base de datos
   * @param {Object} integrationData - Datos de la integración a crear
   * @returns {Promise<Object>} - La integración creada
   */
  async createIntegration(integrationData) {
    try {
      const integration = new Integration(integrationData);
      return await integration.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todas las integraciones con opciones de filtrado
   * @param {Object} filters - Filtros para la consulta
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @returns {Promise<Array>} - Lista de integraciones
   */
  async getAllIntegrations(filters = {}, options = {}) {
    try {
      // Configuración de paginación
      const page = options.page || 1;
      const limit = options.limit || 10;
      const skip = (page - 1) * limit;
      
      // Configuración de ordenamiento
      const sort = {};
      if (options.sortBy) {
        sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
      } else {
        sort.updatedAt = -1; // Por defecto, ordenar por última actualización
      }
      
      // Construir el objeto de filtro
      const query = {};
      
      // Filtrar por status si se proporciona
      if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
      }
      
      // Filtrar por tipo si se proporciona
      if (filters.type && filters.type !== 'all') {
        query.type = filters.type;
      }
      
      // Filtrar por etiquetas si se proporcionan
      if (filters.tags && filters.tags.length > 0) {
        query.tags = { $in: filters.tags };
      }
      
      // Filtrar por búsqueda de texto si se proporciona
      if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        query.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { source: searchRegex },
          { destination: searchRegex }
        ];
      }
      
      // Ejecutar la consulta
      const integrations = await Integration.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      
      // Obtener el total de documentos para paginación
      const total = await Integration.countDocuments(query);
      
      return {
        data: integrations,
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
   * Obtiene una integración por su ID
   * @param {string} integrationId - ID de la integración
   * @returns {Promise<Object>} - La integración encontrada
   */
  async getIntegrationById(integrationId) {
    try {
      const integration = await Integration.findById(integrationId);
      if (!integration) {
        const error = new Error('Integration not found');
        error.statusCode = 404;
        throw error;
      }
      return integration;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza una integración existente
   * @param {string} integrationId - ID de la integración
   * @param {Object} updateData - Datos para actualizar
   * @returns {Promise<Object>} - La integración actualizada
   */
  async updateIntegration(integrationId, updateData) {
    try {
      const integration = await Integration.findById(integrationId);
      
      if (!integration) {
        const error = new Error('Integration not found');
        error.statusCode = 404;
        throw error;
      }
      
      // Actualizar campos
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== '__v') {
          integration[key] = updateData[key];
        }
      });
      
      return await integration.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una integración por su ID
   * @param {string} integrationId - ID de la integración
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async deleteIntegration(integrationId) {
    try {
      const result = await Integration.findByIdAndDelete(integrationId);
      
      if (!result) {
        const error = new Error('Integration not found');
        error.statusCode = 404;
        throw error;
      }
      
      return { success: true, message: 'Integration successfully deleted' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza el estado de una integración
   * @param {string} integrationId - ID de la integración
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} - La integración actualizada
   */
  async updateIntegrationStatus(integrationId, status) {
    try {
      const integration = await Integration.findById(integrationId);
      
      if (!integration) {
        const error = new Error('Integration not found');
        error.statusCode = 404;
        throw error;
      }
      
      integration.status = status;
      return await integration.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de todas las integraciones
   * @returns {Promise<Object>} - Estadísticas de las integraciones
   */
  async getIntegrationStats() {
    try {
      const total = await Integration.countDocuments();
      const active = await Integration.countDocuments({ status: 'active' });
      const inactive = await Integration.countDocuments({ status: 'inactive' });
      const error = await Integration.countDocuments({ status: 'error' });
      const warning = await Integration.countDocuments({ status: 'warning' });
      
      // Distribución por tipo
      const typeCounts = await Integration.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } }
      ]);
      
      // Distribución por frecuencia
      const frequencyCounts = await Integration.aggregate([
        { $group: { _id: '$frequency', count: { $sum: 1 } } },
        { $project: { frequency: '$_id', count: 1, _id: 0 } }
      ]);
      
      return {
        total,
        byStatus: { active, inactive, error, warning },
        byType: typeCounts,
        byFrequency: frequencyCounts
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new IntegrationService();
