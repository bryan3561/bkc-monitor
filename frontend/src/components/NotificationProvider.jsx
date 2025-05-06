import React, { useState, useEffect, createContext, useContext } from 'react';

// Contexto para las notificaciones
const NotificationContext = createContext();

// Tipos de notificaciones con colores correspondientes
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Configuración de estilo según el tipo
const getTypeStyles = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return 'bg-green-100 border-green-500 text-green-800';
    case NOTIFICATION_TYPES.ERROR:
      return 'bg-red-100 border-red-500 text-red-800';
    case NOTIFICATION_TYPES.WARNING:
      return 'bg-yellow-100 border-yellow-500 text-yellow-800';
    case NOTIFICATION_TYPES.INFO:
    default:
      return 'bg-blue-100 border-blue-500 text-blue-800';
  }
};

// Iconos según el tipo de notificación
const NotificationIcon = ({ type }) => {
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    case NOTIFICATION_TYPES.ERROR:
      return (
        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    case NOTIFICATION_TYPES.WARNING:
      return (
        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      );
    case NOTIFICATION_TYPES.INFO:
    default:
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
  }
};

// Componente de notificación individual
const NotificationItem = ({ id, message, type, onClose }) => {
  // Auto-cerrar después de unos segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000); // 5 segundos
    
    return () => clearTimeout(timer);
  }, [id, onClose]);
  
  return (
    <div 
      className={`${getTypeStyles(type)} border-l-4 p-4 mb-3 rounded shadow-md flex justify-between items-start transition-all duration-500 transform`}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 mr-2">
          <NotificationIcon type={type} />
        </div>
        <div>{message}</div>
      </div>
      <button
        onClick={() => onClose(id)}
        className="ml-4 text-gray-500 hover:text-gray-800"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>
  );
};

// Proveedor de notificaciones
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  
  // Agregar una nueva notificación
  const addNotification = (message, type = NOTIFICATION_TYPES.INFO) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    return id;
  };
  
  // Eliminar una notificación por ID
  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  // Funciones de conveniencia para cada tipo de notificación
  const showSuccess = (message) => addNotification(message, NOTIFICATION_TYPES.SUCCESS);
  const showError = (message) => addNotification(message, NOTIFICATION_TYPES.ERROR);
  const showWarning = (message) => addNotification(message, NOTIFICATION_TYPES.WARNING);
  const showInfo = (message) => addNotification(message, NOTIFICATION_TYPES.INFO);
  
  // Contexto que compartimos
  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
  
  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Contenedor de notificaciones */}
      {notifications.length > 0 && (
        <div className="fixed top-0 right-0 p-4 w-full max-w-md z-50">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              {...notification}
              onClose={removeNotification}
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};

// Hook para usar el sistema de notificaciones
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};

// Constantes exportadas para usarlas en toda la aplicación
export const NotificationTypes = NOTIFICATION_TYPES;

export default NotificationProvider;
