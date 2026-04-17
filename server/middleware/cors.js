import cors from 'cors';

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const localhostRegex = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
    const localNetworkRegex = /^http:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)[\d.]+:\d+$/;
    const allowedOrigins = [
      'https://cliphub.netlify.app',
      'https://clipdothub.netlify.app',
      process.env.CLIENT_URL,
      // Add exact frontend domains here if variable isn't set
    ].filter(Boolean);

    if (allowedOrigins.includes(origin) || localhostRegex.test(origin) || localNetworkRegex.test(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

export default cors(corsOptions);
