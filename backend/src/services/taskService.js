"use strict";

const Task = require('../models/Task');
const Integration = require('../models/Integration');

// Servicio para manejar las tareas de integración
class TaskService {
  /**
   * Crea una nueva tarea para una integración
   * @param {Object} taskData - Datos de la tarea a crear
   * @returns {Promise<Object>} - La tarea creada
   */
  async createTask(taskData) {
    try {
      // Verificar que la integración existe
      const integrationExists = await Integration.findById(taskData.integrationId);
      
      if (!integrationExists) {
        const error = new Error('Integration not found');
        error.statusCode = 404;
        throw error;
      }
      
      // Obtener el último orden para esta integración
      const lastTask = await Task.findOne({ integrationId: taskData.integrationId })
        .sort({ order: -1 });
      
      // Asignar orden automáticamente si no se proporciona
      if (!taskData.order) {
        taskData.order = lastTask ? lastTask.order + 1 : 0;
      }
      
      const task = new Task(taskData);
      return await task.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene todas las tareas para una integración específica
   * @param {string} integrationId - ID de la integración
   * @returns {Promise<Array>} - Lista de tareas
   */
  async getTasksByIntegration(integrationId) {
    try {
      return await Task.find({ integrationId }).sort({ order: 1 });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtiene una tarea por su ID
   * @param {string} taskId - ID de la tarea
   * @returns {Promise<Object>} - La tarea encontrada
   */
  async getTaskById(taskId) {
    try {
      const task = await Task.findById(taskId);
      
      if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      
      return task;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza una tarea existente
   * @param {string} taskId - ID de la tarea
   * @param {Object} updateData - Datos para actualizar
   * @returns {Promise<Object>} - La tarea actualizada
   */
  async updateTask(taskId, updateData) {
    try {
      const task = await Task.findById(taskId);
      
      if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      
      // Actualizar campos
      Object.keys(updateData).forEach(key => {
        if (key !== '_id' && key !== '__v' && key !== 'integrationId') {
          task[key] = updateData[key];
        }
      });
      
      return await task.save();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Elimina una tarea por su ID
   * @param {string} taskId - ID de la tarea
   * @returns {Promise<Object>} - Resultado de la eliminación
   */
  async deleteTask(taskId) {
    try {
      const result = await Task.findByIdAndDelete(taskId);
      
      if (!result) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      
      // Reordenar las tareas restantes
      const tasksToReorder = await Task.find({
        integrationId: result.integrationId,
        order: { $gt: result.order }
      }).sort({ order: 1 });
      
      for (let task of tasksToReorder) {
        task.order -= 1;
        await task.save();
      }
      
      return { success: true, message: 'Task successfully deleted' };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza el orden de las tareas
   * @param {Array} taskOrderData - Array de objetos { taskId, newOrder }
   * @returns {Promise<Array>} - Las tareas actualizadas
   */
  async updateTasksOrder(taskOrderData) {
    try {
      const updatedTasks = [];
      
      for (const { taskId, newOrder } of taskOrderData) {
        const task = await Task.findById(taskId);
        
        if (task) {
          task.order = newOrder;
          await task.save();
          updatedTasks.push(task);
        }
      }
      
      return updatedTasks;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Actualiza el estado de una tarea
   * @param {string} taskId - ID de la tarea
   * @param {string} status - Nuevo estado
   * @returns {Promise<Object>} - La tarea actualizada
   */
  async updateTaskStatus(taskId, status) {
    try {
      const task = await Task.findById(taskId);
      
      if (!task) {
        const error = new Error('Task not found');
        error.statusCode = 404;
        throw error;
      }
      
      task.status = status;
      return await task.save();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TaskService();
