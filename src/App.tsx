import React, { useEffect, useState } from 'react';
import { useAppStore } from './store/appStore';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import './App.css';

type PageType = 'login' | 'register' | 'dashboard';

function App() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const initializeStore = useAppStore((s) => s.initializeStore);
  const logout = useAppStore((s) => s.logout);

  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeStore();
    setIsInitialized(true);
  }, [initializeStore]);

  useEffect(() => {
    if (isInitialized) {
      if (isAuthenticated) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('login');
      }
    }
  }, [isAuthenticated, isInitialized]);

  if (!isInitialized) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <svg viewBox="0 0 50 50">
            <circle cx="25" cy="25" r="20" />
          </svg>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {currentPage === 'login' && (
        <LoginPage
          onSuccess={() => setCurrentPage('dashboard')}
          onSwitchToRegister={() => setCurrentPage('register')}
        />
      )}

      {currentPage === 'register' && (
        <RegisterPage
          onSuccess={() => setCurrentPage('dashboard')}
          onSwitchToLogin={() => setCurrentPage('login')}
        />
      )}

      {currentPage === 'dashboard' && (
        <DashboardPage
          onLogout={() => {
            logout();
            setCurrentPage('login');
          }}
        />
      )}
    </div>
  );
}

export default App;
