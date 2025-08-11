import React, { useState } from 'react';
import '../styles/PinModal.css';

const PinModal = ({ isOpen, onClose, onSuccess, title = "Enter PIN" }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check PIN
    if (pin === '0103') {
      setPin('');
      setError('');
      onSuccess();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="pin-modal-overlay">
      <div className="pin-modal-content">
        <div className="pin-modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="pin-input-container">
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 4-digit PIN"
              maxLength="4"
              autoFocus
              className="pin-input"
            />
          </div>
          
          {error && <div className="pin-error">{error}</div>}
          
          <div className="pin-modal-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="btn-submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PinModal;