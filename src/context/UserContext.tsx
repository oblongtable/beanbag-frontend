import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// Define the shape of the context data
interface UserContextType {
  userName: string | null;
  setUserName: (name: string | null) => void;
  profilePicture: string | null;
  setProfilePicture: (picture: string | null) => void;
  email: string | null;
  setEmail: (email: string | null) => void;
  logoutGuest: () => void; // Add guest logout function
}

// Create the context with a default undefined value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Create a provider component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  // Internal state
  const [userNameState, setUserNameInternal] = useState<string | null>(null);
  const [profilePictureState, setProfilePictureInternal] = useState<string | null>(null);
  const [emailState, setEmailInternal] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth0();

  // Effect 1: Initialize state from Auth0 or localStorage
  useEffect(() => {
    if (!isLoading) { // Only run when Auth0 is done loading
      if (isAuthenticated && user) {
        // User is authenticated, use Auth0 data
        setUserNameInternal(user.name || null);
        setProfilePictureInternal(user.picture || null);
        setEmailInternal(user.email || null);
        // Clear any guest data from localStorage
        localStorage.removeItem('guestUserName');
        localStorage.removeItem('guestProfilePicture');
        localStorage.removeItem('guestEmail');
      } else {
        // User is not authenticated, try to load guest data from localStorage
        const guestName = localStorage.getItem('guestUserName');
        const guestPic = localStorage.getItem('guestProfilePicture');
        const guestEmail = localStorage.getItem('guestEmail');

        // Set state only if localStorage had values, otherwise they remain null from initial state
        if (guestName !== null) setUserNameInternal(guestName);
        if (guestPic !== null) setProfilePictureInternal(guestPic);
        if (guestEmail !== null) setEmailInternal(guestEmail);
      }
    }
  }, [user, isAuthenticated, isLoading]); // Dependencies for Auth0 state changes

  // Custom setters that update internal state and localStorage for guests
  const setUserName = (name: string | null) => {
    setUserNameInternal(name);
    if (!isAuthenticated && !isLoading) { // Persist if guest and Auth0 is stable
      if (name === null) {
        localStorage.removeItem('guestUserName');
      } else {
        localStorage.setItem('guestUserName', name);
      }
    }
  };

  const setProfilePicture = (picture: string | null) => {
    setProfilePictureInternal(picture);
    if (!isAuthenticated && !isLoading) {
      if (picture === null) {
        localStorage.removeItem('guestProfilePicture');
      } else {
        localStorage.setItem('guestProfilePicture', picture);
      }
    }
  };

  const setEmail = (emailAddress: string | null) => {
    setEmailInternal(emailAddress);
    if (!isAuthenticated && !isLoading) {
      if (emailAddress === null) {
        localStorage.removeItem('guestEmail');
      } else {
        localStorage.setItem('guestEmail', emailAddress);
      }
    }
  };

  // Function to log out a guest user
  const logoutGuest = () => {
    if (!isAuthenticated) { // Only allow guest logout if not Auth0 authenticated
      // Clear localStorage
      localStorage.removeItem('guestUserName');
      localStorage.removeItem('guestProfilePicture');
      localStorage.removeItem('guestEmail');
      // Reset state
      setUserNameInternal(null);
      setProfilePictureInternal(null);
      setEmailInternal(null);
    }
  };

  return (
    <UserContext.Provider value={{
      userName: userNameState,
      setUserName,
      profilePicture: profilePictureState,
      setProfilePicture,
      email: emailState,
      setEmail,
      logoutGuest // Provide the guest logout function
    }}>
      {children}
    </UserContext.Provider>
  );
};

// Create a custom hook to use the UserContext
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
