// API service to communicate with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  // Generate travel plan using AI
  async generateTravelPlan(request) {
    const response = await fetch(`${API_BASE_URL}/generate-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // 直接传递request对象，它已经包含了apiKey字段
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate travel plan: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get all travel plans
  async getTravelPlans(userId = 'anonymous') {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // 如果提供了用户ID，添加到请求头中
    if (userId && userId !== 'anonymous') {
      headers['X-User-ID'] = userId;
    }
    
    const url = new URL(`${API_BASE_URL}/travel-plans`);
    // 同时在查询参数中也添加用户ID作为后备
    if (userId) {
      url.searchParams.append('userId', userId);
    }
    
    const response = await fetch(url, {
      headers: headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch travel plans: ${response.statusText}`);
    }

    return await response.json();
  }

  // Get a specific travel plan
  async getTravelPlan(id) {
    const response = await fetch(`${API_BASE_URL}/travel-plans/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch travel plan: ${response.statusText}`);
    }

    return await response.json();
  }

  // Save a travel plan
  async saveTravelPlan(plan) {
    const response = await fetch(`${API_BASE_URL}/travel-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plan),
    });

    if (!response.ok) {
      throw new Error(`Failed to save travel plan: ${response.statusText}`);
    }

    return await response.json();
  }

  // Update a travel plan
  async updateTravelPlan(id, plan) {
    const response = await fetch(`${API_BASE_URL}/travel-plans/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(plan),
    });

    if (!response.ok) {
      throw new Error(`Failed to update travel plan: ${response.statusText}`);
    }

    return await response.json();
  }

  // Delete a travel plan
  async deleteTravelPlan(id) {
    const response = await fetch(`${API_BASE_URL}/travel-plans/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete travel plan: ${response.statusText}`);
    }

    return await response.json();
  }
}

// Export a singleton instance
const apiService = new ApiService();
export default apiService;