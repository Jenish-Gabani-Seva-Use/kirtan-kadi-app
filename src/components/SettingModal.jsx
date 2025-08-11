import React, { useState } from 'react';
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaListUl } from 'react-icons/fa';
import '../styles/SettingModal.css';

const SettingsModal = ({ isOpen, onClose, editorSettings, onUpdateEditorSettings }) => {
  const [localSettings, setLocalSettings] = useState(editorSettings);

  const handleSave = () => {
    onUpdateEditorSettings(localSettings);
    onClose();
  };

  const toggleFormat = (format) => {
    setLocalSettings({
      ...localSettings,
      [format]: !localSettings[format]
    });
  };

  const setAlignment = (alignment) => {
    setLocalSettings({
      ...localSettings,
      textAlign: alignment
    });
  };

  if (!isOpen) return null;

  return (
    <div className="settings-modal">
      <div className="settings-content">
        <h2>Output Text Editor</h2>
        
        <div className="editor-controls">
          <div className="editor-group">
            <label htmlFor="editorFontSize">Font Size</label>
            <select
  id="editorFontSize"
  value={localSettings.fontSize}
  onChange={(e) => setLocalSettings({...localSettings, fontSize: e.target.value})}
>
  <option value="24px">24px</option>
  <option value="32px">32px</option>
  <option value="40px">40px</option>
  <option value="48px">48px</option>
  <option value="56px">56px</option>
  <option value="64px">64px</option>
  <option value="72px">72px</option>
  <option value="80px">80px</option>
  <option value="88px">88px</option>
  <option value="96px">96px</option>
  <option value="104px">104px</option>
  <option value="112px">112px</option>
  <option value="120px">120px</option>
  <option value="128px">128px</option>
  <option value="500px">500px</option>
  <option value="600px">600px</option>
  <option value="700px">700px</option>
  <option value="800px">800px</option>
  <option value="900px">900px</option>
  <option value="1000px">1000px</option>
</select>
          </div>
          
          <div className="editor-group">
            <label htmlFor="editorTextColor">Text Color</label>
            <input
              type="color"
              id="editorTextColor"
              value={localSettings.textColor}
              onChange={(e) => setLocalSettings({...localSettings, textColor: e.target.value})}
            />
          </div>
          
          <div className="editor-group">
            <label htmlFor="editorBgColor">Background Color</label>
            <input
              type="color"
              id="editorBgColor"
              value={localSettings.bgColor}
              onChange={(e) => setLocalSettings({...localSettings, bgColor: e.target.value})}
            />
          </div>
          
          <div className="editor-group">
            <label htmlFor="editorFontFamily">Font Family</label>
            <select
              id="editorFontFamily"
              value={localSettings.fontFamily}
              onChange={(e) => setLocalSettings({...localSettings, fontFamily: e.target.value})}
            >
              <option value="'Guj_Regular_Bold_Sulekh', sans-serif">Gujarati Sulekh</option>
              <option value="'Segoe UI', Tahoma, Geneva, Verdana, sans-serif">Default</option>
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Times New Roman', serif">Times New Roman</option>
            </select>
          </div>
        </div>
        
        <div className="text-format-controls">
          <button
            className={`format-btn ${localSettings.isBold ? 'active' : ''}`}
            onClick={() => toggleFormat('isBold')}
            title="Bold"
          >
            <FaBold />
          </button>
          <button
            className={`format-btn ${localSettings.isItalic ? 'active' : ''}`}
            onClick={() => toggleFormat('isItalic')}
            title="Italic"
          >
            <FaItalic />
          </button>
          <button
            className={`format-btn ${localSettings.isUnderline ? 'active' : ''}`}
            onClick={() => toggleFormat('isUnderline')}
            title="Underline"
          >
            <FaUnderline />
          </button>
          <button
            className={`format-btn ${localSettings.textAlign === 'left' ? 'active' : ''}`}
            onClick={() => setAlignment('left')}
            title="Align Left"
          >
            <FaAlignLeft />
          </button>
          <button
            className={`format-btn ${localSettings.textAlign === 'center' ? 'active' : ''}`}
            onClick={() => setAlignment('center')}
            title="Align Center"
          >
            <FaAlignCenter />
          </button>
          <button
            className={`format-btn ${localSettings.textAlign === 'right' ? 'active' : ''}`}
            onClick={() => setAlignment('right')}
            title="Align Right"
          >
            <FaAlignRight />
          </button>
          <button
            className="format-btn"
            title="Bullet List"
          >
            <FaListUl />
          </button>
        </div>
        
        <div className="settings-actions">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;