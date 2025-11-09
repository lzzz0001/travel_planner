import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import settingsManager from '../utils/settingsManager';

const MapComponent = forwardRef(({ itinerary }, ref) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const contextMenuRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    updateMarkers: (locations) => {
      if (locations && locations.length > 0) {
        addMarkers(locations);
      }
    },
    setMapType: (mapType) => {
      if (mapRef.current && window.BMapGL) {
        const BMapGL = window.BMapGL;
        console.log(`设置为标准地图`);
        // 始终使用标准地图
        mapRef.current.setMapType(BMapGL.BMAP_NORMAL_MAP);
      }
    },
    // 添加resize方法，用于在组件可见性变化时重新渲染地图
    resize: () => {
      if (mapRef.current) {
        console.log('地图组件执行resize方法');
        
        // 先检查地图容器是否可见
        const container = mapContainerRef.current;
        if (!container) return;
        
        const isVisible = () => {
          const rect = container.getBoundingClientRect();
          return (
            rect.width > 0 && 
            rect.height > 0 && 
            rect.top <= window.innerHeight && 
            rect.bottom >= 0 && 
            rect.left <= window.innerWidth && 
            rect.right >= 0
          );
        };
        
        console.log(`地图容器可见性检查: ${isVisible() ? '可见' : '不可见'}`);
        
        try {
          // 百度地图重绘方法 - 只使用确认支持的方法
          // 首先使用setViewport方法
          const viewport = mapRef.current.getViewport();
          mapRef.current.setViewport(viewport, { 
            margins: [50, 50, 50, 50],
            animation: false // 禁用动画以提高性能
          });
          
          // 获取当前中心点和缩放级别
          const center = mapRef.current.getCenter();
          const zoom = mapRef.current.getZoom();
          
          // 重新设置中心点和缩放级别，强制重绘地图
          if (center && zoom) {
            mapRef.current.centerAndZoom(center, zoom);
          } else {
            // 如果无法获取中心点，设置默认中心点（北京）
            const defaultPoint = new window.BMapGL.Point(116.404, 39.915);
            mapRef.current.centerAndZoom(defaultPoint, 10);
          }
          
          // 强制刷新地图图层
          if (typeof mapRef.current.redraw === 'function') {
            mapRef.current.redraw();
          } else {
            // 如果没有redraw方法，通过设置地图类型来触发重绘
            mapRef.current.setMapType(window.BMapGL.BMAP_NORMAL_MAP);
          }
          
          console.log('地图resize方法执行完成');
        } catch (error) {
          console.error('执行地图resize时出错:', error);
          // 即使出错，也尝试一个简单的重绘
          try {
            mapRef.current.setMapType(window.BMapGL.BMAP_NORMAL_MAP);
          } catch (innerError) {
            console.error('尝试简单重绘也失败:', innerError);
          }
        }
      }
    }
  }));
  
  // 加载百度地图API
  const loadBaiduMap = () => {
    return new Promise((resolve, reject) => {
      // 检查是否已经加载
      if (window.BMapGL) {
        console.log('百度地图API已加载，直接使用缓存实例');
        resolve(window.BMapGL);
        return;
      }
      
      // 获取API密钥
      let apiKey;
      let keySource = '';
      try {
        const localKey = settingsManager.getSetting('baiduMapsApiKey'); // 修改键名以匹配Settings.jsx中的保存键名
        const envKey = import.meta.env.VITE_BAIDU_MAPS_API_KEY;
        
        if (localKey) {
          apiKey = localKey;
          keySource = 'localStorage';
        } else if (envKey) {
          apiKey = envKey;
          keySource = '.env文件';
        }
        
        console.log(`获取百度地图API密钥，来源: ${keySource}`);
        console.log(`使用的API密钥(部分显示): ${apiKey ? '*'.repeat(apiKey.length - 8) + apiKey.slice(-8) : '无'}`);
        
      } catch (error) {
        console.error('获取设置失败:', error);
        apiKey = import.meta.env.VITE_BAIDU_MAPS_API_KEY;
        keySource = '.env文件(捕获错误后)';
      }
      
      if (!apiKey) {
        reject(new Error('百度地图API密钥未配置，请在设置中添加'));
        return;
      }
      
      // 创建script标签
      const script = document.createElement('script');
      // 添加调试参数
      script.src = `https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${apiKey}&callback=initBaiduMap`;
      console.log(`正在加载百度地图API，URL: ${script.src.replace(apiKey, '*'.repeat(apiKey.length - 8) + apiKey.slice(-8))}`);
      
      // 重写onerror以获取更详细信息
      script.onerror = (event) => {
        console.error('百度地图API加载失败:', event);
        reject(new Error('百度地图API加载失败，请检查网络连接或API密钥是否正确'));
      };
      
      // 设置超时处理
      const timeoutId = setTimeout(() => {
        console.error('百度地图API加载超时');
        reject(new Error('百度地图API加载超时，请检查网络连接或API密钥是否有效'));
        try {
          document.head.removeChild(script);
        } catch (e) {}
      }, 10000);
      
      script.onload = () => {
        console.log('百度地图API脚本加载完成');
        clearTimeout(timeoutId);
      };
      
      document.head.appendChild(script);
      
      // 定义全局回调函数
      window.initBaiduMap = () => {
        console.log('百度地图API初始化完成，BMapGL对象可用');
        resolve(window.BMapGL);
        // 移除script标签和回调函数
        try {
          document.head.removeChild(script);
        } catch (e) {}
        delete window.initBaiduMap;
        clearTimeout(timeoutId);
      };
      
      // 捕获百度地图可能抛出的全局错误
      window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('APP被禁用') || e.message.includes('百度地图')) {
          console.error('百度地图API错误:', e.message);
        }
      }, true);
    });
  };
  
  // 创建右键菜单
  const createContextMenu = () => {
    if (!mapRef.current || !window.BMapGL) return;
    
    const BMapGL = window.BMapGL;
    const menu = new BMapGL.ContextMenu();
    
    // 定义菜单项
    const txtMenuItem = [
      {
        text: '放大',
        callback: function() {
          mapRef.current.zoomIn();
        }
      },
      {
        text: '缩小',
        callback: function() {
          mapRef.current.zoomOut();
        }
      },
      {
        text: '返回中心点',
        callback: function() {
          mapRef.current.centerAndZoom(new BMapGL.Point(116.404, 39.915), 10);
        }
      }
    ];
    
    // 添加菜单项
    for (let i = 0; i < txtMenuItem.length; i++) {
      menu.addItem(new BMapGL.MenuItem(
        txtMenuItem[i].text,
        txtMenuItem[i].callback,
        {
          width: 300,
          id: 'menu' + i
        }
      ));
    }
    
    // 给地图添加右键菜单
    mapRef.current.addContextMenu(menu);
    contextMenuRef.current = menu;
  };
  
  // 初始化地图
  const initMap = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('开始初始化百度地图...');
      const BMapGL = await loadBaiduMap();
      
      // 如果地图容器不存在，不初始化地图
      if (!mapContainerRef.current) {
        console.error('地图容器不存在');
        setIsLoading(false);
        return;
      }
      
      console.log('开始创建地图实例...');
      // 注意：根据百度地图文档，需要使用BD09坐标系统
      // 不设置全局coordType，使用默认的BD09坐标系
      
      // 创建地图实例 - 简化配置，使用默认参数
      const map = new BMapGL.Map(mapContainerRef.current);
      
      // 默认中心点（北京）
      const point = new BMapGL.Point(116.404, 39.915);
      map.centerAndZoom(point, 10);
      
      // 添加控件 - 完善控件设置
      map.enableScrollWheelZoom(true);
      
      // 导航控件
      map.addControl(new BMapGL.NavigationControl({
        anchor: BMapGL.BMAP_ANCHOR_TOP_RIGHT,
        type: BMapGL.BMAP_NAVIGATION_CONTROL_LARGE
      }));
      
      // 比例尺控件 - 设置位置偏移
      const scaleOpts = {
        anchor: BMapGL.BMAP_ANCHOR_BOTTOM_LEFT,
        offset: new BMapGL.Size(150, 5)
      };
      map.addControl(new BMapGL.ScaleControl(scaleOpts));
      
      // 缩放控件
      map.addControl(new BMapGL.ZoomControl({
        anchor: BMapGL.BMAP_ANCHOR_TOP_LEFT
      }));
      
      // 城市列表控件
      map.addControl(new BMapGL.CityListControl({
        anchor: BMapGL.BMAP_ANCHOR_TOP_LEFT
      }));
      
      // 创建右键菜单
      createContextMenu();
      
      // 保存地图实例
      mapRef.current = map;
      setMapLoaded(true);
      console.log('地图初始化成功，可进行交互操作');
      
      // 添加WebGL错误监听器，但不影响地图功能
      if (typeof window.WebGLRenderingContext !== 'undefined') {
        const originalErrorCallback = window.WebGLRenderingContext.prototype.getError;
        window.WebGLRenderingContext.prototype.getError = function() {
          const error = originalErrorCallback.call(this);
          if (error === 36054) { // FRAMEBUFFER_INCOMPLETE_ATTACHMENT
            console.warn('WebGL Frame buffer警告(36054)：这是常见的渲染警告，通常不影响地图基本功能');
          }
          return error;
        };
      }
      
      // 如果有行程数据，添加标记
      const locations = itinerary?.locations || itinerary?.places;
      if (locations && locations.length > 0) {
        addMarkers(locations);
      }
      
    } catch (err) {
      console.error('地图初始化失败:', err);
      
      // 特殊处理百度地图API弹窗错误的情况
      // 即使API密钥有问题，百度地图可能仍会加载基础地图，但会弹出错误提示
      if (window.BMapGL && mapContainerRef.current) {
        console.warn('API加载出错但BMapGL对象可用，尝试创建基础地图...');
        try {
          // 尝试创建基础地图，不显示错误弹窗
          const map = new BMapGL.Map(mapContainerRef.current);
          const point = new BMapGL.Point(116.404, 39.915);
          map.centerAndZoom(point, 10);
          map.enableScrollWheelZoom(true);
          mapRef.current = map;
          setMapLoaded(true);
          console.warn('已创建基础地图，但API密钥可能存在问题，建议检查');
          
          // 显示警告而非错误，允许用户继续使用基础功能
          setError('⚠️ 百度地图API密钥可能存在问题，基础地图功能可用但某些高级功能可能受限。请检查API密钥状态。');
        } catch (innerErr) {
          console.error('创建基础地图也失败:', innerErr);
          setError('百度地图无法加载，请检查API密钥或网络连接。');
        }
      } else {
        // 检查错误是否可能是API密钥无效或服务被禁用
        if (err.message.includes('加载失败') || err.message.includes('超时')) {
          setError('百度地图API服务可能被禁用或密钥无效。请访问 http://lbsyun.baidu.com/apiconsole/key# 检查API密钥状态。');
        } else {
          setError(err.message);
        }
      }
    } finally {
      setIsLoading(false);
      // 优化状态判断 - 如果mapRef.current存在且已设置，即使有WebGL警告也应视为成功
      const actualStatus = mapRef.current ? '成功' : '失败';
      console.log('地图初始化过程完成，状态:', actualStatus, 
        mapRef.current && window.BMapGL ? '地图可交互，WebGL警告不影响功能' : '');
    }
  };
  
  // 添加标记
  const addMarkers = (places) => {
    if (!mapRef.current || !places || places.length === 0) return;
    
    const BMapGL = window.BMapGL;
    
    // 清除现有标记
    clearMarkers();
    
    // 创建地理编码服务
    const geocoder = new BMapGL.Geocoder();
    let validPoints = 0;
    const points = [];
    
    // 尝试从行程数据中提取城市信息
    let city = '';
    if (itinerary) {
      // 从行程查询中提取城市
      if (itinerary.query) {
        // 常见城市名称列表（可扩展）
        const commonCities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '南京', '重庆', 
                            '苏州', '天津', '长沙', '郑州', '东莞', '青岛', '沈阳', '宁波', '昆明', '福州',
                            '无锡', '厦门', '大连', '合肥', '佛山', '哈尔滨', '济南', '温州', '南宁', '长春'];
        
        // 查找查询中包含的城市名称
        for (const c of commonCities) {
          if (itinerary.query.includes(c)) {
            city = c;
            break;
          }
        }
      }
      // 如果行程中有明确的城市字段，优先使用
      if (itinerary.city) {
        city = itinerary.city;
      }
    }
    
    console.log(`当前行程城市: ${city}`);

    // 根据类别获取图标颜色
    const getCategoryColor = (category) => {
      const categoryColors = {
        '住宿': '#FF0000',
        '交通': '#0000FF',
        '景点': '#008000',
        '餐饮': '#FFA500',
        '购物': '#800080',
        '娱乐': '#FFC0CB',
        'attraction': '#008000',
        'food': '#FFA500',
        'accommodation': '#FF0000',
        'transportation': '#0000FF'
      };
      return categoryColors[category] || '#FFD700';
    };

    // 批量创建标记
    places.forEach((place, index) => {
      // 如果已有坐标，直接使用
      if (place.lat && place.lng) {
        const point = new BMapGL.Point(place.lng, place.lat);
        points.push(point);
        createMarker(point, place, index, getCategoryColor(place.category));
        validPoints++;
      } else {
        // 否则进行地理编码
        const address = place.address || place.name;
        if (address) {
          // 使用城市参数进行地理编码，避免相似地名导致的错误定位
          geocoder.getPoint(address, (point) => {
            if (point) {
              // 缓存坐标以供后续使用
              place.lng = point.lng;
              place.lat = point.lat;
              points.push(point);
              createMarker(point, place, index, getCategoryColor(place.category));
              validPoints++;
              
              // 如果是第一个有效点，设置为地图中心点
              if (validPoints === 1) {
                mapRef.current.centerAndZoom(point, 12);
              }
              
              // 如果所有点都处理完毕，调整视图显示所有标记
              if (validPoints === places.length) {
                adjustMapView(points);
              }
            } else {
              console.warn(`无法解析地点: ${address} (城市: ${city})`);
              
              // 如果带城市的地理编码失败，尝试不带城市的地理编码作为备选
              if (city) {
                console.log(`尝试不带城市参数的地理编码: ${address}`);
                geocoder.getPoint(address, (fallbackPoint) => {
                  if (fallbackPoint) {
                    place.lng = fallbackPoint.lng;
                    place.lat = fallbackPoint.lat;
                    points.push(fallbackPoint);
                    createMarker(fallbackPoint, place, index, getCategoryColor(place.category));
                    validPoints++;
                    
                    if (validPoints === 1) {
                      mapRef.current.centerAndZoom(fallbackPoint, 12);
                    }
                    
                    if (validPoints === places.length) {
                      adjustMapView(points);
                    }
                  }
                });
              }
            }
          }, city); // 传递城市参数，限制地理编码范围
        }
      }
    });
    
    // 如果所有点都有坐标，直接调整视图
    if (validPoints > 0 && validPoints === places.length) {
      setTimeout(() => {
        adjustMapView(points);
      }, 300);
    }
  };
  
  // 调整地图视图以显示所有标记
  const adjustMapView = (points) => {
    if (!mapRef.current || points.length === 0) return;
    
    if (points.length === 1) {
      mapRef.current.centerAndZoom(points[0], 13);
    } else {
      const bounds = new BMapGL.Bounds();
      points.forEach(point => bounds.extend(point));
      mapRef.current.setViewport(bounds, {
        margins: [50, 50, 50, 50]
      });
    }
  };
  
  // 创建单个标记
  const createMarker = (point, place, index, color) => {
    if (!mapRef.current) return;
    
    const BMapGL = window.BMapGL;
    
    // 创建标记 - 根据文档要求配置坐标类型
    const marker = new BMapGL.Marker(point, {
      coordType: BMapGL.BMAP_COORD_GCJ02
    });
    
    // 创建信息窗口
    const infoContent = `
      <div style="padding: 10px; line-height: 1.5;">
        <h4 style="margin: 0 0 8px 0; color: ${color};">${place.name}</h4>
        ${place.address ? `<p style="margin: 0 0 4px 0;"><strong>地址：</strong>${place.address}</p>` : ''}
        ${place.description ? `<p style="margin: 0 0 4px 0;"><strong>描述：</strong>${place.description}</p>` : ''}
        ${place.category ? `<p style="margin: 0 0 4px 0;"><strong>类型：</strong>${place.category}</p>` : ''}
        ${place.day ? `<p style="margin: 0;"><strong>天数：</strong>第${place.day}天</p>` : ''}
      </div>
    `;
    
    const infoWindow = new BMapGL.InfoWindow(infoContent, {
      width: 300,
      height: 180,
      enableCloseOnClick: true
    });
    
    // 添加点击事件
    marker.addEventListener('click', () => {
      // 根据文档要求配置坐标类型
      mapRef.current.openInfoWindow(infoWindow, point, {
        coordType: BMapGL.BMAP_COORD_GCJ02
      });
    });
    
    // 添加标记到地图
    mapRef.current.addOverlay(marker);
    markersRef.current.push(marker);
  };
  
  // 清除标记
  const clearMarkers = () => {
    if (!mapRef.current) return;
    
    markersRef.current.forEach(marker => {
      mapRef.current.removeOverlay(marker);
    });
    
    markersRef.current = [];
  };
  
  // 监听行程数据变化
  useEffect(() => {
    const locations = itinerary?.locations || itinerary?.places;
    if (mapLoaded && locations && locations.length > 0) {
      addMarkers(locations);
    }
  }, [itinerary, mapLoaded]);
  
  // 检查元素是否可见
  const isElementVisible = (element) => {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    const isVisible = (
      rect.width > 0 && 
      rect.height > 0 && 
      rect.top <= window.innerHeight && 
      rect.bottom >= 0 && 
      rect.left <= window.innerWidth && 
      rect.right >= 0
    );
    
    console.log(`地图容器可见性检查: ${isVisible ? '可见' : '不可见'}`);
    return isVisible;
  };
  
  // 初始化地图 - 只有在容器可见时才初始化
  useEffect(() => {
    let initAttempts = 0;
    const maxInitAttempts = 10;
    let initInterval;
    
    // 尝试初始化地图的函数
    const tryInitMap = () => {
      initAttempts++;
      
      // 检查容器是否可见且存在
      if (mapContainerRef.current && isElementVisible(mapContainerRef.current)) {
        console.log(`容器可见，开始初始化地图 (尝试 ${initAttempts}/${maxInitAttempts})`);
        initMap();
        clearInterval(initInterval);
      } else if (initAttempts >= maxInitAttempts) {
        console.log(`已达到最大尝试次数 (${maxInitAttempts})，即使容器不可见也尝试初始化地图`);
        // 即使容器不可见，也尝试初始化地图作为最后手段
        if (mapContainerRef.current) {
          initMap();
        }
        clearInterval(initInterval);
      } else {
        console.log(`容器不可见，推迟地图初始化 (尝试 ${initAttempts}/${maxInitAttempts})`);
      }
    };
    
    // 立即尝试一次初始化
    tryInitMap();
    
    // 设置间隔检查，直到容器可见或达到最大尝试次数
    initInterval = setInterval(tryInitMap, 500);
    
    // 添加页面可见性变化监听
    const handleVisibilityChange = () => {
      if (!document.hidden && mapRef.current) {
        console.log('页面变为可见，重绘地图');
        // 调用resize方法进行重绘
        if (typeof mapRef.current.resize === 'function') {
          mapRef.current.resize();
        } else {
          // 如果resize方法不可用，使用备选方法
          try {
            const center = mapRef.current.getCenter();
            const zoom = mapRef.current.getZoom();
            mapRef.current.centerAndZoom(center, zoom);
          } catch (error) {
            console.error('页面可见性变化时重绘地图失败:', error);
          }
        }
      }
    };
    
    // 添加DOM尺寸变化监听
    const handleResize = () => {
      if (mapRef.current) {
        console.log('窗口尺寸变化，调整地图大小');
        setTimeout(() => {
          if (mapRef.current && typeof mapRef.current.resize === 'function') {
            mapRef.current.resize();
          }
        }, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(initInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      
      if (mapRef.current) {
        // 移除右键菜单
        if (contextMenuRef.current) {
          mapRef.current.removeContextMenu(contextMenuRef.current);
        }
        clearMarkers();
        mapRef.current = null;
      }
    };
  }, []);
  
  // 渲染组件内容
  return (
    <div className="map-component" style={{ height: '500px', width: '100%', position: 'relative' }}>
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          zIndex: 1000
        }}>
          <p>加载百度地图中，请稍候...</p>
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: error.includes('⚠️') ? 'rgba(255, 255, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          padding: '15px 20px',
          borderRadius: '8px',
          zIndex: 1000,
          color: error.includes('⚠️') ? '#856404' : '#D8000C',
          maxWidth: '90%',
          textAlign: 'center',
          fontSize: '14px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0 }}>{error}</p>
          {!error.includes('⚠️') && (
            <p style={{ fontSize: '12px', marginTop: '5px', marginBottom: 0 }}>
              请检查百度地图API密钥是否正确配置
            </p>
          )}
          <p style={{ fontSize: '12px', marginTop: '5px', marginBottom: 0, opacity: 0.8 }}>
            使用的密钥来源: {settingsManager.getSetting('baiduMapsApiKey') ? '本地设置' : '.env文件'}
          </p>
        </div>
      )}
      
      <div ref={mapContainerRef} style={{
        height: '100%',
        width: '100%',
        display: isLoading && !error ? 'none' : 'block'
      }}>
        {!mapLoaded && !isLoading && !error && (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5'
          }}>
            <p>地图组件加载失败，请刷新页面重试</p>
          </div>
        )}
      </div>
    </div>
  );
});

MapComponent.displayName = 'MapComponent';

export default MapComponent;