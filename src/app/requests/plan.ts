import { SERVER_BACKEND } from "../requests/misc";

export type Plan = {
  title: string;
  price: string;
  original_price: string;
  popular: number;
  plan_id: string;
};

type PlansRes = {
  ec: number;
  data: {
    home: Plan[];
    more: Plan[];
  };
};

export const getPlans = async (type_id?: string) => {
  try {
    const query = type_id ? `?${new URLSearchParams({ type_id })}` : "";
    const res = await fetch(`${SERVER_BACKEND}/api/misc/plan${query}`, {
      // 套餐信息变化不频繁，缓存 60 秒，避免每个首页请求都打到后端
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("Get Plans resp error:", res);
      return {
        homePlans: [],
        morePlans: [],
      };
    }
    const { data }: PlansRes = await res.json();
    return {
      homePlans: data.home,
      morePlans: data.more,
    };
  } catch (error) {
    console.error("Get Plans error:", error);
    return {
      homePlans: [],
      morePlans: [],
    };
  }
};
