"use client";

import { useEffect, useState } from "react";

import { fetchIcpInfo, type ICP } from "@/app/requests/icp";
import IcpLink from "@/components/home/IcpLink";

/** 在浏览器端获取备案信息，所在页面不必读取请求头，可以保持静态生成 */
export default function IcpInfoClient() {
  const [icp, setIcp] = useState<ICP | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchIcpInfo(window.location.host, controller.signal).then(data => {
      if (!controller.signal.aborted) {
        setIcp(data);
      }
    });
    return () => controller.abort();
  }, []);

  return icp ? <IcpLink icp={icp} /> : null;
}
