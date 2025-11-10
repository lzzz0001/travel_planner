import React, { useState, useEffect } from 'react';
import settingsManager from '../utils/settingsManager';
import supabaseClient from '../utils/supabaseClient';
import aiTravelPlanner from '../utils/aiTravelPlanner';
import './Settings.css';

// 配置状态检查函数
const checkBackendStatus = async () => {
  try {
    const response = await fetch('/api/settings/status');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('检查后端状态失败:', error);
    return { success: false, message: '无法连接到后端' };
  }
};

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
  const [backendStatus, setBackendStatus] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadedSettings = settingsManager.getAllSettings();
    // Mask API keys for security
    const maskedSettings = maskApiKeys(loadedSettings);
    setSettings(maskedSettings);
    
    // 初始检查后端状态
    loadBackendStatus();
  }, []);
  
  const loadBackendStatus = async () => {
    setIsCheckingStatus(true);
    const status = await checkBackendStatus();
    setBackendStatus(status);
    setIsCheckingStatus(false);
  };

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
  const handleSave = async () => {
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
      
      // 保存到本地存储
      settingsManager.updateSettings(updatedSettings);
      
      // Update the services with new settings
      if (updatedSettings.dashscopeApiKey) {
        aiTravelPlanner.setApiKey(updatedSettings.dashscopeApiKey);
      }
      
      let backendMessage = '';
      if (updatedSettings.supabaseUrl && updatedSettings.supabaseKey) {
        // 初始化前端的Supabase客户端
        supabaseClient.init(updatedSettings.supabaseUrl, updatedSettings.supabaseKey);
        
        // 发送配置到后端服务器
        try {
          setSaveStatus('正在保存配置并更新后端...');
          const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              supabaseUrl: updatedSettings.supabaseUrl,
              supabaseKey: updatedSettings.supabaseKey,
              baiduMapsApiKey: updatedSettings.baiduMapsApiKey,
              iflytekAppId: updatedSettings.iflytekAppId
            })
          });
          
          const data = await response.json();
          if (data.success) {
            console.log('后端配置更新成功:', data.message);
            backendMessage = '后端已更新Supabase配置';
            
            // 重新检查后端状态
            await loadBackendStatus();
          } else {
            console.log('后端配置更新失败:', data.message);
            backendMessage = `后端配置失败: ${data.message}`;
          }
        } catch (backendError) {
          console.error('与后端通信失败:', backendError);
          backendMessage = '无法连接后端服务器，请手动重启容器';
        }
      } else {
        backendMessage = '缺少必要的Supabase配置，使用内存存储';
      }
      
      setSaveStatus(`设置保存成功！${backendMessage}`);
      setTimeout(() => setSaveStatus(''), 5000);
    } catch (error) {
      setSaveStatus('保存设置失败: ' + error.message);
      setTimeout(() => setSaveStatus(''), 5000);
    }
  };
  
  const handleRefreshStatus = async () => {
     await loadBackendStatus();
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

  // 渲染后端状态指示器
  const renderBackendStatus = () => {
    if (isCheckingStatus) {
      return <div className="status-indicator checking">正在检查后端状态...</div>;
    }
    
    if (!backendStatus || !backendStatus.success) {
      return <div className="status-indicator error">后端状态未知</div>;
    }
    
    if (backendStatus.usingSupabase) {
      return (
        <div className="status-indicator success">
          <span>✓ Supabase 已配置并正在使用</span>
          {backendStatus.configSource && <small>配置源: {backendStatus.configSource}</small>}
          {backendStatus.supabaseUrlPreview && <small>URL: {backendStatus.supabaseUrlPreview}</small>}
        </div>
      );
    } else {
      return <div className="status-indicator warning">⚠️ 使用内存存储（重启后数据丢失）</div>;
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-overlay" onClick={onClose}></div>
      <div className="settings-panel">
        <div className="settings-header">
          <h2>设置</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          {/* 后端状态显示区域 */}
          <div className="settings-section">
            <h3>后端配置状态</h3>
            {renderBackendStatus()}
            <button 
              className="btn btn-small refresh-status-btn"
              onClick={handleRefreshStatus}
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? '刷新中...' : '刷新状态'}
            </button>
            <div className="status-tip">
              💡 在保存设置后，后端会自动更新并使用您配置的Supabase数据库
            </div>
          </div>
          
          <div className="settings-section">
            <h3>API 配置</h3>
            
            <div className="form-group">
              <label htmlFor="dashscopeApiKey">阿里云百炼 API 密钥</label>
              <input
                id="dashscopeApiKey"
                name="dashscopeApiKey"
                type={showApiKeys ? "text" : "password"}
                value={settings.dashscopeApiKey}
                onChange={handleInputChange}
                placeholder="请输入 API 密钥"
              />
              <small>用于访问 AI 旅行规划服务</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="supabaseUrl">Supabase URL</label>
              <input
                id="supabaseUrl"
                name="supabaseUrl"
                type="text"
                value={settings.supabaseUrl}
                onChange={handleInputChange}
                placeholder="https://your-project.supabase.co"
              />
              <small>Supabase 项目的 URL</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="supabaseKey">Supabase 匿名密钥</label>
              <input
                id="supabaseKey"
                name="supabaseKey"
                type={showApiKeys ? "text" : "password"}
                value={settings.supabaseKey}
                onChange={handleInputChange}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
              <small>Supabase 项目的匿名 API 密钥</small>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>地图与语音配置</h3>
            
            <div className="form-group">
              <label htmlFor="baiduMapsApiKey">百度地图 API 密钥</label>
              <input
                id="baiduMapsApiKey"
                name="baiduMapsApiKey"
                type="text"
                value={settings.baiduMapsApiKey}
                onChange={handleInputChange}
                placeholder="请输入百度地图 API 密钥"
              />
              <small>用于地图显示功能</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="iflytekAppId">讯飞开放平台 App ID</label>
              <input
                id="iflytekAppId"
                name="iflytekAppId"
                type="text"
                value={settings.iflytekAppId}
                onChange={handleInputChange}
                placeholder="请输入讯飞 App ID"
              />
              <small>用于语音识别功能</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="iflytekApiKey">讯飞开放平台 API 密钥</label>
              <input
                id="iflytekApiKey"
                name="iflytekApiKey"
                type={showApiKeys ? "text" : "password"}
                value={settings.iflytekApiKey}
                onChange={handleInputChange}
                placeholder="请输入讯飞 API 密钥"
              />
              <small>用于语音识别功能</small>
            </div>
          </div>
          
          <div className="settings-options">
            <label className="checkbox-option">
              <input 
                type="checkbox" 
                checked={showApiKeys} 
                onChange={() => setShowApiKeys(!showApiKeys)} 
              />
              显示 API 密钥
            </label>
          </div>
          
          {saveStatus && (
            <div className={`save-status ${saveStatus.includes('成功') ? 'success' : saveStatus.includes('失败') ? 'error' : ''}`}>
              {saveStatus}
            </div>
          )}
        </div>
        
        <div className="settings-footer">
          <button className="btn btn-secondary" onClick={onClose}>取消</button>
          <button className="btn btn-primary" onClick={handleSave}>保存并应用设置</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;