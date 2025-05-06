import React, { useState, useMemo } from 'react';

/**
 * Componente para mostrar los logs de una tarea específica
 * Con capacidades de filtrado y mejores visualizaciones
 */
const TaskLogs = ({ logs, isLoading }) => {
  // Estados para el filtro
  const [levelFilter, setLevelFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  
  // Función para obtener el color de fondo según el nivel del log
  const getLogLevelStyle = (level) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-50 border-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-100 text-blue-800';
      case 'debug':
        return 'bg-gray-50 border-gray-100 text-gray-800';
      default:
        return 'bg-gray-50 border-gray-100 text-gray-800';
    }
  };
  
  // Filtrar los logs según los criterios seleccionados
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filtro por nivel
      if (levelFilter !== 'all' && log.level.toLowerCase() !== levelFilter.toLowerCase()) {
        return false;
      }
      
      // Filtro por texto
      if (searchText && !log.message.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [logs, levelFilter, searchText]);
  
  // Función para obtener el icono según el nivel del log
  const LogLevelIcon = ({ level }) => {
    switch (level.toLowerCase()) {
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  // Si no hay logs, mostramos un mensaje
  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500 bg-gray-50 rounded-lg">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-300 mb-2"></div>
            <p>Cargando logs...</p>
          </>
        ) : (
          <>
            <svg className="h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No hay logs disponibles para esta tarea</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-auto max-h-60 border border-gray-200 rounded-lg">
      <div className="divide-y divide-gray-100">
        {filteredLogs.map(log => (
          <div 
            key={log.id} 
            className={`flex items-start p-3 ${getLogLevelStyle(log.level)}`}
          >
            <div className="flex-shrink-0 mr-3">
              <LogLevelIcon level={log.level} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700 font-medium">[{log.timestamp}]</p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  log.level.toLowerCase() === 'error' ? 'bg-red-100 text-red-800' :
                  log.level.toLowerCase() === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  log.level.toLowerCase() === 'info' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {log.level}
                </span>
              </div>
              <p className="text-sm mt-1">{log.message}</p>
              {log.details && (
                <div className="mt-1">
                  <details className="text-xs">
                    <summary className="text-gray-500 cursor-pointer hover:text-gray-700">
                      Ver detalles
                    </summary>
                    <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200 overflow-x-auto">
                      <pre className="text-xs whitespace-pre-wrap">
                        {typeof log.details === 'object' 
                          ? JSON.stringify(log.details, null, 2) 
                          : log.details}
                      </pre>
                    </div>
                  </details>
                </div>
              )}
            </div>
            {log.taskId && (
              <div className="ml-2 flex-shrink-0">
                <span className="text-xs text-gray-500">Tarea #{log.taskId}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskLogs;
