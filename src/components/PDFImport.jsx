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
        reader.onload = (e) => {
          const csvText = e.target.result;
          setProgress('Extracting kirtans from CSV...');
          const kirtans = parseCSV(csvText);
          if (kirtans.length === 0) {
            setProgress('No kirtans found in the CSV file.');
          } else {
            setProgress(`Found ${kirtans.length} kirtans in CSV. Review and select which ones to import.`);
            setExtractedKirtans(kirtans);
            setSelectedKirtans(kirtans.map(k => k.id));
          }
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

  // CSV parsing helper
  const parseCSV = (csvText) => {
    // Split lines, handle quoted fields, trim whitespace
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    const kirtans = [];
    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      if (row.length < 2) continue;
      // Map columns by header name
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = row[idx] ? row[idx].trim() : '';
      });
      // Build kirtan object
      kirtans.push({
        id: `csv_kirtan_${i}`,
        number: i,
        sulekhTitle: obj['PDF Name'] || '',
        unicodeTitle: enhancedSulekhToUnicode(obj['PDF Name'] || ''),
        gujlishTitle: enhancedSulekhToGujlish(obj['PDF Name'] || ''),
        sulekhContent: obj['Kirtan Text'] || '',
        unicodeContent: enhancedSulekhToUnicode(obj['Kirtan Text'] || ''),
        gujlishContent: enhancedSulekhToGujlish(obj['Kirtan Text'] || ''),
        pdfPage: obj['PDF Page'] || '',
        bookPage: obj['Book Page'] || '',
        raag: obj['Raag'] || '',
        dhaal: obj['Dhaal'] || '',
        pad: obj['Pad'] || '',
        selected: true
      });
    }
    return kirtans;
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
          sulekhTitle: kirtan.sulekhTitle,
          unicodeTitle: kirtan.unicodeTitle,
          englishTitle: kirtan.gujlishTitle,
          sulekhContent: kirtan.sulekhContent,
          unicodeContent: kirtan.unicodeContent,
          englishContent: kirtan.gujlishContent,
          pdfPage: kirtan.pdfPage,
          bookPage: kirtan.bookPage,
          raag: kirtan.raag,
          dhaal: kirtan.dhaal,
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
                <li>First row must be the header: PDF Name, Kirtan Text, PDF Page, Book Page, Raag, Dhaal, Pad</li>
                <li>Each row is a kirtan entry</li>
                <li>Kirtan Text is the Sulekh content (will be auto-converted)</li>
                <li>Other columns are optional but recommended</li>
              </ol>
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
                <div key={kirtan.id} className={`kirtan-preview ${selectedKirtans.includes(kirtan.id) ? 'selected' : ''}`}>
                  <div className="kirtan-header">
                    <input
                      type="checkbox"
                      checked={selectedKirtans.includes(kirtan.id)}
                      onChange={() => toggleKirtanSelection(kirtan.id)}
                    />
                    <span className="kirtan-number">#{kirtan.number}</span>
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
                  <div className="kirtan-content-preview">
                    <div className="content-column">
                      <h5>Sulekh Content:</h5>
                      <pre className="sulekh">{kirtan.sulekhContent.substring(0, 150)}...</pre>
                    </div>
                    <div className="content-column">
                      <h5>Unicode Content:</h5>
                      <pre className="unicode">{kirtan.unicodeContent.substring(0, 150)}...</pre>
                    </div>
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