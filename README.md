# TwitchFarm Dashboard

A Twitch dashboard that automates point farming, tracks watchtime, and makes intelligent predictions with a simple mobile-friendly interface.

## Features
- 🔐 User authentication with easy login
- 📱 Mobile-friendly responsive design
- 💰 Automatic channel points farming
- ⏱️ Watchtime tracking for drops
- 📊 Smart predictions using AI
- 📈 Detailed stats and tracking

## Prerequisites
- Node.js 18+ 
- Twitch Developer Account with API keys

## Local Development
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set environment variables:
   ```
   TWITCH_CLIENT_ID=your_client_id
   TWITCH_CLIENT_SECRET=your_client_secret
   SESSION_SECRET=your_session_secret
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Deployment on Render.com

This application is configured to be easily deployed on Render.com

### Steps to Deploy

1. Sign up for a [Render account](https://render.com/)
2. Fork/clone this repository to your GitHub account
3. In Render dashboard, click "New +" and select "Web Service"
4. Connect your GitHub repository
5. Use the following settings:
   - **Name**: twitch-dashboard (or your preferred name)
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variables:
   - `NODE_ENV`: production
   - `PORT`: 10000
   - `TWITCH_CLIENT_ID`: Your Twitch client ID
   - `TWITCH_CLIENT_SECRET`: Your Twitch client secret
   - `SESSION_SECRET`: Random string for session encryption
7. Click "Create Web Service"

The application will be deployed and available at your Render URL.

### Important Notes for Twitch Integration

You'll need to add your Render.com application URL to the list of authorized redirect URIs in your Twitch Developer Console:

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Select your application
3. Add `https://your-render-app.onrender.com/api/auth/twitch/callback` to the "OAuth Redirect URLs"

## License
MIT