/**
 * 复制文本到剪贴板，优先使用 Clipboard API，失败时回退到 execCommand。
 * Safari/iOS 在 await 之后会丢失用户激活，两种方式都可能失败，调用方需要根据返回值提供手动复制的兜底。
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // 非安全上下文或失去用户激活时会被拒绝，继续尝试降级方案
  }
  return legacyCopy(text);
}

function legacyCopy(text: string): boolean {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.opacity = "0";
  // 弹窗的焦点陷阱会把焦点抢回去，放进当前弹窗内才能选中
  const container = document.activeElement?.closest("[role=dialog]") ?? document.body;
  container.appendChild(textArea);
  textArea.select();
  // iOS 需要显式设置选区
  textArea.setSelectionRange(0, text.length);
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    container.removeChild(textArea);
  }
}
