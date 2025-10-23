import { Freight, PaginatedFreights } from '../types'; // Make sure types.ts matches backend Page structure

const API_URL = 'http://localhost:8080/freights';

export interface FreightFilters {
  status: string;
  propertyKey: string;
  propertyValue: string;
}

/**
 * Handles API responses and errors.
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage += `, message: ${JSON.stringify(errorBody)}`;
    } catch (e) {
      // Ignore if response body isn't JSON or empty
    }
    throw new Error(errorMessage);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
};

/**
 * Fetches freights from the backend using server-side pagination and filtering.
 */
export const fetchFreights = async (
  searchTerm: string,
  page: number, // Frontend page (usually starts at 1)
  pageSize: number,
  filters: FreightFilters
): Promise<PaginatedFreights> => {

  const params = new URLSearchParams();
  params.append('page', String(page - 1 < 0 ? 0 : page - 1));
  params.append('size', String(pageSize));

  if (searchTerm) {
    params.append('searchTerm', searchTerm);
  }
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.propertyKey) {
    params.append('propertyKey', filters.propertyKey);
  }
  if (filters.propertyKey && filters.propertyValue) {
    params.append('propertyValue', filters.propertyValue);
  }

  const url = `${API_URL}?${params.toString()}`;
  console.log("Fetching Freights URL:", url);

  const response = await fetch(url);
  const paginatedResult: PaginatedFreights = await handleResponse(response);
  return paginatedResult;
};

/**
 * Fetches a single freight by ID.
 */
export const getFreightById = (id: number): Promise<Freight> => {
  return fetch(`${API_URL}/${id}`).then(handleResponse);
};

/**
 * Creates a new freight.
 */
export const createFreight = (newFreightData: Omit<Freight, 'id'>): Promise<Freight> => {
  return fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newFreightData),
  }).then(handleResponse);
};

/**
 * Updates an existing freight.
 */
export const updateFreight = (id: number, updatedFreightData: Freight): Promise<Freight> => {
  const payload = { ...updatedFreightData };
  return fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).then(handleResponse);
};

/**
 * Deletes a freight.
 */
export const deleteFreight = (id: number): Promise<void> => {
  return fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  }).then(response => {
    if (!response.ok && response.status !== 204) {
      return response.text().then(text => {
         throw new Error(`Failed to delete freight: ${response.status} - ${text}`);
      });
    }
    return undefined;
  });
};


// --- FUNCTION UPDATED ---
/**
 * Fetches the list of unique statuses directly from the optimized backend endpoint.
 */
export const getUniqueStatuses = async (): Promise<string[]> => {
  // Construct the URL for the new endpoint
  const url = `${API_URL}/statuses`; // Changed URL
  console.log("Fetching Unique Statuses URL:", url); // For debugging

  try {
    const response = await fetch(url);
    // Backend now returns a simple array of strings
    const statuses: string[] = await handleResponse(response);
    // No need to map/Set, backend query already handles distinct and sorting
    return statuses;
  } catch (error) {
    console.error("Failed to fetch unique statuses:", error);
    return []; // Return empty array on error
  }
};
// --- END OF UPDATE ---