import React, { useState, useEffect, useRef } from 'react'
import VoiceInput from './components/VoiceInput'
import Auth from './components/Auth'
import ItineraryDisplay from './components/ItineraryDisplay'
import ExpenseTracker from './components/ExpenseTracker'
import Settings from './components/Settings'
import TravelPlansManager from './components/TravelPlansManager'
import MapComponent from './components/MapComponent'
import travelPlannerClient from './utils/supabaseClient'
import aiTravelPlanner from './utils/aiTravelPlanner'
import settingsManager from './utils/settingsManager'
import './App.css'
import './components/VoiceInput.css'
import './components/Auth.css'
import './components/ItineraryDisplay.css'
import './components/ExpenseTracker.css'
import './components/Settings.css'
import './components/TravelPlansManager.css'
import './components/MapComponent.css'

// 初始化函数：将本地设置同步到后端
const syncSettingsToBackend = async () => {
  try {
    const savedSettings = settingsManager.getAllSettings();
    
    // 如果有Supabase配置，发送到后端
    if (savedSettings.supabaseUrl && savedSettings.supabaseKey) {
      console.log('尝试将本地设置同步到后端...');
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supabaseUrl: savedSettings.supabaseUrl,
          supabaseKey: savedSettings.supabaseKey,
          baiduMapsApiKey: savedSettings.baiduMapsApiKey,
          iflytekAppId: savedSettings.iflytekAppId
        })
      });
      
      const data = await response.json();
      console.log('后端设置同步结果:', data);
    }
  } catch (error) {
    console.warn('无法同步设置到后端:', error.message);
    // 静默失败，不影响应用启动
  }
};

// 检查后端配置状态
const checkBackendSettingsStatus = async () => {
  try {
    const response = await fetch('/api/settings/status');
    const data = await response.json();
    console.log('后端配置状态:', data);
    return data;
  } catch (error) {
    console.warn('无法检查后端配置状态:', error.message);
    return null;
  }
}

