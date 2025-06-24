import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'parent' | 'child' | 'official';

interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  profileImage?: string;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// console.log('AuthContext created:', AuthContext);


export const useAuth = () => {
  const context = useContext(AuthContext);
  // console.log(context);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token on app load
    const token = localStorage.getItem('kidolio-token');
    const userData = localStorage.getItem('kidolio-user');
    
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        // Ensure 'verified' is always present
        if (typeof parsed.verified === 'undefined') parsed.verified = true;
        setUser(parsed);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('kidolio-token');
        localStorage.removeItem('kidolio-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    // Ensure 'verified' is always present
    const safeUser = { ...userData, verified: typeof userData.verified === 'undefined' ? true : userData.verified };
    localStorage.setItem('kidolio-token', token);
    localStorage.setItem('kidolio-user', JSON.stringify(safeUser));
    setUser(safeUser);
  };

  const logout = () => {
    localStorage.removeItem('kidolio-token');
    localStorage.removeItem('kidolio-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
