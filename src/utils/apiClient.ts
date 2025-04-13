// src/utils/apiClient.ts
import { Auth0ContextInterface } from '@auth0/auth0-react';

// Define a type alias for the specific function we need from the hook
type GetAccessTokenSilentlyFn = Auth0ContextInterface['getAccessTokenSilently'];

/**
 * Fetches an access token using the provided getAccessTokenSilently function.
 * Handles potential errors during token retrieval.
 */
async function fetchAccessToken(getAccessTokenSilently: GetAccessTokenSilentlyFn): Promise<string> {
  try {
    // Ensure 'audience' is configured in Auth0Provider for this to work correctly
    const token = await getAccessTokenSilently();
    if (!token) {
      throw new Error("Received empty token.");
    }
    console.log("Got token: " + token) // Uncomment for debugging if needed
    return token;
  } catch (error: any) {
    console.error("Error getting access token:", error);
    // Re-throw the error so the calling function knows token retrieval failed
    throw new Error(`Failed to retrieve access token: ${error.message || error}`);
  }
}

/**
 * A wrapper around the native fetch function that automatically retrieves
 * an Auth0 access token and adds it to the Authorization header.
 * It constructs the full API URL based on the environment variable VITE_BACKEND_API_ADDR and build mode.
 *
 * @param getAccessTokenSilently - The getAccessTokenSilently function obtained from useAuth0().
 * @param url - The relative API endpoint path (e.g., '/quizzes', '/users/me'). Must start with '/'.
 * @param options - Standard fetch options (method, body, headers, etc.).
 * @returns A Promise resolving to the Fetch Response object.
 */
export async function fetchWithAuth(
  getAccessTokenSilently: GetAccessTokenSilentlyFn,
  url: string, // Expecting paths like '/quizzes', '/health' starting with '/'
  options: RequestInit = {}
): Promise<Response> {

  // 1. Get the access token
  const token = await fetchAccessToken(getAccessTokenSilently);

  // 2. Prepare headers
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  // Default Content-Type to application/json if body exists and header isn't set
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 3. Combine fetch options
  const fetchOptions: RequestInit = {
    ...options,
    headers: headers,
  };

  // 4. Construct the full URL based on VITE_BACKEND_API_ADDR and build mode
  let fullUrl: string;
  const backendBaseUrl = import.meta.env.VITE_BACKEND_API_ADDR;
  console.log(`[fetchWithAuth] prod is ${import.meta.env.PROD}`);

  // Use Vite's built-in boolean import.meta.env.PROD
  if (backendBaseUrl && import.meta.env.PROD) {
    // Production build AND VITE_BACKEND_API_ADDR is defined
    // Construct absolute URL: BASE_URL + /api + RELATIVE_PATH
    if (!url.startsWith('/')) {
        console.warn(`[fetchWithAuth] URL parameter "${url}" should start with '/'. Prepending '/'`);
        url = '/' + url;
    }
    fullUrl = `${backendBaseUrl}/api${url}`;
    console.log(`[fetchWithAuth] Using absolute URL (Production build & VITE_BACKEND_API_ADDR is set): ${fullUrl}`);
  } else {
    // Development build OR VITE_BACKEND_API_ADDR is NOT defined in production build
    // Construct relative URL for proxy: /api + RELATIVE_PATH
    if (!url.startsWith('/')) {
        console.warn(`[fetchWithAuth] URL parameter "${url}" should start with '/'. Prepending '/'`);
        url = '/' + url;
    }
    fullUrl = `/api${url}`;
    console.log(`[fetchWithAuth] Using relative URL (Dev build or VITE_BACKEND_API_ADDR not set, relying on proxy): ${fullUrl}`);
  }

  console.log(`[fetchWithAuth] Requesting: ${fetchOptions.method || 'GET'} ${fullUrl}`);

  // 5. Make the fetch call
  return fetch(fullUrl, fetchOptions);
}
