"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Esquema para logs de tareas
const logSchema = new Schema({
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task'
  },
  executionId: {
    type: Schema.Types.ObjectId,
    ref: 'Execution',
    required: true
  },
  integrationId: {
    type: Schema.Types.ObjectId,
    ref: 'Integration',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  level: {
    type: String,
    enum: ['debug', 'info', 'warning', 'error'],
    default: 'info'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: Schema.Types.Mixed,
    default: null
  },
  source: {
    type: String,
    default: 'system'
  },
  context: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Índices para mejorar las consultas
logSchema.index({ executionId: 1, timestamp: 1 });
logSchema.index({ integrationId: 1, timestamp: 1 });
logSchema.index({ taskId: 1, timestamp: 1 });
logSchema.index({ level: 1 });

// Métodos estáticos
logSchema.statics.findByExecution = function(executionId) {
  return this.find({ executionId })
    .sort({ timestamp: 1 });
};

logSchema.statics.findByTask = function(taskId) {
  return this.find({ taskId })
    .sort({ timestamp: 1 });
};

logSchema.statics.findByIntegration = function(integrationId, limit = 100) {
  return this.find({ integrationId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

logSchema.statics.findErrors = function(integrationId, limit = 50) {
  return this.find({
    integrationId,
    level: 'error'
  })
  .sort({ timestamp: -1 })
  .limit(limit);
};

// Métodos de instancia
logSchema.methods.isError = function() {
  return this.level === 'error';
};

logSchema.methods.isWarning = function() {
  return this.level === 'warning';
};

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
