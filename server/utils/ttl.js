const getSecondsFromExpiry = (expiry) => {
  const expiryMap = {
    '1m': 60,           // 1 minute
    '10m': 600,         // 10 minutes
    '1h': 3600,         // 1 hour
    '1d': 86400,        // 1 day
    'once': 86400,      // 1 day (but marked for single use)
  };

  return expiryMap[expiry] || 3600; // Default to 1 hour
};

const isOneTimeExpiry = (expiry) => {
  return expiry === 'once';
};

export { getSecondsFromExpiry, isOneTimeExpiry };