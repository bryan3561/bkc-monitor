import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  getIntegrationDetails,
  getRecentExecutions,
  getIntegrationLogs,
  runIntegration,
  updateIntegration
} from '../services/integrationService';
import { useNotifications } from '../components/NotificationProvider';
import ConfigurationModal from '../components/ConfigurationModal';
import TaskLogs from '../components/TaskLogs';
import IntegrationDashboardCard from '../components/IntegrationDashboardCard';

// Componente para la vista detallada de una integración
const IntegrationDetailView = ({ integrationId }) => {
  // Estado para almacenar los datos de la integración
  const [integration, setIntegration] = useState(null);
  const [executions, setExecutions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('resumen');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [taskLogs, setTaskLogs] = useState([]);
  
  // Acceder a las notificaciones
  const { showSuccess, showError, showInfo } = useNotifications();

  // Colores pastel para los gráficos
  const colors = {
    success: '#a7f3d0', // Verde pastel (Tailwind green-200)
    error: '#fecaca',   // Rojo pastel (Tailwind red-200)
    task: '#bfdbfe',    // Azul pastel (Tailwind blue-200)
    background: '#f9fafb', // Gris muy claro (Tailwind gray-50)
    text: '#374151',    // Gris oscuro (Tailwind gray-700)
  };
  
  // Función para filtrar logs de una tarea específica
  const getTaskLogs = (taskId) => {
    if (!taskId) return logs;
    return logs.filter(log => log.taskId === parseInt(taskId));
  };

  // Función para ejecutar manualmente la integración
  const handleRunIntegration = async () => {
    try {
      setIsRunning(true);
      showInfo("Iniciando ejecución de la integración...");
      await runIntegration(integrationId);
      
      // Esperar un momento y luego actualizar los datos
      setTimeout(() => {
        fetchAllData();
        setIsRunning(false);
        showSuccess("Integración ejecutada correctamente");
      }, 1000);
    } catch (err) {
      console.error('Error al ejecutar la integración:', err);
      setIsRunning(false);
      showError(`Error al ejecutar la integración: ${err.message}`);
    }
  };

  // Función para abrir/cerrar el panel de configuración
  const toggleConfig = () => {
    setIsConfigOpen(prev => !prev);
  };

  // Función para manejar cambios en la configuración
  const handleUpdateConfig = async (updatedConfig) => {
    try {
      showInfo("Guardando configuración...");
      // Llamada a la API para actualizar la configuración
      await updateIntegration(integrationId, updatedConfig);
      
      // Actualizamos los datos
      await fetchAllData();
      
      // Cerramos el panel de configuración
      setIsConfigOpen(false);
      showSuccess("Configuración guardada correctamente");
    } catch (err) {
      console.error('Error al actualizar la configuración:', err);
      showError(`Error al guardar la configuración: ${err.message}`);
    }
  };
  
  // Función para cargar todos los datos necesarios
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cargar detalles de la integración
      const integrationData = await getIntegrationDetails(integrationId);
      setIntegration(integrationData);
      
      // Cargar ejecuciones recientes
      const executionsData = await getRecentExecutions(integrationId);
      setExecutions(executionsData);
      
      // Cargar logs generales
      const logsData = await getIntegrationLogs(integrationId);
      setLogs(logsData);
      
      setLoading(false);
    } catch (err) {
      console.error('Error al cargar los datos:', err);
      setError(`Error al cargar los datos: ${err.message}`);
      setLoading(false);
    }
  };
  
  // Función para cargar logs específicos de una tarea
  const fetchTaskLogs = async (taskId) => {
    try {
      // Si no hay ID de tarea, cargamos todos los logs
      const options = {
        limit: 50, // Aumentamos el límite para ver más logs
        sortOrder: 'desc' // Más recientes primero
      };
      
      // Si hay ID de tarea, filtramos por ella
      if (taskId) {
        options.taskId = taskId;
      }
      
      // Indicamos que estamos cargando logs
      showInfo(`Cargando logs${taskId ? ' de la tarea seleccionada' : ''}...`);
      
      // Obtenemos los logs
      const taskLogsData = await getIntegrationLogs(integrationId, options);
      
      // Actualizamos el estado
      setTaskLogs(taskLogsData);
      
      // Notificación de éxito
      if (taskLogsData.length > 0) {
        showSuccess(`${taskLogsData.length} logs cargados correctamente`);
      } else {
        showInfo('No se encontraron logs para esta selección');
      }
    } catch (err) {
      console.error('Error al cargar logs de la tarea:', err);
      showError(`Error al cargar los logs: ${err.message}`);
    }
  };
  
  // Efecto para cargar los datos de la integración
  useEffect(() => {
    if (integrationId) {
      fetchAllData();
    }
  }, [integrationId]);
  
  // Efecto para cargar logs cuando se selecciona una tarea
  useEffect(() => {
    if (selectedTaskId) {
      fetchTaskLogs(selectedTaskId);
    }
  }, [selectedTaskId]);

  // Renderizar estado de carga o error
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-300"></div>
      </div>
    );
  }

  if (error || !integration) {
    return (
      <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error || 'No se pudo cargar la integración'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado y controles */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl font-bold text-gray-800">{integration.name}</h1>
          <p className="text-gray-600 mt-2">{integration.description}</p>
          <div className="flex items-center mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              integration.status === 'active' ? 'bg-green-100 text-green-800' :
              integration.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
              'bg-yellow-100 text-yellow-800'
            }`}>
              {integration.status === 'active' ? 'Activo' : 
               integration.status === 'inactive' ? 'Inactivo' : 
               'Pausado'}
            </span>
            <span className="ml-3 text-sm text-gray-500">Última ejecución: {integration.lastRun ? new Date(integration.lastRun).toLocaleString('es-ES') : 'Nunca'}</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={toggleConfig}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configurar
          </button>
          
          <button
            onClick={handleRunIntegration}
            disabled={isRunning}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Ejecutando...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ejecutar ahora
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Navegación de pestañas */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'resumen'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('resumen')}
          >
            Resumen
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tareas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('tareas')}
          >
            Tareas
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'ejecuciones'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('ejecuciones')}
          >
            Historial de Ejecuciones
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('logs')}
          >
            Logs
          </button>
        </nav>
      </div>

      {/* Contenido según la pestaña seleccionada */}
      {activeTab === 'resumen' && (
        <div>
          {/* Gráfico de ejecuciones recientes */}
          <div className="mb-8 bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Últimas Ejecuciones</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={executions}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="time" />
                  <YAxis label={{ value: 'Duración (s)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', borderColor: '#e5e7eb' }}
                    formatter={(value, name) => [`${value} segundos`, 'Duración']}
                    labelFormatter={(label) => `Hora: ${label}`}
                  />
                  <Bar dataKey="duration" name="Duración">
                    {executions.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === 'success' ? colors.success : colors.error} 
                        stroke={entry.status === 'success' ? '#10b981' : '#ef4444'} 
                        strokeWidth={1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-end mt-2 gap-4">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-200 border border-green-500 inline-block mr-2"></span>
                <span className="text-sm text-gray-600">Correcto</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-red-200 border border-red-500 inline-block mr-2"></span>
                <span className="text-sm text-gray-600">Error</span>
              </div>
            </div>
          </div>

          {/* Resumen en dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Tareas actuales */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Tareas Actuales</h2>
              <div className="space-y-4">
                {integration.currentTasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden ${
                      selectedTaskId === task.id ? 'border-blue-300 ring-2 ring-blue-100' : ''
                    }`}
                  >
                    <div 
                      className="flex items-center p-3 cursor-pointer"
                      onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                        task.status === 'completed' ? 'bg-green-100 text-green-600' : 
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {task.order}
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-gray-800">{task.name}</h3>
                        <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.status === 'completed' ? 'bg-green-100 text-green-600' : 
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {task.status === 'completed' ? 'Completado' : 
                            task.status === 'in_progress' ? 'En progreso' : 
                            'Pendiente'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {task.estimatedTime}s estimados
                          </span>
                        </div>
                      </div>
                      <div className="ml-3">
                        <svg className={`w-5 h-5 transition-transform ${selectedTaskId === task.id ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    {selectedTaskId === task.id && (
                      <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Configuración
                          </h4>
                          <div className="bg-gray-50 rounded p-2 text-xs">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(task.config, null, 2)}
                            </pre>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                            Logs relacionados
                          </h4>
                          <TaskLogs 
                            logs={logs.filter(log => log.taskId === task.id)} 
                            isLoading={false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <button 
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setActiveTab('tareas')}
                >
                  Ver todas las tareas
                </button>
              </div>
            </div>
            
            {/* Estadísticas */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Estadísticas</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Estado General</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Tasa de éxito</p>
                      <p className="text-xl font-semibold text-gray-800">{integration.stats.successfulRuns / integration.stats.totalRuns * 100}%</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Total ejecuciones</p>
                      <p className="text-xl font-semibold text-gray-800">{integration.stats.totalRuns}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Duración media</p>
                      <p className="text-xl font-semibold text-gray-800">{integration.averageDuration}s</p>
                    </div>
                  </div>
                </div>
                
                {/* Estadísticas semanales */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Última semana</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Ejecuciones</p>
                      <p className="text-xl font-semibold text-gray-800">{integration.stats.lastWeekRuns}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100 text-green-600">
                      <p className="text-xs text-gray-500 mb-1">Exitosas</p>
                      <p className="text-xl font-semibold">{integration.stats.lastWeekSuccess}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-gray-100 text-red-600">
                      <p className="text-xs text-gray-500 mb-1">Fallidas</p>
                      <p className="text-xl font-semibold">{integration.stats.lastWeekFailed}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Próxima ejecución programada</h3>
                  <p className="text-gray-800">{new Date(integration.nextRun).toLocaleString('es-ES')}</p>
                  <p className="text-xs text-gray-500 mt-1">Programación: <code className="bg-gray-100 px-1 py-0.5 rounded">{integration.schedule}</code></p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Estadísticas semanales */}
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Estadísticas de la Última Semana</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Ejecuciones</p>
                    <h3 className="text-2xl font-semibold text-gray-800">{integration.stats.lastWeekRuns}</h3>
                  </div>
                  <svg className="w-12 h-12 text-blue-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                  </svg>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Exitosas</p>
                    <h3 className="text-2xl font-semibold text-green-600">{integration.stats.lastWeekSuccess}</h3>
                  </div>
                  <svg className="w-12 h-12 text-green-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Fallidas</p>
                    <h3 className="text-2xl font-semibold text-red-600">{integration.stats.lastWeekFailed}</h3>
                  </div>
                  <svg className="w-12 h-12 text-red-200" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Pestaña de Tareas */}
      {activeTab === 'tareas' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Configuración de Tareas</h2>
            <p className="text-gray-600">Esta integración consta de {integration.currentTasks.length} tareas que se ejecutan secuencialmente.</p>
          </div>
          
          <div className="space-y-6">
            {integration.currentTasks.map((task) => (
              <div 
                key={task.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                >
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                      task.status === 'completed' ? 'bg-green-100 text-green-600' : 
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-600' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {task.order}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{task.name}</h3>
                      <p className="text-sm text-gray-500">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-4 px-2 py-1 text-xs rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {task.status === 'completed' ? 'Completado' : 
                      task.status === 'in_progress' ? 'En progreso' : 
                      'Pendiente'}
                    </span>
                    <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${selectedTaskId === task.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                
                {/* Detalles expandibles de la tarea */}
                {selectedTaskId === task.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Tiempo Estimado</h4>
                        <p className="text-gray-800">{task.estimatedTime} segundos</p>
                      </div>
                      
                      {task.actualTime !== null && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Tiempo Real</h4>
                          <p className="text-gray-800">{task.actualTime} segundos</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Configuración</h4>
                      <div className="bg-gray-100 p-3 rounded-lg overflow-x-auto">
                        <pre className="text-xs text-gray-700">{JSON.stringify(task.config, null, 2)}</pre>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Logs Relacionados</h4>
                      <div>
                        <TaskLogs 
                          logs={taskLogs.length > 0 ? taskLogs : logs.filter(log => log.taskId === task.id)} 
                          isLoading={selectedTaskId === task.id && taskLogs.length === 0}
                        />
                        <div className="mt-3 flex justify-end">
                          <button 
                            onClick={() => fetchTaskLogs(task.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Actualizar logs
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Pestaña de Historial de Ejecuciones */}
      {activeTab === 'ejecuciones' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Historial de Ejecuciones</h2>
            <p className="text-gray-600">Registro detallado de todas las ejecuciones recientes de esta integración.</p>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tareas OK</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tareas Error</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {executions.map((execution) => (
                    <tr key={execution.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          execution.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {execution.status === 'success' ? 'Éxito' : 'Error'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{execution.duration}s</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{execution.tasks_completed}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{execution.tasks_failed}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                        <button className="text-blue-600 hover:text-blue-900">Ver detalles</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Anterior
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">1</span> a <span className="font-medium">7</span> de <span className="font-medium">12</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Previous</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">1</button>
                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-blue-50 text-sm font-medium text-blue-600 hover:bg-blue-100">2</button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <span className="sr-only">Next</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Pestaña de Logs */}
      {activeTab === 'logs' && (
        <div>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-1 text-gray-700">Logs de la Integración</h2>
              <p className="text-gray-600">Registro completo de actividad de la integración.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <label htmlFor="filterTask" className="block text-sm text-gray-500 mb-1">Filtrar por tarea</label>
                <select
                  id="filterTask"
                  className="block w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                  value={selectedTaskId || ''}
                  onChange={(e) => setSelectedTaskId(e.target.value ? parseInt(e.target.value) : null)}
                >
                  <option value="">Todas las tareas</option>
                  {integration.currentTasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.order}. {task.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="filterLevel" className="block text-sm text-gray-500 mb-1">Nivel</label>
                <select
                  id="filterLevel"
                  className="block w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                >
                  <option>Todos</option>
                  <option>Info</option>
                  <option>Warning</option>
                  <option>Error</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-700">
                  {selectedTaskId 
                    ? `Logs para la tarea: ${integration.currentTasks.find(t => t.id === selectedTaskId)?.name || ''}`
                    : 'Todos los logs'
                  }
                </h3>
                <button 
                  onClick={() => {
                    fetchTaskLogs(selectedTaskId);
                    showInfo('Actualizando logs...');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualizar logs
                </button>
              </div>
              
              <TaskLogs 
                logs={selectedTaskId ? taskLogs : logs} 
                isLoading={false}
              />
              
              {logs.length === 0 && (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay logs disponibles</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron logs para esta integración.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Panel de configuración - Aparece cuando isConfigOpen es true */}
      {isConfigOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Configuración de la Integración</h3>
              <button
                onClick={toggleConfig}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-128px)]">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Información General</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Nombre</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={integration.name || ''}
                        readOnly
                      />
                      <p className="text-xs text-gray-400 mt-1">Para cambiar el nombre, cree una nueva integración</p>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Descripción</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        rows={3}
                      >{integration.description}</textarea>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Estado</label>
                      <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                        <option value="active" selected={integration.status === 'active'}>Activo</option>
                        <option value="inactive" selected={integration.status === 'inactive'}>Inactivo</option>
                        <option value="paused" selected={integration.status === 'paused'}>Pausado</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Programación</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Expresión Cron</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={integration.schedule || '0 0 * * *'}
                      />
                      <p className="text-xs text-gray-400 mt-1">Formato: minutos hora día-mes mes día-semana</p>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-md">
                      <h5 className="text-xs font-medium text-blue-700 mb-2">Ejemplos comunes:</h5>
                      <ul className="text-xs text-blue-600 space-y-1">
                        <li>• <code>0 */3 * * *</code> - Cada 3 horas</li>
                        <li>• <code>0 9-17 * * 1-5</code> - Cada hora de 9AM a 5PM, de lunes a viernes</li>
                        <li>• <code>0 0 * * *</code> - Diariamente a medianoche</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Conexiones</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">URL del servicio</label>
                      <input 
                        type="text" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={integration.serviceUrl || ''}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">API Key</label>
                      <div className="flex">
                        <input 
                          type="password" 
                          className="flex-grow border border-gray-300 rounded-md rounded-r-none px-3 py-2"
                          value="••••••••••••••••"
                        />
                        <button className="bg-gray-100 border border-l-0 border-gray-300 rounded-r-md px-3 hover:bg-gray-200">
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Configuración de Notificaciones</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input type="checkbox" id="notifyOnError" className="mr-2" checked />
                      <label htmlFor="notifyOnError" className="text-xs">Notificar errores</label>
                    </div>
                    <div className="flex items-center">
                      <input type="checkbox" id="notifyOnSuccess" className="mr-2" />
                      <label htmlFor="notifyOnSuccess" className="text-xs">Notificar ejecuciones exitosas</label>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1 mt-2">Correos electrónicos para notificaciones</label>
                      <textarea 
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-xs"
                        rows={2}
                        placeholder="Ingresa los correos separados por comas"
                      >usuario@ejemplo.com, admin@ejemplo.com</textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={toggleConfig}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleUpdateConfig({
                  // aquí iría la actualización de la configuración
                  status: integration.status,
                  description: integration.description,
                  schedule: integration.schedule
                })}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationDetailView;
