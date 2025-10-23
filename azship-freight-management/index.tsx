import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Importar
// Opcional: Importar DevTools
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Criar uma instância do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Cache por 5 minutos (exemplo)
      retry: 1, // Tentar buscar 1 vez em caso de erro
    },
  },
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* Envolver o App com o Provider */}
    <QueryClientProvider client={queryClient}>
      <App />
      {/* Opcional: Adicionar DevTools (visível apenas em desenvolvimento) */}
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </React.StrictMode>
);
