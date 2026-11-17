import { headers } from "next/headers";

import { getIcpInfo } from "@/app/requests/icp";
import IcpLink from "@/components/home/IcpLink";

/** 首页按当前域名在服务端渲染备案信息。 */
export default async function IcpInfo({ className }: { className?: string }) {
  // headers() 不能放进 try/catch，否则会吞掉 Next.js 用来切换动态渲染的内部异常
  const head = await headers();
  const icp = await getIcpInfo(head.get("Host") ?? "");
  return icp ? <IcpLink icp={icp} className={className} /> : null;
}
