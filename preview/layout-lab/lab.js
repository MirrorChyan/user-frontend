const labConfig = window.LAYOUT_LAB || {};
const concepts = labConfig.concepts || {
  a: { title: "A · 套餐直达", description: "Phase 1 采用 A 方向；B / C / D 保留备选，暂不上线。" },
  b: {
    title: "B · 应用优先",
    description: "备选方案，Phase 1 暂不上线。先找应用，再进入订阅。",
  },
  c: {
    title: "C · 极简品牌",
    description: "备选方案，Phase 1 暂不上线。保留深色排版和更新流程。",
  },
  d: {
    title: "D · 分步引导",
    description: "备选方案，Phase 1 暂不上线。保留分步选择的交互方向。",
  },
};
const query = new URLSearchParams(location.search);
const layoutKeys = Object.keys(concepts);
const layoutFile = key => concepts[key].file || `${key}.html`;
const storageKey = labConfig.storageKey || "mc-layout-shortlist";
let layout = concepts[query.get("layout")] ? query.get("layout") : layoutKeys[0];
let device = query.get("device") === "mobile" ? "mobile" : "desktop";
let comparing = query.get("compare") === "1";
let favorites = [];
try {
  favorites = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (!Array.isArray(favorites)) favorites = [];
} catch {
  /* Local file/private browsing still supports preview. */
}
const area = document.querySelector("#preview-area");
const shortlist = document.querySelector("#shortlist");
function render() {
  document
    .querySelectorAll("[data-layout]")
    .forEach(button =>
      button.setAttribute("aria-pressed", String(button.dataset.layout === layout))
    );
  document
    .querySelectorAll("[data-device]")
    .forEach(button =>
      button.setAttribute("aria-pressed", String(button.dataset.device === device))
    );
  document.querySelector("#concept-title").textContent = concepts[layout].title;
  document.querySelector("#concept-description").textContent = concepts[layout].description;
  document.querySelector("#primary-label").textContent = concepts[layout].title;
  document.querySelector("#standalone").href = layoutFile(layout);
  const frame = document.querySelector("#primary-frame");
  const src = `${layoutFile(layout)}?embed=1`;
  if (frame.getAttribute("src") !== src) frame.src = src;
  frame.title = concepts[layout].title + "预览";
  area.classList.toggle("mobile", device === "mobile");
  area.classList.toggle("comparing", comparing);
  document.querySelector(".secondary").hidden = !comparing;
  document.querySelector("#compare-toggle").setAttribute("aria-pressed", String(comparing));
  shortlist.setAttribute("aria-pressed", String(favorites.includes(layout)));
  shortlist.textContent = favorites.includes(layout) ? "★ 已加入候选" : "☆ 加入候选";
  document.querySelector("#saved-note").textContent = favorites.length
    ? `当前候选：${favorites.map(key => concepts[key]?.title || key).join("、")}`
    : "候选保存在当前浏览器";
  const params = new URLSearchParams({ layout, device });
  if (comparing) params.set("compare", "1");
  try {
    history.replaceState(null, "", `${location.pathname}?${params}`);
  } catch {
    /* Some browsers restrict history for file:// previews. */
  }
}
document.querySelectorAll("[data-layout]").forEach(button =>
  button.addEventListener("click", () => {
    layout = button.dataset.layout;
    render();
  })
);
document.querySelectorAll("[data-device]").forEach(button =>
  button.addEventListener("click", () => {
    device = button.dataset.device;
    render();
  })
);
document.querySelector("#compare-toggle").addEventListener("click", () => {
  comparing = !comparing;
  const select = document.querySelector("#compare-select");
  if (comparing && select.value === layout) {
    select.value = layoutKeys.find(key => key !== layout);
    document.querySelector("#secondary-frame").src = `${layoutFile(select.value)}?embed=1`;
  }
  render();
});
document.querySelector("#compare-select").addEventListener("change", event => {
  document.querySelector("#secondary-frame").src = `${layoutFile(event.target.value)}?embed=1`;
});
shortlist.addEventListener("click", () => {
  favorites = favorites.includes(layout)
    ? favorites.filter(item => item !== layout)
    : [...favorites, layout];
  try {
    localStorage.setItem(storageKey, JSON.stringify(favorites));
  } catch {
    /* Selection works for this session. */
  }
  render();
});
render();
