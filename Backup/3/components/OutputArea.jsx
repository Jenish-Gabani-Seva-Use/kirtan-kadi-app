import React, { useEffect, useRef } from 'react';
import '../styles/OutputArea.css';

const OutputArea = ({ content, onContentChange, editorSettings, overlayActive }) => {
  const outputRef = useRef(null);

  // Auto-resize text to fit container
  useEffect(() => {
    const resizeText = () => {
      if (!outputRef.current) return;
      
      const element = outputRef.current;
      let fontSize = parseInt(editorSettings.fontSize || 60);
      element.style.fontSize = `${fontSize}px`;
      
      // Reduce font size until content fits
      while (element.scrollHeight > element.clientHeight && fontSize > 12) {
        fontSize -= 1;
        element.style.fontSize = `${fontSize}px`;
      }
    };

    resizeText();
    window.addEventListener('resize', resizeText);
    return () => window.removeEventListener('resize', resizeText);
  }, [content, editorSettings.fontSize]);

  const outputStyle = {
    color: editorSettings.textColor || '#000000',
    backgroundColor: editorSettings.bgColor || '#f2cfa6',
    fontFamily: editorSettings.fontFamily,
    fontWeight: editorSettings.isBold ? 'bold' : 'normal',
    fontStyle: editorSettings.isItalic ? 'italic' : 'normal',
    textDecoration: editorSettings.isUnderline ? 'underline' : 'none',
    textAlign: editorSettings.textAlign,
    lineHeight: '1.2'
  };

  return (
    <div className={`output-container ${overlayActive ? 'overlay-active' : ''}`}>
      <div
        ref={outputRef}
        className="output-content"
        contentEditable
        style={outputStyle}
        data-placeholder="ÁÒ Ùä sÕâãÑÌâÓâÒÇ"
        dangerouslySetInnerHTML={{ __html: content || 'ÁÒ Ùä sÕâãÑÌâÓâÒÇ' }}
        onInput={(e) => onContentChange(e.target.innerHTML)}
      />
    </div>
  );
};

export default OutputArea;