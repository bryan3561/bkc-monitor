import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Tarjeta para mostrar información resumida de una integración en el dashboard
 */
const IntegrationDashboardCard = ({ integration }) => {
  // Obtener el color de acuerdo al estado de la integración
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  // Obtener icono según el tipo de integración
  const getIntegrationTypeIcon = (type) => {
    switch (type) {
      case 'api':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'database':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
        );
      case 'file':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
    }
  };

  // Formatear fecha para mejor visualización
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    // Si ya es un formato de fecha/hora legible, devolver tal cual
    if (dateString.includes(' ')) return dateString;
    
    // Si es un ISO string, convertir a formato más amigable
    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Calcular indicador visual de tasa de éxito
  const successRateIndicator = () => {
    const rate = integration.successRate || 0;
    let width = `${rate}%`;
    let bgColor = 'bg-green-500';
    
    if (rate < 60) bgColor = 'bg-red-500';
    else if (rate < 80) bgColor = 'bg-yellow-500';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div className={`${bgColor} h-1.5 rounded-full`} style={{ width }}></div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-4 ${
              integration.type === 'api' ? 'text-blue-700 bg-blue-100' :
              integration.type === 'database' ? 'text-purple-700 bg-purple-100' :
              'text-gray-700 bg-gray-100'
            }`}>
              {getIntegrationTypeIcon(integration.type)}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800">{integration.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{integration.description}</p>
            </div>
          </div>
          
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
            {integration.status === 'active' ? 'Activo' : 
             integration.status === 'inactive' ? 'Inactivo' : 
             integration.status === 'paused' ? 'Pausado' : 'Error'}
          </span>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Última ejecución</p>
            <div className="flex items-center mt-1">
              <span className={`w-2 h-2 rounded-full mr-2 ${
                integration.lastExecution?.status === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}></span>
              <span className="text-sm">{formatDate(integration.lastExecution?.timestamp)}</span>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500">Próxima ejecución</p>
            <p className="text-sm mt-1">{formatDate(integration.nextExecution)}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">Tasa de éxito</p>
            <p className="text-xs font-medium">{integration.successRate}%</p>
          </div>
          {successRateIndicator()}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
          <Link 
            to={`/integrations/${integration.id}`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default IntegrationDashboardCard;
