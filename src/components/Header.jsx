import React from 'react';
import { FaCog, FaVideo, FaPencilAlt } from 'react-icons/fa';
import '../styles/Header.css';

const Header = ({ onOpenInputModal, onOpenSettingsModal, onOpenVmixModal }) => {
  return (
    <header>
      <div className="logo">Kirtan Kadi App</div>
      <div className="header-icons">
        <div className="pencil-icon" onClick={onOpenInputModal} title="Add new text">✏️</div>
        <div className="settings-icon" onClick={onOpenSettingsModal} title="Output settings">
          <FaCog />
        </div>
        <div className="vmix-icon" onClick={onOpenVmixModal} title="VMix Settings">
          <FaVideo />
        </div>
      </div>
    </header>
  );
};

export default Header;