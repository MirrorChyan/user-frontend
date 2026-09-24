type Rates = {
  rates: {
    CNY: number;
    USD: number;
  };
};

// 外部汇率接口无响应时不能让页面一直挂起
const REQUEST_TIMEOUT = 5000;
// 接口不可用且没有缓存时使用的近似汇率，避免价格显示为 NaN
const FALLBACK_RATE = 0.14;

export async function getUSDRate(): Promise<number> {
  try {
    const res: Response = await fetch("https://api.exchangerate-api.com/v4/latest/CNY", {
      // 由 Next.js 数据缓存保存 24 小时
      next: { revalidate: 86400 },
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
    return rate;
  } catch (error) {
    console.error("Get USD Rate error:", error);
    return FALLBACK_RATE;
  }
}
