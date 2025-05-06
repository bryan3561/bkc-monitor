import React from 'react';
import { Link } from 'react-router-dom';

// Página de error 404
const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-6xl font-bold text-blue-300 mb-4">404</h1>
      <h2 className="text-2xl font-medium text-gray-800 mb-6">Página no encontrada</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        La página que estás buscando no existe o ha sido movida.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
