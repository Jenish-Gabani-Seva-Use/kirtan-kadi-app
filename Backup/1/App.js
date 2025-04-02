import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import LinesPanel from './components/LinesPanel';
import SelectedLinesPanel from './components/SelectedLinesPanel';
import OutputArea from './components/OutputArea';
import InputModal from './components/InputModal';
import SettingsModal from './components/SettingModal';
import VmixModal from './components/VmixModal';
import './styles/App.css';

function App() {
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [vmixModalOpen, setVmixModalOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [allLines, setAllLines] = useState([]);
  const [selectedLines, setSelectedLines] = useState([]);
  const [currentDisplayedText, setCurrentDisplayedText] = useState('Final output will appear here. You can edit this text directly.');
  const [selectedLineIndex, setSelectedLineIndex] = useState(-1);
  const [isInputPanelFocused, setIsInputPanelFocused] = useState(true);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [linesToDelete, setLinesToDelete] = useState([]);
  const [vmixSettings, setVmixSettings] = useState({
    inputNumber: 1,
    overlayNumber: 1,
    ipAddress: '127.0.0.1',
    port: 8088
  });

  const [editorSettings, setEditorSettings] = useState({
    fontSize: '60px', // Changed to 60px
    textColor: '#000000',
    bgColor: '#f2cfa6', // New default color
    fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif",
    isBold: false,
    isItalic: false,
    isUnderline: false,
    textAlign: 'center'
  });



  const processText = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    setAllLines(lines);
    if (lines.length > 0) {
      setSelectedLineIndex(0);
      setCurrentDisplayedText(lines[0]);
    }
  };

  // Move selectLine before effects that use it
  const selectLine = useCallback((index) => {
    setSelectedLineIndex(index);
    setCurrentDisplayedText(allLines[index]);
    scrollToLine(index);
  }, [allLines]);

  // Load VMix settings from localStorage on initial render
  useEffect(() => {
    const savedSettings = localStorage.getItem('editorSettings');
    if (savedSettings) {
      setEditorSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Keyboard navigation effect
  // Update the keyboard navigation useEffect in App.js
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Arrow key navigation (up/down)
      if (allLines.length > 0 && isInputPanelFocused) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          // Modified to NOT wrap around when at first line
          if (selectedLineIndex > 0) {
            const newIndex = selectedLineIndex - 1;
            selectLine(newIndex);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          // Keep the wrap-around behavior for down arrow (optional)
          const newIndex = selectedLineIndex >= allLines.length - 1 ? 0 : selectedLineIndex + 1;
          selectLine(newIndex);
        }
      }

      // Number keys 1-9 for shortcut selection (unchanged)
      if (e.key >= '1' && e.key <= '9' && selectedLines.length > 0) {
        e.preventDefault();
        const num = parseInt(e.key);
        if (num <= selectedLines.length) {
          setCurrentDisplayedText(selectedLines[num - 1]);
          scrollToLine(num - 1, true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [allLines, selectedLines, selectedLineIndex, isInputPanelFocused, selectLine]);



  const addToSelectedLines = (line) => {
    if (!selectedLines.includes(line)) {
      setSelectedLines([...selectedLines, line]);
    }
    setIsInputPanelFocused(false);
  };

  const removeSelectedLine = (index) => {
    const newSelectedLines = [...selectedLines];
    newSelectedLines.splice(index, 1);
    setSelectedLines(newSelectedLines);
    if (newSelectedLines.length === 0 && allLines.length > 0) {
      setIsInputPanelFocused(true);
    }
  };

  // Update the save function
  const updateEditorSettings = (newSettings) => {
    const updatedSettings = { ...editorSettings, ...newSettings };
    setEditorSettings(updatedSettings);
    localStorage.setItem('editorSettings', JSON.stringify(updatedSettings));
  };

  const saveVmixSettings = (settings) => {
    setVmixSettings(settings);
    localStorage.setItem('vmixSettings', JSON.stringify(settings));
    setVmixModalOpen(false);
  };

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    if (!isDeleteMode) {
      setLinesToDelete([]);
    }
  };

  const toggleLineForDeletion = (index) => {
    if (linesToDelete.includes(index)) {
      setLinesToDelete(linesToDelete.filter(i => i !== index));
    } else {
      setLinesToDelete([...linesToDelete, index]);
    }
  };

  const deleteSelectedLines = () => {
    const newAllLines = allLines.filter((_, index) => !linesToDelete.includes(index));
    setAllLines(newAllLines);
    setIsDeleteMode(false);
    setLinesToDelete([]);
    if (newAllLines.length > 0) {
      setSelectedLineIndex(0);
      setCurrentDisplayedText(newAllLines[0]);
    } else {
      setSelectedLineIndex(-1);
      setCurrentDisplayedText('');
    }
  };

  const triggerVmixOverlay = async () => {
    // Implementation will be added later
    console.log('Triggering VMix overlay');
  };

  return (
    <div className="app">
      <Header
        onOpenInputModal={() => setInputModalOpen(true)}
        onOpenSettingsModal={() => setSettingsModalOpen(true)}
        onOpenVmixModal={() => setVmixModalOpen(true)}
      />

      <div className="main-container">
        <LinesPanel
          allLines={allLines}
          selectedLineIndex={selectedLineIndex}
          isDeleteMode={isDeleteMode}
          linesToDelete={linesToDelete}
          onSelectLine={selectLine}
          onAddToSelectedLines={addToSelectedLines}
          onToggleDeleteMode={toggleDeleteMode}
          onToggleLineForDeletion={toggleLineForDeletion}
          onDeleteSelectedLines={deleteSelectedLines}
          setIsInputPanelFocused={setIsInputPanelFocused} // Make sure this is passed
        />

        <SelectedLinesPanel
          selectedLines={selectedLines}
          onRemoveLine={removeSelectedLine}
          onDisplayLine={setCurrentDisplayedText}
          currentDisplayedText={currentDisplayedText} // Add this line
        />
      </div>

      <OutputArea
        content={currentDisplayedText}
        onContentChange={setCurrentDisplayedText}
        editorSettings={editorSettings}
      />

      <InputModal
        isOpen={inputModalOpen}
        onClose={() => setInputModalOpen(false)}
        onProcessText={processText}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        editorSettings={editorSettings}
        onUpdateEditorSettings={updateEditorSettings}
      />

      <VmixModal
        isOpen={vmixModalOpen}
        onClose={() => setVmixModalOpen(false)}
        onSave={saveVmixSettings}
        settings={vmixSettings}
      />
    </div>
  );
}

const scrollToLine = (index, isShortcutKadi = false) => {
  setTimeout(() => {
    const selector = isShortcutKadi 
      ? `.selected-line:nth-child(${index + 1})` 
      : `.line-item:nth-child(${index + 2})`; // +2 for header
    
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, 50);
};

export default App;