// 将旧格式（单个 redirectUrl）转换为新格式（redirectUrls 数组）
function normalizeRule(item) {
    if (item && typeof item.redirectUrl === 'string' && !Array.isArray(item.redirectUrls)) {
        item.redirectUrls = [item.redirectUrl];
    }
    if (!item.redirectUrls) {
        item.redirectUrls = [];
    }
    return item;
}

// 验证重定向URL格式
function isValidRedirectUrl(url) {
    try {
        const parsedUrl = new URL(url);
        return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
        return false;
    }
}

// 模拟 declarativeNetRequest 的 urlFilter 匹配
function urlMatchesFilter(url, filter) {
    if (!filter || !url) return false;
    const f = filter.toLowerCase();
    const u = url.toLowerCase();

    if (f.startsWith('||')) {
        // 域名锚点：||example.com 匹配 example.com 及其子域
        const domain = f.slice(2);
        try {
            const urlObj = new URL(u);
            const host = urlObj.hostname;
            return host === domain || host.endsWith('.' + domain);
        } catch {
            return false;
        }
    } else if (f.startsWith('|')) {
        // 开头锚点
        return u.startsWith(f.slice(1));
    } else if (f.endsWith('|')) {
        // 结尾锚点
        return u.endsWith(f.slice(0, -1));
    } else if (f.includes('*')) {
        // 通配符
        try {
            const regex = new RegExp('^' + f.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
            return regex.test(u);
        } catch {
            return u.includes(f);
        }
    } else {
        // 简单包含匹配
        return u.includes(f);
    }
}

// 清理旧版 DNR 动态规则（避免残留规则导致重定向到中间页）
async function clearDynamicRules() {
    try {
        const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
        const existingRuleIds = existingRules.map(rule => rule.id);
        if (existingRuleIds.length > 0) {
            await chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: existingRuleIds
            });
            console.log(`已移除 ${existingRuleIds.length} 条旧 DNR 规则`);
        }
    } catch (e) {
        console.error('清理 DNR 规则失败:', e);
    }
}

// 检查并执行随机重定向
async function checkAndRedirect(tabId, url) {
    const result = await chrome.storage.local.get(['urlBlockingRules']);
    const blockedUrls = (result.urlBlockingRules || []).map(normalizeRule);

    for (const item of blockedUrls) {
        if (item.released) continue;
        if (!urlMatchesFilter(url, item.url)) continue;

        const validUrls = item.redirectUrls.filter(isValidRedirectUrl);
        if (validUrls.length === 0) continue;

        const chosen = validUrls[Math.floor(Math.random() * validUrls.length)];
        chrome.tabs.update(tabId, { url: chosen });
        break; // 只匹配第一条规则
    }
}

// 监听主框架导航，在页面加载前拦截
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
    if (details.frameId !== 0) return; // 只处理主框架
    checkAndRedirect(details.tabId, details.url);
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener(function(request, _sender, sendResponse) {
    if (request.action === 'updateRules') {
        sendResponse({ status: 'rules_updated' });
        return true;
    } else if (request.action === 'getRulesInfo') {
        sendResponse({ activeRuleCount: 0, currentRuleIds: [] });
        return true;
    }
    return true;
});

// 扩展安装或启动时清理旧版 DNR 规则
chrome.runtime.onStartup.addListener(clearDynamicRules);
chrome.runtime.onInstalled.addListener(clearDynamicRules);
