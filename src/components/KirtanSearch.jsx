import React, { useState, useEffect, useCallback } from 'react';
import kirtanDB from '../utils/database';
import '../styles/KirtanSearch.css';

const KirtanSearch = ({ isOpen, onClose, onSelectKirtan, onEditKirtan }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allKirtans, setAllKirtans] = useState([]);
  const [filteredKirtans, setFilteredKirtans] = useState([]);
  const [matchingLines, setMatchingLines] = useState([]);
  const [selectedKirtan, setSelectedKirtan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load all kirtans on mount
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

  // Filter kirtans and find matching lines
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredKirtans(allKirtans);
      setMatchingLines([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Filter kirtans by title
    const filtered = allKirtans.filter(kirtan => {
      const titleMatch = 
        (kirtan.sulekhTitle && kirtan.sulekhTitle.toLowerCase().includes(query)) ||
        (kirtan.unicodeTitle && kirtan.unicodeTitle.toLowerCase().includes(query)) ||
        (kirtan.englishTitle && kirtan.englishTitle.toLowerCase().includes(query));
      
      return titleMatch;
    });
    
    setFilteredKirtans(filtered);
    
    // Find matching lines in all kirtans
    const lines = [];
    allKirtans.forEach(kirtan => {
      // Search in Sulekh content
      if (kirtan.sulekhContent) {
        const contentLines = kirtan.sulekhContent.split('\n');
        contentLines.forEach((line, index) => {
          if (line.toLowerCase().includes(query)) {
            lines.push({
              kirtanId: kirtan.id,
              kirtanTitle: kirtan.sulekhTitle || kirtan.unicodeTitle || kirtan.englishTitle,
              line: line,
              lineNumber: index + 1,
              type: 'sulekh'
            });
          }
        });
      }
      
      // Search in Unicode content
      if (kirtan.unicodeContent) {
        const contentLines = kirtan.unicodeContent.split('\n');
        contentLines.forEach((line, index) => {
          if (line.toLowerCase().includes(query)) {
            // Avoid duplicates if already found in Sulekh
            const isDuplicate = lines.some(l => 
              l.kirtanId === kirtan.id && l.lineNumber === index + 1
            );
            if (!isDuplicate) {
              lines.push({
                kirtanId: kirtan.id,
                kirtanTitle: kirtan.unicodeTitle || kirtan.sulekhTitle || kirtan.englishTitle,
                line: line,
                lineNumber: index + 1,
                type: 'unicode'
              });
            }
          }
        });
      }
    });
    
    setMatchingLines(lines);
  }, [searchQuery, allKirtans]);

  const handleKirtanClick = (kirtan) => {
    setSelectedKirtan(kirtan);
  };

  const handleKirtanDoubleClick = (kirtan) => {
    onEditKirtan(kirtan);
  };

  const handleOpenKirtan = (kirtan) => {
    onSelectKirtan(kirtan);
    onClose();
  };

  const handleLineClick = (line) => {
    const kirtan = allKirtans.find(k => k.id === line.kirtanId);
    if (kirtan) {
      setSelectedKirtan(kirtan);
      // Optionally scroll to the specific line
    }
  };

  const getFirstLine = (kirtan) => {
    if (kirtan.sulekhContent) {
      const firstLine = kirtan.sulekhContent.split('\n')[0];
      return firstLine || kirtan.sulekhTitle || 'No content';
    }
    return kirtan.sulekhTitle || kirtan.unicodeTitle || kirtan.englishTitle || 'Untitled';
  };

  const getFontFamily = (type) => {
    if (type === 'sulekh') {
      return "'Guj_Regular_Bold_Sulekh', sans-serif";
    } else if (type === 'unicode') {
      return "'Noto Sans Gujarati', 'Shruti', sans-serif";
    }
    return "'Arial', sans-serif";
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index}>{part}</mark> : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="kirtan-search-modal">
      <div className="kirtan-search-container">
        <div className="kirtan-search-header">
          <h2>Kirtan Database</h2>
          <div className="search-controls">
            <input
              type="text"
              className="kirtan-search-input"
              placeholder="Search kirtans..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button className="close-search-btn" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="kirtan-search-body">
          {/* Left Panel - Kirtan List */}
          <div className="kirtan-list-panel">
            <div className="panel-header">
              <h3>Kirtans ({filteredKirtans.length})</h3>
            </div>
            <div className="kirtan-list">
              {loading ? (
                <div className="loading">Loading kirtans...</div>
              ) : filteredKirtans.length === 0 ? (
                <div className="no-results">No kirtans found</div>
              ) : (
                filteredKirtans.map(kirtan => (
                  <div
                    key={kirtan.id}
                    className={`kirtan-item ${selectedKirtan?.id === kirtan.id ? 'selected' : ''}`}
                    onClick={() => handleKirtanClick(kirtan)}
                    onDoubleClick={() => handleKirtanDoubleClick(kirtan)}
                  >
                    <div className="kirtan-title" style={{ fontFamily: getFontFamily('sulekh') }}>
                      {highlightMatch(kirtan.sulekhTitle || kirtan.unicodeTitle || kirtan.englishTitle, searchQuery)}
                    </div>
                    <div className="kirtan-first-line" style={{ fontFamily: getFontFamily('sulekh') }}>
                      {getFirstLine(kirtan)}
                    </div>
                    <div className="kirtan-meta">
                      <span className="kirtan-date">
                        {new Date(kirtan.createdAt).toLocaleDateString()}
                      </span>
                      <button 
                        className="open-kirtan-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenKirtan(kirtan);
                        }}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Matching Lines */}
          <div className="matching-lines-panel">
            <div className="panel-header">
              <h3>Matching Lines ({matchingLines.length})</h3>
            </div>
            <div className="matching-lines-list">
              {matchingLines.length === 0 ? (
                <div className="no-results">
                  {searchQuery ? 'No matching lines found' : 'Enter a search term to find matching lines'}
                </div>
              ) : (
                matchingLines.map((line, index) => (
                  <div
                    key={`${line.kirtanId}-${line.lineNumber}-${index}`}
                    className="matching-line-item"
                    onClick={() => handleLineClick(line)}
                  >
                    <div className="line-kirtan-title">
                      {line.kirtanTitle} - Line {line.lineNumber}
                    </div>
                    <div 
                      className="line-content"
                      style={{ fontFamily: getFontFamily(line.type) }}
                    >
                      {highlightMatch(line.line, searchQuery)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Selected Kirtan Preview */}
        {selectedKirtan && (
          <div className="kirtan-preview">
            <div className="preview-header">
              <h4>{selectedKirtan.sulekhTitle || selectedKirtan.unicodeTitle || 'Untitled'}</h4>
              <div className="preview-actions">
                <button onClick={() => handleKirtanDoubleClick(selectedKirtan)}>
                  <i className="fas fa-edit"></i> Edit
                </button>
                <button onClick={() => handleOpenKirtan(selectedKirtan)}>
                  <i className="fas fa-external-link-alt"></i> Open
                </button>
              </div>
            </div>
            <div className="preview-content" style={{ fontFamily: getFontFamily('sulekh') }}>
              {selectedKirtan.sulekhContent || 'No content'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KirtanSearch;