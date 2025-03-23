
type Rates = {
  rates: {
    CNY: number;
    USD: number;
  };
};

// 缓存的汇率
let cachedRate = null;
// 缓存的汇率更新时间
let lastFetchTime = 0;
// 缓存的持续时间
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时（毫秒）

export async function getUSDRate(): Promise<number> {
  // Use absolute URL with origin to work properly in server components
  const now = Date.now();

  if (now - lastFetchTime < CACHE_DURATION && cachedRate) {
    return cachedRate;
  }
  try {
    const res: Response = await fetch(`https://api.exchangerate-api.com/v4/latest/CNY`);
    const response: Rates = await res.json();

    cachedRate = response.rates.USD;
    lastFetchTime = now;
    return response.rates.USD;
  } catch (error) {
    console.error("Get Announcement error:", error);
    return NaN;
  }
}
