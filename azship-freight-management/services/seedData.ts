import { Freight } from '../types';

export const initialFreights: Freight[] = [
  {
    id: 'd8c2b5f7-4b7d-4a1e-8b0a-9e1f2c3d4e5a',
    properties: [
      { key: 'Cliente', value: 'Empresa A' },
      { key: 'Destino', value: 'São Paulo, SP' },
      { key: 'Cubagem (m³)', value: '15.5' },
      { key: 'Status', value: 'Em trânsito' },
      { key: 'Motorista', value: 'Carlos Silva' },
    ],
  },
  {
    id: 'e9a1b4c6-3d6c-4f9b-9a8d-0e2f1b3c4d5b',
    properties: [
      { key: 'Cliente', value: 'Empresa B' },
      { key: 'Origem', value: 'Rio de Janeiro, RJ' },
      { key: 'Destino', value: 'Curitiba, PR' },
      { key: 'Peso (kg)', value: '2500' },
      { key: 'Nota Fiscal', value: 'NF-12345' },
      { key: 'Status', value: 'Entregue' },
    ],
  },
  {
    id: 'f0b3c5d8-2e5a-4h8a-8b7c-1f4a2b6d7e9c',
    properties: [
      { key: 'Cliente', value: 'Empresa C' },
      { key: 'Destino', value: 'Belo Horizonte, MG' },
      { key: 'Valor (R$)', value: '1250.75' },
      { key: 'Tipo de Carga', value: 'Frágil' },
      { key: 'Status', value: 'Aguardando Coleta' },
    ],
  },
  {
    id: 'a1b2c3d4-5e6f-7g8h-9i0j-k1l2m3n4o5p',
    properties: [
      { key: 'Cliente', value: 'Empresa A' },
      { key: 'Origem', value: 'Porto Alegre, RS' },
      { key: 'Destino', value: 'Salvador, BA' },
      { key: 'Status', value: 'Cancelado' },
      { key: 'Motivo', value: 'Endereço incorreto' },
    ],
  },
];