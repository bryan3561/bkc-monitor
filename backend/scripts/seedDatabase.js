"use strict";

const mongoose = require('mongoose');
const database = require('../config/database');
const Integration = require('../src/models/Integration');
const Task = require('../src/models/Task');
const Execution = require('../src/models/Execution');
const Log = require('../src/models/Log');
const { v4: uuidv4 } = require('uuid');

// Datos de prueba para integraciones
const integrations = [
  {
    name: 'API de Clientes',
    description: 'Integración con el API de clientes para sincronizar datos',
    type: 'API',
    source: 'https://api.clientes.com',
    destination: 'Base de datos local',
    status: 'active',
    frequency: 'daily',
    customFrequency: null,
    config: {
      authentication: {
        type: 'oauth2',
        clientId: 'CLIENT_ID',
        tokenUrl: 'https://api.clientes.com/oauth/token'
      },
      endpoints: {
        customers: '/api/customers',
        orders: '/api/orders'
      }
    },
    healthScore: 95,
    owner: 'Equipo de Datos',
    tags: ['clientes', 'api', 'sincronización']
  },
  {
    name: 'ETL Financiero',
    description: 'Proceso ETL para datos financieros',
    type: 'DATABASE',
    source: 'Oracle Finance DB',
    destination: 'Data Warehouse',
    status: 'active',
    frequency: 'weekly',
    customFrequency: null,
    config: {
      sourceConnection: {
        host: 'oracle-finance.example.com',
        database: 'FINDB',
        schema: 'FINANCE'
      },
      targetConnection: {
        host: 'datawarehouse.example.com',
        database: 'DWH',
        schema: 'FINANCE_DWH'
      }
    },
    healthScore: 100,
    owner: 'Equipo Financiero',
    tags: ['finanzas', 'etl', 'oracle', 'data warehouse']
  },
  {
    name: 'Procesamiento de Archivos CSV',
    description: 'Integración para procesar archivos CSV de ventas',
    type: 'FILE',
    source: '/data/incoming/sales',
    destination: 'MongoDB Sales Collection',
    status: 'error',
    frequency: 'daily',
    customFrequency: null,
    config: {
      filePattern: '*.csv',
      delimiter: ',',
      hasHeader: true,
      encoding: 'utf8'
    },
    healthScore: 65,
    owner: 'Equipo de Ventas',
    tags: ['ventas', 'csv', 'procesamiento de archivos']
  },
  {
    name: 'Eventos de Kafka',
    description: 'Consumir eventos de Kafka y procesarlos',
    type: 'EVENT',
    source: 'Kafka Cluster',
    destination: 'Elasticsearch',
    status: 'warning',
    frequency: 'hourly',
    customFrequency: null,
    config: {
      kafkaConfig: {
        brokers: ['kafka1:9092', 'kafka2:9092'],
        topic: 'events-topic',
        groupId: 'monitor-consumer-group'
      },
      elasticConfig: {
        nodes: ['http://elastic:9200'],
        index: 'events'
      }
    },
    healthScore: 78,
    owner: 'Equipo de Infraestructura',
    tags: ['kafka', 'eventos', 'elasticsearch']
  },
  {
    name: 'Integración con Shopify',
    description: 'Sincronización bidireccional con tienda Shopify',
    type: 'API',
    source: 'https://api.shopify.com',
    destination: 'CRM interno',
    status: 'inactive',
    frequency: 'custom',
    customFrequency: '0 */4 * * *', // cada 4 horas
    config: {
      shopifyConfig: {
        storeUrl: 'mitienda.myshopify.com',
        apiVersion: '2023-10'
      },
      crmConfig: {
        endpoint: 'http://crm.internal/api',
        mapping: {
          customer: 'client',
          order: 'sale'
        }
      }
    },
    healthScore: 0, // inactiva, no hay puntuación
    owner: 'Equipo de E-commerce',
    tags: ['shopify', 'ecommerce', 'crm']
  }
];

