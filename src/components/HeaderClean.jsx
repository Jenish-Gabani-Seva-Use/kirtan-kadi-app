import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeaderClean = ({ 
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
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setTimeout(() => {
      navigate('/login');
    }, 100);
  };

  const handleSearchClick = () => {
    if (onOpenKirtanSearch) {
      onOpenKirtanSearch();
    }
    setSearchQuery('');
  };

  // All styles inline to avoid CSS conflicts
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 25px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    position: 'relative',
    zIndex: 9999,
    minHeight: '60px',
    width: '100%',
    boxSizing: 'border-box'
  };

  const leftStyle = {
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 auto'
  };

  const h1Style = {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 600,
    whiteSpace: 'nowrap'
  };

  const centerStyle = {
    display: 'flex',
    flex: '0 0 auto',
    margin: '0 20px'
  };

  const searchBarStyle = {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '25px',
    padding: '8px 20px',
    cursor: 'pointer',
    minWidth: '250px'
  };

  const searchIconStyle = {
    marginRight: '10px',
    color: 'white'
  };

  const searchInputStyle = {
    background: 'none',
    border: 'none',
    color: 'white',
    outline: 'none',
    width: '100%',
    fontSize: '14px',
    cursor: 'pointer'
  };

  const rightStyle = {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    flex: '0 0 auto',
    alignItems: 'center'
  };

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 15px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    transition: 'all 0.3s'
  };

  const addButtonStyle = {
    ...buttonStyle,
    background: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.3)'
  };

  const importButtonStyle = {
    ...buttonStyle,
    background: 'rgba(33, 150, 243, 0.2)',
    borderColor: 'rgba(33, 150, 243, 0.3)'
  };

  const logoutButtonStyle = {
    ...buttonStyle,
    background: 'rgba(255, 0, 0, 0.2)',
    borderColor: 'rgba(255, 0, 0, 0.3)'
  };

  return (
    <header style={headerStyle}>
      <div style={leftStyle}>
        <h1 style={h1Style}>Kirtan Kadi App</h1>
      </div>
      
      <div style={centerStyle}>
        <div style={searchBarStyle} onClick={handleSearchClick}>
          <i className="fas fa-search" style={searchIconStyle}></i>
          <input
            type="text"
            placeholder="Search kirtans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchClick}
            readOnly
            style={searchInputStyle}
          />
        </div>
      </div>
      
      <div style={rightStyle}>
        <button style={buttonStyle} onClick={onOpenInputModal}>
          <i className="fas fa-edit"></i> Input
        </button>
        <button style={addButtonStyle} onClick={onAddNewKirtan}>
          <i className="fas fa-plus"></i> Add Kirtan
        </button>
        <button style={importButtonStyle} onClick={onOpenPDFImport}>
          <i className="fas fa-file-import"></i> Import
        </button>
        <button style={buttonStyle} onClick={onOpenSettingsModal}>
          <i className="fas fa-cog"></i> Settings
        </button>
        <button style={buttonStyle} onClick={onOpenVmixModal}>
          <i className="fas fa-video"></i> vMix
        </button>
        <button style={buttonStyle} onClick={onOpenDatabase}>
          <i className="fas fa-database"></i> Database
        </button>
        <button style={logoutButtonStyle} onClick={handleLogout}>
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </header>
  );
};

export default HeaderClean;