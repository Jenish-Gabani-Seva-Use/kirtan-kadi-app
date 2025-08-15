import React, { useState, useEffect } from 'react';
import kirtanDB from '../utils/database';
import KirtanEntryEnhanced from './KirtanEntryEnhanced';
import '../styles/DatabaseManager.css';

const DatabaseManager = ({ isOpen, onClose }) => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpAction, setOtpAction] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [allKirtans, setAllKirtans] = useState([]);
  const [filteredKirtans, setFilteredKirtans] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingKirtan, setEditingKirtan] = useState(null);
  const [kirtanEntryOpen, setKirtanEntryOpen] = useState(false);

  // Load all kirtans when modal opens
  useEffect(() => {
    if (isOpen) {
      loadKirtans();
    }
  }, [isOpen]);

  const loadKirtans = async () => {
    setLoading(true);
    try {
      const kirtans = await kirtanDB.getAllKirtans();
      setAllKirtans(kirtans);
      setFilteredKirtans(kirtans);
    } catch (error) {
      console.error('Failed to load kirtans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter kirtans based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredKirtans(allKirtans);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = allKirtans.filter(kirtan => {
      const searchInAll = 
        (kirtan.sulekhTitle && kirtan.sulekhTitle.toLowerCase().includes(query)) ||
        (kirtan.unicodeTitle && kirtan.unicodeTitle.toLowerCase().includes(query)) ||
        (kirtan.englishTitle && kirtan.englishTitle.toLowerCase().includes(query)) ||
        (kirtan.sulekhContent && kirtan.sulekhContent.toLowerCase().includes(query)) ||
        (kirtan.unicodeContent && kirtan.unicodeContent.toLowerCase().includes(query)) ||
        (kirtan.englishContent && kirtan.englishContent.toLowerCase().includes(query));
      
      return searchInAll;
    });
    
    setFilteredKirtans(filtered);
  }, [searchQuery, allKirtans]);

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    
    // Check OTP for database operations
    if (otp === '2529') {
      setOtp('');
      setOtpError('');
      setShowOtpModal(false);
      
      // Execute the pending action
      if (otpAction === 'export') {
        executeExport();
      } else if (otpAction === 'import') {
        document.getElementById('import-file-input').click();
      } else if (otpAction === 'clear') {
        executeClear();
      }
      
      setOtpAction(null);
    } else {
      setOtpError('Incorrect OTP. Please try again.');
      setOtp('');
    }
  };

  const requestOtp = (action) => {
    setOtpAction(action);
    setShowOtpModal(true);
    setOtp('');
    setOtpError('');
  };

  const executeExport = async () => {
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
      
      // Reload kirtans
      loadKirtans();
    } catch (error) {
      setMessage('Failed to import database: ' + error.message);
      setMessageType('error');
    } finally {
      setImporting(false);
    }
  };

  const executeClear = async () => {
    if (!window.confirm('Are you sure you want to clear all kirtans? This action cannot be undone!')) {
      return;
    }

    try {
      await kirtanDB.clearDatabase();
      setMessage('Database cleared successfully!');
      setMessageType('success');
      
      // Reload kirtans
      setTimeout(() => {
        loadKirtans();
      }, 1000);
    } catch (error) {
      setMessage('Failed to clear database: ' + error.message);
      setMessageType('error');
    }
  };

  const handleEditKirtan = (kirtan) => {
    setEditingKirtan(kirtan);
    setKirtanEntryOpen(true);
  };

  const handleDeleteKirtan = async (kirtan) => {
    if (!window.confirm(`Are you sure you want to delete "${kirtan.sulekhTitle || kirtan.unicodeTitle}"?`)) {
      return;
    }

    try {
      await kirtanDB.deleteKirtan(kirtan.id);
      setMessage('Kirtan deleted successfully!');
      setMessageType('success');
      loadKirtans();
    } catch (error) {
      setMessage('Failed to delete kirtan: ' + error.message);
      setMessageType('error');
    }
  };

  const getFirstLine = (kirtan) => {
    if (kirtan.sulekhContent) {
      const firstLine = kirtan.sulekhContent.split('\n')[0];
      return firstLine || kirtan.sulekhTitle || '';
    }
    return kirtan.sulekhTitle || kirtan.unicodeTitle || kirtan.englishTitle || '';
  };

  if (!isOpen) return null;

  return (
    <>
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

            {/* Database Actions */}
            <div className="database-actions">
              <div className="action-card">
                <i className="fas fa-download"></i>
                <h3>Export Database</h3>
                <p>Download all kirtans as a JSON file for backup.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => requestOtp('export')}
                  disabled={exporting}
                >
                  {exporting ? 'Exporting...' : 'Export to JSON'}
                </button>
              </div>

              <div className="action-card">
                <i className="fas fa-upload"></i>
                <h3>Import Database</h3>
                <p>Load kirtans from a previously exported JSON file.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => requestOtp('import')}
                  disabled={importing}
                >
                  {importing ? 'Importing...' : 'Import from JSON'}
                </button>
                <input
                  id="import-file-input"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="action-card danger">
                <i className="fas fa-trash-alt"></i>
                <h3>Clear Database</h3>
                <p>Remove all kirtans from the database.</p>
                <button 
                  className="btn btn-danger"
                  onClick={() => requestOtp('clear')}
                >
                  Clear All Data
                </button>
              </div>
            </div>

            {/* Kirtan List with Search */}
            <div className="kirtan-management-section">
              <div className="kirtan-management-header">
                <h3>All Kirtans ({allKirtans.length})</h3>
                <input
                  type="text"
                  className="kirtan-search-input"
                  placeholder="Search kirtans..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="kirtan-list-container">
                {loading ? (
                  <div className="loading">Loading kirtans...</div>
                ) : filteredKirtans.length === 0 ? (
                  <div className="no-results">No kirtans found</div>
                ) : (
                  <div className="kirtan-list">
                    {filteredKirtans.map(kirtan => (
                      <div key={kirtan.id} className="kirtan-item">
                        <div className="kirtan-info">
                          <div className="kirtan-title" style={{ fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif" }}>
                            {getFirstLine(kirtan)}
                          </div>
                          <div className="kirtan-meta">
                            Created: {new Date(kirtan.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="kirtan-actions">
                          <button 
                            className="btn-edit"
                            onClick={() => handleEditKirtan(kirtan)}
                            title="Edit Kirtan"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteKirtan(kirtan)}
                            title="Delete Kirtan"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="otp-modal-overlay">
          <div className="otp-modal-content">
            <div className="otp-modal-header">
              <h3>Enter OTP</h3>
              <button className="close-btn" onClick={() => setShowOtpModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleOtpSubmit}>
              <div className="otp-input-container">
                <input
                  type="password"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 4-digit OTP"
                  maxLength="4"
                  autoFocus
                  className="otp-input"
                />
              </div>
              
              {otpError && <div className="otp-error">{otpError}</div>}
              
              <div className="otp-modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowOtpModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kirtan Entry Modal for Editing */}
      <KirtanEntryEnhanced
        isOpen={kirtanEntryOpen}
        editKirtan={editingKirtan}
        onClose={(saved) => {
          setKirtanEntryOpen(false);
          setEditingKirtan(null);
          if (saved) {
            loadKirtans();
          }
        }}
      />
    </>
  );
};

export default DatabaseManager;