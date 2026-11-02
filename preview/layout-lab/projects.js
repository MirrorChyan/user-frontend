const projectLayout = document.body.dataset.projectLayout;
const catalog = window.MC_PROJECTS;
const text = window.MC_COPY;
const pageSize = projectLayout === "a1" ? 12 : 10;
const state = { query: "", category: "all", os: "all", page: 1, selected: catalog[0].resource };
let activeDownload = null;
const escapeHtml = value =>
  String(value ?? "").replace(
    /[&<>"']/g,
    character =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]
  );
const safeUrl = value => (/^https?:\/\//i.test(value || "") ? escapeHtml(value) : "#");
const symbols = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M5 15v5h14v-5"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  box: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm0 10v10M3 7l9 5 9-5M7.5 4.5l9 5"/>',
  key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-5-5 3-3"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  external: '<path d="M14 3h7v7m-1-6L10 14M10 4H4v16h16v-6"/>',
};
function symbol(name, size = 18) {
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[name] || symbols.arrow}</svg>`;
}
function avatar(project, size = 46) {
  return project.localImage
    ? `<img class="project-icon" src="${escapeHtml(project.localImage)}" alt="" width="${size}" height="${size}" loading="lazy">`
    : `<span class="project-icon initial-icon" aria-hidden="true">${escapeHtml(project.name.slice(0, 1))}</span>`;
}
function supportOptions(project) {
  return (project.support || []).map(item => {
    const slash = item.indexOf("/");
    const platform = slash >= 0 ? item.slice(slash + 1) : item;
    const [packagePart, displayPart] = platform.split("@");
    const [channel, pkgOs, pkgArch] = packagePart.split("-");
    const display = displayPart?.split("-");
    const hasDisplay = display?.length === 2 && display.every(Boolean);
    return {
      channel,
      os: hasDisplay ? display[0] : pkgOs,
      arch: hasDisplay ? display[1] : pkgArch,
      pkgOs,
      pkgArch,
      rid: slash >= 0 ? item.slice(0, slash) : project.resource,
    };
  });
}
const unique = values => [...new Set(values.filter(Boolean))];
const normalizedOs = os => (os === "win" ? "windows" : os);
const osLabel = os =>
  ({
    windows: "Windows",
    win: "Windows",
    macos: "macOS",
    linux: "Linux",
    android: "Android",
    any: "通用资源",
  })[os] || os;
const channelLabel = channel => text.Download[channel] || channel;
const systems = project => unique(supportOptions(project).map(option => normalizedOs(option.os)));
function platformTags(project, limit = 4) {
  const values = systems(project);
  return `<span class="platform-tags">${values
    .slice(0, limit)
    .map(os => `<span>${escapeHtml(osLabel(os))}</span>`)
    .join(
      ""
    )}${values.length > limit ? `<span>+${values.length - limit}</span>` : ""}${!values.length ? "<span>应用内更新</span>" : ""}</span>`;
}
const categories = [
  { key: "all", label: "全部项目", icon: "grid" },
  { key: "GameTools", label: "应用项目", icon: "grid" },
  { key: "Dependencies", label: text.Projects.dependencies, icon: "box" },
];
function categoryControls() {
  return categories
    .map(
      category =>
        `<button type="button" data-category="${category.key}" aria-pressed="${state.category === category.key}">${symbol(category.icon, 15)}<span>${category.label}</span><small>${category.key === "all" ? catalog.length : catalog.filter(project => project.type_id === category.key).length}</small></button>`
    )
    .join("");
}
function header() {
  return `<header class="site-header"><a class="brand" href="index.html?layout=a" target="_top" aria-label="Mirror酱首页"><span class="brand-logo" aria-hidden="true"><img src="assets/mirrorchyan-logo.webp" alt="" width="39" height="39"></span><span>Mirror<span class="brand-chyan">酱</span><small>MIRRORCHYAN</small></span></a><nav aria-label="主导航"><a href="index.html?layout=a" target="_top">${text.GetStart.subscribeCdk}</a><a class="nav-current" href="#projects">接入应用</a><a href="https://github.com/MirrorChyan/docs" target="_blank" rel="noopener">${text.GetStart.apiDoc} ↗</a></nav><button class="header-lookup" type="button" data-shortcut="lookup">${symbol("key", 14)} ${text.GetStart.getKey} <span>↗</span></button></header>`;
}
function hero() {
  const title = escapeHtml(text.GetStart.title).replace("更新你的App", "<span>更新你的App</span>");
  const description = text.GetStart.description.split("<br></br>").map(escapeHtml).join("<br>");
  return `<section class="projects-hero"><div class="project-breadcrumb"><a href="index.html?layout=a" target="_top">首页</a><span>/</span><span>项目列表</span></div><div class="hero-heading"><div><span class="eyebrow"><span class="status-dot"></span> MIRRORCHYAN / PROJECTS</span><h1>${title}</h1><p>${description}</p></div><div class="catalog-total"><strong>${catalog.length}<span>↗</span></strong><span>已接入应用</span></div></div></section>`;
}
function searchControl() {
  return `<label class="project-search">${symbol("search", 17)}<input id="project-search" type="search" placeholder="搜索项目名称或简介" aria-label="搜索项目名称或简介" autocomplete="off"><kbd>/</kbd></label>`;
}
function osSelect(id = "os-filter") {
  return `<label class="os-filter"><span>系统</span><select id="${id}" aria-label="筛选系统"><option value="all">全部系统</option>${["windows", "macos", "linux", "android"].map(os => `<option value="${os}">${osLabel(os)}</option>`).join("")}</select></label>`;
}
function sidebar() {
  return `<aside class="project-sidebar"><span class="sidebar-caption">项目分类</span><nav class="project-categories" aria-label="项目分类">${categoryControls()}</nav><div class="sidebar-system"><span class="sidebar-caption">筛选系统</span>${osSelect("sidebar-os-filter")}</div><a class="sidebar-integrate" href="https://github.com/MirrorChyan/docs" target="_blank" rel="noopener"><span class="integrate-icon">${symbol("plus", 23)}</span><strong>${text.Projects.joinUs}</strong><p>${text.Projects.contactUs}</p><span>${text.GetStart.apiDoc} ↗</span></a></aside>`;
}
function shortcuts() {
  return `<section class="projects-shortcuts"><span>${symbol("key", 17)} ${text.Projects.shortcuts}</span><a href="index.html?layout=a" target="_top">${text.GetStart.subscribeCdk} ↗</a><button data-shortcut="lookup" type="button">${text.GetStart.getKey} ↗</button><button data-shortcut="transfer" type="button">${text.GetStart.transfer} ↗</button><a href="https://pd.qq.com/g/MirrorChyan" target="_blank" rel="noopener">${text.GetStart.discussion} ↗</a></section>`;
}
function integrationBar() {
  return `<section class="project-join-bar"><span>${symbol("plus", 22)}</span><div><strong>${text.Projects.joinUs}</strong><p>${text.Projects.contactUs}</p></div><a href="https://github.com/MirrorChyan/docs" target="_blank" rel="noopener">${text.GetStart.apiDoc} ${symbol("arrow", 15)}</a></section>`;
}
function footer() {
  return `<footer class="site-footer"><div><span class="footer-brand">Mirror酱</span><span>让开源应用的更新更简单。</span></div><div class="footer-links"><a href="https://github.com/MirrorChyan/docs" target="_blank" rel="noopener">${text.GetStart.apiDoc} ↗</a><a href="https://github.com/MirrorChyan/user-frontend" target="_blank" rel="noopener">${text.GetStart.openSource} ↗</a><a href="https://mirrorchyan.com/disclaimer.html" target="_blank" rel="noopener">${text.GetStart.disclaimer}</a></div><small>皖ICP备2025075166号-1</small></footer>`;
}
function layout() {
  const toolbar = `<div class="project-toolbar">${searchControl()}${osSelect()}</div>`;
  return `${header()}<main class="projects-main">${hero()}<section class="project-workspace ${projectLayout}" id="projects">${projectLayout === "a2" ? sidebar() : ""}<div class="project-results">${projectLayout !== "a2" ? `<div class="top-categories project-categories" aria-label="项目分类">${categoryControls()}</div>` : ""}${toolbar}<div class="results-heading"><h2 id="category-heading">全部项目 <span>${catalog.length}</span></h2><span id="results-caption" aria-live="polite">保持项目默认顺序</span></div><div id="catalog-results"></div><div class="project-pagination" id="pagination"></div></div></section>${integrationBar()}${shortcuts()}</main>${footer()}`;
}
document.querySelector("#projects-app").innerHTML =
  `${new URLSearchParams(location.search).has("embed") ? "" : `<div class="standalone-note"><a href="projects.html?layout=${projectLayout}">← Projects 布局评审</a><span>Phase 1 · A 风格 · 本地演示</span></div>`}${layout()}<dialog id="project-dialog" aria-labelledby="project-dialog-title"><form method="dialog"><button class="dialog-close" aria-label="关闭弹窗">×</button></form><div id="project-dialog-content"></div></dialog>`;
const projectDialog = document.querySelector("#project-dialog");
function matches() {
  const query = state.query.toLowerCase().trim();
  return catalog.filter(
    project =>
      (state.category === "all" || state.category === project.type_id) &&
      (!query ||
        `${project.name} ${project.resource} ${project.desc}`.toLowerCase().includes(query)) &&
      (state.os === "all" || systems(project).some(os => os === state.os || os === "any"))
  );
}
function downloadButton(project, className = "") {
  return `<button class="project-download ${className}" type="button" data-download="${escapeHtml(project.resource)}" aria-label="${project.download ? "下载" : "查看"} ${escapeHtml(project.name)}">${symbol(project.download ? "download" : "arrow", 15)}<span>${project.download ? text.Download.download : "应用内更新"}</span></button>`;
}
function detailAction(project) {
  if (project.download) return downloadButton(project, "wide");
  return project.url
    ? `<a class="project-download wide" href="${safeUrl(project.url)}" target="_blank" rel="noopener">项目官网 ${symbol("external", 14)}</a>`
    : '<span class="internal-update-status">应用内更新</span>';
}
function projectCard(project) {
  return `<article class="catalog-card"><div class="card-heading">${avatar(project)}<div><h3>${escapeHtml(project.name)}</h3><span class="card-type">${project.type_id === "Dependencies" ? text.Projects.dependencies : "应用项目"}</span></div>${project.url ? `<a class="card-website" href="${safeUrl(project.url)}" target="_blank" rel="noopener" aria-label="${escapeHtml(project.name)} 项目官网" title="${text.Projects.openProjectHomepage}">${symbol("external", 14)}</a>` : ""}</div><p class="project-desc">${escapeHtml(project.desc)}</p><div class="card-platforms">${platformTags(project)}</div><div class="card-actions"><button class="project-detail-link" type="button" data-detail="${escapeHtml(project.resource)}">查看详情 ${symbol("arrow", 13)}</button>${downloadButton(project)}</div></article>`;
}
function projectRow(project) {
  return `<article class="catalog-row"><div class="row-identity">${avatar(project, 42)}<div><h3><button type="button" data-detail="${escapeHtml(project.resource)}">${escapeHtml(project.name)}</button></h3><p class="project-desc">${escapeHtml(project.desc)}</p></div></div><div class="row-platforms">${platformTags(project, 3)}</div><div class="row-actions">${project.url ? `<a href="${safeUrl(project.url)}" target="_blank" rel="noopener" title="${text.Projects.openProjectHomepage}" aria-label="${escapeHtml(project.name)} 项目官网">${symbol("external", 14)}</a>` : ""}${downloadButton(project)}</div></article>`;
}
function masterRow(project) {
  return `<button class="master-row ${project.resource === state.selected ? "selected" : ""}" type="button" data-select="${escapeHtml(project.resource)}" aria-pressed="${project.resource === state.selected}">${avatar(project, 36)}<span><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(systems(project).map(osLabel).join(" · ") || "应用内更新")}</small></span>${symbol("arrow", 14)}</button>`;
}
function detailPanel(project) {
  return `<article class="project-detail-panel"><div class="detail-topline"><span>项目详情</span><span>${project.type_id === "Dependencies" ? text.Projects.dependencies : "应用项目"}</span></div><div class="detail-identity">${avatar(project, 68)}<div><h2>${escapeHtml(project.name)}</h2>${project.url ? `<a href="${safeUrl(project.url)}" target="_blank" rel="noopener">项目官网 ${symbol("external", 12)}</a>` : ""}</div></div><p class="detail-desc">${escapeHtml(project.desc)}</p><dl class="detail-meta"><div><dt>支持系统</dt><dd>${platformTags(project)}</dd></div><div><dt>${text.Download.channel}</dt><dd>${
    unique(supportOptions(project).map(option => option.channel))
      .map(channel => `<span>${escapeHtml(channelLabel(channel))}</span>`)
      .join("") || "应用内更新"
  }</dd></div></dl>${!project.download ? `<p class="internal-update-note">${escapeHtml(text.Projects.onlyInternalUpdate.replace("{name}", project.name))}</p>` : ""}<div class="detail-primary">${detailAction(project)}${project.url ? `<a href="${safeUrl(project.url)}" target="_blank" rel="noopener">${text.Projects.openProjectHomepage} ↗</a>` : ""}</div><p class="detail-disclaimer">${escapeHtml(text.Download.disclaimer.replaceAll("{rid}", project.name)).replaceAll("&lt;br&gt;&lt;/br&gt;", "<br>")}</p></article>`;
}
function renderResults() {
  const results = matches();
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize));
  state.page = Math.min(pageCount, state.page);
  const page = results.slice((state.page - 1) * pageSize, state.page * pageSize);
  const heading = categories.find(category => category.key === state.category).label;
  document.querySelector("#category-heading").innerHTML =
    `${heading} <span>${results.length}</span>`;
  document.querySelector("#results-caption").textContent =
    state.query || state.os !== "all" ? `找到 ${results.length} 个项目` : "保持项目默认顺序";
  document
    .querySelectorAll("[data-category]")
    .forEach(button =>
      button.setAttribute("aria-pressed", String(button.dataset.category === state.category))
    );
  if (!results.length) {
    document.querySelector("#catalog-results").innerHTML =
      `<div class="catalog-empty">${symbol("search", 29)}<h3>没有找到匹配的项目</h3><p>请调整关键词、项目分类或系统筛选。</p><button data-reset type="button">清除筛选 ${symbol("arrow", 14)}</button></div>`;
  } else if (projectLayout === "a3") {
    if (!page.some(project => project.resource === state.selected))
      state.selected = page[0].resource;
    document.querySelector("#catalog-results").innerHTML =
      `<div class="master-detail"><div class="master-list" aria-label="项目列表">${page.map(masterRow).join("")}</div><div class="desktop-detail">${detailPanel(catalog.find(project => project.resource === state.selected))}</div></div>`;
  } else {
    document.querySelector("#catalog-results").innerHTML =
      `<div class="${projectLayout === "a1" ? "catalog-grid" : "catalog-list"}">${page.map(projectLayout === "a1" ? projectCard : projectRow).join("")}</div>`;
  }
  document.querySelector("#pagination").innerHTML = results.length
    ? `<span>显示 ${(state.page - 1) * pageSize + 1}–${Math.min(state.page * pageSize, results.length)} / ${results.length} 个项目</span><div><button type="button" data-page="${state.page - 1}" ${state.page === 1 ? "disabled" : ""} aria-label="上一页">←</button><span>${state.page} <small>/ ${pageCount}</small></span><button type="button" data-page="${state.page + 1}" ${state.page === pageCount ? "disabled" : ""} aria-label="下一页">→</button></div>`
    : "";
}
function openDialog(content) {
  if (projectDialog.open) projectDialog.close();
  document.querySelector("#project-dialog-content").innerHTML = content;
  projectDialog.showModal();
}
function showDetails(resource) {
  const project = catalog.find(item => item.resource === resource);
  openDialog(
    `<h2 id="project-dialog-title" class="sr-only">${escapeHtml(project.name)} 项目详情</h2>${detailPanel(project)}`
  );
}
function selectField(id, label, values, selected, labels = value => value) {
  if (!values.length || (values.length === 1 && values[0] === "any")) return "";
  return `<label class="download-field">${label}<select id="${id}" name="${id}" ${values.length === 1 ? "disabled" : ""}>${values.map(value => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(labels(value))}</option>`).join("")}</select></label>`;
}
function renderDownloadFields() {
  const { project, selected } = activeDownload;
  const options = supportOptions(project);
  const channels = unique(options.map(option => option.channel));
  if (!channels.includes(selected.channel)) selected.channel = channels[0];
  const osValues = unique(
    options.filter(option => option.channel === selected.channel).map(option => option.os)
  );
  if (!osValues.includes(selected.os))
    selected.os = osValues.find(os => normalizedOs(os) === "windows") || osValues[0];
  const archValues = unique(
    options
      .filter(option => option.channel === selected.channel && option.os === selected.os)
      .map(option => option.arch)
  );
  if (!archValues.includes(selected.arch)) selected.arch = archValues[0];
  document.querySelector("#download-selects").innerHTML =
    selectField(
      "download-channel",
      text.Download.channel,
      channels,
      selected.channel,
      channelLabel
    ) +
    selectField("download-os", text.Download.os, osValues, selected.os, osLabel) +
    selectField("download-arch", text.Download.arch, archValues, selected.arch);
}
function showDownload(resource) {
  const project = catalog.find(item => item.resource === resource);
  if (!project.download) {
    showDetails(resource);
    return;
  }
  activeDownload = { project, selected: {} };
  openDialog(
    `<span class="dialog-eyebrow">MIRRORCHYAN / DOWNLOAD</span><div class="download-title">${avatar(project, 43)}<div><h2 id="project-dialog-title">${text.Download.download} ${escapeHtml(project.name)}</h2><p>${text.Download.prepare}</p></div></div><p class="download-project-desc">${escapeHtml(project.desc)}</p><form id="download-form"><div id="download-selects" class="download-selects"></div><label class="download-field cdk-field">${text.Download.cdkey}<input id="demo-cdk" value="DEMO-CDK-XXXX-XXXX" autocomplete="off" aria-describedby="local-download-note"></label><div class="download-cdk-link"><span id="local-download-note">本地演示，请勿输入真实 CDK</span><a href="index.html?layout=a" target="_top">${text.Download.buyCDKey} ↗</a></div><div class="download-legal">${escapeHtml(text.Download.disclaimer.replaceAll("{rid}", project.name)).replaceAll("&lt;br&gt;&lt;/br&gt;", "<br>")} <a href="https://mirrorchyan.com/disclaimer.html" target="_blank" rel="noopener">${text.Download.disclaimerLink}</a></div><button class="button primary demo-download-button" type="submit">${symbol("download", 17)} ${text.Download.download}</button><div id="download-result" role="status"></div></form>`
  );
  renderDownloadFields();
}
document.querySelector("#project-search").addEventListener("input", event => {
  state.query = event.target.value;
  state.page = 1;
  renderResults();
});
document.querySelectorAll(".os-filter select").forEach(select =>
  select.addEventListener("change", event => {
    state.os = event.target.value;
    state.page = 1;
    document.querySelectorAll(".os-filter select").forEach(other => {
      other.value = state.os;
    });
    renderResults();
  })
);
document.addEventListener("click", event => {
  const category = event.target.closest("[data-category]");
  if (category) {
    state.category = category.dataset.category;
    state.page = 1;
    renderResults();
  }
  const page = event.target.closest("[data-page]");
  if (page && !page.disabled) {
    state.page = Number(page.dataset.page);
    renderResults();
    document
      .querySelector("#category-heading")
      .scrollIntoView({ block: "start", behavior: "instant" });
  }
  const detail = event.target.closest("[data-detail]");
  if (detail) showDetails(detail.dataset.detail);
  const download = event.target.closest("[data-download]");
  if (download) {
    const project = catalog.find(item => item.resource === download.dataset.download);
    if (project.download || !projectDialog.open) showDownload(project.resource);
  }
  const row = event.target.closest("[data-select]");
  if (row) {
    state.selected = row.dataset.select;
    if (matchMedia("(max-width: 700px)").matches) showDetails(state.selected);
    else renderResults();
  }
  if (event.target.closest("[data-reset]")) {
    state.query = "";
    state.category = "all";
    state.os = "all";
    state.page = 1;
    document.querySelector("#project-search").value = "";
    document.querySelectorAll(".os-filter select").forEach(select => {
      select.value = "all";
    });
    renderResults();
  }
  const shortcut = event.target.closest("[data-shortcut]");
  if (shortcut)
    openDialog(
      `<span class="dialog-eyebrow">LOCAL PREVIEW</span><h2 id="project-dialog-title">${shortcut.dataset.shortcut === "lookup" ? text.GetStart.getKey : text.GetStart.transfer}</h2><p class="dialog-summary">此处保留原有业务入口。本地原型仅演示布局，不会查询或修改 CDK。</p><button class="button primary" data-close-dialog type="button">完成预览 ${symbol("check", 16)}</button>`
    );
  if (event.target.closest("[data-close-dialog]")) projectDialog.close();
});
document.addEventListener("change", event => {
  if (!activeDownload || !event.target.id.startsWith("download-")) return;
  const key = event.target.id.replace("download-", "");
  activeDownload.selected[key] = event.target.value;
  renderDownloadFields();
  document.querySelector("#download-result").innerHTML = "";
});
document.addEventListener("submit", event => {
  if (event.target.id !== "download-form") return;
  event.preventDefault();
  const { selected } = activeDownload;
  document.querySelector("#download-result").innerHTML =
    `<div class="download-demo-success">${symbol("check", 18)}<div><strong>下载交互预览完成</strong><span>${escapeHtml([channelLabel(selected.channel), osLabel(selected.os), selected.arch].filter(value => value && value !== "any").join(" · "))}</span><p>仅演示本地流程，未请求下载文件或验证 CDK。</p></div></div>`;
});
document.addEventListener("keydown", event => {
  if (
    event.key === "/" &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) &&
    !projectDialog.open
  ) {
    event.preventDefault();
    document.querySelector("#project-search").focus();
  }
});
renderResults();
