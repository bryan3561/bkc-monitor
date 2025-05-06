"use strict";

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Esquema para integraciones
const integrationSchema = new Schema({
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
  type: {
    type: String,
    required: true,
    enum: ['API', 'DATABASE', 'FILE', 'EVENT', 'OTHER']
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive', 'error', 'warning'],
    default: 'inactive'
  },
  frequency: {
    type: String,
    required: true,
    enum: ['hourly', 'daily', 'weekly', 'monthly', 'custom'],
    default: 'daily'
  },
  customFrequency: {
    type: String,
    default: null
  },
  config: {
    type: Schema.Types.Mixed,
    default: {}
  },
  lastExecution: {
    startTime: Date,
    endTime: Date,
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed', 'warning'],
      default: null
    }
  },
  healthScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  owner: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
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
integrationSchema.index({ name: 1 }, { unique: true });
integrationSchema.index({ status: 1 });
integrationSchema.index({ type: 1 });
integrationSchema.index({ tags: 1 });

// Pre-save middleware para actualizar 'updatedAt'
integrationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Métodos estáticos
integrationSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Métodos de instancia
integrationSchema.methods.updateStatus = function(status) {
  this.status = status;
  return this.save();
};

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration;
