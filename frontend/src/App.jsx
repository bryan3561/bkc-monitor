import React from 'react';
import AppRouter from './AppRouter';
import { NotificationProvider } from './components/NotificationProvider';

// Componente principal de la aplicación
const App = () => {
  return (
    <NotificationProvider>
      <AppRouter />
    </NotificationProvider>
  );
};

export default App;
