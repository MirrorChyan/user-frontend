import { SERVER_BACKEND } from "../requests/misc";

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

export const getPlanIds = async (type_id?: string) => {
  try {
    const _plans = await fetch(`${SERVER_BACKEND}/api/misc/plan${type_id ? `?type_id=${type_id}` : ""}`)
    const res: PlansRes = await _plans.json()

    const homePlanIds = res.data.home.map((v) => v.plan_id);
    const morePlanIds = res.data.more.map((v) => v.plan_id);

    return {
      homePlanIds,
      morePlanIds,
    };
  } catch (error) {
    console.error("Get Plan Ids error:", error);
    return {
      homePlanIds: [],
      morePlanIds: []
    };
  }
}