// Función para crear tareas para una integración
const createTasksForIntegration = (integrationId, integrationType) => {
  const tasks = [];
  
  switch (integrationType) {
    case 'API':
      tasks.push({
        name: 'Autenticación API',
        description: 'Autenticar con la API externa',
        integrationId,
        type: 'extract',
        status: 'pending',
        order: 0,
        config: {
          timeout: 30000
        }
      });
      tasks.push({
        name: 'Extracción de datos',
        description: 'Extraer datos desde la API',
        integrationId,
        type: 'extract',
        status: 'pending',
        order: 1,
        dependsOn: [], // Se llenará después
        config: {
          pageSize: 100,
          maxPages: 10
        }
      });
      break;
      
    case 'DATABASE':
      tasks.push({
        name: 'Conexión a base de datos',
        description: 'Establecer conexión con la base de datos fuente',
        integrationId,
        type: 'extract',
        status: 'pending',
        order: 0,
        config: {
          timeout: 60000
        }
      });
      tasks.push({
        name: 'Extracción de tablas',
        description: 'Extraer datos de tablas específicas',
        integrationId,
        type: 'extract',
        status: 'pending',
        order: 1,
        dependsOn: [], // Se llenará después
        config: {
          tables: ['CUSTOMERS', 'ORDERS', 'PRODUCTS']
        }
      });
      break;
      
    case 'FILE':
      tasks.push({
        name: 'Búsqueda de archivos',
        description: 'Buscar archivos que coincidan con el patrón',
        integrationId,
        type: 'extract',
        status: 'pending',
        order: 0,
        config: {
          recursive: true
        }
      });
      tasks.push({
        name: 'Validación de archivos',
        description: 'Validar estructura y contenido de los archivos',
        integrationId,
        type: 'validate',
        status: 'pending',
        order: 1,
        dependsOn: [], // Se llenará después
        config: {
          validateHeaders: true,
          requiredFields: ['id', 'name', 'amount']
        }
      });
      break;
      
    case 'EVENT':
      tasks.push({
        name: 'Conexión a broker',
        description: 'Establecer conexión con el broker de eventos',
        integrationId,
        type: 'extract',
        status: 'pending',
        order: 0,
        config: {
          reconnectAttempts: 5
        }
      });
      tasks.push({
        name: 'Consumo de eventos',
        description: 'Consumir eventos del topic',
        integrationId,
        type: 'extract',
        status: 'pending',
        order: 1,
        dependsOn: [], // Se llenará después
        config: {
          batchSize: 100,
          autoCommit: false
        }
      });
      break;
      
    default:
      tasks.push({
        name: 'Tarea inicial',
        description: 'Tarea inicial para la integración',
        integrationId,
        type: 'extract',
        status: 'pending',
        order: 0,
        config: {}
      });
  }
  
  // Agregar tareas comunes para todos los tipos
  tasks.push({
    name: 'Transformación de datos',
    description: 'Transformar los datos extraídos',
    integrationId,
    type: 'transform',
    status: 'pending',
    order: 2,
    dependsOn: [], // Se llenará después
    config: {
      transformations: [
        { field: 'created_at', type: 'date', format: 'YYYY-MM-DD' },
        { field: 'amount', type: 'number', decimals: 2 }
      ]
    }
  });
  
  tasks.push({
    name: 'Carga de datos',
    description: 'Cargar datos transformados al destino',
    integrationId,
    type: 'load',
    status: 'pending',
    order: 3,
    dependsOn: [], // Se llenará después
    config: {
      batchSize: 500,
      errorThreshold: 0.05 // 5%
    }
  });
  
  tasks.push({
    name: 'Notificación',
    description: 'Enviar notificaciones sobre el resultado',
    integrationId,
    type: 'notify',
    status: 'pending',
    order: 4,
    dependsOn: [], // Se llenará después
    config: {
      channels: ['email', 'slack'],
      recipients: ['equipo@example.com', '#channel-monitor']
    }
  });
  
  return tasks;
};

