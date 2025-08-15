import React, { useState } from 'react';
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaPalette } from 'react-icons/fa';
import '../styles/SettingModal.css';

const SettingsModal = ({ isOpen, onClose, editorSettings, onUpdateEditorSettings }) => {
  const [localSettings, setLocalSettings] = useState(editorSettings);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);

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

  const predefinedColors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
    '#FFC0CB', '#A52A2A', '#808080', '#F0E68C', '#4B0082',
    '#f2cfa6', '#FFE4B5', '#F0F8FF', '#E6E6FA', '#FFF0F5'
  ];

  const fontSizes = [
    '24px', '32px', '40px', '48px', '56px', '64px', '72px', '80px', 
    '88px', '96px', '104px', '112px', '120px', '128px', '150px', 
    '200px', '250px', '300px', '400px', '500px', '600px', '700px', 
    '800px', '900px', '1000px'
  ];

  const fontFamilies = [
    { label: 'Gujarati Sulekh', value: "'Guj_Regular_Bold_Sulekh', sans-serif" },
    { label: 'System Default', value: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
    { label: 'Arial', value: "Arial, sans-serif" },
    { label: 'Times New Roman', value: "'Times New Roman', serif" },
    { label: 'Georgia', value: "Georgia, serif" },
    { label: 'Courier New', value: "'Courier New', monospace" }
  ];

  if (!isOpen) return null;

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal-compact">
        <div className="settings-header">
          <h2>Display Settings</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content-compact">
          <div className="settings-row">
            {/* Font Size Dropdown */}
            <div className="setting-group">
              <label>Font Size</label>
              <select
                value={localSettings.fontSize}
                onChange={(e) => setLocalSettings({...localSettings, fontSize: e.target.value})}
                className="setting-select"
              >
                {fontSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Font Family Dropdown */}
            <div className="setting-group">
              <label>Font Family</label>
              <select
                value={localSettings.fontFamily}
                onChange={(e) => setLocalSettings({...localSettings, fontFamily: e.target.value})}
                className="setting-select"
              >
                {fontFamilies.map(font => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="settings-row">
            {/* Text Color */}
            <div className="setting-group">
              <label>Text Color</label>
              <div className="color-selector">
                <div 
                  className="color-display"
                  style={{ backgroundColor: localSettings.textColor }}
                  onClick={() => {
                    setShowTextColorPicker(!showTextColorPicker);
                    setShowBgColorPicker(false);
                  }}
                />
                <input
                  type="text"
                  value={localSettings.textColor}
                  onChange={(e) => setLocalSettings({...localSettings, textColor: e.target.value})}
                  className="color-input"
                  placeholder="#000000"
                />
              </div>
              {showTextColorPicker && (
                <div className="color-picker-popup">
                  <div className="color-grid">
                    {predefinedColors.map(color => (
                      <div
                        key={color}
                        className="color-option"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setLocalSettings({...localSettings, textColor: color});
                          setShowTextColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={localSettings.textColor}
                    onChange={(e) => setLocalSettings({...localSettings, textColor: e.target.value})}
                    className="color-picker-native"
                  />
                </div>
              )}
            </div>

            {/* Background Color */}
            <div className="setting-group">
              <label>Background Color</label>
              <div className="color-selector">
                <div 
                  className="color-display"
                  style={{ backgroundColor: localSettings.bgColor }}
                  onClick={() => {
                    setShowBgColorPicker(!showBgColorPicker);
                    setShowTextColorPicker(false);
                  }}
                />
                <input
                  type="text"
                  value={localSettings.bgColor}
                  onChange={(e) => setLocalSettings({...localSettings, bgColor: e.target.value})}
                  className="color-input"
                  placeholder="#FFFFFF"
                />
              </div>
              {showBgColorPicker && (
                <div className="color-picker-popup">
                  <div className="color-grid">
                    {predefinedColors.map(color => (
                      <div
                        key={color}
                        className="color-option"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setLocalSettings({...localSettings, bgColor: color});
                          setShowBgColorPicker(false);
                        }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={localSettings.bgColor}
                    onChange={(e) => setLocalSettings({...localSettings, bgColor: e.target.value})}
                    className="color-picker-native"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Text Formatting */}
          <div className="settings-row">
            <div className="setting-group">
              <label>Text Style</label>
              <div className="format-buttons">
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
              </div>
            </div>

            <div className="setting-group">
              <label>Text Alignment</label>
              <div className="format-buttons">
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
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="preview-section-compact">
            <label>Preview</label>
            <div 
              className="preview-box-compact"
              style={{
                fontSize: localSettings.fontSize.includes('px') ? 
                  Math.min(parseInt(localSettings.fontSize), 60) + 'px' : '60px',
                color: localSettings.textColor,
                backgroundColor: localSettings.bgColor,
                fontFamily: localSettings.fontFamily,
                fontWeight: localSettings.isBold ? 'bold' : 'normal',
                fontStyle: localSettings.isItalic ? 'italic' : 'normal',
                textDecoration: localSettings.isUnderline ? 'underline' : 'none',
                textAlign: localSettings.textAlign
              }}
            >
              ÁÒ Ùä sÕâãÑÌâÓâÒÇ
            </div>
          </div>
        </div>
        
        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;