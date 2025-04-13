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
    console.log("Got token: " + token)
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
 *
 * @param getAccessTokenSilently - The getAccessTokenSilently function obtained from useAuth0().
 * @param url - The relative API endpoint (e.g., '/quizzes', '/users/me'). It will be prefixed with '/api'.
 * @param options - Standard fetch options (method, body, headers, etc.).
 * @returns A Promise resolving to the Fetch Response object.
 */
export async function fetchWithAuth(
  getAccessTokenSilently: GetAccessTokenSilentlyFn,
  url: string,
  options: RequestInit = {}
): Promise<Response> {

  // Get the access token first
  const token = await fetchAccessToken(getAccessTokenSilently);

  // Prepare headers
  const headers = new Headers(options.headers); // Clone existing headers if any
  headers.set('Authorization', `Bearer ${token}`); // Set Authorization header

  // Ensure Content-Type is set for methods that typically have a body
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json'); // Default to JSON
  }

  // Combine options
  const fetchOptions: RequestInit = {
    ...options,
    headers: headers,
  };

  // Construct the full URL, ensuring it starts with /api/
  const backendApiPrefix = '/api'; // Assuming handled by Vite proxy or nginx in prod
  const fullUrl = url.startsWith(backendApiPrefix)
    ? url
    : `${backendApiPrefix}${url.startsWith('/') ? '' : '/'}${url}`;

  console.log(`[fetchWithAuth] Requesting: ${fetchOptions.method || 'GET'} ${fullUrl}`);

  // Make the fetch call
  return fetch(fullUrl, fetchOptions);
}