// Crear ejecuciones para una integración
const createExecutionsForIntegration = (integrationId, tasks) => {
  const executions = [];
  
  // Ejecución completada exitosamente hace 1 día
  const completedDate = new Date();
  completedDate.setDate(completedDate.getDate() - 1);
  executions.push({
    integrationId,
    startTime: new Date(completedDate.setHours(completedDate.getHours() - 1)),
    endTime: completedDate,
    status: 'completed',
    executionType: 'scheduled',
    triggeredBy: 'system',
    summary: {
      totalTasks: tasks.length,
      completedTasks: tasks.length,
      failedTasks: 0,
      skippedTasks: 0,
      warningTasks: 0
    },
    resultData: {
      processedRecords: 1250,
      errors: 0,
      warnings: 2
    }
  });
  
  // Ejecución con errores hace 2 días
  const failedDate = new Date();
  failedDate.setDate(failedDate.getDate() - 2);
  executions.push({
    integrationId,
    startTime: new Date(failedDate.setHours(failedDate.getHours() - 1)),
    endTime: failedDate,
    status: 'failed',
    executionType: 'scheduled',
    triggeredBy: 'system',
    summary: {
      totalTasks: tasks.length,
      completedTasks: 2,
      failedTasks: 1,
      skippedTasks: 2,
      warningTasks: 0
    },
    resultData: {
      processedRecords: 850,
      errors: 1,
      errorDetails: 'Error al conectar con base de datos destino'
    }
  });
  
  // Ejecución con advertencias hace 3 días
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() - 3);
  executions.push({
    integrationId,
    startTime: new Date(warningDate.setHours(warningDate.getHours() - 1)),
    endTime: warningDate,
    status: 'warning',
    executionType: 'manual',
    triggeredBy: 'admin',
    summary: {
      totalTasks: tasks.length,
      completedTasks: tasks.length - 1,
      failedTasks: 0,
      skippedTasks: 0,
      warningTasks: 1
    },
    resultData: {
      processedRecords: 1150,
      errors: 0,
      warnings: 1,
      warningDetails: 'Algunos registros no pudieron ser transformados correctamente'
    }
  });
  
  return executions;
};

// Crear logs para una ejecución
const createLogsForExecution = (executionId, integrationId, tasks, executionStatus) => {
  const logs = [];
  
  // Log de inicio de ejecución
  logs.push({
    executionId,
    integrationId,
    taskId: null,
    timestamp: new Date(),
    level: 'info',
    message: 'Iniciando ejecución de integración',
    source: 'system'
  });
  
  // Logs para cada tarea
  for (const task of tasks) {
    // Log de inicio de tarea
    logs.push({
      executionId,
      integrationId,
      taskId: task._id,
      timestamp: new Date(),
      level: 'info',
      message: `Iniciando tarea: ${task.name}`,
      source: 'system'
    });
    
    // Log de progreso
    logs.push({
      executionId,
      integrationId,
      taskId: task._id,
      timestamp: new Date(),
      level: 'debug',
      message: `Progreso de tarea ${task.name}: 50%`,
      details: {
        progress: 50,
        metrics: {
          recordsProcessed: 500,
          timeElapsed: '00:05:30'
        }
      },
      source: 'task'
    });
    
    // Log de finalización de tarea (varía según el estado de la ejecución)
    if (executionStatus === 'failed' && task.order === 2) {
      // Si la ejecución falló, agregar log de error para una tarea específica
      logs.push({
        executionId,
        integrationId,
        taskId: task._id,
        timestamp: new Date(),
        level: 'error',
        message: `Error en tarea ${task.name}: No se pudo establecer conexión con el destino`,
        details: {
          error: {
            code: 'CONNECTION_ERROR',
            message: 'Database connection timeout after 30 seconds'
          }
        },
        source: 'system'
      });
    } else if (executionStatus === 'warning' && task.order === 3) {
      // Si la ejecución tiene advertencias, agregar log de warning para una tarea específica
      logs.push({
        executionId,
        integrationId,
        taskId: task._id,
        timestamp: new Date(),
        level: 'warning',
        message: `Advertencia en tarea ${task.name}: Algunos registros con formato inválido`,
        details: {
          invalidRecords: 5,
          totalRecords: 1150
        },
        source: 'task'
      });
    } else {
      // En caso contrario, log de éxito
      logs.push({
        executionId,
        integrationId,
        taskId: task._id,
        timestamp: new Date(),
        level: 'info',
        message: `Tarea ${task.name} completada exitosamente`,
        details: task.type === 'load' ? {
          recordsProcessed: 1000,
          timeElapsed: '00:10:15'
        } : null,
        source: 'system'
      });
    }
  }
  
  // Log de finalización de ejecución
  let finalMessage = 'Ejecución completada exitosamente';
  let finalLevel = 'info';
  
  if (executionStatus === 'failed') {
    finalMessage = 'Ejecución fallida';
    finalLevel = 'error';
  } else if (executionStatus === 'warning') {
    finalMessage = 'Ejecución completada con advertencias';
    finalLevel = 'warning';
  }
  
  logs.push({
    executionId,
    integrationId,
    taskId: null,
    timestamp: new Date(),
    level: finalLevel,
    message: finalMessage,
    source: 'system'
  });
  
  return logs;
};

