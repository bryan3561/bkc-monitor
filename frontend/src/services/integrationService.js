// Servicio para manejar las llamadas a la API relacionadas con integraciones

// URL base de la API - En un ambiente real, esto vendría de una variable de entorno
const API_BASE_URL = '/api';

// Para propósitos de demostración, usamos datos simulados
let mockIntegrations = [
  { 
    id: 1, 
    name: "Sincronización de Inventario", 
    description: "Actualiza el inventario desde el sistema ERP",
    status: "active",
    schedule: "0 */3 * * *", // Cada 3 horas
    lastRun: "2025-05-02T08:00:00",
    nextRun: "2025-05-02T11:00:00",
    averageDuration: 42,
    successRate: 75,
    type: "api",
    lastExecution: { status: 'success', timestamp: '2025-05-02 08:00' },
    nextExecution: '2025-05-02 11:00',
    tasksCount: 4,
    stats: {
      totalRuns: 248,
      successfulRuns: 186,
      failedRuns: 62,
      averageDailyRuns: 8.3,
      lastWeekRuns: 57,
      lastWeekSuccess: 48,
      lastWeekFailed: 9
    },
    currentTasks: [
      { 
        id: 1, 
        name: "Conectar al API", 
        description: "Establece conexión con el API del sistema ERP",
        status: "completed", 
        order: 1,
        estimatedTime: 5,
        actualTime: 3,
        config: { endpoint: "https://erp-api.ejemplo.com/v2", timeout: 10000 }
      },
      { 
        id: 2, 
        name: "Descargar datos", 
        description: "Descarga los datos actualizados del inventario",
        status: "in_progress", 
        order: 2,
        estimatedTime: 15,
        actualTime: null,
        config: { format: "JSON", compressionEnabled: true }
      },
      { 
        id: 3, 
        name: "Procesar información", 
        description: "Analiza y procesa los datos descargados",
        status: "pending", 
        order: 3,
        estimatedTime: 10,
        actualTime: null,
        config: { batchSize: 500, validateSchema: true }
      },
      { 
        id: 4, 
        name: "Actualizar base de datos", 
        description: "Actualiza los registros en la base de datos local",
        status: "pending", 
        order: 4,
        estimatedTime: 20,
        actualTime: null,
        config: { transaction: true, backupEnabled: true }
      }
    ],
  },
  { 
    id: 2, 
    name: "Procesamiento de Pedidos", 
    description: "Procesa los pedidos nuevos del día",
    status: "active",
    type: "database",
    lastExecution: { status: 'error', timestamp: '2025-05-02 13:45:12' },
    nextExecution: '2025-05-02 19:00:00',
    tasksCount: 6,
    schedule: "0 */2 * * *",
    successRate: 74,
  }
];

// Función para simular retrasos de red
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Obtiene los detalles de una integración específica
 * @param {string|number} id - ID de la integración 
 * @returns {Promise<Object>} Datos de la integración
 */
export const getIntegrationDetails = async (id) => {
  try {
    // En un ambiente real, haríamos esto:
    // const response = await fetch(`${API_BASE_URL}/integrations/${id}`);
    // if (!response.ok) throw new Error(`Error al obtener los datos de la integración: ${response.status}`);
    // return await response.json();
    
    // Simulamos una llamada a la API con datos de ejemplo
    await delay(500); // Simular retraso de la red
    const integration = mockIntegrations.find(i => i.id === parseInt(id));
    
    if (!integration) {
      throw new Error(`No se encontró la integración con ID ${id}`);
    }
    
    return integration;
  } catch (error) {
    console.error('Error en getIntegrationDetails:', error);
    throw error;
  }
};

/**
 * Obtiene las ejecuciones recientes de una integración
 * @param {string|number} id - ID de la integración
 * @param {number} limit - Número máximo de ejecuciones a obtener
 * @returns {Promise<Array>} Lista de ejecuciones recientes
 */
