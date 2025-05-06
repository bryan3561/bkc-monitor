import React, { useState } from 'react';

// Componente de formulario para crear o editar una integración
const IntegrationForm = ({ integration = null, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: integration?.name || '',
    description: integration?.description || '',
    type: integration?.type || 'api',
    schedule: integration?.schedule || '0 */3 * * *',
    status: integration?.status || 'active',
  });
  
  const [step, setStep] = useState(1);
  const [tasks, setTasks] = useState(integration?.tasks || []);
  const [newTask, setNewTask] = useState({ 
    name: '', 
    description: '', 
    order: (tasks.length || 0) + 1,
    config: {}
  });

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Manejar cambios en la tarea nueva
  const handleTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };
  
  // Añadir una nueva tarea
  const addTask = () => {
    if (newTask.name.trim()) {
      setTasks([...tasks, { ...newTask, id: Date.now() }]);
      setNewTask({ 
        name: '', 
        description: '', 
        order: tasks.length + 2,
        config: {}
      });
    }
  };
  
  // Mover a la siguiente etapa del formulario
  const nextStep = () => {
    setStep(step + 1);
  };
  
  // Mover a la etapa anterior del formulario
  const prevStep = () => {
    setStep(step - 1);
  };
  
  // Enviar el formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      tasks
    });
  };
  
  // Renderizar el formulario según la etapa actual
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm text-gray-500 mb-1">Nombre</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nombre de la integración"
                required
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm text-gray-500 mb-1">Tipo</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="block w-full bg-white border border-gray-200 text-gray-700 py-2 px-3 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="api">API</option>
                <option value="database">Base de datos</option>
                <option value="email">Email</option>
                <option value="custom">Personalizada</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm text-gray-500 mb-1">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción de la integración"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="schedule" className="block text-sm text-gray-500 mb-1">Programación (Cron)</label>
              <input
                type="text"
                id="schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                className="block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0 */3 * * *"
              />
              <p className="text-xs text-gray-500 mt-1">Formato: minuto hora día-mes mes día-semana</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-1">Estado inicial</label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-active"
                    name="status"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="status-active" className="ml-2 block text-sm text-gray-700">
                    Activo
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="status-inactive"
                    name="status"
                    value="inactive"
                    checked={formData.status === 'inactive'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="status-inactive" className="ml-2 block text-sm text-gray-700">
                    Inactivo
                  </label>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Tareas configuradas</h3>
              {tasks.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No hay tareas configuradas. Añade al menos una tarea.</p>
              ) : (
                <ul className="space-y-3">
                  {tasks.map((task, index) => (
                    <li key={task.id} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-sm mr-2">
                              {task.order}
                            </span>
                            <h4 className="font-medium text-gray-800">{task.name}</h4>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1 ml-8">{task.description}</p>
                          )}
                        </div>
                        <button 
                          type="button" 
                          className="text-red-500 hover:text-red-700"
                          onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3">Añadir nueva tarea</h3>
              <div className="space-y-3">
                <div>
                  <label htmlFor="task-name" className="block text-sm text-gray-500 mb-1">Nombre</label>
                  <input
                    type="text"
                    id="task-name"
                    name="name"
                    value={newTask.name}
                    onChange={handleTaskChange}
                    className="block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nombre de la tarea"
                  />
                </div>
                
                <div>
                  <label htmlFor="task-description" className="block text-sm text-gray-500 mb-1">Descripción</label>
                  <input
                    type="text"
                    id="task-description"
                    name="description"
                    value={newTask.description}
                    onChange={handleTaskChange}
                    className="block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción breve"
                  />
                </div>
                
                <div>
                  <label htmlFor="task-order" className="block text-sm text-gray-500 mb-1">Orden</label>
                  <input
                    type="number"
                    id="task-order"
                    name="order"
                    value={newTask.order}
                    onChange={handleTaskChange}
                    min="1"
                    className="block w-full border border-gray-200 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button 
                  type="button"
                  onClick={addTask}
                  className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors flex items-center justify-center"
                  disabled={!newTask.name.trim()}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Añadir Tarea
                </button>
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800">
              <h3 className="font-medium mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Resumen de la integración
              </h3>
              <p className="text-sm">Por favor verifica los detalles antes de crear la integración.</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Nombre</h4>
                  <p className="text-gray-800">{formData.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Tipo</h4>
                  <p className="text-gray-800">{formData.type === 'api' ? 'API' : 
                                      formData.type === 'database' ? 'Base de datos' : 
                                      formData.type === 'email' ? 'Email' : 'Personalizada'}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Descripción</h4>
                <p className="text-gray-800">{formData.description || 'Sin descripción'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Programación</h4>
                  <p className="text-gray-800">{formData.schedule}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Estado</h4>
                  <p className="text-gray-800">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      formData.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formData.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Tareas ({tasks.length})</h4>
                {tasks.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No se han configurado tareas.</p>
                ) : (
                  <ul className="space-y-1 mt-2">
                    {tasks.map((task) => (
                      <li key={task.id} className="text-sm">
                        <span className="font-medium">{task.order}. {task.name}</span>
                        {task.description && <span className="text-gray-500"> - {task.description}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Indicador de progreso */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <React.Fragment key={stepNumber}>
              <div 
                className={`flex flex-col items-center ${
                  step === stepNumber ? 'text-blue-600' : 
                  step > stepNumber ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === stepNumber ? 'border-blue-600 bg-blue-100' :
                  step > stepNumber ? 'border-green-600 bg-green-100' : 'border-gray-300'
                }`}>
                  {step > stepNumber ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className="text-xs mt-1">
                  {stepNumber === 1 ? 'Básico' : stepNumber === 2 ? 'Tareas' : 'Confirmar'}
                </span>
              </div>
              
              {stepNumber < 3 && (
                <div className={`flex-1 h-0.5 ${step > stepNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Contenido del paso actual */}
      {renderStepContent()}
      
      {/* Acciones del formulario */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={step === 1 ? onClose : prevStep}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          {step === 1 ? 'Cancelar' : 'Atrás'}
        </button>
        
        <button
          type={step === 3 ? 'submit' : 'button'}
          onClick={step < 3 ? nextStep : undefined}
          disabled={step === 2 && tasks.length === 0}
          className={`px-4 py-2 ${
            step === 3 ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-100 hover:bg-blue-200'
          } ${
            step === 3 ? 'text-white' : 'text-blue-700'
          } rounded-lg transition-colors ${
            step === 2 && tasks.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {step < 3 ? 'Siguiente' : 'Crear Integración'}
        </button>
      </div>
    </form>
  );
};

export default IntegrationForm;
