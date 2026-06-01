import axios from "axios";

// Retry configuration with exponential backoff
const DEFAULT_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export const fetchWithRetry = async (url, options = {}) => {
  const config = { ...DEFAULT_CONFIG, ...options };
  let lastError;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 8000,
        ...(options.axiosConfig || {}),
      });

      if (attempt > 0) {
        console.log(`[RETRY] Successfully fetched after ${attempt} retry(ies): ${url}`);
      }

      return response;
    } catch (err) {
      lastError = err;

      // Check if error is retryable
      const status = err.response?.status;
      const isRetryable =
        status === undefined || // Network error
        config.retryableStatuses.includes(status);

      if (!isRetryable || attempt === config.maxRetries) {
        // Don't retry: either not retryable or max retries reached
        if (attempt === config.maxRetries && isRetryable) {
          console.warn(
            `[RETRY] Max retries (${config.maxRetries}) reached for: ${url}. Status: ${status}`
          );
        }
        throw err;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt),
        config.maxDelay
      );

      console.log(
        `[RETRY] Attempt ${attempt + 1}/${config.maxRetries + 1} failed. Retrying in ${delay}ms...`
      );

      // Check for rate-limit headers
      const retryAfter = err.response?.headers["retry-after"];
      if (retryAfter) {
        const waitTime = parseInt(retryAfter) * 1000;
        console.log(`[RETRY] Rate-limited. Waiting ${waitTime}ms as per API header.`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// Wrapper to use with Promise.allSettled for silent failures
export const apiWithFallback = async (fetchFn, fallbackData = []) => {
  try {
    return await fetchFn();
  } catch (err) {
    console.warn(`[API] Error (falling back to mock data):`, err.message);
    return fallbackData;
  }
};
