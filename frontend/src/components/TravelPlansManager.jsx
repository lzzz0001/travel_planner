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
      setTravelPlans(updatedPlans);
    });
    
    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Load travel plans from backend
  const loadTravelPlans = async () => {
    try {
      setLoading(true);
      const plans = await travelPlannerClient.getTravelPlans();
      setTravelPlans(plans);
    } catch (err) {
      setError('Failed to load travel plans: ' + err.message);
    } finally {
      setLoading(false);
    }
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
    if (window.confirm('Are you sure you want to delete this travel plan?')) {
      try {
        await travelPlannerClient.deleteTravelPlan(planId);
        // Update local state
        setTravelPlans(travelPlans.filter(plan => plan.id !== planId));
      } catch (err) {
        setError('Failed to delete travel plan: ' + err.message);
      }
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div className="travel-plans-manager">Loading travel plans...</div>;
  }

  if (error) {
    return (
      <div className="travel-plans-manager">
        <div className="error-message">{error}</div>
        <button onClick={loadTravelPlans} className="retry-button">Retry</button>
      </div>
    );
  }

  return (
    <div className="travel-plans-manager">
      <div className="plans-header">
        <h2>Your Travel Plans</h2>
        <button onClick={loadTravelPlans} className="sync-button">🔄 Sync</button>
      </div>
      
      {travelPlans.length === 0 ? (
        <div className="no-plans">
          <p>You don't have any saved travel plans yet.</p>
          <p>Plan a trip to see it appear here!</p>
        </div>
      ) : (
        <div className="plans-list">
          {travelPlans.map(plan => (
            <div 
              key={plan.id} 
              className="plan-card"
              onClick={() => handlePlanSelect(plan)}
            >
              <div className="plan-header">
                <h3>{plan.destination || 'Travel Plan'}</h3>
                <button 
                  className="delete-button"
                  onClick={(e) => handleDeletePlan(plan.id, e)}
                >
                  ×
                </button>
              </div>
              <div className="plan-details">
                <p><strong>Duration:</strong> {plan.duration || 'N/A'}</p>
                <p><strong>Budget:</strong> {plan.budget || 'N/A'}</p>
                <p><strong>Created:</strong> {formatDate(plan.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TravelPlansManager;