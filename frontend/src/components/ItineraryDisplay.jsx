import React, { useState, useRef, useEffect } from 'react';
import MapComponent from './MapComponent';

const ItineraryDisplay = ({ itinerary }) => {
  if (!itinerary) {
    return null;
  }
  
  // 状态管理当前选中的日期
  const [selectedDay, setSelectedDay] = useState(null);
  // 地图组件引用
  const mapRef = useRef(null);
  
  // 获取所有日期列表
  const days = itinerary.itinerary || [];
  
  // 提取日期列表用于导航菜单
  const dateList = days.map(day => day.date);
  
  // 如果没有选中日期且有日期列表，默认选择第一天
  React.useEffect(() => {
    if (days.length > 0 && selectedDay === null) {
      setSelectedDay(days[0].date);
    }
  }, [days, selectedDay]);

  // 提取行程中的所有位置信息用于地图显示
  const extractLocations = () => {
    const locations = [];
    
    // 提取活动地点
    if (itinerary.itinerary) {
      itinerary.itinerary.forEach(day => {
        if (day.activities) {
          day.activities.forEach(activity => {
            if (activity.location || activity.activity) {
              locations.push({
                name: activity.location || activity.activity,
                description: activity.details,
                category: determineCategory(activity.activity),
                day: day.date,
                time: activity.time
              });
            }
          });
        }
      });
    }
    
    // 提取住宿地点
    if (itinerary.accommodations) {
      itinerary.accommodations.forEach(hotel => {
        locations.push({
          name: hotel.name,
          address: hotel.location,
          category: '住宿',
          description: `价格范围: ${hotel.price_range}`
        });
      });
    }
    
    // 提取餐厅地点
    if (itinerary.restaurants) {
      itinerary.restaurants.forEach(restaurant => {
        locations.push({
          name: restaurant.name,
          address: restaurant.location,
          category: '餐饮',
          description: `${restaurant.cuisine}，价格范围: ${restaurant.price_range}`
        });
      });
    }
    
    return locations;
  };
  
  // 根据活动名称判断类别
  const determineCategory = (activity) => {
    if (!activity) return '景点';
    
    const lowerActivity = activity.toLowerCase();
    if (lowerActivity.includes('酒店') || lowerActivity.includes('宾馆') || lowerActivity.includes('住宿')) {
      return '住宿';
    } else if (lowerActivity.includes('餐厅') || lowerActivity.includes('吃饭') || lowerActivity.includes('餐') || lowerActivity.includes('饭')) {
      return '餐饮';
    } else if (lowerActivity.includes('机场') || lowerActivity.includes('火车站') || lowerActivity.includes('车站') || lowerActivity.includes('地铁') || lowerActivity.includes('交通')) {
      return '交通';
    } else if (lowerActivity.includes('购物') || lowerActivity.includes('商场') || lowerActivity.includes('商店')) {
      return '购物';
    } else {
      return '景点';
    }
  };
  
  // 用于地图显示的位置数据
  const locations = extractLocations();
  
  // 初始化地图和在行程数据变化时更新地图
  useEffect(() => {
    if (mapRef.current) {
      console.log(`ItineraryDisplay: 设置地图为标准地图`);
      mapRef.current.setMapType('normal');
    }
  }, []);
  
  // 在组件挂载和行程数据变化时调用resize，确保地图正确渲染
  useEffect(() => {
    // 使用防抖函数避免过多的resize调用
    let resizeDebounceTimer = null;
    const debouncedResize = () => {
      if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
      resizeDebounceTimer = setTimeout(() => {
        if (mapRef.current && mapRef.current.resize) {
          console.log('ItineraryDisplay: 执行防抖后的地图resize');
          mapRef.current.resize();
        }
      }, 200);
    };
    
    // 获取地图容器引用
    const mapContainer = document.querySelector('.map-container');
    if (mapContainer && mapRef.current) {
      console.log('ItineraryDisplay: 检测到地图容器，设置可见性监听');
      
      // 使用IntersectionObserver监测地图容器可见性
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              console.log('ItineraryDisplay: 地图容器变为可见，触发resize');
              debouncedResize();
            }
          });
        }, 
        {
          threshold: 0.1,
          rootMargin: '-10px'
        }
      );
      
      observer.observe(mapContainer);
      
      // 当行程数据变化时，延迟执行resize
      setTimeout(() => {
        debouncedResize();
      }, 300);
      
      return () => {
        if (resizeDebounceTimer) clearTimeout(resizeDebounceTimer);
        observer.unobserve(mapContainer);
      };
    }
  }, [itinerary, locations]);

  return (
    <div className="itinerary-display">
      <h2>您的AI生成旅行计划</h2>
      
      <div className="itinerary-summary">
        <div className="summary-item">
          <h3>目的地</h3>
          <p>{itinerary.destination}</p>
        </div>
        <div className="summary-item">
          <h3>时长</h3>
          <p>{itinerary.duration}</p>
        </div>
        <div className="summary-item">
          <h3>预算</h3>
          <p>{itinerary.budget}</p>
        </div>
      </div>

      <div className="map-container">
        <MapComponent 
          ref={mapRef}
          itinerary={{ locations }} 
        />
        
        {/* 地图类型切换控件 */}
        <div className="map-controls">
          <button 
            className="map-type-btn active"
          >
            标准地图
          </button>
        </div>
      </div>

      {/* 日期导航菜单 */}
      {dateList.length > 0 && (
        <div className="date-navigator">
          <h3>行程日期</h3>
          <div className="date-menu">
            {dateList.map((date, index) => (
              <button
                key={index}
                className={`date-button ${selectedDay === date ? 'active' : ''}`}
                onClick={() => setSelectedDay(date)}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="itinerary-details">
        {/* 只显示选中日期的行程 */}
        {itinerary.itinerary?.map((day, index) => {
          // 只渲染选中的日期或所有日期（如果没有选中特定日期）
          if (selectedDay && day.date !== selectedDay) {
            return null;
          }
          
          return (
            <div key={index} className="itinerary-day">
              <h3>{day.date}</h3>
              <div className="activities">
                {day.activities?.map((activity, actIndex) => (
                  <div key={actIndex} className="activity">
                    <div className="activity-time">{activity.time}</div>
                    <div className="activity-details">
                      <h4>{activity.activity}</h4>
                      <p className="activity-location">{activity.location}</p>
                      <p className="activity-description">{activity.details}</p>
                      {activity.estimated_cost && (
                        <p className="activity-cost">预估费用: {activity.estimated_cost}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {itinerary.accommodations && (
        <div className="itinerary-section">
          <h3>住宿推荐</h3>
          <div className="accommodations-list">
            {itinerary.accommodations.map((hotel, index) => (
              <div key={index} className="accommodation">
                <h4>{hotel.name}</h4>
                <p>位置: {hotel.location}</p>
                <p>价格范围: {hotel.price_range}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.transportation && (
        <div className="itinerary-section">
          <h3>交通方式</h3>
          <div className="transportation-list">
            {itinerary.transportation.map((transport, index) => (
              <div key={index} className="transportation">
                <h4>{transport.type}</h4>
                <p>{transport.details}</p>
                <p>预估费用: {transport.estimated_cost}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.restaurants && (
        <div className="itinerary-section">
          <h3>餐厅推荐</h3>
          <div className="restaurants-list">
            {itinerary.restaurants.map((restaurant, index) => (
              <div key={index} className="restaurant">
                <h4>{restaurant.name}</h4>
                <p>菜系: {restaurant.cuisine}</p>
                <p>位置: {restaurant.location}</p>
                <p>价格范围: {restaurant.price_range}</p>
                <p>{restaurant.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.total_estimated_cost && (
        <div className="total-cost">
          <h3>总预估费用: {itinerary.total_estimated_cost}</h3>
        </div>
      )}

      {itinerary.tips && (
        <div className="itinerary-section">
          <h3>旅行提示</h3>
          <ul className="tips-list">
            {itinerary.tips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ItineraryDisplay;