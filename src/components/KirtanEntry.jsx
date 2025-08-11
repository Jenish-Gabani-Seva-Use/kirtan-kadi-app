import React, { useState, useEffect, useRef } from 'react';
import { 
  enhancedSulekhToUnicode, 
  gujUnicodeToSulekh,
  gujUnicodeToEnglish,
  gujUnicodeToHindi,
  hindiUnicodeToGujUnicode,
  extractFirstLine 
} from '../utils/enhancedConverter';
import kirtanDB from '../utils/database';
import '../styles/KirtanEntry.css';

const KirtanEntry = ({ isOpen, onClose, editKirtan = null }) => {
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (editKirtan) {
      setFormData({
        sulekhTitle: editKirtan.sulekhTitle || '',
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

  const handleSulekhTitleChange = (e) => {
    const sulekhTitle = e.target.value;
    
    // Update Sulekh title immediately
    setFormData(prev => ({
      ...prev,
      sulekhTitle
    }));

    // Clear any existing timeout
    if (conversionTimeoutRef.current) {
      clearTimeout(conversionTimeoutRef.current);
    }

    // Debounce conversion
    conversionTimeoutRef.current = setTimeout(() => {
      try {
        const unicodeTitle = enhancedSulekhToUnicode(sulekhTitle);
        const englishTitle = gujUnicodeToEnglish(unicodeTitle);
        const hindiTitle = gujUnicodeToHindi(unicodeTitle);
        
        setFormData(prev => ({
          ...prev,
          unicodeTitle,
          englishTitle,
          hindiTitle
        }));
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
          const englishContent = gujUnicodeToEnglish(unicodeContent);
          const hindiContent = gujUnicodeToHindi(unicodeContent);
          
          // Auto-generate titles from first line if this is first paste and titles are empty
          if (isPaste && isFirstPaste.current && !formData.sulekhTitle && !formData.unicodeTitle && !formData.englishTitle) {
            const firstLineSulekh = extractFirstLine(sulekhContent);
            const firstLineUnicode = enhancedSulekhToUnicode(firstLineSulekh);
            const firstLineEnglish = gujUnicodeToEnglish(firstLineUnicode);
            const firstLineHindi = gujUnicodeToHindi(firstLineUnicode);
            
            setFormData(prev => ({
              ...prev,
              sulekhTitle: firstLineSulekh,
              unicodeTitle: firstLineUnicode,
              englishTitle: firstLineEnglish,
              hindiTitle: firstLineHindi,
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

  const handleUnicodeContentChange = (e) => {
    const unicodeContent = e.target.value;
    const isPaste = e.nativeEvent?.inputType === 'insertFromPaste';
    
    // Update Unicode content immediately
    setFormData(prev => ({
      ...prev,
      unicodeContent
    }));

    // Clear any existing timeout
    if (conversionTimeoutRef.current) {
      clearTimeout(conversionTimeoutRef.current);
    }

    // Only convert if there's content
    if (unicodeContent.trim()) {
      // Show processing indicator for large text
      if (unicodeContent.length > 500) {
        setIsProcessing(true);
      }
      
      // Debounce conversion
      conversionTimeoutRef.current = setTimeout(() => {
        try {
          // Convert content
          const sulekhContent = gujUnicodeToSulekh(unicodeContent);
          const englishContent = gujUnicodeToEnglish(unicodeContent);
          const hindiContent = gujUnicodeToHindi(unicodeContent);
          
          // Auto-generate titles from first line if this is first paste and titles are empty
          if (isPaste && isFirstPaste.current && !formData.sulekhTitle && !formData.unicodeTitle && !formData.englishTitle) {
            const firstLineUnicode = extractFirstLine(unicodeContent);
            const firstLineSulekh = gujUnicodeToSulekh(firstLineUnicode);
            const firstLineEnglish = gujUnicodeToEnglish(firstLineUnicode);
            const firstLineHindi = gujUnicodeToHindi(firstLineUnicode);
            
            setFormData(prev => ({
              ...prev,
              sulekhTitle: firstLineSulekh,
              unicodeTitle: firstLineUnicode,
              englishTitle: firstLineEnglish,
              hindiTitle: firstLineHindi,
              sulekhContent,
              englishContent,
              hindiContent
            }));
            
            isFirstPaste.current = false;
          } else {
            setFormData(prev => ({
              ...prev,
              sulekhContent,
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
      // Clear other fields if Unicode content is empty
      setFormData(prev => ({
        ...prev,
        sulekhContent: '',
        englishContent: '',
        hindiContent: ''
      }));
      setIsProcessing(false);
    }
  };

  const handleHindiContentChange = (e) => {
    const hindiContent = e.target.value;
    const isPaste = e.nativeEvent?.inputType === 'insertFromPaste';
    
    // Update Hindi content immediately
    setFormData(prev => ({
      ...prev,
      hindiContent
    }));

    // Clear any existing timeout
    if (conversionTimeoutRef.current) {
      clearTimeout(conversionTimeoutRef.current);
    }

    // Only convert if there's content
    if (hindiContent.trim()) {
      // Show processing indicator for large text
      if (hindiContent.length > 500) {
        setIsProcessing(true);
      }
      
      // Debounce conversion
      conversionTimeoutRef.current = setTimeout(() => {
        try {
          // Convert content
          const unicodeContent = hindiUnicodeToGujUnicode(hindiContent);
          const sulekhContent = gujUnicodeToSulekh(unicodeContent);
          const englishContent = gujUnicodeToEnglish(unicodeContent);
          
          // Auto-generate titles from first line if this is first paste and titles are empty
          if (isPaste && isFirstPaste.current && !formData.sulekhTitle && !formData.unicodeTitle && !formData.englishTitle) {
            const firstLineHindi = extractFirstLine(hindiContent);
            const firstLineUnicode = hindiUnicodeToGujUnicode(firstLineHindi);
            const firstLineSulekh = gujUnicodeToSulekh(firstLineUnicode);
            const firstLineEnglish = gujUnicodeToEnglish(firstLineUnicode);
            
            setFormData(prev => ({
              ...prev,
              sulekhTitle: firstLineSulekh,
              unicodeTitle: firstLineUnicode,
              englishTitle: firstLineEnglish,
              hindiTitle: firstLineHindi,
              sulekhContent,
              unicodeContent,
              englishContent
            }));
            
            isFirstPaste.current = false;
          } else {
            setFormData(prev => ({
              ...prev,
              sulekhContent,
              unicodeContent,
              englishContent
            }));
          }
        } catch (error) {
          console.error('Content conversion error:', error);
        } finally {
          setIsProcessing(false);
        }
      }, isPaste ? 100 : 500); // Faster for paste operations
    } else {
      // Clear other fields if Hindi content is empty
      setFormData(prev => ({
        ...prev,
        sulekhContent: '',
        unicodeContent: '',
        englishContent: ''
      }));
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
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
        sulekhTitle: '',
        unicodeTitle: '',
        englishTitle: '',
        sulekhContent: '',
        unicodeContent: '',
        englishContent: ''
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
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}
        {isProcessing && <div className="processing-message">Converting text...</div>}

        <div className="kirtan-entry-form">
          <div className="three-column-layout">
            {/* Sulekh Column */}
            <div className="column sulekh-column">
              <div className="column-header">
                <h3>Sulekh</h3>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.sulekhTitle}
                  onChange={handleSulekhTitleChange}
                  placeholder="Enter Sulekh title (auto-generated from first line)..."
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
                  rows="20"
                  style={{ fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif" }}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Unicode Column */}
            <div className="column unicode-column">
              <div className="column-header">
                <h3>Unicode (Gujarati)</h3>
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
                  onChange={handleUnicodeContentChange}
                  onPaste={handleUnicodeContentChange}
                  placeholder="Enter or paste Unicode Gujarati kirtan..."
                  rows="20"
                  style={{ fontFamily: "'Noto Sans Gujarati', 'Shruti', sans-serif" }}
                  disabled={saving}
                />
              </div>
            </div>

            {/* Gujlish Column */}
            <div className="column english-column">
              <div className="column-header">
                <h3>Gujlish</h3>
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
                  rows="20"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Hindi Column */}
            <div className="column hindi-column">
              <div className="column-header">
                <h3>Hindi</h3>
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
                  onChange={handleHindiContentChange}
                  onPaste={handleHindiContentChange}
                  placeholder="Enter or paste Hindi kirtan..."
                  rows="20"
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
    </div>
  );
};

export default KirtanEntry;