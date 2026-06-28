export const API_BASE = "https://paisa-blueprint-production.up.railway.app";

/**
 * Returns the authorization headers including Bearer token if it exists in localStorage.
 */
export function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("paisa_access_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * A central request wrapper that:
 * 1. Prepends the central API_BASE if a relative path is provided.
 * 2. Automatically injects standard Authorization: Bearer <token> headers from localStorage.
 * 3. Incorporates credentials: "include" for HttpOnly cookies and cross-origin security.
 */
export async function paisaFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;
  
  const token = localStorage.getItem("paisa_access_token");
  
  const headers = { ...options.headers } as Record<string, string>;
  
  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const mergedOptions: RequestInit = {
    credentials: "include",
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, mergedOptions);
    return response;
  } catch (error) {
    console.error(`paisaFetch failed for URL [${url}] with error:`, error);
    throw error;
  }
}
