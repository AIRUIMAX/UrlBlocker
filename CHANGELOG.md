# Changelog

本项目的所有重要变更都会记录在此文件。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2026-09-24

首个正式发布版本。

### 新增

* 基于 `webNavigation.onBeforeNavigate` 的**导航前拦截**，主框架导航不会真正加载
* **一对多随机重定向**：一条阻止规则可配置多个目标网址，每次访问随机命中一个
* 完整的 **URL 匹配语法**：域名锚点 `||`、开头锚点 `|`、结尾锚点 `|`、通配符 `*`、子串包含
* 弹窗界面支持规则的**可视化增删改**，点击卡片即可就地编辑
* **释放 / 收回**软开关：临时放行某个站点，界面标灰提示
* 面板顶部**随机励志语录**，每次打开随机显示并随机换色
* **一键访问**被阻止的网址，便于验证链接有效性
* 规则存储于 `chrome.storage.local`，纯本地、零网络请求、零依赖
* 自动兼容旧版单目标规则格式（`redirectUrl` → `redirectUrls`）

### 说明

* 同一个 URL 只应用第一条命中的规则
* 仅拦截主框架导航（`frameId === 0`），iframe 内部的导航不受影响
* 首次发布即附带 README、隐私政策与 MIT 许可证

[1.0.0]: https://github.com/AIRUIMAX/UrlBlocker/releases/tag/v1.0.0
