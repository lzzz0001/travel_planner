// Settings manager utility
class SettingsManager {
  constructor() {
    this.settings = {
      alibabaCloudApiKey: '',
      supabaseUrl: '',
      supabaseKey: '',
      baiduMapsApiKey: '',
      iflytekAppId: '',
      iflytekApiKey: ''
    };
    this.loadSettings();
  }

  // Load settings from localStorage
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('aiTravelPlannerSettings');
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  // Save settings to localStorage
  saveSettings() {
    try {
      localStorage.setItem('aiTravelPlannerSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // Get a specific setting
  getSetting(key) {
    return this.settings[key];
  }

  // Set a specific setting
  setSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }

  // Get all settings
  getAllSettings() {
    return { ...this.settings };
  }

  // Update multiple settings
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

  // Clear all settings
  clearSettings() {
    this.settings = {
      alibabaCloudApiKey: '',
      supabaseUrl: '',
      supabaseKey: '',
      baiduMapsApiKey: '',
      iflytekAppId: '',
      iflytekApiKey: ''
    };
    this.saveSettings();
  }
}

// Export a singleton instance
const settingsManager = new SettingsManager();
export default settingsManager;