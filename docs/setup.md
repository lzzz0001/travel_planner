# AI Travel Planner Setup Guide

## Project Overview

The AI Travel Planner is a web application that helps users create personalized travel itineraries using voice input and AI technology. The application features:

- Voice-based travel planning
- AI-powered itinerary generation
- Budget tracking and expense management
- Map integration for navigation
- Cloud synchronization across devices
- User authentication and profile management

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: Supabase
- **Voice Recognition**: Web Speech API (with iFlytek as alternative)
- **Maps**: Baidu Maps API
- **AI**: Alibaba Cloud Bailian API

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 14 or higher)
- npm (version 6 or higher)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AI_Travel_Planner
```

### 2. Frontend Setup

Navigate to the frontend directory and install dependencies:

```bash
cd frontend
npm install
```

### 3. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd ../backend
npm install
```

### 4. Environment Configuration

#### Frontend Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
REACT_APP_ALIBABA_CLOUD_API_KEY=your_alibaba_cloud_api_key
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_KEY=your_supabase_api_key
REACT_APP_BAIDU_MAPS_API_KEY=your_baidu_maps_api_key
REACT_APP_IFLYTEK_APP_ID=your_iflytek_app_id
REACT_APP_IFLYTEK_API_KEY=your_iflytek_api_key
```

#### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=3001
ALIBABA_CLOUD_ACCESS_KEY_ID=your_alibaba_cloud_access_key_id
ALIBABA_CLOUD_ACCESS_KEY_SECRET=your_alibaba_cloud_access_key_secret
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_api_key
BAIDU_MAPS_API_KEY=your_baidu_maps_api_key
```

### 5. API Keys Setup

You'll need to obtain API keys from the following services:

1. **Alibaba Cloud**
   - Sign up at [Alibaba Cloud](https://www.alibabacloud.com/)
   - Create an API key for the Bailian service

2. **Supabase**
   - Sign up at [Supabase](https://supabase.io/)
   - Create a new project and get your project URL and API key

3. **Baidu Maps**
   - Sign up at [Baidu Maps API](http://lbsyun.baidu.com/)
   - Create an application and get your API key

4. **iFlytek (Optional)**
   - Sign up at [iFlytek](https://www.xfyun.cn/)
   - Create an application and get your App ID and API Key

### 6. Running the Application

#### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on port 3001.

#### Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend development server will start on port 5173 by default.

### 7. Building for Production

#### Build the Frontend

```bash
cd frontend
npm run build
```

The built files will be in the `dist` directory.

#### Build the Backend

```bash
cd backend
npm run build
```

## Project Structure

```
AI_Travel_Planner/
├── frontend/                 # React frontend
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   │   ├── components/       # React components
│   │   ├── utils/            # Utility functions
│   │   ├── App.jsx           # Main application component
│   │   └── main.jsx          # Entry point
│   ├── index.html            # HTML template
│   └── vite.config.js        # Vite configuration
├── backend/                  # Node.js backend
│   ├── server.js             # Main server file
│   └── package.json          # Backend dependencies
├── docs/                     # Documentation
├── README.md                 # Project overview
└── .gitignore                # Git ignore file
```

## Features Implementation Status

- [x] Voice recognition using Web Speech API
- [x] Map integration (placeholder for Baidu Maps)
- [x] User authentication with Supabase
- [x] AI travel planning with Alibaba Cloud API
- [x] Budget tracking and expense management
- [x] Settings page for API key configuration
- [x] Cloud synchronization for travel plans

## Troubleshooting

### Common Issues

1. **API Keys Not Working**
   - Ensure all environment variables are correctly set
   - Check that your API keys have the necessary permissions
   - Verify that you haven't exceeded usage limits

2. **Voice Recognition Not Working**
   - Ensure you're using a supported browser (Chrome, Edge)
   - Check that your microphone permissions are enabled
   - Try using the text input as an alternative

3. **Map Not Displaying**
   - Verify your Baidu Maps API key is correct
   - Check that you have an active internet connection
   - Ensure there are no ad blockers interfering with the API

### Getting Help

If you encounter any issues not covered in this guide, please:
1. Check the browser console for error messages
2. Verify all environment variables are correctly set
3. Ensure all dependencies are properly installed
4. Check the API documentation for the services being used

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.