import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook to check if localStorage is available and retrieve the token.
 * @returns {{ token: string|null, isLoading: boolean }} - Token and loading state.
 */
function useTokenFromLocalStorage() {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    } catch (error) {
      console.error('Error accessing localStorage:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { token, isLoading };
}

/**
 * Component to conditionally render children based on the presence of a token.
 * If the token is not available, redirects to the /login page.
 * @param {Object} props - Props passed to the component.
 * @param {React.ReactNode} props.children - Child content to render if the token exists.
 * @returns {JSX.Element} - Rendered child content or redirection logic.
 */
export function ValidateUSR({ children }) {
  const { token, isLoading } = useTokenFromLocalStorage();
  const router = useRouter();

  useEffect(() => {
    // Redirect to /login if the token is not available
    if (!isLoading && !token) {
      router.push('/login');
    }
  }, [token, isLoading, router]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  // Render children only if the token is available
  return token ? children : null;
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