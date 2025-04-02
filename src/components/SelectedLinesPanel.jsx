import React, { useEffect } from 'react';
import '../styles/SelectedLinesPanel.css';

const SelectedLinesPanel = ({ 
  selectedLines, 
  onRemoveLine, 
  onDisplayLine,
  currentDisplayedText
}) => {
  // Auto-scroll when selection changes
  useEffect(() => {
    if (selectedLines.length > 0 && currentDisplayedText) {
      const index = selectedLines.findIndex(line => line === currentDisplayedText);
      if (index >= 0) {
        const container = document.querySelector('.selected-lines-content');
        const element = document.querySelector(`.selected-line[data-index="${index}"]`);
        
        if (element && container) {
          const containerHeight = container.clientHeight;
          const elementTop = element.offsetTop;
          const elementHeight = element.clientHeight;
          
          const scrollToPosition = elementTop - (containerHeight / 3) + (elementHeight / 2);
          
          container.scrollTo({
            top: scrollToPosition,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [currentDisplayedText, selectedLines]);

  return (
    <div className="display-panel">
      {/* Fixed Header */}
      <div className="panel-header">
        Shortcut Kadi
      </div>
      
      {/* Scrollable Content */}
      <div className="selected-lines-content">
        {selectedLines.length === 0 ? (
          <p className="panel-placeholder">Selected lines will appear here</p>
        ) : (
          selectedLines.map((line, index) => (
            <div
              key={index}
              data-index={index}
              className={`selected-line ${
                currentDisplayedText === line ? 'selected' : ''
              }`}
              onClick={() => {
                onDisplayLine(line);
                const element = document.querySelector(`.selected-line[data-index="${index}"]`);
                element?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
              }}
            >
              <div className="line-number">{index < 9 ? index + 1 : ''}</div>
              <div className="line-text">{line}</div>
              <div 
                className="remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveLine(index);
                }}
              >
                ×
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SelectedLinesPanel;