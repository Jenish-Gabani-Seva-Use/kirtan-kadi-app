import React, { useState } from 'react';
import '../styles/VmixModal.css';

const VmixModal = ({ isOpen, onClose, onSave, settings }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [testResult, setTestResult] = useState('');

    const handleSave = () => {
        onSave({
            inputNumber: parseInt(localSettings.inputNumber) || 1,
            overlayNumber: Math.min(4, Math.max(1, parseInt(localSettings.overlayNumber) || 1)),
            ipAddress: localSettings.ipAddress || '127.0.0.1',
            port: parseInt(localSettings.port) || 8088
        });
    };

    const testOverlay = async () => {
        try {
          const { ipAddress, port, inputNumber, overlayNumber } = localSettings;
          
          // Trigger overlay ON
          const onResponse = await fetch(
            `http://${ipAddress}:${port}/api/?Function=OverlayInput${overlayNumber}In&Input=${inputNumber}`
          );
          if (!onResponse.ok) throw new Error('Failed to activate overlay');
          setTestResult("Overlay ON - check vMix");
      
          // Trigger overlay OFF after 3 seconds
          setTimeout(async () => {
            const offResponse = await fetch(
              `http://${ipAddress}:${port}/api/?Function=OverlayInput${overlayNumber}Out&Input=${inputNumber}`
            );
            if (!offResponse.ok) throw new Error('Failed to deactivate overlay');
            setTestResult("Overlay OFF - test complete");
          }, 3000);
      
        } catch (error) {
          setTestResult(`Overlay test failed: ${error.message}`);
        }
      };

    const testConnection = async () => {
        setTestResult("Testing connection...");

        try {
            const ipAddress = localSettings.ipAddress || '127.0.0.1';
            const port = localSettings.port || 8088;

            if (!ipAddress.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
                throw new Error("Invalid IP address format");
            }

            const response = await fetch(`http://${ipAddress}:${port}/api`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const text = await response.text();
            if (text.includes('<vmix>')) {
                const version = text.match(/<version>(.*?)<\/version>/)?.[1] || 'unknown';
                setTestResult(`Connected to vMix ${version}`);
            } else {
                throw new Error("Invalid vMix response");
            }
        } catch (error) {
            setTestResult(`Connection failed: ${error.message}`);
            console.error("Connection error:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="vmix-modal">
            <div className="vmix-content">
                <h2>VMix Integration Settings</h2>

                <div className="vmix-controls">
                    <div className="vmix-group">
                        <label htmlFor="vmixInputNumber">Input Number</label>
                        <input
                            type="number"
                            id="vmixInputNumber"
                            min="1"
                            max="100"
                            value={localSettings.inputNumber}
                            onChange={(e) => setLocalSettings({ ...localSettings, inputNumber: e.target.value })}
                            placeholder="VMix Input Number"
                        />
                    </div>

                    <div className="vmix-group">
                        <label htmlFor="vmixOverlayNumber">Overlay Number (1-4)</label>
                        <input
                            type="number"
                            id="vmixOverlayNumber"
                            min="1"
                            max="4"
                            value={localSettings.overlayNumber}
                            onChange={(e) => setLocalSettings({ ...localSettings, overlayNumber: e.target.value })}
                            placeholder="1-4"
                        />
                    </div>

                    <div className="vmix-group">
                        <label htmlFor="vmixIpAddress">VMix IP Address</label>
                        <input
                            type="text"
                            id="vmixIpAddress"
                            value={localSettings.ipAddress}
                            onChange={(e) => setLocalSettings({ ...localSettings, ipAddress: e.target.value })}
                            placeholder="e.g., 192.168.1.100"
                        />
                    </div>

                    <div className="vmix-group">
                        <label htmlFor="vmixPort">Port (default: 8088)</label>
                        <input
                            type="number"
                            id="vmixPort"
                            value={localSettings.port}
                            onChange={(e) => setLocalSettings({ ...localSettings, port: e.target.value })}
                            placeholder="8088"
                        />
                    </div>
                </div>

                <div className="vmix-test">
                    <button className="btn btn-secondary" onClick={testConnection}>Test Connection</button>
                    <span className={testResult.includes('Connected') ? 'success' : 'error'}>{testResult}</span>
                </div>

                <div className="vmix-actions">
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                    <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
                    <button
                        className="btn btn-secondary"
                        onClick={async () => {
                            await testConnection();
                            await testOverlay();
                        }}
                        style={{ marginLeft: 'auto' }}
                    >
                        Test Overlay
                    </button>
                </div>
            </div>
        </div>

    );
};

export default VmixModal;