// Función principal para insertar datos de prueba
const seedDatabase = async () => {
  try {
    console.log('Conectando a la base de datos...');
    await database.connect();
    
    console.log('Limpiando colecciones existentes...');
    await Promise.all([
      Integration.deleteMany({}),
      Task.deleteMany({}),
      Execution.deleteMany({}),
      Log.deleteMany({})
    ]);
    
    console.log('Insertando integraciones...');
    const createdIntegrations = await Integration.insertMany(integrations);
    
    console.log('Creando tareas para cada integración...');
    let allTasks = [];
    for (const integration of createdIntegrations) {
      const integrationTasks = createTasksForIntegration(integration._id, integration.type);
      const createdTasks = await Task.insertMany(integrationTasks);
      
      // Actualizar dependsOn para las tareas
      for (let i = 0; i < createdTasks.length; i++) {
        if (i > 0) {
          createdTasks[i].dependsOn = [createdTasks[i-1]._id];
          await createdTasks[i].save();
        }
      }
      
      allTasks = [...allTasks, ...createdTasks];
    }
    
    console.log('Creando ejecuciones para cada integración...');
    let allExecutions = [];
    for (const integration of createdIntegrations) {
      const integrationTasks = allTasks.filter(task => 
        task.integrationId.toString() === integration._id.toString()
      );
      
      const executions = createExecutionsForIntegration(integration._id, integrationTasks);
      const createdExecutions = await Execution.insertMany(executions);
      
      // Actualizar la última ejecución en la integración
      integration.lastExecution = {
        startTime: createdExecutions[0].startTime,
        endTime: createdExecutions[0].endTime,
        status: createdExecutions[0].status
      };
      await integration.save();
      
      allExecutions = [...allExecutions, ...createdExecutions];
    }
    
    console.log('Creando logs para cada ejecución...');
    for (const execution of allExecutions) {
      const integrationTasks = allTasks.filter(task => 
        task.integrationId.toString() === execution.integrationId.toString()
      );
      
      const logs = createLogsForExecution(
        execution._id,
        execution.integrationId,
        integrationTasks,
        execution.status
      );
      
      await Log.insertMany(logs);
    }
    
    console.log('Datos de prueba insertados correctamente!');
    console.log(`- ${createdIntegrations.length} integraciones`);
    console.log(`- ${allTasks.length} tareas`);
    console.log(`- ${allExecutions.length} ejecuciones`);
    
    // Desconectar de la base de datos
    await database.disconnect();
    
  } catch (error) {
    console.error('Error al insertar datos de prueba:', error);
    process.exit(1);
  }
};

// Ejecutar la función
seedDatabase();
