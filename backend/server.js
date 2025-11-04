const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for travel plans
let travelPlans = [];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Travel Planner Backend is running!' });
});

// Generate travel plan using AI (mock implementation)
app.post('/api/generate-plan', (req, res) => {
  const { request } = req.body;
  
  // In a real implementation, this would call the Alibaba Cloud API
  // For this demo, we'll return a sample travel plan
  
  const sampleItinerary = {
    id: 'plan-' + Date.now(),
    destination: "Japan",
    duration: "5 days",
    budget: "10,000 RMB",
    itinerary: [
      {
        day: 1,
        date: "Day 1",
        activities: [
          {
            time: "09:00",
            activity: "Arrival at Tokyo Station",
            location: "Tokyo Station",
            details: "Meet and greet with local guide",
            estimated_cost: "0 RMB"
          },
          {
            time: "12:00",
            activity: "Lunch at Tsukiji Outer Market",
            location: "Tsukiji Outer Market",
            details: "Fresh sushi and seafood",
            estimated_cost: "150 RMB"
          }
        ]
      }
    ],
    accommodations: [
      {
        name: "Tokyo Family Hotel",
        location: "Shinjuku",
        price_range: "800-1200 RMB/night",
        booking_link: "https://example.com"
      }
    ],
    transportation: [
      {
        type: "Airport Transfer",
        details: "Private car from airport to hotel",
        estimated_cost: "800 RMB"
      }
    ],
    restaurants: [
      {
        name: "Sukiyabashi Jiro",
        cuisine: "Sushi",
        location: "Ginza",
        price_range: "3000-5000 RMB",
        recommendation: "World-famous sushi restaurant (requires reservation)"
      }
    ],
    total_estimated_cost: "5000 RMB",
    tips: [
      "Purchase a 7-day JR Pass if planning to travel between cities",
      "Download Google Translate app for language assistance"
    ]
  };
  
  travelPlans.push(sampleItinerary);
  
  res.json(sampleItinerary);
});

// Get all travel plans
app.get('/api/travel-plans', (req, res) => {
  res.json(travelPlans);
});

// Get a specific travel plan
app.get('/api/travel-plans/:id', (req, res) => {
  const plan = travelPlans.find(p => p.id === req.params.id);
  if (plan) {
    res.json(plan);
  } else {
    res.status(404).json({ error: 'Travel plan not found' });
  }
});

// Save a travel plan
app.post('/api/travel-plans', (req, res) => {
  const plan = { id: 'plan-' + Date.now(), ...req.body };
  travelPlans.push(plan);
  res.status(201).json(plan);
});

// Update a travel plan
app.put('/api/travel-plans/:id', (req, res) => {
  const index = travelPlans.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    travelPlans[index] = { ...travelPlans[index], ...req.body };
    res.json(travelPlans[index]);
  } else {
    res.status(404).json({ error: 'Travel plan not found' });
  }
});

// Delete a travel plan
app.delete('/api/travel-plans/:id', (req, res) => {
  const index = travelPlans.findIndex(p => p.id === req.params.id);
  if (index !== -1) {
    const deletedPlan = travelPlans.splice(index, 1);
    res.json(deletedPlan[0]);
  } else {
    res.status(404).json({ error: 'Travel plan not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});