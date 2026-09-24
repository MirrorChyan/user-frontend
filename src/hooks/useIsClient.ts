import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** 服务端渲染和水合阶段返回 false，挂载到浏览器后返回 true */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
