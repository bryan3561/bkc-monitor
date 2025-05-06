"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Esquema para ejecuciones de integraciones
const executionSchema = new Schema({
  integrationId: {
    type: Schema.Types.ObjectId,
    ref: 'Integration',
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'warning', 'cancelled'],
    default: 'pending'
  },
  executionType: {
    type: String,
    enum: ['scheduled', 'manual', 'api-triggered'],
    default: 'scheduled'
  },
  triggeredBy: {
    type: String,
    default: 'system'
  },
  summary: {
    totalTasks: {
      type: Number,
      default: 0
    },
    completedTasks: {
      type: Number,
      default: 0
    },
    failedTasks: {
      type: Number,
      default: 0
    },
    skippedTasks: {
      type: Number,
      default: 0
    },
    warningTasks: {
      type: Number,
      default: 0
    }
  },
  duration: {
    type: Number, // en milisegundos
    default: 0
  },
  resultData: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Índices para mejorar las consultas
executionSchema.index({ integrationId: 1, startTime: -1 });
executionSchema.index({ status: 1 });
executionSchema.index({ executionType: 1 });

// Pre-save middleware para calcular la duración si endTime está presente
executionSchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    this.duration = this.endTime.getTime() - this.startTime.getTime();
  }
  next();
});

// Métodos estáticos
executionSchema.statics.findByIntegration = function(integrationId, limit = 10) {
  return this.find({ integrationId })
    .sort({ startTime: -1 })
    .limit(limit);
};

executionSchema.statics.findRecentExecutions = function(limit = 20) {
  return this.find({})
    .sort({ startTime: -1 })
    .limit(limit)
    .populate('integrationId', 'name type status');
};

// Métodos de instancia
executionSchema.methods.markAsCompleted = function(resultData = {}) {
  this.status = 'completed';
  this.endTime = new Date();
  this.resultData = resultData;
  return this.save();
};

executionSchema.methods.markAsFailed = function(resultData = {}) {
  this.status = 'failed';
  this.endTime = new Date();
  this.resultData = resultData;
  return this.save();
};

executionSchema.methods.updateSummary = function(taskStatus) {
  // Incrementamos el contador correspondiente al estado de la tarea
  this.summary.totalTasks += 1;
  
  switch(taskStatus) {
    case 'completed':
      this.summary.completedTasks += 1;
      break;
    case 'failed':
      this.summary.failedTasks += 1;
      break;
    case 'skipped':
      this.summary.skippedTasks += 1;
      break;
    case 'warning':
      this.summary.warningTasks += 1;
      break;
  }
  
  return this.save();
};

const Execution = mongoose.model('Execution', executionSchema);

module.exports = Execution;
