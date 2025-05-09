import { useContext } from 'react';
import { AuthenticationContext } from '../context/AuthContext';
import type { User } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthenticationContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthenticationProvider');
  }
  return context;
};

export type { User };
