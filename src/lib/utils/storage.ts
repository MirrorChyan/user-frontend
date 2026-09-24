// 禁用站点数据、隐私模式或部分 WebView 中访问 localStorage 会直接抛异常，统一在这里兜底

export function getStorageItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorageItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // 忽略存储不可用或配额已满
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // 忽略存储不可用
  }
}
