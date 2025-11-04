# AI Travel Planner

A web-based AI travel planner that helps users create personalized travel itineraries using voice input and AI technology.

## 🌟 Features

- **🎤 Voice-Based Planning**: Describe your travel plans using voice recognition
- **🤖 AI-Powered Itineraries**: Generate detailed travel plans with AI assistance
- **💰 Budget Tracking**: Manage your travel expenses and stay within budget
- **🗺️ Interactive Maps**: Visualize your travel route and destinations
- **☁️ Cloud Sync**: Access your plans from any device
- **🔐 User Authentication**: Securely save and manage multiple travel plans

## 🛠️ Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: Custom backend API (with Supabase integration ready)
- **Voice Recognition**: Web Speech API (with iFlytek support)
- **Maps**: Baidu Maps API (placeholder implemented)
- **AI**: Alibaba Cloud Bailian API (integrated via backend)
- **Styling**: CSS3 with responsive design

## 📁 Project Structure

```
AI_Travel_Planner/
├── frontend/                 # React frontend application
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── utils/            # Utility functions
│   │   ├── services/         # API services
│   │   ├── App.jsx           # Main application component
│   │   └── main.jsx          # Entry point
│   ├── index.html            # HTML template
│   └── vite.config.js        # Vite configuration
├── backend/                  # Node.js backend server
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
├── docs/                     # Documentation
├── README.md                 # Project overview (this file)
└── .gitignore                # Git ignore file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AI_Travel_Planner
   ```

2. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies:**
   ```bash
   cd ../backend
   npm install
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will start on port 3001.

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will start on port 5173.

3. **Open your browser** and navigate to `http://localhost:5173`

## 🔧 Configuration

To use the full functionality of the application, you'll need to configure API keys:

1. **Frontend Configuration:**
   Create a `.env` file in the `frontend` directory with your API keys.

2. **Backend Configuration:**
   Create a `.env` file in the `backend` directory with your API keys.

Refer to the [Setup Guide](docs/setup.md) for detailed configuration instructions.

## 🎯 Core Functionality

### 1. Intelligent Trip Planning
- Use voice or text to describe your travel needs
- AI generates a complete itinerary including:
  - Day-by-day activities
  - Accommodation recommendations
  - Transportation options
  - Restaurant suggestions
  - Budget estimates

### 2. Expense Management
- Track travel expenses in real-time
- Categorize spending (food, accommodation, transport, etc.)
- Visualize spending patterns
- Stay within your budget with alerts

### 3. User Management
- Secure user registration and login
- Save multiple travel plans
- Access plans from any device
- Privacy-focused data handling

## 📱 User Interface

The application features a modern, responsive design that works on:
- Desktop computers
- Tablets
- Mobile devices

Key UI components:
- Voice input controls
- Interactive map visualization
- Detailed itinerary display
- Expense tracking dashboard
- User authentication system

## 🔄 Data Synchronization

Travel plans are automatically synchronized across devices when:
- Changes are made to an itinerary
- New expenses are added
- Plans are updated or deleted

## 🔒 Security

- User data is securely stored
- API keys are managed through environment variables
- Authentication protects user-specific data
- HTTPS recommended for production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and feature requests, please:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

## 🙏 Acknowledgments

- Alibaba Cloud for AI services
- Baidu Maps for geolocation services
- iFlytek for voice recognition technology
- Supabase for database solutions
- React and Vite communities for excellent tools