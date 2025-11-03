// Example configuration file
// Copy this to config.js and update with your values

export const config = {
  apiUrl: process.env.REACT_APP_API_URL || 'https://your-api-gateway-url.amazonaws.com/prod/',
  
  // Poll refresh interval (milliseconds)
  pollRefreshInterval: 3000,
  
  // Maximum options per poll
  maxPollOptions: 6,
  
  // Minimum options per poll  
  minPollOptions: 2,
};


