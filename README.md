## Mirror酱

### **使用Mirror酱更新你的App**

Mirror酱是一个第三方应用分发平台，让开源应用的更新更简单。  
用户付费使用，收益与开发者共享。此外，Mirror酱本身也是开源的。

## 官网

- 主站: [mirrorchyan.com](https://mirrorchyan.com)
- 备站: [mirrorchyan.net](https://mirrorchyan.net)

## 交流反馈

- B 站: [Mirror酱-Official](https://space.bilibili.com/3546848463685966)
- QQ 频道：[MirrorChyan](https://pd.qq.com/g/MirrorChyan)
- 用户售后 QQ 群：534984726
- 项目接入 QQ：1751971337

## 开发者文档

[Mirror酱服务集成指南](https://github.com/MirrorChyan/docs)

## 前端开发

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/Checkout.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Phase 1 页面布局 AB

沿用现有 `page_group` 槽位，取值和远程分流协议不变：

| 技术分组    | 首页         | Projects 页      |
| ----------- | ------------ | ---------------- |
| `a`（默认） | 原版，对照组 | 原版，对照组     |
| `b`         | 设计 A       | 设计 A1 卡片网格 |

这里的技术分组 `b` 对应选定的设计 A / A1，并非备选设计 B。备选 B / C / D 和 Projects A2 / A3 继续保存在 `preview/layout-lab/`，没有加入运行时分流。

正式页面共用现有套餐和项目 API，不使用 demo 的固定价格或目录快照。slogan、产品介绍、项目名称 / 简介及原有中英文翻译保持不变；`LayoutA` 仅增加搜索、分类、筛选、分页等操作标签。新版下载卡片复用 `ProjectCard` 的真实下载 / 分享 / CDK 弹窗及 `rid / os / arch / channel` 深链接。

实验组首页的中文主标题保持单行，两行产品介绍提高字号；应用入口居中展示接入数量和应用图标，整条可点击，并扩大区块间距。Projects 卡片整体可点击，保留单个下载入口与独立官网链接；分页提供带文字的上一页 / 下一页按钮、当前页高亮及页码跳转。

本地开发预览：

- 对照组：`/zh/get-start?_g=a`、`/zh/projects?_g=a`。
- 实验组：`/zh/get-start?_g=b`、`/zh/projects?_g=b`。
- 英文页面使用 `/en/` 前缀。

`_g` 沿用现有预览机制，通过会话 cookie 保持跨页分组；预览曝光标记为 `pre`。真实流量继续由 `SPLIT_SOURCE` 配置分配，本次没有修改远程权重或发布配置。两页都记录页面曝光，按槽位、页面路径和实验标记去重；套餐点击继续上报原有 `plan_click` 和 `plan_id`。

新版页头 logo 来自用户提供的原始 PNG，等比例导出为 `public/brand/mirrorchyan-logo.webp`：128×128、9,160 字节，保留透明背景。原始大图不进入前端包，现有 favicon 保持不变。

验证包括类型检查、生产构建、两组服务端页面与跨页预览 cookie、中英文及手机布局、项目搜索 / 筛选 / 分页、下载深链接与上报载荷。验收仅打开原有收银台和下载弹窗，没有发起支付或使用真实 CDK 下载。本地没有接入生产 `/m/e` 接收服务，已核对浏览器发出的曝光和套餐点击载荷，未验证服务端入库。

### 其他用户页面统一样式

首页与 Projects 继续使用上面的 AB 对照；其他用户页面不参与分流，两组都使用 A 风格：

- `/get-key`：CDK / 订单查询表单。
- `/transfer`：时长转换表单，保留原有验证和转移操作。
- `/checkout/[[...planId]]`：收银台、无效订单状态、续期输入及支付弹窗。
- `/dashboard`：独立的开发者工作台，页头保留品牌和语言切换，不展示官网订阅 / 项目 / CDK 查询导航，页脚仅保留备案信息。桌面端左侧切换销售统计 / 请求统计，窄屏改为横向切换；筛选状态、CSV 导出及统计计算沿用原实现。
- 订单查询结果、支付成功、项目下载与分享下载弹窗共用统一的边框、配色和间距。
- `/disclaimer.html`：协议阅读页，正文及日期未改。

旧 `/show-key`、`/download` 地址继续按原规则跳转到 Projects，不另建重复页面。共享弹窗的新外观也适用于对照组，但首页套餐和 Projects 卡片的两套布局继续保留。

Dashboard 的本地视觉验收使用临时 localhost API 样例，覆盖切换、筛选保留及 CSV 导出；样例服务和数据不进入应用代码。未使用真实统计凭据，也未执行付款、时长转移或真实 CDK 下载。
