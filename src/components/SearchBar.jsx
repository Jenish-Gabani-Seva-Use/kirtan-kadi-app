import React, { useState, useEffect, useCallback } from 'react';
import kirtanDB from '../utils/database';
import '../styles/SearchBar.css';

const SearchBar = ({ onSelectKirtan, onOpenEntry }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Debounced search function
  const searchKirtans = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await kirtanDB.searchKirtans(query);
      setSearchResults(results);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchKirtans(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchKirtans]);

  const handleSelectKirtan = (kirtan) => {
    onSelectKirtan(kirtan);
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          handleSelectKirtan(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <mark key={index}>{part}</mark> : part
    );
  };

  const getDisplayTitle = (kirtan) => {
    // Prefer Sulekh title, then Unicode, then English
    return kirtan.sulekhTitle || kirtan.unicodeTitle || kirtan.englishTitle || 'Untitled';
  };

  const getDisplayFont = (kirtan) => {
    if (kirtan.sulekhTitle) {
      return "'Guj_Regular_Bold_Sulekh', sans-serif";
    } else if (kirtan.unicodeTitle) {
      return "'Noto Sans Gujarati', 'Shruti', sans-serif";
    }
    return "'Arial', sans-serif";
  };

  return (
    <div className="search-container">
      <div className="search-bar-wrapper">
        <div className="search-input-group">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            className="search-input"
            placeholder="Search kirtans by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery && setShowResults(true)}
          />
          {isSearching && (
            <div className="search-spinner">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
          )}
        </div>
        <button className="add-kirtan-btn" onClick={onOpenEntry}>
          <i className="fas fa-plus"></i>
          <span>Add Kirtan</span>
        </button>
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((kirtan, index) => (
            <div
              key={kirtan.id}
              className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelectKirtan(kirtan)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="result-title" style={{ fontFamily: getDisplayFont(kirtan) }}>
                {highlightMatch(getDisplayTitle(kirtan), searchQuery)}
              </div>
              <div className="result-meta">
                {kirtan.englishTitle && (
                  <span className="result-english">{kirtan.englishTitle}</span>
                )}
                <span className="result-date">
                  {new Date(kirtan.createdAt).toLocaleDateString()}
                </span>
              </div>
              {kirtan.sulekhContent && (
                <div className="result-preview" style={{ fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif" }}>
                  {kirtan.sulekhContent.substring(0, 100)}...
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showResults && searchQuery && searchResults.length === 0 && !isSearching && (
        <div className="search-results">
          <div className="no-results">
            No kirtans found for "{searchQuery}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;