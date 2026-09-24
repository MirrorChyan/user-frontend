type Props = {
  message: string;
  closeLabel: string;
};

/**
 * 低版本浏览器提示。Tailwind CSS 4 依赖 oklch 颜色和 @property（Chrome 111、Safari 16.4、Firefox 128），
 * 更低版本的浏览器颜色甚至整个样式表都会失效，应用自身的 JS 也可能无法解析。
 * 因此使用 ES5 内联脚本和行内样式实现，不依赖应用的样式和 JS。
 */
export default function OutdatedBrowserScript({ message, closeLabel }: Props) {
  // 转义 <，避免文案中出现 </script> 提前结束脚本
  const text = (value: string) => JSON.stringify(value).replace(/</g, "\\u003c");

  const script = `(function () {
  try {
    var css = window.CSS;
    if (css && css.supports && css.supports("color", "oklch(0.5 0.1 200)") && typeof css.registerProperty === "function") {
      return;
    }
  } catch (e) {}
  function show() {
    var bar = document.createElement("div");
    bar.setAttribute("role", "alert");
    bar.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:2147483647;padding:10px 44px 10px 16px;background:#fef3c7;color:#92400e;border-bottom:1px solid #fcd34d;text-align:center;font:14px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif";
    bar.appendChild(document.createTextNode(${text(message)}));
    var close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", ${text(closeLabel)});
    close.appendChild(document.createTextNode("\\u00d7"));
    close.style.cssText = "position:absolute;top:6px;right:10px;border:0;background:none;color:inherit;font-size:20px;line-height:1;cursor:pointer;padding:4px";
    close.onclick = function () {
      bar.parentNode.removeChild(bar);
    };
    bar.appendChild(close);
    document.body.appendChild(bar);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", show);
  } else {
    show();
  }
})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
