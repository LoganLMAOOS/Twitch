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

### First-time Setup After Deployment

1. Access your application at the Render.com URL
2. Register a new user account (this is separate from your Twitch account)
   - Example: Create a user with username "admin" and a secure password
3. After logging in, click "Connect with Twitch" to link your Twitch account
   - This requires you to be logged in first to your application account
   - Then you'll be redirected to Twitch to authorize the application
4. Once connected, you'll be able to add channels and start using all features

**Important**: The two-step authentication process (local account + Twitch) provides better security and flexibility. Your local account stores your preferences and settings, while the Twitch connection enables interaction with Twitch features.

### Important Notes for Twitch Integration

You'll need to add your Render.com application URL to the list of authorized redirect URIs in your Twitch Developer Console:

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Select your application
3. Add `https://your-render-app.onrender.com/api/auth/twitch/callback` to the "OAuth Redirect URLs"

## Troubleshooting Deployment

### Twitch Authentication Fails
- Check that your TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables are set correctly
- Verify that your redirect URI in the Twitch Developer Console matches your actual application URL
- Make sure you're logged in to your application first before trying to connect with Twitch

### Login Issues
- If you can't log in, try registering a new account
- Check server logs in the Render dashboard for any authentication errors
- Try clearing your browser cookies and cache

### Application Not Loading
- Check if the Render service is running properly
- Verify that the build completed successfully in the Render logs
- Make sure all environment variables are configured correctly

## License
MIT