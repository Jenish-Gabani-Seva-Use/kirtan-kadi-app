import React, { useState } from 'react';
import kirtanDB from '../utils/database';
import '../styles/DatabaseManager.css';

const DatabaseManager = ({ isOpen, onClose }) => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleExport = async () => {
    setExporting(true);
    setMessage('');
    
    try {
      const jsonData = await kirtanDB.exportToJSON();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kirtan-database-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage('Database exported successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to export database: ' + error.message);
      setMessageType('error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    setMessage('');

    try {
      const text = await file.text();
      const count = await kirtanDB.importFromJSON(text);
      setMessage(`Successfully imported ${count} kirtans!`);
      setMessageType('success');
      
      // Clear the file input
      event.target.value = '';
      
      // Refresh the page after successful import
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      setMessage('Failed to import database: ' + error.message);
      setMessageType('error');
    } finally {
      setImporting(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!window.confirm('Are you sure you want to clear all kirtans? This action cannot be undone!')) {
      return;
    }

    try {
      await kirtanDB.clearDatabase();
      setMessage('Database cleared successfully!');
      setMessageType('success');
      
      // Refresh the page after clearing
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setMessage('Failed to clear database: ' + error.message);
      setMessageType('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="database-manager-modal">
      <div className="database-manager-content">
        <div className="database-manager-header">
          <h2>Database Management</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="database-manager-body">
          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <div className="database-actions">
            <div className="action-card">
              <i className="fas fa-download"></i>
              <h3>Export Database</h3>
              <p>Download all kirtans as a JSON file for backup or sharing.</p>
              <button 
                className="btn btn-primary"
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? 'Exporting...' : 'Export to JSON'}
              </button>
            </div>

            <div className="action-card">
              <i className="fas fa-upload"></i>
              <h3>Import Database</h3>
              <p>Load kirtans from a previously exported JSON file.</p>
              <label className="btn btn-primary file-input-label">
                {importing ? 'Importing...' : 'Import from JSON'}
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  disabled={importing}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div className="action-card danger">
              <i className="fas fa-trash-alt"></i>
              <h3>Clear Database</h3>
              <p>Remove all kirtans from the database. This action cannot be undone!</p>
              <button 
                className="btn btn-danger"
                onClick={handleClearDatabase}
              >
                Clear All Data
              </button>
            </div>
          </div>

          <div className="database-info">
            <h4>About Database Storage</h4>
            <p>
              Your kirtans are stored locally in your browser using IndexedDB. 
              This means your data is private and stays on your device. 
              Regular exports are recommended for backup purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;