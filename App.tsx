import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { PrivacyTerms } from './components/PrivacyTerms';
import { ViewState } from './types';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('landing');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onLogout={() => setCurrentView('landing')} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />;
      case 'login':
        return <Auth mode="login" onNavigate={(view) => setCurrentView(view)} />;
      case 'signup':
        return <Auth mode="signup" onNavigate={(view) => setCurrentView(view)} />;
      case 'privacy':
        return <PrivacyTerms mode="privacy" onBack={() => setCurrentView('landing')} />;
      case 'terms':
        return <PrivacyTerms mode="terms" onBack={() => setCurrentView('landing')} />;
      default:
        return (
          <LandingPage 
            onNavigate={(view) => setCurrentView(view)} 
            isDark={isDark}
            toggleTheme={() => setIsDark(!isDark)}
          />
        );
    }
  };

  return (
    <>
      {renderView()}
    </>
  );
}

export default App;