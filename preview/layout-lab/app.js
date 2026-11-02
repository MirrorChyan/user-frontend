const variant = document.body.dataset.layout;
if (new URLSearchParams(location.search).has("embed"))
  document.documentElement.classList.add("embedded");
// Keep the existing brand copy from messages/zh.json identical in every layout.
const homeCopy = {
  title: "使用Mirror酱更新你的App",
  description: [
    "Mirror酱是一个第三方应用分发平台，让开源应用的更新更简单。",
    "用户付费使用，收益与开发者共享。此外，Mirror酱本身也是开源的。",
  ],
};
function heroTitle() {
  return homeCopy.title.replace("更新你的App", "<br><span>更新你的App</span>");
}
function heroDescription() {
  return homeCopy.description.join("<br>");
}
const projects = [
  { name: "MAA", image: "maa-logo_512x512.png", initial: "M" },
  { name: "MaaEnd", image: "MaaEnd-Tiny-256.png", initial: "E" },
  { name: "三月七小助手", image: "March7th.png", initial: "7" },
  { name: "MaaYuan", image: "MaaYuan.png", initial: "Y" },
  { name: "AALC", image: "AALC.png", initial: "A" },
  { name: "鸣潮 ok-ww", image: "okww.png", initial: "W" },
  { name: "绝区零 一条龙", image: "ZZZ-OD.png", initial: "Z" },
  { name: "MaaNTE", image: "MaaNTE.png", initial: "N" },
  { name: "BetterGI", image: "BGIv2.png", initial: "B" },
];
const plans = [
  {
    id: "gametools_monthly",
    name: "月卡",
    price: "6.9",
    period: "一个月",
    hint: "一个月",
    detail: "一个月",
    letter: "M",
  },
  {
    id: "gametools_quarterly",
    name: "季卡",
    price: "12.9",
    period: "三个月",
    hint: "三个月",
    detail: "三个月",
    letter: "Q",
  },
  {
    id: "gametools_annual",
    name: "年卡",
    price: "29.9",
    period: "一年",
    hint: "一年",
    detail: "一年",
    letter: "Y",
  },
];
const icon = (name, cls = "") => {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M5 15v5h14v-5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-16-2 20"/>',
    heart:
      '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-5-5 3-3m-6 0 3-3"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
    box: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10v10M3 7l9 5 9-5M7.5 4.5l9 5"/>',
  };
  return `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
};
const logo = `<span class="brand-logo" aria-hidden="true"><img src="assets/mirrorchyan-logo.webp" alt="" width="39" height="39"></span><span>Mirror<span class="brand-chyan">酱</span><small>MIRRORCHYAN</small></span>`;
function header({ dark = false, minimal = false } = {}) {
  return `<header class="site-header ${dark ? "dark-header" : ""}"><a href="#" class="brand" aria-label="Mirror酱首页">${logo}</a><nav aria-label="主导航">${minimal ? "" : `<a href="#plans">订阅套餐</a><button type="button" data-action="projects">接入应用</button>`}<a href="https://github.com/MirrorChyan/docs" target="_blank" rel="noopener">集成文档 ${icon("arrow")}</a></nav><button class="header-lookup" data-action="lookup" type="button">${icon("key")} 查询CDK <span>↗</span></button></header>`;
}
function footer() {
  return `<footer class="site-footer"><div><span class="footer-brand">Mirror酱</span><span>让开源应用的更新更简单。</span></div><div class="footer-links"><a href="https://github.com/MirrorChyan/docs" target="_blank" rel="noopener">集成文档 ↗</a><a href="https://github.com/MirrorChyan/user-frontend" target="_blank" rel="noopener">Mirror酱源码 ↗</a><button data-action="transfer" type="button">时长转换</button><button data-action="feedback" type="button">交流反馈</button><button data-action="terms" type="button">用户协议</button></div><small>皖ICP备2025075166号-1</small></footer>`;
}
function avatars(limit = 5) {
  return `<span class="avatars">${projects
    .slice(0, limit)
    .map(p => `<img src="assets/${p.image}" alt="${p.name}" width="32" height="32">`)
    .join("")}</span>`;
}
function planCards() {
  return plans
    .map(
      (p, i) =>
        `<article class="plan-card ${i === 2 ? "recommended" : ""}"><div class="plan-top"><span class="plan-symbol">${p.letter}<span>↗</span></span>${i === 2 ? '<span class="recommend-label">推荐</span>' : ""}</div><h3>Mirror酱${p.name}</h3><p class="plan-hint">${p.hint}</p><div class="price"><span>¥</span><strong>${p.price}</strong><small>/ ${p.period}</small></div><button class="button ${i === 2 ? "primary" : "outline"}" data-plan="${i}" type="button">前往赞助 ${icon("arrow")}</button></article>`
    )
    .join("");
}
function layoutA() {
  return `${header()}<main class="a-main"><section class="a-hero"><span class="eyebrow"><span class="status-dot"></span> MIRRORCHYAN</span><h1>${heroTitle()}</h1><p>${heroDescription()}</p><button class="app-proof" data-action="projects" type="button">${avatars()}<span>已接入 <strong>95</strong> 款应用</span>${icon("arrow")}</button></section><section id="plans" class="a-plans" aria-label="订阅套餐">${planCards()}</section><div class="a-service-note">${icon("check")} 按需选择时长 <span></span>${icon("check")} 付费支持开源 <span></span>${icon("check")} Mirror酱本身也开源</div><section class="returning-bar"><div>${icon("key")}<span>已经有 CDK？<small>查询订单，或转换已有时长。</small></span></div><div><button type="button" data-action="lookup">查询CDK ↗</button><button type="button" data-action="transfer">时长转换 ↗</button></div></section></main>${footer()}`;
}
function appTiles() {
  return projects
    .map(
      (p, i) =>
        `<button class="app-tile" data-app="${i}" data-search="${p.name.toLowerCase()}" type="button"><img src="assets/${p.image}" width="48" height="48" alt=""><span>${p.name}<small>已接入 Mirror酱</small></span><span class="tile-arrow">↗</span></button>`
    )
    .join("");
}
function layoutB() {
  return `${header()}<main class="b-main"><section class="b-hero"><div><span class="eyebrow">MIRRORCHYAN</span><h1>${heroTitle()}</h1><p>${heroDescription()}</p></div><div class="b-catalog-mark"><span class="orbit-label">MIRRORCHYAN</span><strong>95<span>↗</span></strong><small>款已接入应用</small><div class="catalog-mini">${avatars(4)}</div></div></section><section class="b-app-section" id="apps"><div class="section-heading"><div><span class="section-index">01 / APPS</span><h2>接入应用</h2></div><label class="search-box">${icon("search")}<input type="search" placeholder="搜索应用名称" aria-label="搜索接入应用" id="app-search"><kbd>/</kbd></label></div><div class="app-grid">${appTiles()}</div><p class="no-results" hidden>这组演示应用中没有匹配结果。试试 MAA、MaaEnd 或 BetterGI。</p><div class="catalog-foot"><span id="app-count">精选 9 款已接入应用</span><button data-action="projects" type="button">查看全部接入应用 ${icon("arrow")}</button></div></section><section class="b-subscribe" id="plans"><div><span class="section-index">02 / PLANS</span><h2>订阅CDK</h2><p>${homeCopy.description[1]}</p></div><div class="b-plan-list">${plans.map((p, i) => `<button class="b-plan-row" type="button" data-plan="${i}"><span>${p.name}<small>${p.period}</small></span><strong><small>¥</small> ${p.price}</strong><span class="round-arrow">↗</span></button>`).join("")}</div></section></main>${footer()}`;
}
function flowVisual() {
  return `<div class="flow-visual" aria-label="从开源应用经过 Mirror酱更新到你的设备的流程示意"><div class="flow-caption"><span class="status-dot"></span> MIRRORCHYAN <span>↗</span></div><div class="flow-source"><div class="flow-mini-icons">${projects
    .slice(0, 3)
    .map(p => `<img src="assets/${p.image}" width="37" height="37" alt="${p.name}">`)
    .join(
      ""
    )}</div><span>开源应用</span><small>OPEN SOURCE APPS</small></div><div class="flow-line"><i></i><span>↓</span><i></i></div><div class="flow-hub"><span class="hub-logo">${logo}</span><span class="flow-package">${icon("box")} 应用分发</span></div><div class="flow-line lower"><i></i><span>↓</span><i></i></div><div class="flow-target">${icon("download")}<span>你的设备<small>APP UPDATES</small></span><span class="target-check">${icon("check")}</span></div><div class="flow-bottom"><span>让开源应用的更新更简单。</span><span>01 — 03</span></div></div>`;
}
function layoutC() {
  return `<div class="c-dark">${header({ dark: true })}<main><section class="c-hero"><div class="c-hero-copy"><span class="eyebrow"><span class="status-dot"></span> MIRRORCHYAN</span><h1>${heroTitle()}</h1><p>${heroDescription()}</p><a class="button c-button" href="#plans">订阅CDK ${icon("arrow")}</a><button class="c-app-link" type="button" data-action="projects">95 款应用已接入 <span>探索应用 ↗</span></button></div>${flowVisual()}</section><div class="c-manifesto"><span>MIRRORCHYAN</span><p>${homeCopy.description[1]}</p>${icon("heart")}</div></main></div><section id="plans" class="c-pricing"><div><span class="section-index">PLANS</span><h2>订阅CDK</h2><p>${homeCopy.description[1]}</p></div><div class="c-plan-list">${plans.map((p, i) => `<button class="c-plan-row" type="button" data-plan="${i}"><span class="c-plan-number">0${i + 1}</span><span>${p.name}${i === 2 ? "<small>推荐</small>" : ""}</span><strong><small>¥</small>${p.price}</strong><span class="c-plan-period">/ ${p.period}</span>${icon("arrow")}</button>`).join("")}</div></section><div class="c-tools"><span>已经在使用 Mirror酱？</span><button type="button" data-action="lookup">查询CDK ↗</button><button type="button" data-action="transfer">时长转换 ↗</button></div>${footer()}`;
}
let chosenPlan = 2;
let step = 1;
function wizardContent() {
  const p = plans[chosenPlan];
  return `<div class="wizard-progress"><span class="${step === 1 ? "active" : "done"}">${step > 1 ? "✓" : "1"}<small>选择时长</small></span><i></i><span class="${step === 2 ? "active" : ""}">2<small>开始使用</small></span></div>${step === 1 ? `<div class="wizard-title"><span>01 / YOUR PLAN</span><h2>选择使用时长</h2><p>选择适合自己的使用时长。</p></div><fieldset class="wizard-options"><legend class="sr-only">选择订阅套餐</legend>${plans.map((p, i) => `<label class="wizard-option ${chosenPlan === i ? "selected" : ""}"><input type="radio" name="plan" value="${i}" ${chosenPlan === i ? "checked" : ""}><span class="radio-circle"></span><span class="option-name">${p.name}<small>${p.detail}</small></span><span class="option-price">¥ <strong>${p.price}</strong>${i === 2 ? "<small>推荐</small>" : ""}</span></label>`).join("")}</fieldset><button id="wizard-next" type="button" class="button d-button">下一步，了解使用方式 ${icon("arrow")}</button><div class="wizard-bottom">${icon("heart")} 用户付费使用，收益与开发者共享。</div>` : `<div class="wizard-title"><span>02 / READY TO GO</span><h2>使用方式</h2><p>已选 Mirror酱${p.name} · ¥${p.price}</p></div><ol class="how-to"><li><span>1</span><div><strong>赞助并获取 CDK</strong><p>付款成功后，系统会为你生成 CDK。</p></div></li><li><span>2</span><div><strong>在应用中填写 CDK</strong><p>在已接入应用的 Mirror酱设置中填写。</p></div></li><li><span>3</span><div><strong>开始使用应用更新</strong><p>具体操作可查看对应应用的使用说明。</p></div></li></ol><button type="button" class="button d-button" data-plan="${chosenPlan}">前往赞助 · ¥${p.price} ${icon("arrow")}</button><button id="wizard-back" class="wizard-back" type="button">← 返回选择时长</button>`}`;
}
function layoutD() {
  return `${header({ minimal: true })}<main class="d-main"><section class="d-intro"><span class="eyebrow">MIRRORCHYAN</span><div class="d-title-mark" aria-hidden="true">↗</div><h1>${heroTitle()}</h1><p class="d-description">${heroDescription()}</p><div class="d-proof">${avatars(3)}<div><strong>接入应用</strong><span>95 款应用已接入 Mirror酱</span></div></div><div class="d-note"><span>MIRRORCHYAN</span><p>${homeCopy.description[1]}</p></div></section><section class="wizard" id="plans" aria-label="订阅引导">${wizardContent()}</section><section class="d-returning"><span>${icon("key")} 已经有 CDK？</span><button data-action="lookup" type="button">查询CDK ↗</button><button data-action="transfer" type="button">时长转换 ↗</button><button data-action="projects" type="button">先看接入应用 ↗</button></section></main>${footer()}`;
}
document.querySelector("#app").innerHTML =
  `<div class="standalone-note"><a href="index.html?layout=${variant}">← 布局试验室</a><span>方案 ${variant.toUpperCase()} · 本地交互演示</span></div>${{ a: layoutA, b: layoutB, c: layoutC, d: layoutD }[variant]()}<dialog id="demo-dialog" aria-labelledby="dialog-title"><form method="dialog"><button class="dialog-close" aria-label="关闭弹窗">×</button></form><div id="dialog-content"></div></dialog>`;
const dialog = document.querySelector("#demo-dialog");
function showDialog(html) {
  document.querySelector("#dialog-content").innerHTML = html;
  dialog.showModal();
}
function showPlan(index) {
  const plan = plans[index];
  showDialog(
    `<span class="dialog-eyebrow">LOCAL PREVIEW</span><h2 id="dialog-title">Mirror酱${plan.name}</h2><p class="dialog-summary">你已选择${plan.period}使用时长。</p><div class="demo-order"><span>Mirror酱${plan.name}</span><strong>¥ ${plan.price}</strong></div><p class="demo-notice">这里演示到达收银台的交互，不会创建订单或发起付款。</p><button class="button primary" data-close type="button">完成预览 ${icon("check")}</button>`
  );
}
const actionDialogs = {
  lookup: () =>
    `<span class="dialog-eyebrow">查询CDK</span><h2 id="dialog-title">查询CDK</h2><p class="dialog-summary">正式页面支持用订单号或 CDK 查询。</p><form id="lookup-form"><label for="demo-order-input">演示订单号</label><input id="demo-order-input" value="DEMO-ORDER-001" autocomplete="off" required><p class="demo-notice">这是本地演示，请勿填写真实订单号或 CDK。</p><button class="button primary" type="submit">查询 ${icon("search")}</button></form><div id="lookup-result" role="status"></div>`,
  transfer: () =>
    `<span class="dialog-eyebrow">时长转换</span><h2 id="dialog-title">时长转换</h2><p class="dialog-summary">正式页面可查询并转换已有 CDK 时长。</p><div class="transfer-demo"><span>来源 CDK<strong>DEMO-SOURCE</strong></span>${icon("arrow")}<span>目标 CDK<strong>DEMO-TARGET</strong></span></div><p class="demo-notice">本地仅展示入口和流程提示，不会读取或修改实际 CDK。</p><button class="button primary" data-close type="button">了解了 ${icon("check")}</button>`,
  projects: () =>
    `<span class="dialog-eyebrow">MIRRORCHYAN</span><h2 id="dialog-title">接入应用</h2><p class="dialog-summary">演示展示以下 9 款已接入应用。</p><div class="dialog-projects">${projects.map((p, i) => `<button type="button" data-app="${i}"><img src="assets/${p.image}" width="36" height="36" alt=""><span>${p.name}</span>↗</button>`).join("")}</div><a class="dialog-site-link" href="https://mirrorchyan.com/zh/projects" target="_blank" rel="noopener">去官网查看完整应用列表 ↗</a>`,
  feedback: () =>
    `<span class="dialog-eyebrow">交流反馈</span><h2 id="dialog-title">交流反馈</h2><p class="dialog-summary">遇到问题，或有想法想和我们分享？</p><a class="button primary" href="https://pd.qq.com/g/MirrorChyan" target="_blank" rel="noopener">前往 MirrorChyan QQ 频道 ↗</a>`,
  terms: () =>
    `<span class="dialog-eyebrow">TERMS</span><h2 id="dialog-title">用户协议</h2><p class="dialog-summary">本地原型仅用于评审布局和交互。完整服务条款请查阅正式站点。</p><a class="button primary" href="https://mirrorchyan.com/disclaimer.html" target="_blank" rel="noopener">查看正式用户协议 ↗</a>`,
};
document.addEventListener("click", event => {
  const plan = event.target.closest("[data-plan]");
  if (plan) {
    showPlan(Number(plan.dataset.plan));
    return;
  }
  const action = event.target.closest("[data-action]");
  if (action && actionDialogs[action.dataset.action]) {
    showDialog(actionDialogs[action.dataset.action]());
    return;
  }
  const app = event.target.closest("[data-app]");
  if (app) {
    const project = projects[Number(app.dataset.app)];
    const search = document.querySelector("#app-search");
    if (search) {
      search.value = "";
      search.dispatchEvent(new Event("input"));
    }
    if (dialog.open) dialog.close();
    showDialog(
      `<span class="dialog-eyebrow">CONNECTED WITH MIRRORCHYAN</span><div class="selected-app"><img src="assets/${project.image}" width="58" height="58" alt=""><h2 id="dialog-title">${project.name}</h2></div><p class="dialog-summary">此应用已接入 Mirror酱。选择套餐后，在应用的对应设置中填写 CDK。</p><div class="mini-plans">${plans.map((p, i) => `<button data-plan="${i}" type="button"><span>${p.name}</span><strong>¥${p.price}</strong><span>↗</span></button>`).join("")}</div><p class="demo-notice">此处仅演示从应用发现到套餐选择的路径。</p>`
    );
    return;
  }
  if (event.target.closest("[data-close]")) dialog.close();
  if (event.target.closest("#wizard-next")) {
    step = 2;
    renderWizard();
  }
  if (event.target.closest("#wizard-back")) {
    step = 1;
    renderWizard();
  }
});
dialog.addEventListener("click", event => {
  if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  }
});
document.addEventListener("submit", event => {
  if (event.target.id !== "lookup-form") return;
  event.preventDefault();
  document.querySelector("#lookup-result").innerHTML =
    `<div class="lookup-demo-result">${icon("check")}<div>演示查询完成<strong>DEMO-CDK-XXXX-XXXX</strong><small>此结果仅为示例，无实际使用效力。</small></div></div>`;
});
function renderWizard() {
  document.querySelector(".wizard").innerHTML = wizardContent();
  document.querySelector(".wizard").classList.toggle("step-two", step === 2);
  const target = document.querySelector(".wizard-title h2");
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}
document.addEventListener("change", event => {
  if (event.target.name !== "plan") return;
  chosenPlan = Number(event.target.value);
  document
    .querySelectorAll(".wizard-option")
    .forEach(label => label.classList.toggle("selected", label.querySelector("input").checked));
});
const search = document.querySelector("#app-search");
if (search) {
  search.addEventListener("input", () => {
    const term = search.value.toLowerCase().trim();
    let count = 0;
    document.querySelectorAll(".app-tile").forEach(tile => {
      const match = tile.dataset.search.includes(term);
      tile.hidden = !match;
      if (match) count++;
    });
    document.querySelector(".no-results").hidden = count > 0;
    document.querySelector("#app-count").textContent = term
      ? `找到 ${count} 款演示应用`
      : "精选 9 款已接入应用";
  });
  document.addEventListener("keydown", event => {
    if (
      event.key === "/" &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName) &&
      !dialog.open
    ) {
      event.preventDefault();
      search.focus();
    }
  });
}
