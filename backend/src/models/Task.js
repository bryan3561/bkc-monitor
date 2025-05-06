"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Esquema para tareas de integración
const taskSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  integrationId: {
    type: Schema.Types.ObjectId,
    ref: 'Integration',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['extract', 'transform', 'load', 'validate', 'notify', 'custom']
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'warning', 'skipped'],
    default: 'pending'
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },
  dependsOn: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  config: {
    type: Schema.Types.Mixed,
    default: {}
  },
  timeout: {
    type: Number, // en milisegundos
    default: 3600000 // 1 hora por defecto
  },
  retryStrategy: {
    attempts: {
      type: Number,
      default: 3
    },
    backoff: {
      type: Number, // en milisegundos
      default: 60000 // 1 minuto por defecto
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para mejorar las consultas
taskSchema.index({ integrationId: 1, order: 1 });
taskSchema.index({ status: 1 });

// Pre-save middleware para actualizar 'updatedAt'
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Métodos estáticos
taskSchema.statics.findByIntegration = function(integrationId) {
  return this.find({ integrationId }).sort({ order: 1 });
};

taskSchema.statics.findFailedTasks = function() {
  return this.find({ status: 'failed' });
};

// Métodos de instancia
taskSchema.methods.updateStatus = function(status) {
  this.status = status;
  return this.save();
};

taskSchema.methods.markAsRunning = function() {
  this.status = 'running';
  return this.save();
};

taskSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  return this.save();
};

taskSchema.methods.markAsFailed = function() {
  this.status = 'failed';
  return this.save();
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
