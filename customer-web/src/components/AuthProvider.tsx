import React from 'react';
import { AuthContext, useAuthProvider } from '@/hooks/useAuth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const authValue = useAuthProvider();
  return (
    <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
  );
}
