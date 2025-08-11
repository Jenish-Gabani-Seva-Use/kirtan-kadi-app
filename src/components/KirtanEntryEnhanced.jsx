import React, { useState, useEffect, useRef } from 'react';
import { enhancedSulekhToUnicode, enhancedSulekhToGujlish, extractFirstLine, gujUnicodeToHindi } from '../utils/enhancedConverter';
import kirtanDB from '../utils/database';
import '../styles/KirtanEntryEnhanced.css';

// Custom Dropdown Component with Add Option
const CustomDropdown = ({ 
  label, 
  value, 
  onChange, 
  options, 
  onAddOption, 
  placeholder = "Select...",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newOption, setNewOption] = useState('');
  const [localOptions, setLocalOptions] = useState(options);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddNewOption = () => {
    if (newOption.trim()) {
      const updatedOptions = [...localOptions, newOption.trim()];
      setLocalOptions(updatedOptions);
      onChange(newOption.trim());
      onAddOption && onAddOption(newOption.trim());
      setNewOption('');
      setShowAddModal(false);
      setIsOpen(false);
    }
  };

  const handleClearSelection = () => {
    onChange('');
    setIsOpen(false);
  };

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <label>{label}</label>
      <div className={`custom-dropdown ${disabled ? 'disabled' : ''}`}>
        <div 
          className="dropdown-header" 
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={value ? '' : 'placeholder'}>
            {value || placeholder}
          </span>
          <div className="dropdown-controls">
            {value && (
              <span 
                className="clear-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearSelection();
                }}
              >
                ×
              </span>
            )}
            <span className="dropdown-arrow">▼</span>
          </div>
        </div>
        
        {isOpen && !disabled && (
          <div className="dropdown-list">
            <div 
              className="dropdown-item add-new-item"
              onClick={() => {
                setShowAddModal(true);
                setIsOpen(false);
              }}
            >
              <span className="add-icon">+</span> Add New {label}
            </div>
            {value && (
              <div 
                className="dropdown-item clear-item"
                onClick={handleClearSelection}
              >
                <span className="clear-icon">×</span> Clear Selection
              </div>
            )}
            {localOptions.map((option, index) => (
              <div 
                key={index}
                className={`dropdown-item ${value === option ? 'selected' : ''}`}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Option Modal */}
      {showAddModal && (
        <div className="add-option-modal">
          <div className="add-option-content">
            <h3>Add New {label}</h3>
            <input
              type="text"
              value={newOption}
              onChange={(e) => setNewOption(e.target.value)}
              placeholder={`Enter new ${label.toLowerCase()}...`}
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleAddNewOption()}
            />
            <div className="modal-actions">
              <button 
                className="btn-cancel"
                onClick={() => {
                  setShowAddModal(false);
                  setNewOption('');
                }}
              >
                Cancel
              </button>
              <button 
                className="btn-add"
                onClick={handleAddNewOption}
                disabled={!newOption.trim()}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// List Manager Modal Component
const ListManagerModal = ({ isOpen, onClose, lists, onUpdateLists }) => {
  const [localLists, setLocalLists] = useState(lists);
  const [newListItem, setNewListItem] = useState('');
  const [selectedList, setSelectedList] = useState('pdfNames');

  const listTitles = {
    pdfNames: 'Book Names',
    raags: 'Raag Names',
    dhaals: 'Dhaal Names',
    rachiyatas: 'Rachiyata Names'
  };

  useEffect(() => {
    setLocalLists(lists);
  }, [lists]);

  const handleAddItem = () => {
    if (newListItem.trim()) {
      const updatedLists = {
        ...localLists,
        [selectedList]: [...localLists[selectedList], newListItem.trim()]
      };
      setLocalLists(updatedLists);
      onUpdateLists(updatedLists);
      setNewListItem('');
    }
  };

  const handleRemoveItem = (listKey, index) => {
    const updatedLists = {
      ...localLists,
      [listKey]: localLists[listKey].filter((_, i) => i !== index)
    };
    setLocalLists(updatedLists);
    onUpdateLists(updatedLists);
  };

  if (!isOpen) return null;

  return (
    <div className="list-manager-modal">
      <div className="list-manager-content">
        <div className="list-manager-header">
          <h2>Manage Dropdown Lists</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="list-manager-body">
          <div className="add-item-section">
            <select 
              value={selectedList} 
              onChange={(e) => setSelectedList(e.target.value)}
              className="list-selector"
            >
              {Object.keys(listTitles).map(key => (
                <option key={key} value={key}>{listTitles[key]}</option>
              ))}
            </select>
            <input
              type="text"
              value={newListItem}
              onChange={(e) => setNewListItem(e.target.value)}
              placeholder={`Add new item to ${listTitles[selectedList]}...`}
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <button onClick={handleAddItem} className="btn-add-item">Add</button>
          </div>

          <div className="lists-grid">
            {Object.keys(listTitles).map(listKey => (
              <div key={listKey} className="list-section">
                <h3>{listTitles[listKey]}</h3>
                <div className="list-items">
                  {localLists[listKey].map((item, index) => (
                    <div key={index} className="list-item">
                      <span>{item}</span>
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(listKey, index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {localLists[listKey].length === 0 && (
                    <div className="empty-list">No items added yet</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KirtanEntryEnhanced = ({ isOpen, onClose, editKirtan = null }) => {
  // Initialize dropdown lists from localStorage or defaults
  const getInitialLists = () => {
    const savedLists = localStorage.getItem('kirtanDropdownLists');
    if (savedLists) {
      return JSON.parse(savedLists);
    }
    return {
      pdfNames: ['Kirtan Mala 1', 'Kirtan Mala 2', 'Kirtan Dipawali', 'Kirtan Sangrah', 'Kirtan Ratnavali'],
      raags: ['Bhairavi', 'Yaman', 'Bhupali', 'Kafi', 'Khamaj', 'Bilawal', 'Kalyan', 'Todi', 'Purvi', 'Marwa'],
      dhaals: ['Teentaal', 'Ektaal', 'Jhaptaal', 'Rupak', 'Dadra', 'Keherwa', 'Deepchandi'],
      rachiyatas: ['Kabir', 'Tulsidas', 'Surdas', 'Mirabai', 'Narsinh Mehta', 'Premanand', 'Dayaram', 'Brahmanand']
    };
  };

  const [dropdownLists, setDropdownLists] = useState(getInitialLists());
  const [showListManager, setShowListManager] = useState(false);

  const [formData, setFormData] = useState({
    // New fields
    pdfPageNo: '',
    pdfIndexNo: '',
    pdfName: '',
    firstLetterSulekh: '',
    raagName: '',
    dhaal: '',
    padNo: '',
    rachiyata: '',
    // Existing fields
    sulekhTitle: '',
    unicodeTitle: '',
    englishTitle: '',
    hindiTitle: '',
    sulekhContent: '',
    unicodeContent: '',
    englishContent: '',
    hindiContent: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const conversionTimeoutRef = useRef(null);
  const isFirstPaste = useRef(true);

  // Save dropdown lists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('kirtanDropdownLists', JSON.stringify(dropdownLists));
  }, [dropdownLists]);

  useEffect(() => {
    if (editKirtan) {
      // When editing, recalculate first letter from the existing title
      const sulekhTitle = editKirtan.sulekhTitle || '';
      const firstLetter = sulekhTitle.trim() ? extractFirstLetter(sulekhTitle) : '';
      
      setFormData({
        pdfPageNo: editKirtan.pdfPageNo || '',
        pdfIndexNo: editKirtan.pdfIndexNo || '',
        pdfName: editKirtan.pdfName || '',
        firstLetterSulekh: firstLetter, // Recalculate instead of using stored value
        raagName: editKirtan.raagName || '',
        dhaal: editKirtan.dhaal || '',
        padNo: editKirtan.padNo || '',
        rachiyata: editKirtan.rachiyata || '',
        sulekhTitle: sulekhTitle,
        unicodeTitle: editKirtan.unicodeTitle || '',
        englishTitle: editKirtan.englishTitle || '',
        hindiTitle: editKirtan.hindiTitle || '',
        sulekhContent: editKirtan.sulekhContent || '',
        unicodeContent: editKirtan.unicodeContent || '',
        englishContent: editKirtan.englishContent || '',
        hindiContent: editKirtan.hindiContent || ''
      });
      isFirstPaste.current = false;
    } else {
      setFormData({
        pdfPageNo: '',
        pdfIndexNo: '',
        pdfName: '',
        firstLetterSulekh: '',
        raagName: '',
        dhaal: '',
        padNo: '',
        rachiyata: '',
        sulekhTitle: '',
        unicodeTitle: '',
        englishTitle: '',
        hindiTitle: '',
        sulekhContent: '',
        unicodeContent: '',
        englishContent: '',
        hindiContent: ''
      });
      isFirstPaste.current = true;
    }
  }, [editKirtan, isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (conversionTimeoutRef.current) {
        clearTimeout(conversionTimeoutRef.current);
      }
    };
  }, []);

  // Auto-extract first letter(s) when Sulekh content changes - handles compound characters
  const extractFirstLetter = (text) => {
    if (!text) return '';
    
    const trimmed = text.trim();
    if (trimmed.length === 0) return '';
    
    // Check if first two characters form a compound (like áâ, ã×, etc.)
    if (trimmed.length >= 2) {
      const firstTwo = trimmed.substring(0, 2);
      // Common Sulekh compound patterns
      const compoundPatterns = [
        /^[áàâãäåæçèéêëìíîïðñòóôõö][×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/,
        /^[ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ][×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/,
        /^[a-zA-Z][×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿ]/
      ];
      
      // Check if it's a compound character
      for (const pattern of compoundPatterns) {
        if (pattern.test(firstTwo)) {
          return firstTwo;
        }
      }
    }
    
    // Return single character if not a compound
    return trimmed[0];
  };

  const handleSulekhTitleChange = (e) => {
    const sulekhTitle = e.target.value;
    
    // Update Sulekh title and auto-extract first letter
    // If title is empty, clear first letter as well
    const firstLetter = sulekhTitle.trim() ? extractFirstLetter(sulekhTitle) : '';
    
    setFormData(prev => ({
      ...prev,
      sulekhTitle,
      firstLetterSulekh: firstLetter
    }));

    // Clear any existing timeout
    if (conversionTimeoutRef.current) {
      clearTimeout(conversionTimeoutRef.current);
    }

    // Debounce conversion
    conversionTimeoutRef.current = setTimeout(() => {
      try {
        // If title is empty, clear all converted titles
        if (!sulekhTitle.trim()) {
          setFormData(prev => ({
            ...prev,
            unicodeTitle: '',
            englishTitle: '',
            hindiTitle: ''
          }));
        } else {
          const unicodeTitle = enhancedSulekhToUnicode(sulekhTitle);
          const englishTitle = enhancedSulekhToGujlish(unicodeTitle);
          const hindiTitle = gujUnicodeToHindi(unicodeTitle);
          
          setFormData(prev => ({
            ...prev,
            unicodeTitle,
            englishTitle,
            hindiTitle
          }));
        }
      } catch (error) {
        console.error('Title conversion error:', error);
      }
    }, 300);
  };

  const handleSulekhContentChange = (e) => {
    const sulekhContent = e.target.value;
    const isPaste = e.nativeEvent?.inputType === 'insertFromPaste';
    
    // Update Sulekh content immediately
    setFormData(prev => ({
      ...prev,
      sulekhContent
    }));

    // Clear any existing timeout
    if (conversionTimeoutRef.current) {
      clearTimeout(conversionTimeoutRef.current);
    }

    // Only convert if there's content
    if (sulekhContent.trim()) {
      // Show processing indicator for large text
      if (sulekhContent.length > 500) {
        setIsProcessing(true);
      }
      
      // Debounce conversion
      conversionTimeoutRef.current = setTimeout(() => {
        try {
          // Convert content
          const unicodeContent = enhancedSulekhToUnicode(sulekhContent);
          const englishContent = enhancedSulekhToGujlish(unicodeContent);
          const hindiContent = gujUnicodeToHindi(unicodeContent);
          
          // Auto-generate titles from first line if this is first paste and titles are empty
          if (isPaste && isFirstPaste.current && !formData.sulekhTitle && !formData.unicodeTitle && !formData.englishTitle) {
            const firstLineSulekh = extractFirstLine(sulekhContent);
            const firstLineUnicode = enhancedSulekhToUnicode(firstLineSulekh);
            const firstLineEnglish = enhancedSulekhToGujlish(firstLineUnicode);
            const firstLineHindi = gujUnicodeToHindi(firstLineUnicode);
            const firstLetter = extractFirstLetter(firstLineSulekh);
            
            setFormData(prev => ({
              ...prev,
              sulekhTitle: firstLineSulekh,
              unicodeTitle: firstLineUnicode,
              englishTitle: firstLineEnglish,
              hindiTitle: firstLineHindi,
              firstLetterSulekh: firstLetter,
              unicodeContent,
              englishContent,
              hindiContent
            }));
            
            isFirstPaste.current = false;
          } else {
            setFormData(prev => ({
              ...prev,
              unicodeContent,
              englishContent,
              hindiContent
            }));
          }
        } catch (error) {
          console.error('Content conversion error:', error);
        } finally {
          setIsProcessing(false);
        }
      }, isPaste ? 100 : 500); // Faster for paste operations
    } else {
      // Clear other fields if Sulekh content is empty
      setFormData(prev => ({
        ...prev,
        unicodeContent: '',
        englishContent: '',
        hindiContent: ''
      }));
      setIsProcessing(false);
    }
  };

  const handleNumericInput = (field, value) => {
    // Only allow numeric values
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const handleDropdownChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddDropdownOption = (listKey, newOption) => {
    setDropdownLists(prev => ({
      ...prev,
      [listKey]: [...prev[listKey], newOption]
    }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.sulekhTitle.trim() && !formData.unicodeTitle.trim() && !formData.englishTitle.trim()) {
      setError('Please enter at least one title');
      return;
    }

    if (!formData.sulekhContent.trim() && !formData.unicodeContent.trim() && !formData.englishContent.trim()) {
      setError('Please enter content in at least one language');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editKirtan && editKirtan.id) {
        await kirtanDB.updateKirtan(editKirtan.id, formData);
      } else {
        await kirtanDB.addKirtan(formData);
      }
      
      // Clear any pending conversions
      if (conversionTimeoutRef.current) {
        clearTimeout(conversionTimeoutRef.current);
      }
      
      // Reset form
      setFormData({
        pdfPageNo: '',
        pdfIndexNo: '',
        pdfName: '',
        firstLetterSulekh: '',
        raagName: '',
        dhaal: '',
        padNo: '',
        rachiyata: '',
        sulekhTitle: '',
        unicodeTitle: '',
        englishTitle: '',
        hindiTitle: '',
        sulekhContent: '',
        unicodeContent: '',
        englishContent: '',
        hindiContent: ''
      });
      
      isFirstPaste.current = true;
      onClose(true); // Pass true to indicate successful save
    } catch (err) {
      setError('Failed to save kirtan: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Clear any pending conversions
    if (conversionTimeoutRef.current) {
      clearTimeout(conversionTimeoutRef.current);
    }
    setIsProcessing(false);
    isFirstPaste.current = true;
    onClose(false);
  };

  if (!isOpen) return null;

  return (
    <div className="kirtan-entry-modal">
      <div className="kirtan-entry-content">
        <div className="kirtan-entry-header">
          <h2>{editKirtan ? 'Edit Kirtan' : 'Add New Kirtan'}</h2>
          <div className="header-actions">
            <button 
              className="manage-lists-btn"
              onClick={() => setShowListManager(true)}
              title="Manage Dropdown Lists"
            >
              ⚙️ Manage Lists
            </button>
            <button className="close-btn" onClick={handleCancel}>×</button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {isProcessing && <div className="processing-message">Converting text...</div>}

        <div className="kirtan-entry-form">
          {/* Content Section - Moved to top */}
          <div className="content-section">
            <h3>Kirtan Content</h3>
            <div className="four-column-layout">
              {/* Sulekh Column */}
              <div className="column sulekh-column">
                <div className="column-header">
                  <h4>Sulekh</h4>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.sulekhTitle}
                    onChange={handleSulekhTitleChange}
                    placeholder="Enter Sulekh title..."
                    style={{ fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif" }}
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={formData.sulekhContent}
                    onChange={handleSulekhContentChange}
                    onPaste={handleSulekhContentChange}
                    placeholder="Enter or paste Sulekh kirtan..."
                    rows="15"
                    style={{ fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif" }}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Unicode Column */}
              <div className="column unicode-column">
                <div className="column-header">
                  <h4>Unicode (Gujarati)</h4>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.unicodeTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, unicodeTitle: e.target.value }))}
                    placeholder="Unicode title (auto-generated)..."
                    style={{ fontFamily: "'Noto Sans Gujarati', 'Shruti', sans-serif" }}
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={formData.unicodeContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, unicodeContent: e.target.value }))}
                    placeholder="Unicode content (auto-generated)..."
                    rows="15"
                    style={{ fontFamily: "'Noto Sans Gujarati', 'Shruti', sans-serif" }}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Hindi Column */}
              <div className="column hindi-column">
                <div className="column-header">
                  <h4>Hindi</h4>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.hindiTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, hindiTitle: e.target.value }))}
                    placeholder="Hindi title (auto-generated)..."
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={formData.hindiContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, hindiContent: e.target.value }))}
                    placeholder="Hindi content (auto-generated)..."
                    rows="15"
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Gujlish Column */}
              <div className="column english-column">
                <div className="column-header">
                  <h4>Gujlish</h4>
                </div>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.englishTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, englishTitle: e.target.value }))}
                    placeholder="Gujlish title (auto-generated)..."
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={formData.englishContent}
                    onChange={(e) => setFormData(prev => ({ ...prev, englishContent: e.target.value }))}
                    placeholder="Gujlish content (auto-generated)..."
                    rows="15"
                    disabled={saving}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Section - Below content */}
          <div className="metadata-section">
            <h3>Kirtan Metadata</h3>
            <div className="metadata-grid">
              {/* Row 1 - Reordered as requested */}
              <CustomDropdown
                label="Book"
                value={formData.pdfName}
                onChange={(value) => handleDropdownChange('pdfName', value)}
                options={dropdownLists.pdfNames}
                onAddOption={(option) => handleAddDropdownOption('pdfNames', option)}
                placeholder="Select Book..."
                disabled={saving}
              />

              <div className="form-group">
                <label>First Letter (Auto)</label>
                <input
                  type="text"
                  value={formData.firstLetterSulekh}
                  readOnly
                  placeholder="Auto-filled from title..."
                  className="readonly-field"
                  style={{ fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif" }}
                />
              </div>

              <div className="form-group">
                <label>Pad No</label>
                <input
                  type="text"
                  value={formData.padNo}
                  onChange={(e) => handleNumericInput('padNo', e.target.value)}
                  placeholder="Enter pad number..."
                  disabled={saving}
                />
              </div>

              <CustomDropdown
                label="Rachiyata"
                value={formData.rachiyata}
                onChange={(value) => handleDropdownChange('rachiyata', value)}
                options={dropdownLists.rachiyatas}
                onAddOption={(option) => handleAddDropdownOption('rachiyatas', option)}
                placeholder="Select Rachiyata..."
                disabled={saving}
              />

              {/* Row 2 */}
              <CustomDropdown
                label="Raag"
                value={formData.raagName}
                onChange={(value) => handleDropdownChange('raagName', value)}
                options={dropdownLists.raags}
                onAddOption={(option) => handleAddDropdownOption('raags', option)}
                placeholder="Select Raag..."
                disabled={saving}
              />

              <CustomDropdown
                label="Dhaal"
                value={formData.dhaal}
                onChange={(value) => handleDropdownChange('dhaal', value)}
                options={dropdownLists.dhaals}
                onAddOption={(option) => handleAddDropdownOption('dhaals', option)}
                placeholder="Select Dhaal..."
                disabled={saving}
              />

              <div className="form-group">
                <label>Book Page No</label>
                <input
                  type="text"
                  value={formData.pdfPageNo}
                  onChange={(e) => handleNumericInput('pdfPageNo', e.target.value)}
                  placeholder="Enter page number..."
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>Book Index No</label>
                <input
                  type="text"
                  value={formData.pdfIndexNo}
                  onChange={(e) => handleNumericInput('pdfIndexNo', e.target.value)}
                  placeholder="Enter index number..."
                  disabled={saving}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              className="btn btn-secondary" 
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving || isProcessing}
            >
              {saving ? 'Saving...' : (editKirtan ? 'Update' : 'Save Kirtan')}
            </button>
          </div>
        </div>
      </div>

      {/* List Manager Modal */}
      <ListManagerModal
        isOpen={showListManager}
        onClose={() => setShowListManager(false)}
        lists={dropdownLists}
        onUpdateLists={setDropdownLists}
      />
    </div>
  );
};

export default KirtanEntryEnhanced;