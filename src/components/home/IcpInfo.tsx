import { headers } from "next/headers";

import { getIcpInfo } from "@/app/requests/icp";
import IcpLink from "@/components/home/IcpLink";

/**
 * 服务端渲染备案信息。读取请求头会让所在路由变成动态渲染，
 * 需要静态生成的页面改用 IcpInfoClient
 */
export default async function IcpInfo() {
  // headers() 不能放进 try/catch，否则会吞掉 Next.js 用来切换动态渲染的内部异常
  const head = await headers();
  const icp = await getIcpInfo(head.get("Host") ?? "");
  return icp ? <IcpLink icp={icp} /> : null;
}
