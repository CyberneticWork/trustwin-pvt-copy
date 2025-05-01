import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to check if localStorage is available, retrieve the token, and validate credentials.
 * @returns {{ token: string|null, isLoading: boolean, user: Object|null }} - Token, loading state, and user data.
 */
function useAuth() {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function validateCredentials() {
      try {
        // Check if window is defined (ensures we're not on the server)
        if (typeof window === 'undefined') {
          setIsLoading(false);
          return;
        }

        // Test if localStorage is accessible
        const testKey = '__test__';
        window.localStorage.setItem(testKey, testKey);
        window.localStorage.removeItem(testKey);

        // Retrieve the token from localStorage
        const storedToken = window.localStorage.getItem('token');
        
        setToken(storedToken);

        if (storedToken) {
          // Validate credentials
          const response = await fetch('/api/account/validate-credentials', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token: storedToken })
          });

          const data = await response.json();

          if (response.ok && data.code === 'SUCCESS') {
            setUser(data.user);
          } else {
            // If validation fails, clear token and user
            setToken(null);
            setUser(null);
            window.localStorage.removeItem('token');
          }
        } else {
          // If token is missing, clear everything
          setToken(null);
          setUser(null);
          window.localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Error validating credentials:', error.message);
        setToken(null);
        setUser(null);
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('passwordHash');
      } finally {
        setIsLoading(false);
      }
    }

    validateCredentials();
  }, []);

  return { token, user, isLoading };
}

/**
 * Component to conditionally render children based on authentication status.
 * If not authenticated, redirects to the /login page.
 * @param {Object} props - Props passed to the component.
 * @param {React.ReactNode} props.children - Child content to render if authenticated.
 * @returns {JSX.Element} - Rendered child content or redirection logic.
 */
export function ValidateUSR({ children }) {
  const { token, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect to /login if not authenticated
    if (!isLoading && (!token || !user)) {
      router.push('/login');
    }
  }, [token, user, isLoading, router]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Render children only if authenticated
  return token && user ? children : null;
}

export function LogoutUSR() {
  try {
    // Clear everything in localStorage
    window.localStorage.clear();

    // Refresh the page to reflect the logged-out state
    window.location.reload();
  } catch (error) {
    console.error('Error during logout:', error.message);
  }
}