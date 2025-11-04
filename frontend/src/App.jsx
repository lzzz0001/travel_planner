import { useState, useEffect } from 'react'
import VoiceInput from './components/VoiceInput'
import Auth from './components/Auth'
import ItineraryDisplay from './components/ItineraryDisplay'
import ExpenseTracker from './components/ExpenseTracker'
import Settings from './components/Settings'
import TravelPlansManager from './components/TravelPlansManager'
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

function App() {
  const [travelRequest, setTravelRequest] = useState('')
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  // Initialize services with settings
  useEffect(() => {
    const settings = settingsManager.getAllSettings();
    
    // In a real implementation, you would pass these settings to the backend
    console.log('Loaded settings:', settings);
  }, []);

  const handleAuthChange = (userData) => {
    setUser(userData)
  }

  const handleVoiceInput = (transcript) => {
    setTravelRequest(transcript)
  }

  // Generate travel plan using AI
  const planTrip = async () => {
    if (!travelRequest.trim()) {
      setError('Please enter your travel request')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const generatedItinerary = await aiTravelPlanner.generateTravelPlan(travelRequest)
      setItinerary(generatedItinerary)
      
      // If user is logged in, save the itinerary
      if (user) {
        await travelPlannerClient.saveTravelPlan(generatedItinerary)
        console.log('Itinerary saved')
      }
    } catch (err) {
      setError(err.message || 'Failed to generate travel plan')
    } finally {
      setLoading(false)
    }
  }

  // Handle plan selection from travel plans manager
  const handlePlanSelect = (plan) => {
    setItinerary(plan)
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <h1>AI Travel Planner</h1>
          <button className="settings-button" onClick={() => setShowSettings(true)}>
            ⚙️ Settings
          </button>
        </div>
        <p>Plan your perfect trip with AI assistance</p>
        
        <Auth onAuthChange={handleAuthChange} />
        
        {user && (
          <>
            <div className="travel-planner">
              <h2>Tell us about your trip</h2>
              <p>Describe your travel plans using voice or text</p>
              
              <VoiceInput onTranscript={handleVoiceInput} />
              
              <div className="text-input">
                <textarea
                  value={travelRequest}
                  onChange={(e) => setTravelRequest(e.target.value)}
                  placeholder="Or type your travel request here... e.g. 'I want to go to Japan for 5 days with a budget of 10,000 RMB, I like food and anime, traveling with kids'"
                  rows="4"
                  cols="50"
                />
              </div>
              
              <button className="plan-button" onClick={planTrip} disabled={loading}>
                {loading ? 'Planning...' : 'Plan My Trip'}
              </button>
              
              {error && (
                <div className="error-message">
                  <p>{error}</p>
                </div>
              )}
            </div>
            
            <TravelPlansManager onPlanSelect={handlePlanSelect} />
          </>
        )}

        {itinerary && (
          <>
            <ItineraryDisplay itinerary={itinerary} />
            <ExpenseTracker itinerary={itinerary} />
          </>
        )}
      </header>
      
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

export default App