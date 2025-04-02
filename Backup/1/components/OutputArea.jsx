import React from 'react';
import '../styles/OutputArea.css';

const OutputArea = ({ content, onContentChange, editorSettings }) => {
  const outputStyle = {
    fontSize: editorSettings.fontSize || '60px',
    color: editorSettings.textColor || '#000000',
    backgroundColor: editorSettings.bgColor || '#f2cfa6',
    fontFamily: editorSettings.fontFamily,
    fontWeight: editorSettings.isBold ? 'bold' : 'normal',
    fontStyle: editorSettings.isItalic ? 'italic' : 'normal',
    textDecoration: editorSettings.isUnderline ? 'underline' : 'none',
    textAlign: editorSettings.textAlign
  };

  return (
    <div className="output-area">
      <div 
        className="output-content"
        contentEditable
        style={outputStyle}
        dangerouslySetInnerHTML={{ __html: content }}
        onInput={(e) => onContentChange(e.target.innerHTML)}
      />
    </div>
  );
};

export default OutputArea;