import React, { useState, useEffect, useCallback } from 'react';
import kirtanDB from '../utils/database';
import '../styles/KirtanSearch.css';

const KirtanSearch = ({ isOpen, onClose, onSelectKirtan, onEditKirtan }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allKirtans, setAllKirtans] = useState([]);
  const [firstLineResults, setFirstLineResults] = useState([]);
  const [contentResults, setContentResults] = useState([]);
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
      setFirstLineResults(kirtans);
      setContentResults([]);
    } catch (error) {
      console.error('Failed to load kirtans:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search in all fields and languages
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFirstLineResults(allKirtans);
      setContentResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    
    // Search for first line matches
    const firstLineMatches = allKirtans.filter(kirtan => {
      // Get first line from all available content
      const firstLineSulekh = kirtan.sulekhContent ? kirtan.sulekhContent.split('\n')[0].toLowerCase() : '';
      const firstLineUnicode = kirtan.unicodeContent ? kirtan.unicodeContent.split('\n')[0].toLowerCase() : '';
      const firstLineEnglish = kirtan.englishContent ? kirtan.englishContent.split('\n')[0].toLowerCase() : '';
      
      // Also check titles as they might be the first line
      const titleMatch = 
        (kirtan.sulekhTitle && kirtan.sulekhTitle.toLowerCase().includes(query)) ||
        (kirtan.unicodeTitle && kirtan.unicodeTitle.toLowerCase().includes(query)) ||
        (kirtan.englishTitle && kirtan.englishTitle.toLowerCase().includes(query));
      
      // Check if query matches first line in any language
      const firstLineMatch = 
        firstLineSulekh.includes(query) ||
        firstLineUnicode.includes(query) ||
        firstLineEnglish.includes(query) ||
        titleMatch;
      
      return firstLineMatch;
    });
    
    // Search for content matches (anywhere in the text)
    const contentMatches = allKirtans.filter(kirtan => {
      // Search in all content (all languages)
      const fullContentMatch = 
        (kirtan.sulekhContent && kirtan.sulekhContent.toLowerCase().includes(query)) ||
        (kirtan.unicodeContent && kirtan.unicodeContent.toLowerCase().includes(query)) ||
        (kirtan.englishContent && kirtan.englishContent.toLowerCase().includes(query));
      
      return fullContentMatch;
    });
    
    setFirstLineResults(firstLineMatches);
    setContentResults(contentMatches);
  }, [searchQuery, allKirtans]);

  const handleKirtanClick = (kirtan) => {
    onSelectKirtan(kirtan);
    onClose();
  };

  const getFirstLine = (kirtan) => {
    // Always show Sulekh first line if available
    if (kirtan.sulekhContent) {
      const firstLine = kirtan.sulekhContent.split('\n')[0];
      return firstLine || kirtan.sulekhTitle || '';
    }
    return kirtan.sulekhTitle || kirtan.unicodeTitle || kirtan.englishTitle || '';
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '0 2px' }}>{part}</mark> : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="kirtan-search-modal">
      <div className="kirtan-search-container">
        <div className="kirtan-search-header">
          <h2>Search Kirtan</h2>
          <input
            type="text"
            className="kirtan-search-input"
            placeholder="Search in any language (Sulekh, Unicode, English, Hindi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <button className="close-search-btn" onClick={onClose}>×</button>
        </div>

        <div className="kirtan-search-body">
          {/* Left Panel - First Line Search Results */}
          <div className="search-panel">
            <div className="panel-header">
              <h3>First Line Matches ({firstLineResults.length})</h3>
            </div>
            <div className="kirtan-list">
              {loading ? (
                <div className="loading">Loading kirtans...</div>
              ) : firstLineResults.length === 0 ? (
                <div className="no-results">No first line matches found</div>
              ) : (
                firstLineResults.map(kirtan => (
                  <div
                    key={`first-${kirtan.id}`}
                    className="kirtan-item"
                    onClick={() => handleKirtanClick(kirtan)}
                    title="Click to open"
                  >
                    <div className="kirtan-first-line" style={{ fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif" }}>
                      {highlightMatch(getFirstLine(kirtan), searchQuery)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel - Content Search Results */}
          <div className="search-panel">
            <div className="panel-header">
              <h3>Content Matches ({contentResults.length})</h3>
            </div>
            <div className="kirtan-list">
              {contentResults.length === 0 ? (
                <div className="no-results">
                  {searchQuery ? 'No content matches found' : 'Enter text to search in content'}
                </div>
              ) : (
                contentResults.map(kirtan => (
                  <div
                    key={`content-${kirtan.id}`}
                    className="kirtan-item"
                    onClick={() => handleKirtanClick(kirtan)}
                    title="Click to open"
                  >
                    <div className="kirtan-first-line" style={{ fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif" }}>
                      {getFirstLine(kirtan)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KirtanSearch;