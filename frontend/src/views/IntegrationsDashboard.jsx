// filepath: /home/bcontreras/www/containers/bkc-monitor/frontend/src/views/IntegrationsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import IntegrationForm from '../components/IntegrationForm';
import IntegrationDashboardCard from '../components/IntegrationDashboardCard';
import { getAllIntegrations } from '../services/integrationService';
import { useNotifications } from '../components/NotificationProvider';

const IntegrationsDashboard = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const { showSuccess, showError } = useNotifications();

  // Función para cargar las integraciones
  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      
      // Opciones de filtrado
      const options = {};
      if (filterStatus !== 'all') {
        options.status = filterStatus;
      }
      if (searchTerm) {
        options.search = searchTerm;
      }
      
      // Usamos nuestro servicio para obtener las integraciones
      const data = await getAllIntegrations(options);
      setIntegrations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar las integraciones:', error);
      setError('Error al cargar las integraciones');
      showError(`Error al cargar las integraciones: ${error.message}`);
      setLoading(false);
    }
  };
  
  // Cargar integraciones cuando cambian los filtros
  useEffect(() => {
    fetchIntegrations();
  }, [filterStatus, searchTerm]);

  // Filtrar integraciones según búsqueda (filtro adicional en cliente)
  const filteredIntegrations = integrations.filter(integration => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      searchTerm === '' || 
      integration.name.toLowerCase().includes(searchLower) ||
      integration.description.toLowerCase().includes(searchLower);
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado con filtros */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-800">Integraciones</h1>
          <p className="text-gray-600 mt-1">
            {filteredIntegrations.length} {filteredIntegrations.length === 1 ? 'integración' : 'integraciones'} disponibles
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar integraciones..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <select
            className="border border-gray-300 rounded-md py-2 px-3 focus:ring-blue-500 focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
            <option value="paused">Pausados</option>
            <option value="error">Con errores</option>
          </select>
          
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Nueva Integración
          </button>
        </div>
      </div>

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {!loading && !error && filteredIntegrations.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron integraciones</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' ? 'Prueba con otros filtros o términos de búsqueda.' : 'Comienza creando una nueva integración.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowAddModal(true)}
            >
              <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Nueva Integración
            </button>
          </div>
        </div>
      )}

      {/* Lista de integraciones */}
      {!loading && !error && filteredIntegrations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map(integration => (
            <IntegrationDashboardCard key={integration.id} integration={integration} />
          ))}
        </div>
      )}

      {/* Modal para crear nueva integración */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Nueva Integración</h3>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowAddModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-128px)]">
              <IntegrationForm 
                onSubmit={async (data) => {
                  try {
                    // Aquí iría la lógica para crear una nueva integración
                    // Por ahora, simplemente simulamos éxito
                    setShowAddModal(false);
                    await fetchIntegrations(); // Recargar las integraciones
                    showSuccess('Integración creada exitosamente');
                  } catch (error) {
                    showError(`Error al crear la integración: ${error.message}`);
                  }
                }}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsDashboard;
