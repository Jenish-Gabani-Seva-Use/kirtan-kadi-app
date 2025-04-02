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
  const [overlayActive, setOverlayActive] = useState(false);

  // Load saved settings on initial mount
  const [vmixSettings, setVmixSettings] = useState(() => {
    const savedSettings = localStorage.getItem('vmixSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      inputNumber: 1,
      overlayNumber: 1,
      ipAddress: '192.168.1.3', // Default to your actual IP
      port: 8088
    };
  });

  const [editorSettings, setEditorSettings] = useState(() => {
    const savedSettings = localStorage.getItem('editorSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      fontSize: '60px',
      textColor: '#000000',
      bgColor: '#f2cfa6',
      fontFamily: "'Guj_Regular_Bold_Sulekh', sans-serif",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      textAlign: 'center'
    };
  });

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Spacebar handling
      if (e.key === ' ') {
        // Only trigger if not in input field
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.isContentEditable) {
          e.preventDefault();
          e.stopPropagation();
          triggerVmixOverlay();
        }
        return;
      }

      // Arrow keys navigation
      if (allLines.length > 0 && isInputPanelFocused) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (selectedLineIndex > 0) {
            selectLine(selectedLineIndex - 1);
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          const newIndex = selectedLineIndex >= allLines.length - 1 ? 0 : selectedLineIndex + 1;
          selectLine(newIndex);
        }
      }

      // Number keys selection
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
  }, [allLines, selectedLines, selectedLineIndex, isInputPanelFocused]);

  const processText = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    setAllLines(lines);
    if (lines.length > 0) {
      setSelectedLineIndex(0);
      setCurrentDisplayedText(lines[0]);
    }
  };

  const selectLine = useCallback((index) => {
    setSelectedLineIndex(index);
    setCurrentDisplayedText(allLines[index]);
    scrollToLine(index);
  }, [allLines]);

  const triggerVmixOverlay = useCallback(async () => {
    if (!vmixSettings.ipAddress || vmixSettings.ipAddress === '127.0.0.1') {
      console.error('vMix IP not configured');
      return;
    }
  
    try {
      const { ipAddress, port, inputNumber, overlayNumber } = vmixSettings;
      const functionName = overlayActive ? 'Out' : 'In';
      
      const response = await fetch(
        `http://${ipAddress}:${port}/api/?Function=OverlayInput${overlayNumber}${functionName}&Input=${inputNumber}`
      );
      
      if (!response.ok) throw new Error(`Failed to toggle overlay ${functionName}`);
      
      setOverlayActive(!overlayActive);
    } catch (error) {
      console.error('Overlay error:', error);
      setOverlayActive(false);
    }
  }, [vmixSettings, overlayActive]);

  // Rest of your existing functions (addToSelectedLines, removeSelectedLine, etc.)
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

  const updateEditorSettings = (newSettings) => {
    const updatedSettings = { ...editorSettings, ...newSettings };
    setEditorSettings(updatedSettings);
    localStorage.setItem('editorSettings', JSON.stringify(updatedSettings));
  };

  const saveVmixSettings = (settings) => {
    const validatedSettings = {
      ...settings,
      inputNumber: parseInt(settings.inputNumber) || 1,
      overlayNumber: Math.min(4, Math.max(1, parseInt(settings.overlayNumber) || 1)),
      port: parseInt(settings.port) || 8088
    };
    setVmixSettings(validatedSettings);
    localStorage.setItem('vmixSettings', JSON.stringify(validatedSettings));
    setVmixModalOpen(false);
  };

  // Rest of your existing functions (toggleDeleteMode, etc.)
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
          setIsInputPanelFocused={setIsInputPanelFocused}
        />

        <SelectedLinesPanel
          selectedLines={selectedLines}
          onRemoveLine={removeSelectedLine}
          onDisplayLine={setCurrentDisplayedText}
          currentDisplayedText={currentDisplayedText}
        />
      </div>

      <OutputArea
        content={currentDisplayedText}
        onContentChange={setCurrentDisplayedText}
        editorSettings={editorSettings}
        overlayActive={overlayActive}
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
      : `.line-item:nth-child(${index + 2})`;
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