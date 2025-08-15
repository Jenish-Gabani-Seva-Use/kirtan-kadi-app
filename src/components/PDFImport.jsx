import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { enhancedSulekhToUnicode, enhancedSulekhToGujlish, extractFirstLine } from '../utils/enhancedConverter';
import kirtanDB from '../utils/database';
import '../styles/PDFImport.css';

const PDFImport = ({ isOpen, onClose }) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState('');
  const [extractedKirtans, setExtractedKirtans] = useState([]);
  const [selectedKirtans, setSelectedKirtans] = useState([]);
  const [importStatus, setImportStatus] = useState('');

  // Pattern to identify kirtan titles (numbers followed by text)
  const kirtanTitlePattern = /^[૦-૯0-9]+[\s\.\-\)]*(.+)$/;
  const englishNumberPattern = /^[0-9]+[\s\.\-\)]*(.+)$/;
  
  // Function to extract kirtans from text
  const extractKirtansFromText = (text) => {
    const lines = text.split('\n');
    const kirtans = [];
    let currentKirtan = null;
    let kirtanNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        if (currentKirtan && currentKirtan.content.trim()) {
          currentKirtan.content += '\n';
        }
        continue;
      }

      // Check if this line is a kirtan title (starts with number)
      const isTitle = englishNumberPattern.test(line) || kirtanTitlePattern.test(line);
      
      if (isTitle) {
        // Save previous kirtan if exists
        if (currentKirtan && currentKirtan.content.trim()) {
          kirtans.push(currentKirtan);
        }
        
        // Start new kirtan
        kirtanNumber++;
        const titleMatch = line.match(englishNumberPattern) || line.match(kirtanTitlePattern);
        const title = titleMatch ? titleMatch[1].trim() : line;
        
        currentKirtan = {
          id: `kirtan_${kirtanNumber}`,
          number: kirtanNumber,
          sulekhTitle: title,
          unicodeTitle: enhancedSulekhToUnicode(title),
          gujlishTitle: enhancedSulekhToGujlish(title),
          content: '',
          selected: true
        };
      } else if (currentKirtan) {
        // Add line to current kirtan content
        currentKirtan.content += line + '\n';
      }
    }
    
    // Save last kirtan
    if (currentKirtan && currentKirtan.content.trim()) {
      kirtans.push(currentKirtan);
    }
    
    // Process content for each kirtan
    return kirtans.map(kirtan => ({
      ...kirtan,
      sulekhContent: kirtan.content.trim(),
      unicodeContent: enhancedSulekhToUnicode(kirtan.content.trim()),
      gujlishContent: enhancedSulekhToGujlish(kirtan.content.trim())
    }));
  };

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setProcessing(true);
    setProgress('Reading PDF file...');
    setExtractedKirtans([]);
    setImportStatus('');

    try {
      // Read file as text (for now, we'll handle PDF text extraction on backend)
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const text = e.target.result;
        setProgress('Extracting kirtans from text...');
        
        // Extract kirtans from the text
        const kirtans = extractKirtansFromText(text);
        
        if (kirtans.length === 0) {
          setProgress('No kirtans found in the file.');
        } else {
          setProgress(`Found ${kirtans.length} kirtans. Review and select which ones to import.`);
          setExtractedKirtans(kirtans);
          setSelectedKirtans(kirtans.map(k => k.id));
        }
        
        setProcessing(false);
      };

      reader.onerror = () => {
        setProgress('Error reading file.');
        setProcessing(false);
      };

      // For PDF files, we need special handling
      if (file.type === 'application/pdf') {
        setProgress('PDF files need to be converted to text first. Please copy the text from PDF and save as .txt or .csv file.');
        setProcessing(false);
      } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        reader.onload = async (e) => {
          const csvText = e.target.result;
          setProgress('Extracting kirtans from CSV...');
          const kirtans = parseCSV(csvText);
          if (kirtans.length === 0) {
            setProgress('No kirtans found in the CSV file.');
            setProcessing(false);
            return;
          }
          
          setProgress('Checking for duplicates...');
          const kirtansWithDuplicateCheck = await checkForDuplicates(kirtans);
          const duplicateCount = kirtansWithDuplicateCheck.filter(k => k.isDuplicate).length;
          
          if (duplicateCount > 0) {
            setProgress(`Found ${kirtans.length} kirtans in CSV (${duplicateCount} duplicates detected). Review and select which ones to import.`);
          } else {
            setProgress(`Found ${kirtans.length} kirtans in CSV. Review and select which ones to import.`);
          }
          
          setExtractedKirtans(kirtansWithDuplicateCheck);
          setSelectedKirtans(kirtansWithDuplicateCheck.filter(k => k.selected).map(k => k.id));
          setProcessing(false);
        };
        reader.onerror = () => {
          setProgress('Error reading CSV file.');
          setProcessing(false);
        };
        reader.readAsText(file, 'UTF-8');
      } else {
        // Read as text for .txt files
        reader.readAsText(file, 'UTF-8');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setProgress('Error processing file: ' + error.message);
      setProcessing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv']
    },
    multiple: false
  });

  // Toggle kirtan selection
  const toggleKirtanSelection = (kirtanId) => {
    setSelectedKirtans(prev => {
      if (prev.includes(kirtanId)) {
        return prev.filter(id => id !== kirtanId);
      } else {
        return [...prev, kirtanId];
      }
    });
  };

  // Select/Deselect all
  const toggleSelectAll = () => {
    if (selectedKirtans.length === extractedKirtans.length) {
      setSelectedKirtans([]);
    } else {
      setSelectedKirtans(extractedKirtans.map(k => k.id));
    }
  };

  // CSV parsing helper with better field mapping
  const parseCSV = (csvText) => {
    console.log('Raw CSV text:', csvText.substring(0, 500)); // Debug log
    
    // Split lines, handle quoted fields, trim whitespace
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];
    
    // Detect delimiter - check for tabs first, then commas
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) {
      delimiter = '\t';
    } else if (firstLine.split(',').length < firstLine.split(' ').length && firstLine.split(' ').length > 10) {
      // If there are very few commas but many spaces, it might be space-delimited
      delimiter = ' ';
    }
    
    console.log('Detected delimiter:', delimiter === '\t' ? 'TAB' : delimiter === ' ' ? 'SPACE' : 'COMMA');
    
    // Parse CSV with proper handling of quoted fields and different delimiters
    const parseCSVLine = (line) => {
      if (delimiter === ' ') {
        // For space-delimited, we need to be more careful about splitting
        // Split by multiple spaces to handle the format better
        return line.split(/\s{2,}/).map(item => item.trim()).filter(item => item.length > 0);
      }
      
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headerRow = parseCSVLine(lines[0]);
    const headers = headerRow.map(h => h.replace(/"/g, '').trim());
    console.log('Parsed headers:', headers);
    
    const kirtans = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      console.log(`Processing line ${i}:`, line.substring(0, 200));
      
      // For your specific format, let's try a different approach
      // Based on your example, it seems like the data is structured as:
      // PDF Name, then Sulekh content, then Unicode, then Hindi, then English, then numbers
      
      // Try to parse based on the pattern in your data
      let obj = {};
      
      if (delimiter === ' ' || delimiter === '\t') {
        // Special handling for your format
        // Split the line and try to identify the sections
        const parts = line.split(/\s+/);
        
        // Look for patterns to identify different sections
        let pdfNameEnd = -1;
        let sulekhStart = -1, sulekhEnd = -1;
        let unicodeStart = -1, unicodeEnd = -1;
        let hindiStart = -1, hindiEnd = -1;
        let englishStart = -1, englishEnd = -1;
        
        // Find the first part that looks like Sulekh text (contains special characters)
        for (let j = 0; j < parts.length; j++) {
          if (parts[j].match(/[ÖèÈâïêÄäÓëÑrÚÌïÊ»ÕëÇÔâÐÔëÕâÒâÓëñáïÈÓêÍjÒíáãÈ×ëáâÌïÊ]/)) {
            if (sulekhStart === -1) sulekhStart = j;
            sulekhEnd = j;
          }
        }
        
        // Find Unicode section (Gujarati Unicode characters)
        for (let j = sulekhEnd + 1; j < parts.length; j++) {
          if (parts[j].match(/[સૂતાંઊઠીરેસમરુંસહજાનંદકેવેણલાંભલેવાયાંઅંતરઊપજ્યોઅતિશેઆનંદ]/)) {
            if (unicodeStart === -1) unicodeStart = j;
            unicodeEnd = j;
          }
        }
        
        // Find Hindi section
        for (let j = unicodeEnd + 1; j < parts.length; j++) {
          if (parts[j].match(/[सूतांऊठीरेसमरुंसहजानंदकेवेणलांभलेवायांअंतरऊपज्योअतिशेआनंद]/)) {
            if (hindiStart === -1) hindiStart = j;
            hindiEnd = j;
          }
        }
        
        // Find English section
        for (let j = hindiEnd + 1; j < parts.length; j++) {
          if (parts[j].match(/[a-zA-Z]/)) {
            if (englishStart === -1) englishStart = j;
            englishEnd = j;
          }
        }
        
        // Extract the sections
        if (sulekhStart > 0) {
          obj['PDF Name'] = parts.slice(0, sulekhStart).join(' ');
        }
        if (sulekhStart !== -1 && sulekhEnd !== -1) {
          obj['Kirtan Text (Sulekh)'] = parts.slice(sulekhStart, sulekhEnd + 1).join(' ');
        }
        if (unicodeStart !== -1 && unicodeEnd !== -1) {
          obj['Gujarati Unicode'] = parts.slice(unicodeStart, unicodeEnd + 1).join(' ');
        }
        if (hindiStart !== -1 && hindiEnd !== -1) {
          obj['Hindi Unicode'] = parts.slice(hindiStart, hindiEnd + 1).join(' ');
        }
        if (englishStart !== -1 && englishEnd !== -1) {
          obj['English'] = parts.slice(englishStart, englishEnd + 1).join(' ');
        }
        
        // Look for numbers at the end for pages
        const numberParts = parts.slice(englishEnd + 1).filter(p => p.match(/^\d+$/));
        if (numberParts.length >= 1) obj['PDF Page'] = numberParts[0];
        if (numberParts.length >= 2) obj['Book Page'] = numberParts[1];
        
      } else {
        // Regular CSV parsing
        const row = parseCSVLine(line);
        headers.forEach((h, idx) => {
          const value = row[idx] ? row[idx].replace(/"/g, '').trim() : '';
          obj[h] = value;
        });
      }
      
      console.log('Parsed object:', obj);
      
      // Flexible field mapping - check for various possible column names
      const getFieldValue = (possibleNames) => {
        for (const name of possibleNames) {
          if (obj[name]) return obj[name];
        }
        return '';
      };

      const sulekhTitle = getFieldValue(['PDF Name', 'Title', 'Kirtan Name', 'Name', 'Kirtan Title']);
      const sulekhContent = getFieldValue(['Kirtan Text (Sulekh)', 'Kirtan Text', 'Content', 'Text', 'Sulekh', 'Kirtan Content']);
      
      // Get pre-converted content from CSV if available
      const unicodeContent = getFieldValue(['Gujarati Unicode', 'Unicode Content', 'Unicode (Gujarati)', 'Unicode']);
      const hindiContent = getFieldValue(['Hindi Unicode', 'Hindi Content', 'Hindi']);
      const englishContent = getFieldValue(['English', 'English Content', 'Gujlish']);
      
      console.log('Extracted values:', {
        sulekhTitle,
        sulekhContent: sulekhContent?.substring(0, 50),
        unicodeContent: unicodeContent?.substring(0, 50),
        hindiContent: hindiContent?.substring(0, 50),
        englishContent: englishContent?.substring(0, 50)
      });
      
      // Extract first letter from title for enhanced compatibility
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
          
          for (const pattern of compoundPatterns) {
            if (pattern.test(firstTwo)) {
              return firstTwo;
            }
          }
        }
        
        return trimmed[0];
      };
      
      // Build kirtan object with all enhanced fields
      kirtans.push({
        id: `csv_kirtan_${i}`,
        number: i,
        // Enhanced fields
        pdfPageNo: getFieldValue(['PDF Page', 'Book Page', 'PDF Page No', 'Book Page No', 'Page No', 'Page']),
        pdfIndexNo: getFieldValue(['Book Page', 'PDF Index No', 'Book Index No', 'Index No', 'Index']),
        pdfName: getFieldValue(['PDF Name', 'Book Name', 'Book', 'Source']),
        firstLetterSulekh: extractFirstLetter(sulekhTitle),
        raagName: getFieldValue(['Raag', 'Raag Name', 'Raga']),
        dhaal: getFieldValue(['Dhaal', 'Taal', 'Rhythm']),
        padNo: getFieldValue(['Pad', 'Pad No', 'Verse No', 'Verse']),
        rachiyata: getFieldValue(['Rachiyata', 'Author', 'Poet', 'Writer']),
        // Title fields
        sulekhTitle: sulekhTitle,
        unicodeTitle: unicodeContent ? enhancedSulekhToUnicode(sulekhTitle) : enhancedSulekhToUnicode(sulekhTitle),
        englishTitle: englishContent || enhancedSulekhToGujlish(sulekhTitle),
        hindiTitle: hindiContent || '', // Use provided Hindi or leave empty
        // Content fields - use provided content if available, otherwise convert
        sulekhContent: sulekhContent,
        unicodeContent: unicodeContent || enhancedSulekhToUnicode(sulekhContent),
        englishContent: englishContent || enhancedSulekhToGujlish(sulekhContent),
        hindiContent: hindiContent || '', // Use provided Hindi content
        // Legacy fields for backward compatibility
        pdfPage: getFieldValue(['PDF Page', 'Book Page', 'PDF Page No', 'Book Page No', 'Page No', 'Page']),
        bookPage: getFieldValue(['Book Page', 'PDF Page', 'PDF Page No', 'Book Page No', 'Page No', 'Page']),
        raag: getFieldValue(['Raag', 'Raag Name', 'Raga']),
        pad: getFieldValue(['Pad', 'Pad No', 'Verse No', 'Verse']),
        // Import metadata
        selected: true,
        isDuplicate: false,
        duplicateReason: ''
      });
    }
    return kirtans;
  };

  // Check for duplicates based on first line of sulekh content
  const checkForDuplicates = async (kirtans) => {
    const existingKirtans = await kirtanDB.getAllKirtans();
    
    return kirtans.map(kirtan => {
      const firstLine = extractFirstLine(kirtan.sulekhContent);
      if (!firstLine) return kirtan;
      
      // Check if first line matches any existing kirtan's first line
      const duplicate = existingKirtans.find(existing => {
        const existingFirstLine = extractFirstLine(existing.sulekhContent);
        return existingFirstLine && 
               existingFirstLine.toLowerCase().trim() === firstLine.toLowerCase().trim();
      });
      
      if (duplicate) {
        return {
          ...kirtan,
          isDuplicate: true,
          duplicateReason: `First line matches existing kirtan: "${duplicate.sulekhTitle || 'Untitled'}"`,
          selected: false // Don't select duplicates by default
        };
      }
      
      return kirtan;
    });
  };

  // Import selected kirtans to database
  const importSelectedKirtans = async () => {
    if (selectedKirtans.length === 0) {
      setImportStatus('Please select at least one kirtan to import.');
      return;
    }

    setProcessing(true);
    setImportStatus('Importing kirtans...');

    let successCount = 0;
    let errorCount = 0;

    for (const kirtan of extractedKirtans) {
      if (!selectedKirtans.includes(kirtan.id)) continue;

      try {
        await kirtanDB.addKirtan({
          // Enhanced fields
          pdfPageNo: kirtan.pdfPageNo,
          pdfIndexNo: kirtan.pdfIndexNo,
          pdfName: kirtan.pdfName,
          firstLetterSulekh: kirtan.firstLetterSulekh,
          raagName: kirtan.raagName,
          dhaal: kirtan.dhaal,
          padNo: kirtan.padNo,
          rachiyata: kirtan.rachiyata,
          // Title fields
          sulekhTitle: kirtan.sulekhTitle,
          unicodeTitle: kirtan.unicodeTitle,
          englishTitle: kirtan.englishTitle,
          hindiTitle: kirtan.hindiTitle,
          // Content fields
          sulekhContent: kirtan.sulekhContent,
          unicodeContent: kirtan.unicodeContent,
          englishContent: kirtan.englishContent,
          hindiContent: kirtan.hindiContent,
          // Legacy fields for backward compatibility
          pdfPage: kirtan.pdfPage,
          bookPage: kirtan.bookPage,
          raag: kirtan.raag,
          pad: kirtan.pad
        });
        successCount++;
      } catch (error) {
        console.error(`Error importing kirtan ${kirtan.number}:`, error);
        errorCount++;
      }
    }

    setProcessing(false);
    setImportStatus(`Import complete! Successfully imported ${successCount} kirtans${errorCount > 0 ? `, ${errorCount} failed` : ''}.`);
    
    // Clear after successful import
    setTimeout(() => {
      setExtractedKirtans([]);
      setSelectedKirtans([]);
      if (successCount > 0) {
        onClose(true); // Refresh the main list
      }
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="pdf-import-modal">
      <div className="pdf-import-content">
        <div className="pdf-import-header">
          <h2>Import Kirtans from File</h2>
          <button className="close-btn" onClick={() => onClose(false)}>×</button>
        </div>

        {!extractedKirtans.length ? (
          <div className="upload-section">
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
              <input {...getInputProps()} />
              {isDragActive ? (
                <p>Drop the CSV file here...</p>
              ) : (
                <div className="dropzone-content">
                  <div className="upload-icon">📄</div>
                  <p>Drag and drop a CSV file here, or click to select</p>
                  <p className="file-types">Supported: .csv files only</p>
                  <p className="note">Note: The CSV must have the correct header columns.</p>
                </div>
              )}
            </div>

            {progress && (
              <div className={`progress-message ${processing ? 'processing' : ''}`}>
                {processing && <span className="spinner">⏳</span>}
                {progress}
              </div>
            )}

            <div className="instructions">
              <h3>CSV Format Required:</h3>
              <ol>
                <li>First row must contain headers for the fields you want to import</li>
                <li>Each subsequent row is a kirtan entry</li>
                <li>Kirtan Text/Content is the Sulekh content (will be auto-converted to Unicode and Gujlish)</li>
                <li>All fields are optional except Title and Content</li>
              </ol>
              
              <div className="supported-fields">
                <h4>Supported Field Names (flexible matching):</h4>
                <ul>
                  <li><strong>Title:</strong> "PDF Name", "Title", "Kirtan Name", "Name", "Kirtan Title"</li>
                  <li><strong>Content:</strong> "Kirtan Text", "Content", "Text", "Sulekh", "Kirtan Content"</li>
                  <li><strong>Book:</strong> "Book Name", "PDF Name", "Book", "Source"</li>
                  <li><strong>Page:</strong> "PDF Page No", "Book Page No", "Page No", "PDF Page", "Page"</li>
                  <li><strong>Index:</strong> "PDF Index No", "Book Index No", "Index No", "Index"</li>
                  <li><strong>Raag:</strong> "Raag Name", "Raag", "Raga"</li>
                  <li><strong>Dhaal:</strong> "Dhaal", "Taal", "Rhythm"</li>
                  <li><strong>Pad:</strong> "Pad No", "Pad", "Verse No", "Verse"</li>
                  <li><strong>Author:</strong> "Rachiyata", "Author", "Poet", "Writer"</li>
                </ul>
              </div>
              <div className="example">
                <h4>Example CSV:</h4>
                <pre>{`PDF Name,Kirtan Text,PDF Page,Book Page,Raag,Dhaal,Pad
Kirtan Dipawali,"’½í   ãÌÁ   ‘ÕÌ   ÏíÔë,   Íï¼äÅâï   ÕâÇäñ ÈÑâÓä   ÖjÒâÑâï,   ÑâÓä   ÖâÅä   ¿ïÍâÇä...’½í",0,1,,,,
Ôí»ÅâÌä,"ÔâÁ   ÑâÓë,   SÒâÑÛâ   ÕâÔâñ ÈÑë   Èí   ãÌð×ï»   ÍíÆ¥â,   ÌïÊÌâ   ÔâÔâ...’½í",0,2,,,,`}</pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="review-section">
            <div className="review-header">
              <h3>Review Extracted Kirtans</h3>
              <div className="selection-controls">
                <button onClick={toggleSelectAll} className="btn btn-secondary">
                  {selectedKirtans.length === extractedKirtans.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="selection-count">
                  {selectedKirtans.length} of {extractedKirtans.length} selected
                </span>
              </div>
            </div>

            <div className="kirtans-list">
              {extractedKirtans.map((kirtan) => (
                <div key={kirtan.id} className={`kirtan-preview ${selectedKirtans.includes(kirtan.id) ? 'selected' : ''} ${kirtan.isDuplicate ? 'duplicate' : ''}`}>
                  <div className="kirtan-header">
                    <input
                      type="checkbox"
                      checked={selectedKirtans.includes(kirtan.id)}
                      onChange={() => toggleKirtanSelection(kirtan.id)}
                      disabled={kirtan.isDuplicate}
                    />
                    <span className="kirtan-number">#{kirtan.number}</span>
                    {kirtan.isDuplicate && (
                      <span className="duplicate-badge">DUPLICATE</span>
                    )}
                    <div className="kirtan-titles">
                      <div className="title-row">
                        <span className="label">Sulekh:</span>
                        <span className="title sulekh">{kirtan.sulekhTitle}</span>
                      </div>
                      <div className="title-row">
                        <span className="label">Unicode:</span>
                        <span className="title unicode">{kirtan.unicodeTitle}</span>
                      </div>
                      <div className="title-row">
                        <span className="label">Gujlish:</span>
                        <span className="title gujlish">{kirtan.gujlishTitle}</span>
                      </div>
                    </div>
                  </div>
                  
                  {kirtan.isDuplicate && (
                    <div className="duplicate-warning">
                      <span className="warning-icon">⚠️</span>
                      <span className="warning-text">{kirtan.duplicateReason}</span>
                    </div>
                  )}
                  
                  <div className="kirtan-metadata">
                    {kirtan.pdfName && (
                      <div className="metadata-item">
                        <span className="label">Book:</span>
                        <span className="value">{kirtan.pdfName}</span>
                      </div>
                    )}
                    {kirtan.firstLetterSulekh && (
                      <div className="metadata-item">
                        <span className="label">First Letter:</span>
                        <span className="value sulekh-font">{kirtan.firstLetterSulekh}</span>
                      </div>
                    )}
                    {kirtan.raagName && (
                      <div className="metadata-item">
                        <span className="label">Raag:</span>
                        <span className="value">{kirtan.raagName}</span>
                      </div>
                    )}
                    {kirtan.dhaal && (
                      <div className="metadata-item">
                        <span className="label">Dhaal:</span>
                        <span className="value">{kirtan.dhaal}</span>
                      </div>
                    )}
                    {kirtan.padNo && (
                      <div className="metadata-item">
                        <span className="label">Pad No:</span>
                        <span className="value">{kirtan.padNo}</span>
                      </div>
                    )}
                    {kirtan.rachiyata && (
                      <div className="metadata-item">
                        <span className="label">Rachiyata:</span>
                        <span className="value">{kirtan.rachiyata}</span>
                      </div>
                    )}
                    {kirtan.pdfPageNo && (
                      <div className="metadata-item">
                        <span className="label">Page No:</span>
                        <span className="value">{kirtan.pdfPageNo}</span>
                      </div>
                    )}
                    {kirtan.pdfIndexNo && (
                      <div className="metadata-item">
                        <span className="label">Index No:</span>
                        <span className="value">{kirtan.pdfIndexNo}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="kirtan-content-preview">
                    <div className="content-column">
                      <h5>Sulekh Content:</h5>
                      <pre className="sulekh">{kirtan.sulekhContent ? kirtan.sulekhContent.substring(0, 150) + '...' : 'No content'}</pre>
                    </div>
                    <div className="content-column">
                      <h5>Unicode Content:</h5>
                      <pre className="unicode">{kirtan.unicodeContent ? kirtan.unicodeContent.substring(0, 150) + '...' : 'No content'}</pre>
                    </div>
                    {kirtan.hindiContent && (
                      <div className="content-column">
                        <h5>Hindi Content:</h5>
                        <pre className="hindi">{kirtan.hindiContent.substring(0, 150)}...</pre>
                      </div>
                    )}
                    {kirtan.englishContent && (
                      <div className="content-column">
                        <h5>English Content:</h5>
                        <pre className="english">{kirtan.englishContent.substring(0, 150)}...</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {importStatus && (
              <div className={`import-status ${importStatus.includes('complete') ? 'success' : ''}`}>
                {importStatus}
              </div>
            )}

            <div className="import-actions">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setExtractedKirtans([]);
                  setSelectedKirtans([]);
                  setImportStatus('');
                }}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={importSelectedKirtans}
                disabled={processing || selectedKirtans.length === 0}
              >
                {processing ? 'Importing...' : `Import ${selectedKirtans.length} Kirtans`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PDFImport;