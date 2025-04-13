import { useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router'; // Keep hooks for optional redirect
import { useAuth0 } from '@auth0/auth0-react';
import { fetchWithAuth } from '../../utils/apiClient'; // <-- Import your fetch utility
import Header from "../Header"; // Assuming Header is used here

const IndexLayout = () => {
  // Get necessary state and functions from Auth0
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate(); // Keep for optional redirect
  const location = useLocation(); // Keep for optional redirect

  // Ref to prevent multiple sync calls per login session/page load
  const syncAttempted = useRef(false);

  useEffect(() => {
    const syncUserWithBackend = async () => {
      // Conditions: Auth0 loaded, user authenticated, user object exists, sync not yet attempted
      if (!isLoading && isAuthenticated && user && !syncAttempted.current) {
        syncAttempted.current = true;
        console.log('User authenticated, attempting to sync with backend:', user.email);

        try {
          // Prepare user data (only name and email)
          const userData = {
            email: user.email,
            name: user.name || user.email, // Use email as fallback name if name isn't present
          };

          const response = await fetchWithAuth(
            getAccessTokenSilently,
            '/users/sync',
            {
              method: 'POST',
              body: JSON.stringify(userData),
              // Content-Type header is set automatically by fetchWithAuth if body exists
            }
          );

          if (!response.ok) {
            // Handle non-2xx responses
            const errorData = await response.text(); // Get error text or JSON
            throw new Error(`Backend sync failed: ${response.status} ${response.statusText} - ${errorData}`);
          }

          const backendUser = await response.json();
          console.log('Backend sync successful:', backendUser);

          // --- Optional Redirect ---
          // If want to redirect to /profile for UX after successful login & sync
          // Only redirect if they landed on the root path after the Auth0 callback.
          // if (location.pathname === '/') {
          //    console.log('Sync done, redirecting to /profile');
          //    navigate('/profile', { replace: true });
          // }
          // --- End Optional Redirect ---

        } catch (error) {
          console.error('Failed to sync user with backend:', error);
          // Reset flag on failure to allow potential retry on next relevant state change/re-render
          syncAttempted.current = false;
          // Consider showing an error message to the user
        }
      } else if (!isLoading && !isAuthenticated) {
        // Reset the flag if the user logs out or is not authenticated on load
        syncAttempted.current = false;
      }
    };

    syncUserWithBackend();

    // Dependencies for the effect
  }, [isLoading, isAuthenticated, user, getAccessTokenSilently, navigate, location.pathname]);

  // Optional: Render loading state while Auth0 initializes
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div>Loading Application...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-grow">
        <Outlet /> {/* Renders the matched child route */}
      </div>
    </div>
  );
};

export default IndexLayout;