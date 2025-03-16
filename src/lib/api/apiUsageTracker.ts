// Local storage helpers
const getLocalStorageItem = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(key);
};

const setLocalStorageItem = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, value);
};

// API usage keys
const API_DAILY_REQUESTS_KEY = 'api_daily_requests';
const API_MONTHLY_REQUESTS_KEY = 'api_monthly_requests';
const API_DAILY_LIMIT_KEY = 'api_daily_limit';
const API_LAST_RESET_KEY = 'api_last_reset_date';

// Default limits
const DEFAULT_DAILY_LIMIT = 100;

// Get API usage statistics
export const getDailyRequests = (): number => {
  const stored = getLocalStorageItem(API_DAILY_REQUESTS_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

export const getMonthlyRequests = (): number => {
  const stored = getLocalStorageItem(API_MONTHLY_REQUESTS_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

export const getDailyLimit = (): number => {
  const stored = getLocalStorageItem(API_DAILY_LIMIT_KEY);
  return stored ? parseInt(stored, 10) : DEFAULT_DAILY_LIMIT;
};

export const getRemainingDailyRequests = (): number => {
  const limit = getDailyLimit();
  const used = getDailyRequests();
  return Math.max(0, limit - used);
};

// Check if limit is exceeded
export const isDailyLimitExceeded = (): boolean => {
  return getDailyRequests() >= getDailyLimit();
};

// Reset counters if needed
export const checkAndResetCounters = (): void => {
  const today = new Date().toDateString();
  const lastReset = getLocalStorageItem(API_LAST_RESET_KEY);
  
  // Reset daily counter if it's a new day
  if (lastReset !== today) {
    setLocalStorageItem(API_DAILY_REQUESTS_KEY, '0');
    setLocalStorageItem(API_LAST_RESET_KEY, today);
    
    // Check if it's a new month
    const lastResetDate = lastReset ? new Date(lastReset) : null;
    const currentDate = new Date();
    
    if (!lastResetDate || lastResetDate.getMonth() !== currentDate.getMonth() || 
        lastResetDate.getFullYear() !== currentDate.getFullYear()) {
      setLocalStorageItem(API_MONTHLY_REQUESTS_KEY, '0');
    }
  }
};

// Record API usage
export const recordAPIUsage = (): void => {
  // Check and reset counters if needed
  checkAndResetCounters();
  
  // Update daily counter
  const dailyRequests = getDailyRequests();
  setLocalStorageItem(API_DAILY_REQUESTS_KEY, (dailyRequests + 1).toString());
  
  // Update monthly counter
  const monthlyRequests = getMonthlyRequests();
  setLocalStorageItem(API_MONTHLY_REQUESTS_KEY, (monthlyRequests + 1).toString());
};

// Set custom daily limit
export const setDailyLimit = (limit: number): void => {
  setLocalStorageItem(API_DAILY_LIMIT_KEY, limit.toString());
};

// Export as a single API
const apiUsageTracker = {
  getDailyRequests,
  getMonthlyRequests,
  getDailyLimit,
  getRemainingDailyRequests,
  isDailyLimitExceeded,
  recordAPIUsage,
  setDailyLimit
};

export default apiUsageTracker; 