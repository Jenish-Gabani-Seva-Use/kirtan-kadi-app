import React, { useState, useEffect } from 'react';
import '../styles/InputModal.css';

const InputModal = ({ 
  isOpen, 
  onClose, 
  onProcessText,
  currentText // Add this to destructured props
}) => {
  const [text, setText] = useState(currentText || ''); // Initialize with currentText

  useEffect(() => {
    // Reset text when modal opens
    if (isOpen) {
      setText(currentText || '');
    }
  }, [isOpen, currentText]);

  const handleProcess = () => {
    if (text.trim()) {
      onProcessText(text); // This will trigger the clearing
      setText('');
      onClose();
    }
  };


  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Enter Your Text</h2>
        <textarea
          className="modal-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your entire text here..."
        />
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleProcess}>Process Text</button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;