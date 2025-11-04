import apiService from '../services/api';

// Client to communicate with our backend API
class TravelPlannerClient {
  constructor() {
    this.user = null;
    this.travelPlans = []; // Local cache of travel plans
  }

  // Sign up a new user (mock implementation)
  async signUp(email, password) {
    console.log('Signing up user:', email);
    this.user = { id: 'user-' + Date.now(), email };
    return this.user;
  }

  // Sign in an existing user (mock implementation)
  async signIn(email, password) {
    console.log('Signing in user:', email);
    this.user = { id: 'user-' + Date.now(), email };
    return this.user;
  }

  // Sign out the current user
  async signOut() {
    console.log('Signing out user');
    this.user = null;
    this.travelPlans = [];
  }

  // Get the current user
  getCurrentUser() {
    return this.user;
  }

  // Save a travel plan
  async saveTravelPlan(plan) {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    try {
      const planWithId = await apiService.saveTravelPlan(plan);
      console.log('Saving travel plan for user:', this.user.id);
      
      // Add to local cache
      this.travelPlans.push(planWithId);
      
      return planWithId;
    } catch (error) {
      console.error('Error saving travel plan:', error);
      throw error;
    }
  }

  // Get all travel plans for the current user
  async getTravelPlans() {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    try {
      const plans = await apiService.getTravelPlans();
      console.log('Retrieving travel plans for user:', this.user.id);
      this.travelPlans = plans;
      return plans;
    } catch (error) {
      console.error('Error retrieving travel plans:', error);
      throw error;
    }
  }

  // Update a travel plan
  async updateTravelPlan(planId, updates) {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('Updating travel plan:', planId);
      const updatedPlan = await apiService.updateTravelPlan(planId, updates);
      
      // Update local cache
      const index = this.travelPlans.findIndex(plan => plan.id === planId);
      if (index !== -1) {
        this.travelPlans[index] = updatedPlan;
      }
      
      return updatedPlan;
    } catch (error) {
      console.error('Error updating travel plan:', error);
      throw error;
    }
  }

  // Delete a travel plan
  async deleteTravelPlan(planId) {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    try {
      console.log('Deleting travel plan:', planId);
      const result = await apiService.deleteTravelPlan(planId);
      
      // Remove from local cache
      this.travelPlans = this.travelPlans.filter(plan => plan.id !== planId);
      
      return result;
    } catch (error) {
      console.error('Error deleting travel plan:', error);
      throw error;
    }
  }

  // Sync local changes with backend
  async syncWithCloud() {
    if (!this.user) {
      throw new Error('User not authenticated');
    }

    console.log('Syncing travel plans with backend for user:', this.user.id);
    
    // For this demo, we'll just return the local cache
    return this.travelPlans;
  }

  // Listen for real-time changes (in a real implementation)
  onTravelPlanChange(callback) {
    // In a real implementation, this would subscribe to real-time changes
    console.log('Subscribing to travel plan changes');
    
    // For this demo, we'll simulate changes
    const interval = setInterval(() => {
      // Simulate occasional changes
      if (Math.random() > 0.7 && this.travelPlans.length > 0) {
        callback(this.travelPlans);
      }
    }, 10000);
    
    // Return unsubscribe function
    return () => clearInterval(interval);
  }
}

// Export a singleton instance
const travelPlannerClient = new TravelPlannerClient();
export default travelPlannerClient;