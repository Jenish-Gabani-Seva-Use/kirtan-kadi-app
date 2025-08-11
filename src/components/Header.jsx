import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import '../styles/HeaderDebug.css';

const Header = ({ 
  onOpenInputModal, 
  onOpenSettingsModal, 
  onOpenVmixModal, 
  onOpenDatabase, 
  onOpenKirtanSearch,
  onAddNewKirtan,
  onOpenPDFImport,
  onLogout 
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleSearchClick = () => {
    console.log('Search clicked');
    if (onOpenKirtanSearch) {
      onOpenKirtanSearch();
    }
    setSearchQuery('');
  };

  // Debug: Log all props
  console.log('Header props:', {
    onOpenInputModal: !!onOpenInputModal,
    onOpenSettingsModal: !!onOpenSettingsModal,
    onOpenVmixModal: !!onOpenVmixModal,
    onOpenDatabase: !!onOpenDatabase,
    onOpenKirtanSearch: !!onOpenKirtanSearch,
    onAddNewKirtan: !!onAddNewKirtan,
    onOpenPDFImport: !!onOpenPDFImport,
    onLogout: !!onLogout
  });

  return (
    <header className="app-header">
      <div className="header-left">
        <h1>Kirtan Kadi App</h1>
      </div>
      
      <div className="header-center">
        <div className="header-search-bar" onClick={handleSearchClick}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search kirtans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchClick}
            readOnly
          />
        </div>
      </div>
      
      <div className="header-right">
        <button className="header-button" onClick={onOpenInputModal}>
          <i className="fas fa-edit"></i> Input
        </button>
        <button className="header-button add-kirtan" onClick={onAddNewKirtan}>
          <i className="fas fa-plus"></i> Add Kirtan
        </button>
        <button className="header-button import-button" onClick={onOpenPDFImport}>
          <i className="fas fa-file-import"></i> Import
        </button>
        <button className="header-button" onClick={onOpenSettingsModal}>
          <i className="fas fa-cog"></i> Settings
        </button>
        <button className="header-button" onClick={onOpenVmixModal}>
          <i className="fas fa-video"></i> vMix
        </button>
        <button className="header-button" onClick={onOpenDatabase}>
          <i className="fas fa-database"></i> Database
        </button>
        <button className="header-button logout-button" onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;