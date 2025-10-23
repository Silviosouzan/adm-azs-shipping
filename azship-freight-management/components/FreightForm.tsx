import React, { useState, useEffect } from 'react';
import { Freight } from '../types';
import { PlusIcon, TrashIcon, SpinnerIcon } from './icons';

interface FreightFormProps {
  freightToEdit?: Freight | null;
  onSave: (freightData: Omit<Freight, 'id'> | Freight) => void;
  onCancel: () => void;
  isSaving: boolean;
  availableStatuses?: string[];
}

interface DynamicProperty {
  key: string;
  value: string;
}

interface FormData {
  clientName: string;
  status: string;
  dynamicProperties: DynamicProperty[];
}

type FormErrors = {
  clientName?: string;
  status?: string;
  dynamicProperties?: { [index: number]: { key?: string; value?: string } };
  general?: string;
};

const initialCreateFormData: FormData = {
  clientName: '',
  status: '',
  dynamicProperties: [
    { key: 'Origem', value: '' },
    { key: 'Destino', value: '' },
    { key: '', value: '' },
  ],
};

const FreightForm: React.FC<FreightFormProps> = ({
  freightToEdit,
  onSave,
  onCancel,
  isSaving,
  availableStatuses = []
}) => {
  const [formData, setFormData] = useState<FormData>(() => {
    if (freightToEdit) {
      const propsArray = Object.entries(freightToEdit.properties || {})
        .map(([key, value]) => ({ key, value: String(value) }));
      return {
        clientName: freightToEdit.clientName,
        status: freightToEdit.status,
        dynamicProperties: propsArray.length > 0 ? propsArray : [{ key: '', value: '' }]
      };
    }
    return initialCreateFormData;
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (freightToEdit) {
      const propsArray = Object.entries(freightToEdit.properties || {})
        .map(([key, value]) => ({ key, value: String(value) }));
      setFormData({
        clientName: freightToEdit.clientName,
        status: freightToEdit.status,
        dynamicProperties: propsArray.length > 0 ? propsArray : [{ key: '', value: '' }]
      });
    } else {
      setFormData(initialCreateFormData);
    }
    setErrors({});
    setTouched({});
  }, [freightToEdit]);

  const validateField = (name: keyof FormData | string, value: any): string | undefined => {
     if (name === 'clientName') {
         return !String(value).trim() ? 'O nome do cliente é obrigatório.' : undefined;
     }
     if (name === 'status') {
         return !String(value).trim() ? 'Selecione um status.' : undefined;
     }
     return undefined;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof FormData]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

   const handleDynamicPropertyChange = (index: number, field: 'key' | 'value', value: string) => {
    setFormData(prev => {
      const newDynamicProps = [...prev.dynamicProperties];
      newDynamicProps[index] = { ...newDynamicProps[index], [field]: value };
      return { ...prev, dynamicProperties: newDynamicProps };
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      if (newErrors.dynamicProperties?.[index]?.[field]) {
         delete newErrors.dynamicProperties[index][field];
      }
      return newErrors;
    });
  };
  const addProperty = () => {
     setFormData(prev => ({ ...prev, dynamicProperties: [...prev.dynamicProperties, { key: '', value: '' }] }));
  };
   const removeProperty = (index: number) => {
     setFormData(prev => ({ ...prev, dynamicProperties: prev.dynamicProperties.filter((_, i) => i !== index) }));
   };

  const validate = (): boolean => {
    const newErrors: FormErrors = { dynamicProperties: {} };
    let isValid = true;
    const touchedFields: { [key: string]: boolean } = { clientName: true, status: true };

    const clientNameError = validateField('clientName', formData.clientName);
    if (clientNameError) { newErrors.clientName = clientNameError; isValid = false; }
    const statusError = validateField('status', formData.status);
    if (statusError) { newErrors.status = statusError; isValid = false; }

    const keys = new Set<string>();
    formData.dynamicProperties.forEach((prop, index) => {
      const trimmedKey = prop.key.trim();
      const trimmedValue = prop.value.trim();

      if (trimmedKey === '' && trimmedValue === '') {
          return;
      }

      if (trimmedKey === '') {
        newErrors.dynamicProperties![index] = { ...newErrors.dynamicProperties![index], key: 'A chave não pode estar vazia.' };
        isValid = false;
      } else if (keys.has(trimmedKey.toLowerCase())) {
        newErrors.dynamicProperties![index] = { ...newErrors.dynamicProperties![index], key: 'Chave duplicada.' };
        isValid = false;
      } else {
        keys.add(trimmedKey.toLowerCase());
      }
      if (trimmedValue === '') {
        newErrors.dynamicProperties![index] = { ...newErrors.dynamicProperties![index], value: 'O valor não pode estar vazio.' };
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(prev => ({ ...prev, ...touchedFields }));
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { return; }

    const validDynamicProperties = formData.dynamicProperties
      .filter(p => p.key.trim() !== '' && p.value.trim() !== '');

    const propertiesObject = validDynamicProperties.reduce((acc, prop) => {
      acc[prop.key.trim()] = prop.value.trim();
      return acc;
    }, {} as { [key: string]: any });

    const freightDataPayload: Omit<Freight, 'id'> = {
      clientName: formData.clientName.trim(),
      status: formData.status.trim(),
      properties: propertiesObject,
    };

    onSave(freightToEdit ? { ...freightDataPayload, id: freightToEdit.id } : freightDataPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <fieldset>
        <legend className="text-lg font-medium text-gray-800 mb-4">Dados Principais</legend>
        <div className="space-y-4">
            <div>
                <label htmlFor="clientName" className="block text-sm font-semibold text-gray-800 mb-1">
                Nome do Cliente <span className="text-red-500">*</span>
                </label>
                <input
                id="clientName" name="clientName" type="text"
                value={formData.clientName} onChange={handleInputChange} onBlur={handleBlur}
                className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-az-light-blue focus:border-az-light-blue ${errors.clientName ? 'border-red-500' : ''}`}
                />
                <div className="text-red-600 text-xs mt-1 min-h-[1rem]">{errors.clientName}</div>
            </div>

            <div>
                <label htmlFor="status" className="block text-sm font-semibold text-gray-800 mb-1">
                Status <span className="text-red-500">*</span>
                </label>
                <select
                id="status" name="status" value={formData.status}
                onChange={handleInputChange} onBlur={handleBlur}
                className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-az-light-blue focus:border-az-light-blue ${errors.status ? 'border-red-500' : ''}`}
                >
                <option value="" disabled>-- Selecione --</option>
                {(availableStatuses ?? []).map(statusOption => (
                    <option key={statusOption} value={statusOption}>{statusOption}</option>
                ))}
                </select>
                <div className="text-red-600 text-xs mt-1 min-h-[1rem]">{errors.status}</div>
            </div>
        </div>
      </fieldset>
      
      <fieldset className="border-t pt-6">
        <legend className="text-lg font-medium text-gray-800">Propriedades Adicionais</legend>
        <p className="text-sm text-gray-500 mb-4">
          Adicione detalhes específicos do frete (ex: Origem, Destino, Peso, NF, etc.).
        </p>
        {errors.general && <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 rounded-md">{errors.general}</div>}

        <div className="space-y-3">
          {formData.dynamicProperties.map((prop, index) => (
            <div
              key={index}
              className="bg-gray-50 p-3 rounded-md border border-gray-200"
            >
              <div className="flex items-end space-x-2">
                <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1">
                  <div>
                    <label htmlFor={`prop-key-${index}`} className="block text-xs font-medium text-gray-600 mb-0.5">
                      Propriedade #{index + 1}
                    </label>
                    <input
                      id={`prop-key-${index}`} type="text"
                      placeholder="Nome (ex: Origem)"
                      value={prop.key}
                      onChange={(e) => handleDynamicPropertyChange(index, 'key', e.target.value)}
                      className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-az-light-blue focus:border-az-light-blue placeholder:text-gray-400 text-sm ${errors.dynamicProperties?.[index]?.key ? 'border-red-500' : ''}`}
                    />
                    <div className="text-red-600 text-xs mt-1 min-h-[1rem]">
                      {errors.dynamicProperties?.[index]?.key}
                    </div>
                  </div>
                  <div>
                     <label htmlFor={`prop-value-${index}`} className="block text-xs font-medium text-gray-600 mb-0.5">
                      Valor
                    </label>
                    <input
                      id={`prop-value-${index}`} type="text"
                      placeholder="Valor (ex: São Paulo)"
                      value={prop.value}
                      onChange={(e) => handleDynamicPropertyChange(index, 'value', e.target.value)}
                      className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-az-light-blue focus:border-az-light-blue placeholder:text-gray-400 text-sm ${errors.dynamicProperties?.[index]?.value ? 'border-red-500' : ''}`}
                    />
                    <div className="text-red-600 text-xs mt-1 min-h-[1rem]">
                       {errors.dynamicProperties?.[index]?.value}
                    </div>
                  </div>
                </div>
                <div className="pb-[calc(1rem+1px)]">
                  <button
                    type="button"
                    onClick={() => removeProperty(index)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 rounded-md"
                    aria-label="Remover Propriedade"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addProperty}
          className="mt-4 flex items-center justify-center w-full px-4 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 hover:border-az-blue hover:text-az-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-az-light-blue transition-all duration-200"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Adicionar Propriedade
        </button>
      </fieldset>

      <div className="flex justify-end space-x-4 pt-5 border-t mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-transform transform hover:scale-105 disabled:opacity-50"
          disabled={isSaving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="inline-flex items-center justify-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-az-blue hover:bg-az-light-blue disabled:bg-gray-400 transition-transform transform hover:scale-105"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Salvando...
            </>
          ) : (
            'Salvar Frete'
          )}
        </button>
      </div>
    </form>
  );
};

export default FreightForm;