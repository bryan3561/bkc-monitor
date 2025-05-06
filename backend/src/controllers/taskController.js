"use strict";

const taskService = require('../services/taskService');

// Controlador para manejar las operaciones de tareas
class TaskController {
  /**
   * Crea una nueva tarea
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async createTask(req, res, next) {
    try {
      const taskData = req.body;
      const newTask = await taskService.createTask(taskData);
      
      res.status(201).json({
        status: 'success',
        message: 'Task created successfully',
        data: newTask
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene todas las tareas para una integración específica
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getTasksByIntegration(req, res, next) {
    try {
      const integrationId = req.params.integrationId;
      const tasks = await taskService.getTasksByIntegration(integrationId);
      
      res.status(200).json({
        status: 'success',
        message: 'Tasks retrieved successfully',
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una tarea por su ID
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async getTaskById(req, res, next) {
    try {
      const taskId = req.params.id;
      const task = await taskService.getTaskById(taskId);
      
      res.status(200).json({
        status: 'success',
        message: 'Task retrieved successfully',
        data: task
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una tarea existente
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async updateTask(req, res, next) {
    try {
      const taskId = req.params.id;
      const updateData = req.body;
      const updatedTask = await taskService.updateTask(taskId, updateData);
      
      res.status(200).json({
        status: 'success',
        message: 'Task updated successfully',
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una tarea por su ID
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async deleteTask(req, res, next) {
    try {
      const taskId = req.params.id;
      const result = await taskService.deleteTask(taskId);
      
      res.status(200).json({
        status: 'success',
        message: 'Task deleted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el orden de múltiples tareas
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async updateTasksOrder(req, res, next) {
    try {
      const { tasks } = req.body;
      
      if (!tasks || !Array.isArray(tasks)) {
        return res.status(400).json({
          status: 'error',
          message: 'Tasks array is required'
        });
      }
      
      const updatedTasks = await taskService.updateTasksOrder(tasks);
      
      res.status(200).json({
        status: 'success',
        message: 'Tasks order updated successfully',
        data: updatedTasks
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el estado de una tarea
   * @param {Object} req - Objeto de solicitud
   * @param {Object} res - Objeto de respuesta
   * @param {Function} next - Siguiente middleware
   */
  async updateTaskStatus(req, res, next) {
    try {
      const taskId = req.params.id;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Status is required'
        });
      }
      
      const updatedTask = await taskService.updateTaskStatus(taskId, status);
      
      res.status(200).json({
        status: 'success',
        message: 'Task status updated successfully',
        data: updatedTask
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();