type Rates = {
  rates: {
    CNY: number;
    USD: number;
  };
};

// 缓存的汇率
let cachedRate: number | null = null;
// 缓存的汇率更新时间
let lastFetchTime = 0;
// 缓存的持续时间
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24小时（毫秒）
// 外部汇率接口无响应时不能让页面一直挂起
const REQUEST_TIMEOUT = 5000;
// 接口不可用且没有缓存时使用的近似汇率，避免价格显示为 NaN
const FALLBACK_RATE = 0.14;

export async function getUSDRate(): Promise<number> {
  const now = Date.now();

  if (now - lastFetchTime < CACHE_DURATION && cachedRate !== null) {
    return cachedRate;
  }
  try {
    const res: Response = await fetch("https://api.exchangerate-api.com/v4/latest/CNY", {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    });
    if (!res.ok) {
      throw new Error(`status ${res.status}`);
    }
    const response: Rates = await res.json();
    const rate = response.rates?.USD;
    if (typeof rate !== "number" || !(rate > 0)) {
      throw new Error(`invalid rate ${rate}`);
    }

    cachedRate = rate;
    lastFetchTime = now;
    return rate;
  } catch (error) {
    console.error("Get USD Rate error:", error);
    return cachedRate ?? FALLBACK_RATE;
  }
}
