import React, { useState, useEffect } from 'react';
import settingsManager from '../utils/settingsManager';
import supabaseClient from '../utils/supabaseClient';
import aiTravelPlanner from '../utils/aiTravelPlanner';

const Settings = ({ onClose }) => {
  const [settings, setSettings] = useState({
    alibabaCloudApiKey: '',
    supabaseUrl: '',
    supabaseKey: '',
    baiduMapsApiKey: '',
    iflytekAppId: '',
    iflytekApiKey: ''
  });
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load settings on component mount
  useEffect(() => {
    const loadedSettings = settingsManager.getAllSettings();
    // Mask API keys for security
    const maskedSettings = maskApiKeys(loadedSettings);
    setSettings(maskedSettings);
  }, []);

  // Mask API keys for display
  const maskApiKeys = (settingsObj) => {
    const masked = { ...settingsObj };
    Object.keys(masked).forEach(key => {
      if (masked[key] && masked[key].length > 10) {
        masked[key] = '*'.repeat(masked[key].length - 8) + masked[key].slice(-8);
      }
    });
    return masked;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      [name]: value
    });
  };

  // Save settings
  const handleSave = () => {
    try {
      // Get current settings to preserve unmodified values
      const currentSettings = settingsManager.getAllSettings();
      
      // Only update values that have changed (and aren't masked)
      const updatedSettings = { ...currentSettings };
      
      Object.keys(settings).forEach(key => {
        // If the value isn't masked, update it
        if (!settings[key].startsWith('********') || settings[key].length <= 10) {
          updatedSettings[key] = settings[key];
        }
      });
      
      settingsManager.updateSettings(updatedSettings);
      
      // Update the services with new settings
      if (updatedSettings.alibabaCloudApiKey) {
        aiTravelPlanner.setApiKey(updatedSettings.alibabaCloudApiKey);
      }
      
      if (updatedSettings.supabaseUrl && updatedSettings.supabaseKey) {
        supabaseClient.init(updatedSettings.supabaseUrl, updatedSettings.supabaseKey);
      }
      
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      setSaveStatus('Failed to save settings: ' + error.message);
    }
  };

  // Clear all settings
  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all settings?')) {
      settingsManager.clearSettings();
      const clearedSettings = {
        alibabaCloudApiKey: '',
        supabaseUrl: '',
        supabaseKey: '',
        baiduMapsApiKey: '',
        iflytekAppId: '',
        iflytekApiKey: ''
      };
      setSettings(clearedSettings);
      setSaveStatus('Settings cleared successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div className="settings-modal">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        {saveStatus && (
          <div className={`save-status ${saveStatus.includes('success') ? 'success' : 'error'}`}>
            {saveStatus}
          </div>
        )}
        
        <div className="settings-form">
          <div className="setting-group">
            <h3>Alibaba Cloud API</h3>
            <div className="form-group">
              <label>API Key</label>
              <div className="input-with-toggle">
                <input
                  type={showApiKeys ? "text" : "password"}
                  name="alibabaCloudApiKey"
                  value={settings.alibabaCloudApiKey}
                  onChange={handleInputChange}
                  placeholder="Enter your Alibaba Cloud API Key"
                />
                <button 
                  type="button" 
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="toggle-visibility"
                >
                  {showApiKeys ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="help-text">
                Get your API key from Alibaba Cloud Dashboard
              </p>
            </div>
          </div>
          
          <div className="setting-group">
            <h3>Supabase</h3>
            <div className="form-group">
              <label>Project URL</label>
              <input
                type="text"
                name="supabaseUrl"
                value={settings.supabaseUrl}
                onChange={handleInputChange}
                placeholder="https://your-project.supabase.co"
              />
            </div>
            <div className="form-group">
              <label>API Key</label>
              <div className="input-with-toggle">
                <input
                  type={showApiKeys ? "text" : "password"}
                  name="supabaseKey"
                  value={settings.supabaseKey}
                  onChange={handleInputChange}
                  placeholder="Enter your Supabase API Key"
                />
                <button 
                  type="button" 
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="toggle-visibility"
                >
                  {showApiKeys ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="help-text">
                Get your API key from your Supabase project settings
              </p>
            </div>
          </div>
          
          <div className="setting-group">
            <h3>Baidu Maps</h3>
            <div className="form-group">
              <label>API Key</label>
              <div className="input-with-toggle">
                <input
                  type={showApiKeys ? "text" : "password"}
                  name="baiduMapsApiKey"
                  value={settings.baiduMapsApiKey}
                  onChange={handleInputChange}
                  placeholder="Enter your Baidu Maps API Key"
                />
                <button 
                  type="button" 
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="toggle-visibility"
                >
                  {showApiKeys ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="help-text">
                Get your API key from Baidu Maps Developer Console
              </p>
            </div>
          </div>
          
          <div className="setting-group">
            <h3>iFlytek Speech Recognition</h3>
            <div className="form-group">
              <label>App ID</label>
              <input
                type="text"
                name="iflytekAppId"
                value={settings.iflytekAppId}
                onChange={handleInputChange}
                placeholder="Enter your iFlytek App ID"
              />
            </div>
            <div className="form-group">
              <label>API Key</label>
              <div className="input-with-toggle">
                <input
                  type={showApiKeys ? "text" : "password"}
                  name="iflytekApiKey"
                  value={settings.iflytekApiKey}
                  onChange={handleInputChange}
                  placeholder="Enter your iFlytek API Key"
                />
                <button 
                  type="button" 
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="toggle-visibility"
                >
                  {showApiKeys ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="help-text">
                Get your credentials from iFlytek Developer Platform
              </p>
            </div>
          </div>
          
          <div className="settings-actions">
            <button onClick={handleSave} className="save-button">
              Save Settings
            </button>
            <button onClick={handleClear} className="clear-button">
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;