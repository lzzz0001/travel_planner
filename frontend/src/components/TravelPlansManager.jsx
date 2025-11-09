import React, { useState, useEffect } from 'react';
import travelPlannerClient from '../utils/supabaseClient';

const TravelPlansManager = ({ onPlanSelect }) => {
  const [travelPlans, setTravelPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load travel plans on component mount
  useEffect(() => {
    loadTravelPlans();
    
    // Subscribe to real-time changes
    const unsubscribe = travelPlannerClient.onTravelPlanChange((updatedPlans) => {
      // 确保实时更新的数据也经过去重处理
      const uniquePlans = removeDuplicatePlans(updatedPlans);
      setTravelPlans(uniquePlans);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Load travel plans from backend
  const loadTravelPlans = async () => {
    try {
      setLoading(true);
      const plans = await travelPlannerClient.getTravelPlans();
      // 对旅行计划进行去重处理，确保每个计划只显示一次
      const uniquePlans = removeDuplicatePlans(plans);
      setTravelPlans(uniquePlans);
    } catch (err) {
      setError('加载旅行计划失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // 去除重复的旅行计划（基于id）
  const removeDuplicatePlans = (plans) => {
    if (!Array.isArray(plans)) return [];
    
    // 使用Map来存储唯一的计划
    const uniquePlansMap = new Map();
    
    plans.forEach(plan => {
      // 如果plan有id属性，使用id作为键
      if (plan && plan.id) {
        uniquePlansMap.set(plan.id, plan);
      }
    });
    
    // 将Map转换回数组
    return Array.from(uniquePlansMap.values());
  };

  // Handle plan selection
  const handlePlanSelect = (plan) => {
    if (onPlanSelect) {
      onPlanSelect(plan);
    }
  };

  // Handle plan deletion
  const handleDeletePlan = async (planId, e) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这个旅行计划吗？')) {
      try {
        await travelPlannerClient.deleteTravelPlan(planId);
        // Update local state
        setTravelPlans(travelPlans.filter(plan => plan.id !== planId));
      } catch (err) {
        setError('删除旅行计划失败: ' + err.message);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="travel-plans-manager">加载旅行计划中...</div>;
  }

  if (error) {
    return (
      <div className="travel-plans-manager">
        <div className="error-message">{error}</div>
        <button onClick={loadTravelPlans} className="retry-button">重试</button>
      </div>
    );
  }

  return (
    <div className="travel-plans-manager">
      <div className="plans-header">
        <h2>您的旅行计划</h2>
        <button onClick={loadTravelPlans} className="sync-button">🔄 同步</button>
      </div>
      
      {travelPlans.length === 0 ? (
        <div className="no-plans">
          <p>您还没有保存的旅行计划。</p>
          <p>计划一次旅行，就能在这里看到！</p>
        </div>
      ) : (
        <div className="plans-list">
          {travelPlans.map((plan) => (
            <div 
              // 使用plan.id作为唯一key
              key={plan.id} 
              className="plan-card"
              onClick={() => handlePlanSelect(plan)}
            >
              <div className="plan-header">
                <h3>{plan.destination || '旅行计划'}</h3>
                <button 
                  className="delete-button"
                  onClick={(e) => handleDeletePlan(plan.id, e)}
                >
                  ×
                </button>
              </div>
              <div className="plan-details">
                <p><strong>时长:</strong> {plan.duration || '未设置'}</p>
                <p><strong>预算:</strong> {plan.budget || '未设置'}</p>
                <p><strong>创建日期:</strong> {formatDate(plan.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelPlansManager;