// 将旧格式（单个 redirectUrl）转换为新格式（redirectUrls 数组）
function normalizeRule(item) {
    if (item && typeof item.redirectUrl === 'string' && !Array.isArray(item.redirectUrls)) {
        item.redirectUrls = [item.redirectUrl];
    }
    if (!item.redirectUrls) {
        item.redirectUrls = [];
    }
    if (typeof item.released !== 'boolean') {
        item.released = false;
    }
    if (typeof item.reminderEnabled !== 'boolean') {
        item.reminderEnabled = false;
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

// ==================== 提醒功能 ====================

const REMINDER_ALARM_PREFIX = 'url-reminder-';
const DEFAULT_REMINDER_INTERVAL = 15;

// 生成提醒 alarm 名称
function alarmNameForRule(ruleUrl) {
    return `${REMINDER_ALARM_PREFIX}${encodeURIComponent(ruleUrl)}`;
}

// 获取提醒间隔（分钟）
async function getReminderInterval() {
    const result = await chrome.storage.local.get(['reminderIntervalMinutes']);
    const interval = parseInt(result.reminderIntervalMinutes, 10);
    return Number.isNaN(interval) || interval < 1 ? DEFAULT_REMINDER_INTERVAL : interval;
}

// 开始一条规则的提醒会话
async function startReminderSession(ruleUrl) {
    const interval = await getReminderInterval();
    const alarmName = alarmNameForRule(ruleUrl);

    // 记录会话开始时间
    const sessions = (await chrome.storage.local.get(['reminderSessions'])).reminderSessions || {};
    sessions[ruleUrl] = {
        startedAt: Date.now(),
        lastRemindedAt: null,
        intervalMinutes: interval
    };
    await chrome.storage.local.set({ reminderSessions: sessions });

    // 创建一次性 alarm，首次在 interval 分钟后触发
    await chrome.alarms.create(alarmName, { delayInMinutes: interval });
    console.log(`已启动提醒会话: ${ruleUrl}, 间隔: ${interval} 分钟`);
}

// 停止一条规则的提醒会话
async function stopReminderSession(ruleUrl) {
    const alarmName = alarmNameForRule(ruleUrl);
    try {
        await chrome.alarms.clear(alarmName);
    } catch (e) {
        console.error('清除 alarm 失败:', e);
    }

    const sessions = (await chrome.storage.local.get(['reminderSessions'])).reminderSessions || {};
    if (sessions[ruleUrl]) {
        delete sessions[ruleUrl];
        await chrome.storage.local.set({ reminderSessions: sessions });
    }
    console.log(`已停止提醒会话: ${ruleUrl}`);
}

// 重新调度所有已释放且开启提醒的规则
async function rescheduleAllReminders() {
    const result = await chrome.storage.local.get(['urlBlockingRules']);
    const rules = (result.urlBlockingRules || []).map(normalizeRule);

    for (const rule of rules) {
        const alarmName = alarmNameForRule(rule.url);
        if (rule.released && rule.reminderEnabled) {
            const sessions = (await chrome.storage.local.get(['reminderSessions'])).reminderSessions || {};
            const session = sessions[rule.url];
            if (session) {
                // 已有会话，从上次提醒时间或释放时间计算下一次触发时间
                const last = session.lastRemindedAt || session.startedAt;
                const interval = (await getReminderInterval()) * 60 * 1000;
                const nextTrigger = last + interval;
                const delayMs = Math.max(0, nextTrigger - Date.now());
                await chrome.alarms.create(alarmName, { delayInMinutes: Math.max(1, delayMs / 1000 / 60) });
            } else {
                await startReminderSession(rule.url);
            }
        } else {
            await chrome.alarms.clear(alarmName);
        }
    }
}

// 找到匹配规则且已释放的活跃标签页
async function findActiveTabsForRule(ruleUrl) {
    const tabs = await chrome.tabs.query({});
    const result = await chrome.storage.local.get(['urlBlockingRules']);
    const rules = (result.urlBlockingRules || []).map(normalizeRule);
    const rule = rules.find(r => r.url === ruleUrl);
    if (!rule || !rule.released || !rule.reminderEnabled) return [];

    return tabs.filter(tab => tab.url && urlMatchesFilter(tab.url, ruleUrl));
}

// 弹出提醒（通过 content script）
async function triggerReminder(ruleUrl) {
    const tabs = await findActiveTabsForRule(ruleUrl);
    if (tabs.length === 0) {
        // 没有活跃标签页，继续下一次提醒
        const interval = await getReminderInterval();
        await chrome.alarms.create(alarmNameForRule(ruleUrl), { delayInMinutes: interval });
        return;
    }

    // 向第一个匹配的标签页发送提醒消息
    const tab = tabs[0];
    try {
        await chrome.tabs.sendMessage(tab.id, {
            action: 'showReminder',
            url: ruleUrl,
            intervalMinutes: await getReminderInterval()
        });
    } catch (e) {
        console.error('发送提醒消息失败:', e);
        // 失败时仍然继续下一次提醒，避免会话中断
        const interval = await getReminderInterval();
        await chrome.alarms.create(alarmNameForRule(ruleUrl), { delayInMinutes: interval });
    }
}

// 处理用户从提醒弹窗返回的操作
async function handleReminderResponse(ruleUrl, action) {
    if (action === 'block') {
        // 用户选择重新拦截
        const result = await chrome.storage.local.get(['urlBlockingRules']);
        const rules = (result.urlBlockingRules || []).map(normalizeRule);
        const index = rules.findIndex(r => r.url === ruleUrl);
        if (index >= 0) {
            rules[index].released = false;
            await chrome.storage.local.set({ urlBlockingRules: rules });
        }
        await stopReminderSession(ruleUrl);

        // 尝试将当前匹配该规则的标签页重定向
        const tabs = await chrome.tabs.query({});
        for (const tab of tabs) {
            if (tab.url && urlMatchesFilter(tab.url, ruleUrl)) {
                const validUrls = rules[index].redirectUrls.filter(isValidRedirectUrl);
                if (validUrls.length > 0) {
                    const chosen = validUrls[Math.floor(Math.random() * validUrls.length)];
                    chrome.tabs.update(tab.id, { url: chosen });
                }
                break;
            }
        }
    } else if (action === 'continue') {
        // 用户选择继续使用，记录本次提醒时间并继续下一次
        const sessions = (await chrome.storage.local.get(['reminderSessions'])).reminderSessions || {};
        if (sessions[ruleUrl]) {
            sessions[ruleUrl].lastRemindedAt = Date.now();
            sessions[ruleUrl].intervalMinutes = await getReminderInterval();
            await chrome.storage.local.set({ reminderSessions: sessions });
        }
        const interval = await getReminderInterval();
        await chrome.alarms.create(alarmNameForRule(ruleUrl), { delayInMinutes: interval });
    }
}

// 监听 alarm
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name.startsWith(REMINDER_ALARM_PREFIX)) {
        const ruleUrl = decodeURIComponent(alarm.name.slice(REMINDER_ALARM_PREFIX.length));
        triggerReminder(ruleUrl);
    }
});

