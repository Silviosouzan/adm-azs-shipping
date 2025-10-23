export interface Freight {
  id: number;
  clientName: string;
  status: string;
  properties: { [key: string]: any };
}

export interface PaginatedFreights {
  
  content: Freight[];
  
  totalElements: number;
  
  totalPages: number;
 
  number: number;
  
  size: number;

}