// AI Travel Planner utility using backend API
import apiService from '../services/api';
import settingsManager from './settingsManager';

// AI Travel Planner utility using backend API
class AITravelPlanner {
  constructor() {
    // 初始化时从设置管理器获取API密钥
    this.apiKey = settingsManager.getSetting('dashscopeApiKey') || '';
  }
  
  // 设置API密钥
  setApiKey(key) {
    this.apiKey = key;
    console.log('DashScope API Key has been set (部分显示):', key ? '*'.repeat(key.length - 8) + key.slice(-8) : '无');
    // 同时保存到设置管理器中
    settingsManager.setSetting('dashscopeApiKey', key);
  }
  
  // 获取当前API密钥
  getApiKey() {
    return this.apiKey;
  }
  
  // Generate a travel plan based on user input
  async generateTravelPlan(request) {
    try {
      // 在请求中添加API密钥信息
      const requestWithKey = {
        ...request,
        apiKey: this.apiKey // 传递API密钥给后端服务
      };
      
      // Call our backend API which would connect to Alibaba Cloud
      const itinerary = await apiService.generateTravelPlan(requestWithKey);
      return itinerary;
    } catch (error) {
      console.error('Error generating travel plan:', error);
      throw error;
    }
  }
}

// Export a singleton instance
const aiTravelPlanner = new AITravelPlanner();
export default aiTravelPlanner;