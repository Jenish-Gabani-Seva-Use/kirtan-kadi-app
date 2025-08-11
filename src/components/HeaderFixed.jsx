import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HeaderFix.css';

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
  const [isVisible, setIsVisible] = useState(true);

  // Force visibility after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Force re-render
      const headerRight = document.querySelector('.header-right');
      if (headerRight) {
        headerRight.style.display = 'flex';
        headerRight.style.visibility = 'visible';
        headerRight.style.opacity = '1';
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
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

  // Style object to force visibility
  const forceVisibleStyle = {
    display: 'flex',
    visibility: 'visible',
    opacity: 1,
    gap: '10px',
    flexWrap: 'wrap'
  };

  const buttonStyle = {
    display: 'inline-flex',
    visibility: 'visible',
    opacity: 1,
    padding: '8px 15px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap'
  };

  return (
    <header className="app-header" style={{ display: 'flex', visibility: 'visible', opacity: 1 }}>
      <div className="header-left" style={{ display: 'flex', visibility: 'visible', opacity: 1 }}>
        <h1>Kirtan Kadi App</h1>
      </div>
      
      <div className="header-center" style={{ display: 'flex', visibility: 'visible', opacity: 1 }}>
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
      
      <div className="header-right" style={forceVisibleStyle}>
        <button className="header-button" style={buttonStyle} onClick={onOpenInputModal}>
          <i className="fas fa-edit"></i> Input
        </button>
        <button className="header-button add-kirtan" style={buttonStyle} onClick={onAddNewKirtan}>
          <i className="fas fa-plus"></i> Add Kirtan
        </button>
        <button className="header-button import-button" style={buttonStyle} onClick={onOpenPDFImport}>
          <i className="fas fa-file-import"></i> Import
        </button>
        <button className="header-button" style={buttonStyle} onClick={onOpenSettingsModal}>
          <i className="fas fa-cog"></i> Settings
        </button>
        <button className="header-button" style={buttonStyle} onClick={onOpenVmixModal}>
          <i className="fas fa-video"></i> vMix
        </button>
        <button className="header-button" style={buttonStyle} onClick={onOpenDatabase}>
          <i className="fas fa-database"></i> Database
        </button>
        <button className="header-button logout-button" style={{...buttonStyle, background: 'rgba(255, 0, 0, 0.2)'}} onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;