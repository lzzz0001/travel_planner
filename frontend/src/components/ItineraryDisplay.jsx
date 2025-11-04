import React from 'react';
import MapComponent from './MapComponent';

const ItineraryDisplay = ({ itinerary }) => {
  if (!itinerary) {
    return null;
  }

  // Extract locations for the map component
  const locations = itinerary.itinerary?.flatMap(day => 
    day.activities?.map(activity => ({
      name: activity.location || activity.activity,
      type: 'activity'
    })) || []
  ) || [];

  return (
    <div className="itinerary-display">
      <h2>Your AI-Generated Travel Plan</h2>
      
      <div className="itinerary-summary">
        <div className="summary-item">
          <h3>Destination</h3>
          <p>{itinerary.destination}</p>
        </div>
        <div className="summary-item">
          <h3>Duration</h3>
          <p>{itinerary.duration}</p>
        </div>
        <div className="summary-item">
          <h3>Budget</h3>
          <p>{itinerary.budget}</p>
        </div>
      </div>

      <MapComponent locations={locations} />

      <div className="itinerary-details">
        {itinerary.itinerary?.map((day, index) => (
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
                      <p className="activity-cost">Est. Cost: {activity.estimated_cost}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {itinerary.accommodations && (
        <div className="itinerary-section">
          <h3>Accommodations</h3>
          <div className="accommodations-list">
            {itinerary.accommodations.map((hotel, index) => (
              <div key={index} className="accommodation">
                <h4>{hotel.name}</h4>
                <p>Location: {hotel.location}</p>
                <p>Price Range: {hotel.price_range}</p>
                {hotel.booking_link && (
                  <a href={hotel.booking_link} target="_blank" rel="noopener noreferrer">
                    Book Now
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.transportation && (
        <div className="itinerary-section">
          <h3>Transportation</h3>
          <div className="transportation-list">
            {itinerary.transportation.map((transport, index) => (
              <div key={index} className="transportation">
                <h4>{transport.type}</h4>
                <p>{transport.details}</p>
                <p>Est. Cost: {transport.estimated_cost}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.restaurants && (
        <div className="itinerary-section">
          <h3>Restaurant Recommendations</h3>
          <div className="restaurants-list">
            {itinerary.restaurants.map((restaurant, index) => (
              <div key={index} className="restaurant">
                <h4>{restaurant.name}</h4>
                <p>Cuisine: {restaurant.cuisine}</p>
                <p>Location: {restaurant.location}</p>
                <p>Price Range: {restaurant.price_range}</p>
                <p>{restaurant.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {itinerary.total_estimated_cost && (
        <div className="total-cost">
          <h3>Total Estimated Cost: {itinerary.total_estimated_cost}</h3>
        </div>
      )}

      {itinerary.tips && (
        <div className="itinerary-section">
          <h3>Travel Tips</h3>
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