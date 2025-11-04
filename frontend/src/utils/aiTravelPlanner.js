// AI Travel Planner utility using backend API
import apiService from '../services/api';

// AI Travel Planner utility using backend API
class AITravelPlanner {
  // Generate a travel plan based on user input
  async generateTravelPlan(request) {
    try {
      // Call our backend API which would connect to Alibaba Cloud
      const itinerary = await apiService.generateTravelPlan(request);
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