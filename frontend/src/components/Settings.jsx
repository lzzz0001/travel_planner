import React, { useState, useEffect } from 'react';
import settingsManager from '../utils/settingsManager';
import supabaseClient from '../utils/supabaseClient';
import aiTravelPlanner from '../utils/aiTravelPlanner';

const Settings = ({ onClose }) => {
  const [settings, setSettings] = useState({
    dashscopeApiKey: '',
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
      if (updatedSettings.dashscopeApiKey) {
        aiTravelPlanner.setApiKey(updatedSettings.dashscopeApiKey);
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
        dashscopeApiKey: '',
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
        
        <div className="settings-form">
          <div className="setting-group">
            <h3>DashScope API</h3>
            <div className="form-group">
              <label>API密钥</label>
              <div className="input-with-toggle">
                <input
                  type={showApiKeys ? "text" : "password"}
                  name="dashscopeApiKey"
                  value={settings.dashscopeApiKey}
                  onChange={handleInputChange}
                  placeholder="Enter your DashScope API Key"
                />
                <button 
                  type="button" 
                  onClick={() => setShowApiKeys(!showApiKeys)}
                  className="toggle-visibility"
                >
                  {showApiKeys ? '隐藏' : '显示'}
                </button>
              </div>
              <p className="help-text">
                Get your API key from DashScope Platform
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
                  placeholder="输入您的百度地图API密钥"
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
                请从百度地图开发者控制台获取API密钥
              </p>
            </div>
          </div>
          
          <div className="setting-group">
            <h3>讯飞语音识别</h3>
            <div className="form-group">
              <label>应用ID</label>
              <input
                type="text"
                name="iflytekAppId"
                value={settings.iflytekAppId}
                onChange={handleInputChange}
                placeholder="输入您的讯飞应用ID"
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
                  placeholder="输入您的讯飞API密钥"
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
                请从讯飞开发者平台获取凭证
              </p>
            </div>
          </div>
          
          <div className="settings-actions">
            <button onClick={handleSave} className="save-button">
              保存设置
            </button>
            <button onClick={handleClear} className="clear-button">
              清空所有
            </button>
          </div>
          
          {saveStatus && (
            <div className={`save-status ${saveStatus.includes('success') ? 'success' : 'error'}`}>
              {saveStatus}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;