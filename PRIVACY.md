# 隐私政策 / Privacy Policy

**URL Blocker · 自律拦截器**

最后更新：2026-09-24

## 一句话总结

本扩展不收集、不存储、不传输任何个人信息。所有数据都只留在你自己的浏览器里。

## 具体说明

### 1. 我们收集什么

**什么都不收集。**

本扩展不包含任何统计、埋点、崩溃上报或分析 SDK，不采集你的浏览历史、访问记录、搜索内容或任何身份信息。

### 2. 我们存储什么

仅存储**你主动填写的拦截规则**，位于浏览器本地存储 `chrome.storage.local` 的 `urlBlockingRules` 键下：

* 被阻止的 URL 匹配表达式
* 你设置的重定向目标网址
* 每条规则是否处于「已释放」状态

这些数据：

* 只保存在**本机浏览器**中
* 不会同步到任何云服务
* 不会发送到任何服务器
* 卸载扩展或在扩展详情页清除数据后即被删除

### 3. 网络请求

本扩展**不发起任何网络请求**。所有逻辑（URL 匹配、随机选择目标、界面渲染）均在本地完成。

### 4. 权限用途

| 权限 | 用途 | 是否用于数据传输 |
| --- | --- | --- |
| `storage` | 在本机保存你的规则 | 否 |
| `webNavigation` | 在导航发起前获知即将访问的 URL | 否 |
| `tabs` | 将当前标签页重定向到目标网址 | 否 |
| `declarativeNetRequest` | 清理旧版本遗留的动态规则 | 否 |
| `host_permissions: <all_urls>` | 被阻止的站点无法预先枚举，需匹配任意站点 | 否 |

`<all_urls>` 这一项看起来范围较大，但它的作用仅限于**在本地比对 URL 字符串**，不读取页面内容，也不上传任何信息。

### 5. 第三方

本扩展不集成任何第三方服务、广告或追踪器。

### 6. 免责

本扩展按「原样」提供，用于辅助使用者按自身意愿管理自己的浏览器使用行为。

### 7. 联系方式

如有疑问，请在本仓库提交 [Issue](../../issues)。

---

# Privacy Policy (English)

**Summary:** This extension collects nothing, stores nothing remotely, and transmits nothing.
All rules you configure live only in your own browser's local storage (`chrome.storage.local`).

* **No data collection** — no analytics, telemetry, or crash reporting.
* **No network requests** — all matching and rendering happen locally.
* **Permissions** are used solely for local URL comparison and tab redirection.
* Uninstalling the extension removes all locally stored rules.

For questions, please open an [Issue](../../issues).