function App() {
  const [travelRequest, setTravelRequest] = useState('')
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  const [previousQueries, setPreviousQueries] = useState([])
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false)
  const [activeTab, setActiveTab] = useState('plan') // plan, map, expenses
  const mapRef = useRef(null)

  // Initialize services with settings
  useEffect(() => {
    const settings = settingsManager.getAllSettings();
    
    // In a real implementation, you would pass these settings to the backend
    console.log('Loaded settings:', settings);
    
    // 自动同步设置到后端
    syncSettingsToBackend();
    // 检查后端配置状态
    checkBackendSettingsStatus();
    
    // 加载历史查询记录
    const savedQueries = localStorage.getItem('previousQueries');
    if (savedQueries) {
      try {
        setPreviousQueries(JSON.parse(savedQueries));
      } catch (error) {
        console.error('Failed to load previous queries:', error);
      }
    }
  }, []);

  // 保存历史查询记录
  const savePreviousQuery = (query) => {
    const updatedQueries = [query, ...previousQueries.filter(q => q !== query)].slice(0, 5);
    setPreviousQueries(updatedQueries);
    localStorage.setItem('previousQueries', JSON.stringify(updatedQueries));
  };

  const handleAuthChange = (userData) => {
    setUser(userData)
  }

  const handleVoiceInput = (transcript) => {
    setTravelRequest(transcript)
    setIsVoiceInputActive(false)
    // 如果是有效的行程查询，自动提交
    if (transcript && transcript.length > 5) {
      setTimeout(() => planTrip(), 500);
    }
  }

  // 开始语音输入
  const startVoiceInput = () => {
    setError('');
    setIsVoiceInputActive(true);
  }

  // 取消语音输入
  const cancelVoiceInput = () => {
    setIsVoiceInputActive(false);
  }

  // 使用AI生成旅行计划
  const planTrip = async () => {
    if (!travelRequest.trim()) {
      setError('请输入旅行需求')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      // 保存查询到历史记录
      savePreviousQuery(travelRequest)
      
      // 调用行程生成API
      const generatedItinerary = await aiTravelPlanner.generateTravelPlan(travelRequest)
      
      // 从查询中提取城市信息
      const extractCityFromQuery = (query) => {
        // 常见城市名称列表
        const commonCities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆', 
                            '苏州', '天津', '长沙', '郑州', '东莞', '青岛', '沈阳', '宁波', '昆明', '福州',
                            '无锡', '厦门', '大连', '合肥', '佛山', '哈尔滨', '济南', '温州', '南宁', '长春'];
        
        // 查找查询中包含的城市名称
        for (const city of commonCities) {
          if (query.includes(city)) {
            return city;
          }
        }
        return null;
      };
      
      // 提取城市信息
      const city = generatedItinerary.city || extractCityFromQuery(travelRequest);
      console.log(`提取到的城市: ${city}`);
      
      // 确保行程数据结构完整
      const formattedItinerary = {
        id: Date.now().toString(),
        ...generatedItinerary,
        query: travelRequest,
        createdAt: new Date().toISOString(),
        // 保存城市信息
        city: city,
        // 确保地点列表存在
        places: generatedItinerary.places || generatedItinerary.attractions || [],
        // 确保行程天数信息存在
        days: generatedItinerary.days || 1,
        // 提取预算信息
        budget: generatedItinerary.budget || '',
        // 添加坐标信息以便地图显示
        locations: formatLocationsForMap(generatedItinerary)
      }
      
      setItinerary(formattedItinerary)
      
      // 自动切换到地图标签显示行程地点
      setActiveTab('map')
      
      // 如果有地点信息，通知地图组件更新标记
      if (mapRef.current && formattedItinerary.locations && formattedItinerary.locations.length > 0) {
        setTimeout(() => {
          mapRef.current.updateMarkers(formattedItinerary.locations)
        }, 500)
      }
      
      // 无论用户是否登录，都保存行程到本地缓存
      // 我们已经修改了saveTravelPlan方法，使其在未登录时也能正常工作
      await travelPlannerClient.saveTravelPlan(formattedItinerary)
      console.log('Itinerary saved to cache, will sync with server if authenticated')
    } catch (err) {
      setError(`生成行程失败: ${err.message || '未知错误'}`)
      console.error('Error generating plan:', err)
    } finally {
      setLoading(false)
    }
  }
  
  // 格式化地点信息用于地图显示
  const formatLocationsForMap = (plan) => {
    const locations = []
    
    // 检查不同可能的地点数据结构
    if (plan.places && Array.isArray(plan.places)) {
      plan.places.forEach(place => {
        if (place.name) {
          locations.push({
            name: place.name,
            address: place.address || '',
            description: place.description || '',
            category: place.category || 'attraction',
            // 如果有坐标直接使用，否则会在地图组件中进行地理编码
            lat: place.lat,
            lng: place.lng
          })
        }
      })
    } else if (plan.dailyItinerary && Array.isArray(plan.dailyItinerary)) {
      // 如果是按天组织的行程
      plan.dailyItinerary.forEach(day => {
        if (day.activities && Array.isArray(day.activities)) {
          day.activities.forEach(activity => {
            if (activity.location || activity.name) {
              locations.push({
                name: activity.name || activity.location,
                address: activity.address || '',
                description: activity.description || activity.activity || '',
                category: activity.category || 'activity',
                day: day.day || ''
              })
            }
          })
        }
      })
    }
    
    return locations
  }
  
  // 使用历史查询
  const usePreviousQuery = (query) => {
    setTravelRequest(query)
  }

  // 处理从旅行计划管理器中选择的计划
  const handlePlanSelect = (plan) => {
    setItinerary(plan)
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <h1>AI 旅行规划师</h1>
          <button className="settings-button" onClick={() => setShowSettings(!showSettings)}>
            ⚙️ 设置
          </button>
        </div>
        <p>使用AI规划您的完美旅行</p>
        
        <Auth onAuthChange={handleAuthChange} />
        
        {user && (
          <>
            <div className="travel-planner">
              <h2>告诉我们您的旅行计划</h2>
              <p>使用语音或文本描述您的旅行计划</p>
              
              {!isVoiceInputActive ? (
                <button 
                  type="button"
                  className="voice-button"
                  onClick={startVoiceInput}
                  disabled={loading}
                >
                  🎤 语音输入
                </button>
              ) : (
                <button 
                  type="button"
                  className="voice-button recording"
                  onClick={cancelVoiceInput}
                >
                  ⏹️ 停止录音
                </button>
              )}
              
              <div className="text-input">
                <textarea
                  value={travelRequest}
                  onChange={(e) => setTravelRequest(e.target.value)}
                  placeholder="或者在这里输入您的旅行需求...例如：'我想去日本5天，预算10000元，喜欢美食和动漫，带孩子旅行'"
                  rows="4"
                  cols="50"
                />
              </div>
              
              <button className="plan-button" onClick={planTrip} disabled={loading}>
                {loading ? '规划中...' : '规划我的旅行'}
              </button>
              
              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}
              
              {/* 历史查询记录 */}
              {previousQueries.length > 0 && (
                <div className="previous-queries">
                  <h4>历史查询：</h4>
                  <div className="query-tags">
                    {previousQueries.map((query, index) => (
                      <button
                        key={index}
                        className="query-tag"
                        onClick={() => usePreviousQuery(query)}
                      >
                        {query.substring(0, 30)}...
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* 主体内容区域 */}
            <div className="main-content">
              {/* 左侧导航菜单 */}
              <div className="sidebar-menu">
                <div className="menu-header">
                  <h3>功能菜单</h3>
                </div>
                <div className="menu-items">
                  <button 
                    className={`menu-item ${activeTab === 'plan' ? 'active' : ''}`}
                    onClick={() => setActiveTab('plan')}
                  >
                    📋 行程详情
                  </button>
                  <button 
                    className={`menu-item ${activeTab === 'map' ? 'active' : ''}`}
                    onClick={() => setActiveTab('map')}
                  >
                    🗺️ 地图
                  </button>
                  <button 
                    className={`menu-item ${activeTab === 'expenses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('expenses')}
                  >
                    💰 费用管理
                  </button>
                </div>
              </div>
            
               {/* 右侧内容区域 */}
               <div className="content-area">
                 <div className="tab-content">
                   {activeTab === 'plan' && itinerary && (
                     <ItineraryDisplay itinerary={itinerary} />
                   )}
                   {activeTab === 'map' && (
                     <MapComponent 
                       ref={mapRef}
                       itinerary={itinerary} 
                     />
                   )}
                   {activeTab === 'expenses' && (
                     <ExpenseTracker itinerary={itinerary} />
                   )}
                   {(!itinerary && activeTab !== 'expenses') && (
                     <div className="empty-state">
                       <p>请输入旅行需求并生成行程计划</p>
                     </div>
                   )}
                 </div>
               </div>
             </div>
            
            <TravelPlansManager onPlanSelect={handlePlanSelect} />
          </>
        )}
      </header>
      
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
      
      {/* 语音输入组件 */}
      {isVoiceInputActive && (
        <VoiceInput
          onTranscript={handleVoiceInput}
          onError={(err) => {
            setError(`语音输入错误: ${err}`);
            setIsVoiceInputActive(false);
          }}
          className="voice-input-container"
          autoStart={true}
        />
      )}
    </div>
  )
}

export default App