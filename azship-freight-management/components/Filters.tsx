import React from 'react';
import { FreightFilters } from '../services/freightService';

interface FiltersProps {
  filters: FreightFilters;
  onFilterChange: (newFilters: Partial<FreightFilters>) => void;
  onClearFilters: () => void;
  availableStatuses: string[];
}

const Filters: React.FC<FiltersProps> = ({ filters, onFilterChange, onClearFilters, availableStatuses }) => {
    
  const isFilterActive = filters.status || filters.propertyKey || filters.propertyValue;

  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Filter by Status */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                </label>
                <select
                    id="status-filter"
                    value={filters.status}
                    onChange={(e) => onFilterChange({ status: e.target.value })}
                    className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-az-light-blue focus:border-az-light-blue"
                >
                    <option value="">Todos</option>
                    {availableStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            {/* Filter by Property Key */}
            <div>
                <label htmlFor="prop-key-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Chave da Propriedade
                </label>
                <input
                    id="prop-key-filter"
                    type="text"
                    placeholder="Ex: Destino"
                    value={filters.propertyKey}
                    onChange={(e) => onFilterChange({ propertyKey: e.target.value })}
                    className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-az-light-blue focus:border-az-light-blue placeholder:text-gray-400"
                />
            </div>
            
            {/* Filter by Property Value */}
            <div>
                <label htmlFor="prop-value-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Valor da Propriedade
                </label>
                <input
                    id="prop-value-filter"
                    type="text"
                    placeholder="Ex: São Paulo"
                    value={filters.propertyValue}
                    onChange={(e) => onFilterChange({ propertyValue: e.target.value })}
                    className="w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-az-light-blue focus:border-az-light-blue placeholder:text-gray-400 disabled:bg-gray-100"
                    disabled={!filters.propertyKey}
                />
            </div>

            {/* Clear Button */}
            <div>
                 <button
                    onClick={onClearFilters}
                    disabled={!isFilterActive}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    Limpar
                </button>
            </div>
        </div>
         {!filters.propertyKey && filters.propertyValue && (
            <p className="text-xs text-orange-600 mt-2 pl-1">
                Para filtrar por valor, preencha a "Chave da Propriedade".
            </p>
        )}
    </div>
  );
};

export default Filters;