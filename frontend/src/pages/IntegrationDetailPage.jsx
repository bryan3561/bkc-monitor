import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import IntegrationDetailView from '../views/IntegrationDetailView';
import { useNotifications } from '../components/NotificationProvider';
import { getIntegrationDetails } from '../services/integrationService';

// Página de detalle de integración
const IntegrationDetailPage = () => {
  // Obtener el ID de la integración desde los parámetros de la URL
  const { id } = useParams();
  const navigate = useNavigate();
  const { showError } = useNotifications();
  
  const [loading, setLoading] = useState(true);
  const [integration, setIntegration] = useState(null);
  
  // Cargar los datos de la integración
  useEffect(() => {
    const loadIntegration = async () => {
      try {
        setLoading(true);
        const data = await getIntegrationDetails(id);
        setIntegration(data);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar la integración", error);
        showError(`No se pudo cargar la integración: ${error.message}`);
        navigate('/integrations');
      }
    };
    
    loadIntegration();
  }, [id, showError, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-300"></div>
        </div>
      ) : (
        <IntegrationDetailView integrationId={id} />
      )}
    </div>
  );
};

export default IntegrationDetailPage;
