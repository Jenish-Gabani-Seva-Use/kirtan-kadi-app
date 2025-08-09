import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import LinesPanel from './components/LinesPanel';
import SelectedLinesPanel from './components/SelectedLinesPanel';
import OutputArea from './components/OutputArea';
import InputModal from './components/InputModal';
import Login from './components/Login';
import SettingsModal from './components/SettingModal';
import VmixModal from './components/VmixModal';
import './styles/App.css';
import {
  Routes,
  Route,
  Navigate,
  useNavigate  // Fix the typo here (was Navigate)
} from 'react-router-dom';

function MainApp({ onLogout }) {
  // Tab management state
  const [tabs, setTabs] = useState([
    { id: 1, name: 'Tab 1', active: true, data: {
      allLines: [],
      selectedLines: [],
      currentDisplayedText: 'ÁÒ Ùä sÕâãÑÌâÓâÒÇ',
      selectedLineIndex: -1,
      originalInputText: '' // Store the original input text
    }}
  ]);
  const [activeTabId, setActiveTabId] = useState(1);
  const [nextTabId, setNextTabId] = useState(2);

  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [vmixModalOpen, setVmixModalOpen] = useState(false);
  const [isInputPanelFocused, setIsInputPanelFocused] = useState(true);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [linesToDelete, setLinesToDelete] = useState([]);
  const [overlayActive, setOverlayActive] = useState(false);

  // Get current tab data
  const currentTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  const { allLines, selectedLines, currentDisplayedText, selectedLineIndex, originalInputText } = currentTab.data;

// Load saved settings on initial mount
const [vmixSettings, setVmixSettings] = useState(() => {
  const savedSettings = localStorage.getItem('vmixSettings');
  return savedSettings ? JSON.parse(savedSettings) : {
    inputNumber: 1,
    overlayNumber: 1,
    ipAddress: '192.168.1.3',
    port: 8088
  };
});

// In your MainApp component
const handleLogout = () => {
  localStorage.removeItem('isAuthenticated');
  setVmixModalOpen(false);
  setSettingsModalOpen(false);
  setInputModalOpen(false);
};

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

// Define updateCurrentTab before it's used
const updateCurrentTab = useCallback((updates) => {
  setTabs(prevTabs => prevTabs.map(tab => 
    tab.id === activeTabId 
      ? { ...tab, data: { ...tab.data, ...updates } }
      : tab
  ));
}, [activeTabId]);

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

const selectLine = useCallback((index) => {
  updateCurrentTab({
    selectedLineIndex: index,
    currentDisplayedText: allLines[index]
  });
  scrollToLine(index);
}, [allLines, updateCurrentTab]);

// Keyboard handler
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === ' ') {
      if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.isContentEditable) {
        e.preventDefault();
        e.stopPropagation();
        triggerVmixOverlay();
      }
      return;
    }

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

    // Fix numeric key shortcuts for selected lines (Shortcut Kadi)
    if (e.key >= '1' && e.key <= '9' && selectedLines.length > 0) {
      // Don't trigger if typing in input fields
      if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName) && !e.target.isContentEditable) {
        e.preventDefault();
        const num = parseInt(e.key);
        if (num <= selectedLines.length) {
          updateCurrentTab({ currentDisplayedText: selectedLines[num - 1] });
          scrollToLine(num - 1, true);
        }
      }
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [allLines, selectedLines, selectedLineIndex, isInputPanelFocused, updateCurrentTab, selectLine, triggerVmixOverlay]);

// Tab management functions
const addNewTab = () => {
  const newTab = {
    id: nextTabId,
    name: `Tab ${nextTabId}`,
    active: false,
    data: {
      allLines: [],
      selectedLines: [],
      currentDisplayedText: 'ÁÒ Ùä sÕâãÑÌâÓâÒÇ',
      selectedLineIndex: -1,
      originalInputText: ''
    }
  };
  setTabs([...tabs, newTab]);
  setActiveTabId(nextTabId);
  setNextTabId(nextTabId + 1);
};

const switchTab = (tabId) => {
  setActiveTabId(tabId);
  const tab = tabs.find(t => t.id === tabId);
  if (tab) {
    setLinesToDelete([]);
    setIsDeleteMode(false);
  }
};

const closeTab = (tabId) => {
  if (tabs.length === 1) return; // Don't close the last tab
  
  const newTabs = tabs.filter(tab => tab.id !== tabId);
  setTabs(newTabs);
  
  if (activeTabId === tabId) {
    setActiveTabId(newTabs[0].id);
  }
};

const processText = (text) => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  
  // Auto-rename tab based on first line - keep it in the same format as input
  let tabName = 'Empty Tab';
  if (lines.length > 0) {
    const firstLine = lines[0];
    // Take first few words or characters
    if (firstLine.length > 25) {
      tabName = firstLine.substring(0, 25) + '...';
    } else {
      tabName = firstLine;
    }
  }
  
  // Update tab name along with data
  setTabs(tabs.map(tab => 
    tab.id === activeTabId 
      ? { 
          ...tab, 
          name: tabName,
          data: {
            ...tab.data,
            allLines: lines,
            selectedLines: [],
            selectedLineIndex: lines.length > 0 ? 0 : -1,
            currentDisplayedText: lines.length > 0 ? lines[0] : '',
            originalInputText: text
          }
        }
      : tab
  ));
  
  setLinesToDelete([]);
  setIsDeleteMode(false);
};

const renameTab = (tabId, newName) => {
  setTabs(tabs.map(tab => 
    tab.id === tabId 
      ? { ...tab, name: newName }
      : tab
  ));
};

const setCurrentDisplayedText = (text) => {
  updateCurrentTab({ currentDisplayedText: text });
};

const setSelectedLines = (lines) => {
  updateCurrentTab({ selectedLines: lines });
};

const setAllLines = (lines) => {
  updateCurrentTab({ allLines: lines });
};

const setSelectedLineIndex = (index) => {
  updateCurrentTab({ selectedLineIndex: index });
};

const addToSelectedLines = (line) => {
  if (!selectedLines.includes(line)) {
    const newSelectedLines = [...selectedLines, line];
    updateCurrentTab({ selectedLines: newSelectedLines });
  }
  setIsInputPanelFocused(false);
};

const removeSelectedLine = (index) => {
  const newSelectedLines = [...selectedLines];
  newSelectedLines.splice(index, 1);
  updateCurrentTab({ selectedLines: newSelectedLines });
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
        onLogout={onLogout}
      />

    <TabBar
      tabs={tabs}
      activeTabId={activeTabId}
      onSwitchTab={switchTab}
      onCloseTab={closeTab}
      onAddTab={addNewTab}
      onRenameTab={renameTab}
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
      currentText={originalInputText} // Pass the original input text instead of currentDisplayedText
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    // Remove the <Router> wrapper here
    <Routes>
      <Route
        path="/login"
        element={
          <Login onLogin={(status) => {
            setIsAuthenticated(status);
            localStorage.setItem('isAuthenticated', status);
          }} />
        }
      />
      <Route
        path="/*"
        element={
          isAuthenticated ? 
            <MainApp onLogout={handleLogout} /> : 
            <Navigate to="/login" replace />
        }
      />
    </Routes>
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