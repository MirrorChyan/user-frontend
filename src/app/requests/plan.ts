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
    const res = await fetch(
      `${SERVER_BACKEND}/api/misc/plan${type_id ? `?type_id=${type_id}` : ""}`
    );
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
