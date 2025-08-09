import React, { useState, useEffect } from 'react';
import '../styles/InputModal.css';
import { 
  convertUnicodeToSulekh, 
  convertSulekhToUnicode, 
  isUnicodeGujarati,
  isSulekhText 
} from '../utils/fontConverter';

const InputModal = ({ 
  isOpen, 
  onClose, 
  onProcessText,
  currentText // This will now receive the original input text
}) => {
  const [text, setText] = useState('');
  const [fontType, setFontType] = useState('sulekh'); // 'sulekh', 'unicode', or 'english'
  const [autoConvert, setAutoConvert] = useState(true);
  const [originalText, setOriginalText] = useState(''); // Store original for conversion

  useEffect(() => {
    // When modal opens, set the text to the current text (original input)
    if (isOpen) {
      const savedFontType = localStorage.getItem('inputFontType') || 'sulekh';
      const savedAutoConvert = localStorage.getItem('autoConvert') !== 'false';
      setFontType(savedFontType);
      setAutoConvert(savedAutoConvert);
      setText(currentText || '');
      setOriginalText(currentText || '');
    }
  }, [isOpen, currentText]);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Auto-convert Unicode to Sulekh if enabled and font is set to Sulekh
    if (autoConvert && fontType === 'sulekh') {
      // Check if user is pasting or typing Unicode text
      if (isUnicodeGujarati(newText) && !isSulekhText(newText)) {
        // Convert Unicode to Sulekh
        const convertedText = convertUnicodeToSulekh(newText);
        setText(convertedText);
      }
    }
  };

  const handleFontTypeChange = (newFontType) => {
    setFontType(newFontType);
    localStorage.setItem('inputFontType', newFontType);
    
    // Convert existing text when switching font types
    if (text) {
      if (newFontType === 'sulekh' && fontType === 'unicode') {
        // Convert from Unicode to Sulekh
        setText(convertUnicodeToSulekh(text));
      } else if (newFontType === 'unicode' && fontType === 'sulekh') {
        // Convert from Sulekh to Unicode
        setText(convertSulekhToUnicode(text));
      }
    }
  };

  const handleAutoConvertToggle = () => {
    const newValue = !autoConvert;
    setAutoConvert(newValue);
    localStorage.setItem('autoConvert', newValue.toString());
  };

  const handleProcess = () => {
    if (text.trim()) {
      // Always convert to Sulekh before processing if in Unicode mode
      let processedText = text;
      if (fontType === 'unicode') {
        processedText = convertUnicodeToSulekh(text);
      }
      onProcessText(processedText); // Process the text
      onClose();
    }
  };

  const handleClose = () => {
    // Don't clear the text when closing, preserve it
    onClose();
  };

  const handlePaste = (e) => {
    if (autoConvert && fontType === 'sulekh') {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      
      // Check if pasted text is Unicode Gujarati
      if (isUnicodeGujarati(pastedText)) {
        const convertedText = convertUnicodeToSulekh(pastedText);
        setText(text + convertedText);
      } else {
        setText(text + pastedText);
      }
    }
  };

  const getFontFamily = () => {
    switch(fontType) {
      case 'sulekh':
        return "'Guj_Regular_Bold_Sulekh', sans-serif";
      case 'unicode':
        return "'Noto Sans Gujarati', 'Shruti', sans-serif";
      case 'english':
        return "'Arial', sans-serif";
      default:
        return "'Guj_Regular_Bold_Sulekh', sans-serif";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Enter Your Text</h2>
        
        <div className="font-controls">
          <div className="font-selector">
            <label>Font Type:</label>
            <select 
              value={fontType} 
              onChange={(e) => handleFontTypeChange(e.target.value)}
              className="font-dropdown"
            >
              <option value="sulekh">Gujarati Sulekh</option>
              <option value="unicode">Unicode Gujarati</option>
              <option value="english">English</option>
            </select>
          </div>
          
          {fontType === 'sulekh' && (
            <div className="auto-convert-toggle">
              <label>
                <input 
                  type="checkbox" 
                  checked={autoConvert}
                  onChange={handleAutoConvertToggle}
                />
                Auto-convert Unicode to Sulekh
              </label>
            </div>
          )}
        </div>

        <textarea
          className="modal-textarea"
          value={text}
          onChange={handleTextChange}
          onPaste={handlePaste}
          placeholder={
            fontType === 'english' 
              ? "Enter your text in English..." 
              : fontType === 'unicode'
              ? "તમારો ટેક્સ્ટ અહીં દાખલ કરો..."
              : "Paste your entire text here..."
          }
          style={{ fontFamily: getFontFamily() }}
        />
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={handleClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleProcess}>Process Text</button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;