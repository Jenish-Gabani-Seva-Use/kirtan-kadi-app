import React, { useEffect } from 'react';
import '../styles/LinesPanel.css';

const LinesPanel = ({
  allLines,
  selectedLineIndex,
  isDeleteMode,
  linesToDelete,
  onSelectLine,
  onAddToSelectedLines,
  onToggleDeleteMode,
  onToggleLineForDeletion,
  onDeleteSelectedLines,
  setIsInputPanelFocused
}) => {
  // Auto-focus the panel when lines change
  useEffect(() => {
    const panel = document.querySelector('.lines-content');
    if (panel && allLines.length > 0) {
      panel.focus();
      setIsInputPanelFocused(true);
    }
  }, [allLines, setIsInputPanelFocused]);

  // Enhanced scroll behavior with fixed header
  useEffect(() => {
    if (selectedLineIndex >= 0 && allLines.length > 0) {
      const container = document.querySelector('.lines-content');
      const element = document.querySelector(`.line-item[data-index="${selectedLineIndex}"]`);
      
      if (element && container) {
        const containerHeight = container.clientHeight;
        const elementTop = element.offsetTop;
        const elementHeight = element.clientHeight;
        
        // Calculate scroll position to show context
        const scrollToPosition = elementTop - (containerHeight / 3) + (elementHeight / 2);
        
        container.scrollTo({
          top: scrollToPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedLineIndex, allLines]);

  return (
    <div className="lines-panel">
      {/* Fixed Header */}
      <div className="panel-header">
        <span>Text Inputs</span>
        <div className="panel-header-actions">
          <div 
            className={`delete-icon ${isDeleteMode ? 'active' : ''}`} 
            onClick={(e) => {
              e.stopPropagation();
              onToggleDeleteMode();
            }}
            title={isDeleteMode ? 'Exit delete mode' : 'Delete selected lines'}
          >
            {isDeleteMode ? '✕' : '🗑️'}
          </div>
        </div>
      </div>
      
      {/* Scrollable Content */}
      <div 
        className="lines-content"
        tabIndex="0"
        onClick={() => setIsInputPanelFocused(true)}
      >
        {allLines.length === 0 ? (
          <p className="panel-placeholder">Process text to see lines here</p>
        ) : (
          allLines.map((line, index) => (
            <div
              key={index}
              data-index={index}
              className={`line-item ${selectedLineIndex === index ? 'selected' : ''}`}
              onClick={() => !isDeleteMode && onSelectLine(index)}
            >
              {isDeleteMode && (
                <input
                  type="checkbox"
                  className="line-checkbox"
                  checked={linesToDelete.includes(index)}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleLineForDeletion(index);
                  }}
                />
              )}
              <span className="line-index">{index + 1}.</span>
              <div className="line-text">{line}</div>
              {!isDeleteMode && (
                <div 
                  className="add-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToSelectedLines(line);
                    setIsInputPanelFocused(false);
                  }}
                >
                  +
                </div>
              )}
            </div>
          ))
        )}
        
        {isDeleteMode && linesToDelete.length > 0 && (
          <div className="delete-confirm">
            <button 
              className="btn btn-primary"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSelectedLines();
              }}
            >
              Delete Selected ({linesToDelete.length})
            </button>
          </div>
        )}

       
      </div>
    </div>
  );
};

export default LinesPanel;