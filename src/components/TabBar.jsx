import React, { useState, useRef, useEffect } from 'react';
import '../styles/TabBar.css';

const TabBar = ({ tabs, activeTabId, onSwitchTab, onCloseTab, onAddTab, onRenameTab, onReorderTabs, lockedTabs, onToggleLockTab }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [editingTabId, setEditingTabId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [draggedTab, setDraggedTab] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const contextMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (e, tab) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tabId: tab.id,
      tabName: tab.name
    });
  };

  const handleRename = () => {
    if (contextMenu) {
      setEditingTabId(contextMenu.tabId);
      setEditingName(contextMenu.tabName);
      setContextMenu(null);
    }
  };

  const handleDelete = () => {
    if (contextMenu && tabs.length > 1) {
      // Check if tab is locked
      if (lockedTabs && lockedTabs.includes(contextMenu.tabId)) {
        alert('This tab is locked and cannot be closed. Unlock it first.');
        setContextMenu(null);
        return;
      }
      onCloseTab(contextMenu.tabId);
      setContextMenu(null);
    }
  };

  const handleToggleLock = () => {
    if (contextMenu) {
      onToggleLockTab(contextMenu.tabId);
      setContextMenu(null);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, tab, index) => {
    setDraggedTab({ tab, index });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedTab && draggedTab.index !== dropIndex) {
      const newTabs = [...tabs];
      const [removed] = newTabs.splice(draggedTab.index, 1);
      newTabs.splice(dropIndex, 0, removed);
      onReorderTabs(newTabs);
    }
    setDraggedTab(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDragOverIndex(null);
  };

  const handleRenameSubmit = (tabId) => {
    if (editingName.trim()) {
      onRenameTab(tabId, editingName.trim());
    }
    setEditingTabId(null);
    setEditingName('');
  };

  const handleRenameKeyDown = (e, tabId) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(tabId);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
      setEditingName('');
    }
  };

  const getFontFamily = (tab) => {
    // Check if tab name contains Sulekh characters
    const sulekhPattern = /[áâåæéêÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕ×ØÖÚÛäçèöëìíîïðz]/;
    if (sulekhPattern.test(tab.name)) {
      return "'Guj_Regular_Bold_Sulekh', sans-serif";
    }
    // Check if it contains Gujarati Unicode
    const gujaratiPattern = /[અ-ઔક-હા-ૅે-ૌં-ઃ્]/;
    if (gujaratiPattern.test(tab.name)) {
      return "'Noto Sans Gujarati', 'Shruti', sans-serif";
    }
    // Default to regular font
    return "'Arial', sans-serif";
  };

  return (
    <div className="tab-bar">
      <div className="tabs-container">
        {tabs.map((tab, index) => {
          const isLocked = lockedTabs && lockedTabs.includes(tab.id);
          return (
            <div
              key={tab.id}
              className={`tab ${tab.id === activeTabId ? 'active' : ''} ${dragOverIndex === index ? 'drag-over' : ''}`}
              onClick={() => onSwitchTab(tab.id)}
              onContextMenu={(e) => handleContextMenu(e, tab)}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, tab, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {isLocked && (
                <span className="lock-icon" title="Tab is locked">🔒</span>
              )}
              {editingTabId === tab.id ? (
                <input
                  type="text"
                  className="tab-rename-input"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleRenameSubmit(tab.id)}
                  onKeyDown={(e) => handleRenameKeyDown(e, tab.id)}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  style={{ fontFamily: getFontFamily(tab) }}
                />
              ) : (
                <span className="tab-name" style={{ fontFamily: getFontFamily(tab) }}>
                  {tab.name}
                </span>
              )}
              {tabs.length > 1 && !isLocked && (
                <button
                  className="tab-close"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}
        <button className="add-tab-btn" onClick={onAddTab}>
          +
        </button>
      </div>

      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          <div className="context-menu-item" onClick={handleToggleLock}>
            <i className={`fas fa-${lockedTabs && lockedTabs.includes(contextMenu.tabId) ? 'unlock' : 'lock'}`}></i> 
            {lockedTabs && lockedTabs.includes(contextMenu.tabId) ? 'Unlock Tab' : 'Lock Tab'}
          </div>
          <div className="context-menu-item" onClick={handleRename}>
            <i className="fas fa-edit"></i> Rename
          </div>
          {tabs.length > 1 && (!lockedTabs || !lockedTabs.includes(contextMenu.tabId)) && (
            <div className="context-menu-item" onClick={handleDelete}>
              <i className="fas fa-trash"></i> Delete
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TabBar;