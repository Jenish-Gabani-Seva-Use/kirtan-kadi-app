import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = ({ onOpenInputModal, onOpenSettingsModal, onOpenVmixModal, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Call the onLogout prop if it exists
    if (onLogout) {
      onLogout();
    }
    // Navigate after a small delay to ensure state updates
    setTimeout(() => {
      navigate('/login');
    }, 100);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Kirtan Kadi App</h1>
      </div>
      
      <div className="header-right">
        <button className="header-button" onClick={onOpenInputModal}>
          <i className="fas fa-edit"></i> Input
        </button>
        <button className="header-button" onClick={onOpenSettingsModal}>
          <i className="fas fa-cog"></i> Settings
        </button>
        <button className="header-button" onClick={onOpenVmixModal}>
          <i className="fas fa-video"></i> vMix
        </button>
        <button className="header-button logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;