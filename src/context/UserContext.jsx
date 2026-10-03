import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

const UserContext = createContext(null);

const resolveRole = (user) => {
  if (!user) return 'user';
  if (user.roles && Array.isArray(user.roles)) {
    if (user.roles.includes('super_admin') || user.roles.includes('admin')) return 'admin';
    const nonUserRole = user.roles.find(r => r !== 'user');
    if (nonUserRole) return nonUserRole.toLowerCase();
  }
  if (user.roleStatus) {
    const statuses = typeof user.roleStatus === 'object' ? user.roleStatus : {};
    if (statuses.vendor || statuses['vendor']) return 'vendor';
    if (statuses.service_provider || statuses['service_provider']) return 'service_provider';
    if (statuses.educator || statuses['educator']) return 'educator';
    if (statuses.influencer || statuses['influencer']) return 'influencer';
    if (statuses.distributor || statuses['distributor']) return 'distributor';
    if (statuses.delivery_person || statuses['delivery_person']) return 'delivery_person';
  }
  const role = user.role || 'user';
  const normalized = typeof role === 'string' ? role.toLowerCase() : 'user';
  return normalized === 'super_admin' ? 'admin' : normalized;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Safe Local Storage Session Loader
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const sessionStr = localStorage.getItem('user_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session?.token && session?.user) {
            const resolvedRole = resolveRole(session.user);
            const userWithRole = { ...session.user, role: resolvedRole };
            setToken(session.token);
            setUser(userWithRole);

            // Sync authorization header on initial load
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${session.token}`;
          }
        }
      } catch (err) {
        console.error("Failed to parse user session securely:", err);
        localStorage.removeItem('user_session'); // Clean corrupted storage
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAuth();

    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
      delete apiClient.defaults.headers.common['Authorization'];
    };

    window.addEventListener('auth:session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session_expired', handleSessionExpired);
    };
  }, []);

  const login = (sessionData) => {
    try {
      const rawUser = sessionData.safeUser || sessionData.user;
      const resolvedRole = resolveRole(rawUser);
      const userWithRole = { ...rawUser, role: resolvedRole };

      const dataToSave = {
        user: userWithRole,
        token: sessionData.access_token || sessionData.token,
      };
      setUser(dataToSave.user);
      setToken(dataToSave.token);
      localStorage.setItem('user_session', JSON.stringify(dataToSave));

      // Update interceptor state dynamically
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${dataToSave.token}`;
    } catch (err) {
      console.error("Failed during session login storage:", err);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user_session');

    // Clear Authorization header completely
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      if (!prev) return null;
      const rawUpdated = { ...prev, ...updatedFields };
      const resolvedRole = resolveRole(rawUpdated);
      const updated = { ...rawUpdated, role: resolvedRole };
      try {
        const sessionStr = localStorage.getItem('user_session');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          session.user = updated;
          localStorage.setItem('user_session', JSON.stringify(session));
        }
      } catch (e) {
        console.error("Error saving updated user details:", e);
      }
      return updated;
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        updateUser,
        isAuthenticated: !!token,
        role: user?.role || 'user'
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