export const getRecentExecutions = async (id, limit = 10) => {
  try {
    // TODO: Reemplazar con la URL real de la API
    const response = await fetch(`/api/integrations/${id}/executions?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener las ejecuciones recientes: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getRecentExecutions:', error);
    throw error;
  }
};

/**
 * Obtiene los logs recientes de una integración
 * @param {string|number} id - ID de la integración
 * @param {number} limit - Número máximo de logs a obtener
 * @returns {Promise<Array>} Lista de logs recientes
 */
export const getIntegrationLogs = async (id, limit = 20) => {
  try {
    // TODO: Reemplazar con la URL real de la API
    const response = await fetch(`/api/integrations/${id}/logs?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener los logs: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getIntegrationLogs:', error);
    throw error;
  }
};

/**
 * Ejecuta manualmente una integración
 * @param {string|number} id - ID de la integración
 * @returns {Promise<Object>} Resultado de la ejecución
 */
export const runIntegration = async (id) => {
  try {
    // TODO: Reemplazar con la URL real de la API
    const response = await fetch(`/api/integrations/${id}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error al ejecutar la integración: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en runIntegration:', error);
    throw error;
  }
};

/**
 * Obtener todas las integraciones con filtros opcionales
 * @param {Object} options - Opciones de filtrado
 * @param {string} options.status - Estado de la integración (active, inactive, all)
 * @param {string} options.search - Término de búsqueda para nombre o descripción
 * @returns {Promise<Array>} Lista de integraciones
 */
export const getAllIntegrations = async (options = {}) => {
  try {
    // Simulamos una llamada API con un pequeño retraso
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filtramos según las opciones recibidas
    let filteredIntegrations = [...mockIntegrations];
    
    // Filtrar por estado si se proporciona
    if (options.status && options.status !== 'all') {
      filteredIntegrations = filteredIntegrations.filter(
        integration => integration.status === options.status
      );
    }
    
    // Filtrar por búsqueda si se proporciona
    if (options.search) {
      const search = options.search.toLowerCase();
      filteredIntegrations = filteredIntegrations.filter(
        integration => 
          integration.name.toLowerCase().includes(search) ||
          integration.description.toLowerCase().includes(search)
      );
    }
    
    return filteredIntegrations;
  } catch (error) {
    console.error('Error al obtener integraciones:', error);
    throw error;
  }
};

/**
 * Actualizar la configuración de una integración
 * @param {string|number} integrationId - ID de la integración
 * @param {Object} updatedData - Datos actualizados para la integración
 * @returns {Promise<Object>} Integración actualizada
 */
export const updateIntegration = async (integrationId, updatedData) => {
  try {
    // Simulamos una llamada API con un pequeño retraso
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Buscamos la integración por ID
    const integrationIndex = mockIntegrations.findIndex(i => i.id === parseInt(integrationId));
    
    if (integrationIndex === -1) {
      throw new Error(`No se encontró la integración con ID ${integrationId}`);
    }
    
    // Actualizamos los datos
    mockIntegrations[integrationIndex] = {
      ...mockIntegrations[integrationIndex],
      ...updatedData,
      lastUpdated: new Date().toISOString()
    };
    
    return mockIntegrations[integrationIndex];
  } catch (error) {
    console.error('Error al actualizar integración:', error);
    throw error;
  }
};

// Funciones auxiliares
function getRandomLogMessage(level, taskId) {
  const messages = {
    info: [
      `Tarea ${taskId} iniciada correctamente`,
      `Conexión establecida con éxito`,
      `Datos recibidos (${Math.floor(Math.random() * 1000)} registros)`,
      `Proceso completado satisfactoriamente`
    ],
    warning: [
      `Tiempo de respuesta elevado (${Math.floor(Math.random() * 1000)}ms)`,
      `Reintentos necesarios: ${Math.floor(Math.random() * 3) + 1}`,
      `Datos parciales recibidos`,
      `Capacidad de memoria al ${Math.floor(Math.random() * 20) + 80}%`
    ],
    error: [
      `Error de conexión con el servidor`,
      `Tiempo de espera agotado después de ${Math.floor(Math.random() * 30) + 10} segundos`,
      `Error de autenticación: credenciales inválidas`,
      `Datos corruptos en la respuesta`
    ],
    debug: [
      `Enviando petición a endpoint /data/${taskId}`,
      `Headers: Content-Type: application/json, Authorization: Bearer ***`,
      `Procesando respuesta: ${Math.floor(Math.random() * 200)} ms`,
      `Memoria utilizada: ${Math.floor(Math.random() * 100)} MB`
    ]
  };
  
  return messages[level][Math.floor(Math.random() * messages[level].length)];
}

function getRandomErrorDetails() {
  const errors = [
    {
      code: "ERR_CONN_REFUSED",
      host: "api.ejemplo.com",
      port: 443,
      retries: Math.floor(Math.random() * 3) + 1
    },
    {
      code: "ERR_TIMEOUT",
      requestId: `req-${Date.now().toString(36)}`,
      timeout: 30000,
      endpoint: "/api/data"
    },
    {
      code: "ERR_AUTH",
      message: "El token de autorización ha expirado",
      timestamp: new Date().toISOString()
    },
    {
      code: "ERR_INVALID_DATA",
      message: "El formato de los datos no es válido",
      expected: "JSON",
      received: "texto plano"
    }
  ];
  
  return errors[Math.floor(Math.random() * errors.length)];
}