// 监听来自 popup / content / options 的消息
chrome.runtime.onMessage.addListener(function(request, _sender, sendResponse) {
    if (request.action === 'updateRules') {
        sendResponse({ status: 'rules_updated' });
        return true;
    } else if (request.action === 'getRulesInfo') {
        sendResponse({ activeRuleCount: 0, currentRuleIds: [] });
        return true;
    } else if (request.action === 'startReminderSession' && request.rule && request.rule.url) {
        startReminderSession(request.rule.url);
        sendResponse({ status: 'started' });
        return true;
    } else if (request.action === 'stopReminderSession' && request.rule && request.rule.url) {
        stopReminderSession(request.rule.url);
        sendResponse({ status: 'stopped' });
        return true;
    } else if (request.action === 'settingsUpdated') {
        rescheduleAllReminders();
        sendResponse({ status: 'rescheduled' });
        return true;
    } else if (request.action === 'reminderResponse' && request.url) {
        handleReminderResponse(request.url, request.response);
        sendResponse({ status: 'handled' });
        return true;
    }
    return true;
});

// 扩展安装或启动时清理旧版 DNR 规则，并恢复提醒调度
chrome.runtime.onStartup.addListener(() => {
    clearDynamicRules();
    rescheduleAllReminders();
});
chrome.runtime.onInstalled.addListener(() => {
    clearDynamicRules();
    rescheduleAllReminders();
});
