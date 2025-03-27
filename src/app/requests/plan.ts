import { SERVER_BACKEND } from "../requests/misc";
import { getPlanInfo } from "./planInfo";

type Plan = {
  plan_id: string
  platform: string
  popular: number
  type_id: string
}

type PlansRes = {
  ec: number
  data: {
    home: Plan[]
    more: Plan[]
  }
}

export const getPlans = async (type_id?: string) => {
  try {
    const res = await fetch(`${SERVER_BACKEND}/api/misc/plan${type_id ? `?type_id=${type_id}` : ""}`)
    if (!res.ok) {
      console.error("Get Plans resp error:", res);
      return {
        homePlans: [],
        morePlans: [],
      }
    }
    const { data }: PlansRes = await res.json()

    const [homePlans, morePlans] = await Promise.all([
      Promise.all(data.home.map((v) => getPlanInfo(v.plan_id, v.popular === 1))),
      Promise.all(data.more.map((v) => getPlanInfo(v.plan_id, v.popular === 1))),
    ]);

    return {
      homePlans: homePlans.filter((v) => v !== null),
      morePlans: morePlans.filter((v) => v !== null),
    };
  } catch (error) {
    console.error("Get Plans error:", error);
    return {
      homePlans: [],
      morePlans: [],
    };
  }
}

