import apiService from '../services/api';
import { createClient } from '@supabase/supabase-js';

// Client to communicate with our backend API
class TravelPlannerClient {
  constructor() {
    this.user = null;
    this.travelPlans = []; // Local cache of travel plans
    this.supabase = null;
    
    // Initialize Supabase client with credentials from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      this.initializeSupabaseClient(supabaseUrl, supabaseKey);
    } else {
      console.warn('Supabase credentials not found, using mock authentication');
    }
  }
  
  // Initialize or reinitialize the Supabase client
  init(supabaseUrl, supabaseKey) {
    if (!supabaseUrl || !supabaseKey) {
      console.error('Invalid Supabase credentials');
      throw new Error('Supabase URL and API Key are required');
    }
    
    this.initializeSupabaseClient(supabaseUrl, supabaseKey);
    console.log('Supabase client reinitialized with new credentials');
    
    // If user was logged in before, we might need to re-authenticate
    // For simplicity, we'll clear the user state
    this.user = null;
    this.travelPlans = [];
    
    return true;
  }
  
  // Internal method to initialize the Supabase client
  initializeSupabaseClient(supabaseUrl, supabaseKey) {
    // Configure Supabase with proper settings
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        // Disable email confirmations for simpler authentication
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.log('Supabase client initialized');
  }

  // Sign up a new user (real implementation with Supabase)
  async signUp(email, password) {
    // If we don't have Supabase client, use mock implementation
    if (!this.supabase) {
      console.log('Using mock signup for user:', email);
      this.user = { id: 'user-' + Date.now(), email };
      return this.user;
    }

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        // Disable email confirmation
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true
        }
      });
      
      if (error) throw error;
      
      // For immediate access without email confirmation
      // Create a simplified user object without email confirmation checks
      this.user = {
        id: data.user.id,
        email: data.user.email
      };
      return this.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Sign in an existing user (real implementation with Supabase)
  async signIn(email, password) {
    // If we don't have Supabase client, use mock implementation
    if (!this.supabase) {
      console.log('Using mock signin for user:', email);
      this.user = { id: 'user-' + Date.now(), email };
      return this.user;
    }

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Create a simplified user object without email confirmation checks
      this.user = {
        id: data.user.id,
        email: data.user.email
      };
      return this.user;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  // Sign out the current user
  async signOut() {
    // If we don't have Supabase client, use mock implementation
    if (!this.supabase) {
      console.log('Using mock signout');
      this.user = null;
      this.travelPlans = [];
      return;
    }

    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) throw error;
      
      this.user = null;
      this.travelPlans = [];
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  }

  // Check if user's email is confirmed (always return true now)
  isEmailConfirmed() {
    // Always return true since we're not requiring email confirmation
    return true;
  }

  // Get the current user
  getCurrentUser() {
    return this.user;
  }

  // Save a travel plan
  async saveTravelPlan(plan) {
    // 不再强制要求用户登录，允许未登录用户保存旅行计划到本地
    if (!this.user) {
      console.log('User not authenticated, saving plan to local cache only');
      // 生成一个临时ID
      const planWithId = { ...plan, id: 'local-plan-' + Date.now() };
      this.travelPlans.push(planWithId);
      return planWithId;
    }

    // No email confirmation required anymore
    try {
      const planWithId = await apiService.saveTravelPlan(plan);
      console.log('Saving travel plan for user:', this.user.id);
      
      // Add to local cache
      this.travelPlans.push(planWithId);
      
      return planWithId;
    } catch (error) {
      console.error('Error saving travel plan:', error);
      // 发生错误时，保存到本地缓存
      const planWithId = { ...plan, id: 'local-error-plan-' + Date.now() };
      this.travelPlans.push(planWithId);
      return planWithId;
    }
  }

  // Get all travel plans for the current user
  async getTravelPlans() {
    // 不再强制要求用户登录，允许未登录用户查看旅行计划
    if (!this.user) {
      console.log('User not authenticated, returning cached plans');
      return this.travelPlans || [];
    }

    // No email confirmation required anymore
    try {
      const plans = await apiService.getTravelPlans();
      console.log('Retrieving travel plans for user:', this.user.id);
      this.travelPlans = plans;
      return plans;
    } catch (error) {
      console.error('Error retrieving travel plans:', error);
      // 发生错误时返回缓存的旅行计划，而不是抛出错误
      return this.travelPlans || [];
    }
  }

  // Update a travel plan
  async updateTravelPlan(planId, updates) {
    // 不再强制要求用户登录，允许未登录用户更新本地缓存中的旅行计划
    if (!this.user) {
      console.log('User not authenticated, updating plan in local cache only');
      // 只更新本地缓存
      const index = this.travelPlans.findIndex(plan => plan.id === planId);
      if (index !== -1) {
        this.travelPlans[index] = { ...this.travelPlans[index], ...updates };
        return this.travelPlans[index];
      }
      throw new Error('Travel plan not found in local cache');
    }

    // No email confirmation required anymore
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
      // 尝试更新本地缓存
      const index = this.travelPlans.findIndex(plan => plan.id === planId);
      if (index !== -1) {
        this.travelPlans[index] = { ...this.travelPlans[index], ...updates };
        return this.travelPlans[index];
      }
      throw error;
    }
  }

  // Delete a travel plan
  async deleteTravelPlan(planId) {
    // 不再强制要求用户登录，允许未登录用户删除本地缓存中的旅行计划
    if (!this.user) {
      console.log('User not authenticated, deleting plan from local cache only');
      // 只从本地缓存删除
      const initialLength = this.travelPlans.length;
      this.travelPlans = this.travelPlans.filter(plan => plan.id !== planId);
      if (this.travelPlans.length === initialLength) {
        throw new Error('Travel plan not found in local cache');
      }
      return { success: true };
    }

    // No email confirmation required anymore
    try {
      console.log('Deleting travel plan:', planId);
      const result = await apiService.deleteTravelPlan(planId);
      
      // Remove from local cache
      this.travelPlans = this.travelPlans.filter(plan => plan.id !== planId);
      
      return result;
    } catch (error) {
      console.error('Error deleting travel plan:', error);
      // 尝试从本地缓存删除
      const initialLength = this.travelPlans.length;
      this.travelPlans = this.travelPlans.filter(plan => plan.id !== planId);
      if (this.travelPlans.length === initialLength) {
        throw error;
      }
      return { success: true, warning: 'Deleted from local cache only' };
    }
  }

  // Sync local changes with backend
  async syncWithCloud() {
    // 不再强制要求用户登录，允许未登录用户进行同步操作
    if (!this.user) {
      console.log('User not authenticated, syncing from local cache only');
      return this.travelPlans || [];
    }

    // No email confirmation required anymore
    console.log('Syncing travel plans with backend for user:', this.user.id);
    
    try {
      // 尝试从后端获取最新数据
      const latestPlans = await apiService.getTravelPlans();
      this.travelPlans = latestPlans;
      return latestPlans;
    } catch (error) {
      console.error('Error syncing travel plans:', error);
      // 发生错误时返回本地缓存的数据
      return this.travelPlans || [];
    }
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