"use strict";

// config/database.js
const mongoose = require('mongoose');
require('dotenv').config();

// Opciones de configuración para la conexión a MongoDB
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

// URI de la base de datos según el entorno
const getDbUri = () => {
  if (process.env.NODE_ENV === 'test') {
    return process.env.MONGODB_URI_TEST;
  }
  return process.env.MONGODB_URI;
};

// Función para conectar a la base de datos
const connect = async () => {
  try {
    await mongoose.connect(getDbUri(), options);
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Función para desconectar de la base de datos (útil para pruebas)
const disconnect = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connect,
  disconnect,
  getDbUri
};
