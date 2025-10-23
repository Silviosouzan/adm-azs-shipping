import React, { useState, useEffect, useCallback } from 'react';
import { Freight, PaginatedFreights } from './types';
import * as freightService from './services/freightService';
import { FreightFilters } from './services/freightService';
import FreightForm from './components/FreightForm';
import Modal from './components/Modal';
import Highlight from './components/Highlight';
import Filters from './components/Filters';
import { PlusIcon, PencilIcon, TrashIcon, SearchIcon, ArchiveBoxIcon, InformationCircleIcon, XMarkIcon } from './components/icons';

const App: React.FC = () => {
  const [freights, setFreights] = useState<PaginatedFreights>({
    content: [], totalElements: 0, number: 0, size: 10, totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'error' | 'success', message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState<FreightFilters>({
    status: '',
    propertyKey: '',
    propertyValue: '',
  });
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [freightToEdit, setFreightToEdit] = useState<Freight | null>(null);

  const [freightToDelete, setFreightToDelete] = useState<Freight | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const loadFreights = useCallback(() => {
    setIsLoading(true);
    // Do not clear notification here to allow users to see success/error messages from previous actions
    // setNotification(null); 
    freightService.fetchFreights(searchTerm, currentPage, 10, filters)
      .then(pageResult => {
        setFreights(pageResult);
      })
      .catch((err) => {
        console.error("Fetch Freights Error:", err);
        setNotification({ type: 'error', message: `Falha ao carregar fretes: ${err.message}` });
        setFreights({ content: [], totalElements: 0, number: 0, size: 10, totalPages: 0 });
      })
      .finally(() => setIsLoading(false));
  }, [searchTerm, currentPage, filters]);

  useEffect(() => {
    freightService.getUniqueStatuses()
      .then(setAvailableStatuses)
      .catch(err => {
          console.error("Failed to load statuses:", err)
          setNotification({ type: 'error', message: 'Não foi possível carregar a lista de status. O backend está online?' });
      });
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      loadFreights();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [loadFreights]);

  const handleFilterChange = (newFilters: Partial<FreightFilters>) => {
    setCurrentPage(1);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setCurrentPage(1);
    setFilters({ status: '', propertyKey: '', propertyValue: '' });
    setSearchTerm('');
  };

  const handleOpenCreateModal = () => {
    setFreightToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (freight: Freight) => {
    setFreightToEdit(freight);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteConfirm = (freight: Freight) => {
    setFreightToDelete(freight);
    setIsConfirmModalOpen(true);
  }

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setFreightToEdit(null);
    setIsConfirmModalOpen(false);
    setFreightToDelete(null);
  };

  const handleSaveFreight = async (data: Omit<Freight, 'id'> | Freight) => {
    setIsSaving(true);
    setNotification(null);
    try {
      const isEditing = 'id' in data && data.id != null;
      if (isEditing) {
        await freightService.updateFreight(data.id, data);
      } else {
        await freightService.createFreight(data);
      }
      setNotification({ type: 'success', message: `Frete ${isEditing ? 'atualizado' : 'cadastrado'} com sucesso!` });
      freightService.getUniqueStatuses().then(setAvailableStatuses).catch(err => console.error("Failed to reload statuses:", err));
      handleCloseModals();
      loadFreights();
    } catch (err: any) {
       console.error("Save Freight Error:", err);
       setNotification({ type: 'error', message: `Falha ao salvar o frete: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteFreight = async () => {
    if (!freightToDelete) return;
    setIsSaving(true);
    setNotification(null);
    try {
      await freightService.deleteFreight(freightToDelete.id);
      setNotification({ type: 'success', message: 'Frete removido com sucesso!' });
      handleCloseModals();
      if (freights.content.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        loadFreights();
      }
       freightService.getUniqueStatuses().then(setAvailableStatuses).catch(err => console.error("Failed to reload statuses:", err));
    } catch (err: any) {
       console.error("Delete Freight Error:", err);
       setNotification({ type: 'error', message: `Falha ao remover o frete: ${err.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= freights.totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getStatusStyle = (status: string | undefined | null): { chip: string, border: string } => {
      if (!status) return { chip: 'bg-gray-100 text-gray-800', border: 'border-gray-300' };
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes('entregue')) return { chip: 'bg-green-100 text-green-800', border: 'border-green-500' };
      if (lowerStatus.includes('trânsito')) return { chip: 'bg-orange-100 text-orange-800', border: 'border-orange-500' };
      if (lowerStatus.includes('aguardando')) return { chip: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-500' };
      if (lowerStatus.includes('cancelado')) return { chip: 'bg-red-100 text-red-800', border: 'border-red-500' };
      return { chip: 'bg-gray-100 text-gray-800', border: 'border-gray-300' };
  };

  const renderFreightCard = (freight: Freight, index: number) => {
    const { status, clientName, properties } = freight;
    const otherProps = Object.entries(properties);
    const statusStyle = getStatusStyle(status);

    return (
      <div
        key={freight.id}
        className={`bg-white rounded-lg border-l-4 ${statusStyle.border} shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between animate-fadeInUp`}
        style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
      >
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-az-blue pr-2 break-words">
              {clientName ? <Highlight text={clientName} highlight={searchTerm} /> : 'Frete sem cliente'}
            </h3>
            {status && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusStyle.chip}`}>
                <Highlight text={status} highlight={searchTerm} />
              </span>
            )}
          </div>

          <div className="space-y-2 mb-4">
            {otherProps.length > 0 ? (
                otherProps.slice(0, 3).map(([key, value], propIndex) => (
                <dl key={propIndex} className="flex text-sm">
                    <dt className="font-semibold text-gray-600 w-1/3 truncate">
                        <Highlight text={key} highlight={searchTerm} />:
                    </dt>
                    <dd className="text-gray-800 w-2/3 ml-2 truncate">
                        <Highlight text={String(value)} highlight={searchTerm} />
                    </dd>
                </dl>
                ))
            ) : (
                <p className="text-sm text-gray-400 italic">Nenhuma propriedade adicional.</p>
            )}
            {otherProps.length > 3 && <p className="text-xs text-gray-500 mt-2">+ {otherProps.length - 3} outra(s) propriedade(s)</p>}
          </div>
        </div>
        <div className="flex justify-end space-x-1 border-t bg-gray-50/70 p-2 rounded-b-md">
          <button onClick={() => handleOpenEditModal(freight)} className="p-2 text-gray-500 hover:text-az-blue hover:bg-gray-200 rounded-full transition-all" aria-label="Editar Frete">
            <PencilIcon className="w-5 h-5" />
          </button>
          <button onClick={() => handleOpenDeleteConfirm(freight)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-all" aria-label="Remover Frete">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <header className="bg-az-blue shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-az-yellow tracking-wider">
            AZShip - Gestão de Fretes
          </h1>
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center bg-az-yellow text-az-blue font-semibold py-2 px-5 rounded-lg shadow-md hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Cadastrar
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notification && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between shadow-md ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="alert">
             <div className="flex items-center">
                 <InformationCircleIcon className="w-6 h-6 mr-3" />
                 <span>{notification.message}</span>
             </div>
             <button onClick={() => setNotification(null)} className="p-1 rounded-full hover:bg-black/10" aria-label="Fechar notificação">
                 <XMarkIcon className="w-5 h-5" />
             </button>
          </div>
        )}
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-az-blue">Painel de Fretes</h2>
            <div className="relative">
              <label htmlFor="main-search" className="sr-only">Buscar frete</label>
              <input
                id="main-search"
                type="text"
                placeholder="Buscar em todos os campos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-az-light-blue focus:border-az-light-blue w-64 md:w-80"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              {searchTerm && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-az-light-blue"
                    aria-label="Limpar busca"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            availableStatuses={availableStatuses}
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
               <div className="w-12 h-12 border-4 border-az-light-blue border-t-transparent rounded-full animate-spin mb-4"></div>
               <p className="text-lg">Carregando fretes...</p>
            </div>
          ) : freights.totalElements === 0 ? (
            <div className="text-center py-20">
              <ArchiveBoxIcon className="mx-auto h-16 w-16 text-gray-300" />
              <h3 className="mt-4 text-lg font-medium text-gray-800">
                {searchTerm || filters.status || filters.propertyKey ? `Nenhum frete encontrado` : 'Nenhum frete cadastrado.'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filters.status || filters.propertyKey ? 'Tente ajustar sua busca ou limpar os filtros.' : 'Clique em "Cadastrar" para adicionar o primeiro.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {freights.content.map(renderFreightCard)}
              </div>

              {freights.totalPages > 1 && (
                <div className="mt-8 flex justify-between items-center flex-wrap gap-4">
                  <span className="text-sm text-gray-600">
                    Página {freights.number + 1} de {freights.totalPages} ({freights.totalElements} registros)
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-transform transform hover:scale-105 active:scale-95"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === freights.totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-transform transform hover:scale-105 active:scale-95"
                    >
                      Próximo
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Modal
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
          title={freightToEdit ? 'Editar Frete' : 'Cadastrar Novo Frete'}
      >
          <FreightForm
              freightToEdit={freightToEdit}
              onSave={handleSaveFreight}
              onCancel={handleCloseModals}
              isSaving={isSaving}
              availableStatuses={availableStatuses}
          />
      </Modal>

      <Modal isOpen={isConfirmModalOpen} onClose={handleCloseModals} title="Confirmar Remoção">
          <div className="text-center p-4">
              <p className="text-lg">
                  Tem certeza que deseja remover o frete para <span className="font-bold">{freightToDelete?.clientName}</span>?
              </p>
              <p className="text-sm text-gray-500 mt-2">Esta ação não poderá ser desfeita.</p>
              <div className="mt-6 flex justify-center space-x-4">
                  <button onClick={handleCloseModals} className="px-6 py-2 border rounded-md transition-transform transform hover:scale-105" disabled={isSaving}>
                      Cancelar
                  </button>
                  <button onClick={handleDeleteFreight} className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-400 transition-transform transform hover:scale-105" disabled={isSaving}>
                      {isSaving ? 'Removendo...' : 'Sim, remover'}
                  </button>
              </div>
          </div>
      </Modal>
    </div>
  );
};

export default App;