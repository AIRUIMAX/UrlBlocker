// 50个励志语录库
const quotes = [
    "意志不该被打败，人生本应无限精彩",
    "每一次努力，都是在为未来铺路",
    "坚持到底，成功就在不远处",
    "相信自己，你比想象中更强大",
    "困难是成长的必经之路",
    "行动是梦想的开始",
    "不要等待机会，而要创造机会",
    "每一个不曾起舞的日子，都是对生命的辜负",
    "人生没有白走的路，每一步都算数",
    "你的努力，终将成就无可替代的自己",
    "今天很残酷，明天更残酷，后天很美好",
    "梦想不会逃跑，会逃跑的永远是自己",
    "成功不是终点，失败也不是终结，只有勇气才是永恒",
    "生活不是等待风暴过去，而是学会在雨中跳舞",
    "只有经历地狱般的磨练，才能炼出创造天堂的力量",
    "世界上只有一种真正的英雄主义，那就是在认清生活的真相后依然热爱生活",
    "生命中最重要的事情不是你遭遇了什么，而是你如何应对它",
    "不要让昨天的泪水淋湿今天的阳光",
    "即使爬到最高的山上，一次也只能脚踏实地地迈一步",
    "人生最大的荣耀不在于从不跌倒，而在于每次跌倒后都能爬起来",
    "当你想要放弃的时候，想想为什么坚持走到了这里",
    "没有比脚更长的路，没有比人更高的山",
    "每一次挫折都是成长的机会",
    "你的潜力无穷大，只待你去发掘",
    "保持微笑，生活就会变得美好",
    "今天的努力是明天的铺垫",
    "不要被困难吓倒，勇敢地迎接挑战",
    "人生就像一场马拉松，坚持到最后才是胜利者",
    "相信过程，结果自然会好",
    "每一天都是新的开始，充满无限可能",
    "成功属于那些永不放弃的人",
    "勇敢面对挑战，你会发现自己比想象中更坚强",
    "生命的意义在于不断超越自己",
    "每一个小目标的实现，都是向成功迈进的一步",
    "不要因为一时的失败而否定自己的能力",
    "坚持是成功的秘诀，耐心是胜利的关键",
    "你的态度决定你的高度",
    "成功的道路上没有捷径，只有脚踏实地的努力",
    "相信自己的选择，坚持自己的梦想",
    "困难是暂时的，成功是永恒的",
    "每一次尝试都是一次成长的机会",
    "不要害怕失败，失败是成功之母",
    "你的未来由你自己创造",
    "努力不一定成功，但放弃一定失败",
    "保持积极的心态，一切都会变得美好",
    "成功需要勇气，更需要坚持",
    "你的努力，时间会证明一切",
    "梦想是前进的动力，行动是实现梦想的阶梯",
    "不要让别人的看法影响你的决定",
    "每一个成功的人都曾经经历过失败",
    "相信自己，你一定能够实现自己的梦想"
];

// 生成随机颜色
function getRandomColor() {
    const colors = [
        '#c82333', // 红色
        '#28a745', // 绿色
        '#007bff', // 蓝色
        '#ffc107', // 黄色
        '#17a2b8', // 青色
        '#6f42c1', // 紫色
        '#fd7e14', // 橙色
        '#20c997', // 绿色
        '#e83e8c', // 粉色
        '#343a40'  // 深色
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// 随机选择并展示语录
function showRandomQuote() {
    const quoteElement = document.getElementById('quoteText');
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.textContent = quotes[randomIndex];
    quoteElement.style.color = getRandomColor();
}

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

// 记录已展开「重定向到」列表的规则索引（仅在本次面板会话内有效）
const expandedRedirects = new Set();

// 加载阻止的URL列表
function loadBlockedUrls() {
    chrome.storage.local.get(['urlBlockingRules'], function(result) {
        const blockedUrls = (result.urlBlockingRules || []).map(normalizeRule);
        const urlList = document.getElementById('urlList');
        urlList.innerHTML = '';
        
        if (blockedUrls.length === 0) {
            urlList.innerHTML = `
                <div class="empty-state">
                    <p>暂无阻止规则</p>
                    <p>添加规则后，它们将显示在这里</p>
                </div>
            `;
            return;
        }

        blockedUrls.forEach((item, index) => {
            const urlItem = document.createElement('div');
            urlItem.className = 'url-item';
            if (item.released) {
                urlItem.classList.add('released');
            }
            const reminderChecked = item.reminderEnabled ? 'checked' : '';
            const isOpen = expandedRedirects.has(index) ? 'open' : '';
            const redirectItems = item.redirectUrls.length > 0
                ? item.redirectUrls.map(url => `<span>${url}</span>`).join('')
                : '<span>未设置</span>';
            urlItem.innerHTML = `
                <div class="url-content" data-index="${index}">
                    <div class="url-row-head">
                        <strong>阻止</strong>
                        <div class="redirect-header">
                            <strong>重定向到</strong>
                            <button class="redirect-toggle ${isOpen}" data-index="${index}" title="展开 / 收起重定向目标">▸</button>
                            <span class="redirect-hint">${item.redirectUrls.length} 个目标</span>
                        </div>
                    </div>
                    <span>${item.url}</span>
                    <div class="redirect-list ${isOpen}" data-index="${index}">${redirectItems}</div>
                </div>
                <div class="url-actions">
                    <button class="btn release-btn" data-index="${index}">${item.released ? '已释放' : '释放'}</button>
                    <label class="reminder-toggle" data-index="${index}" title="释放该 URL 后，按设置间隔弹出提醒">
                        <input type="checkbox" class="reminder-checkbox" data-index="${index}" ${reminderChecked}>
                        <span>释放后提醒</span>
                    </label>
                    <span class="actions-spacer"></span>
                    <button class="btn visit-btn" data-index="${index}">访问</button>
                    <button class="btn delete-btn" data-index="${index}">删除</button>
                </div>
            `;
            urlList.appendChild(urlItem);
        });
        
        // 添加点击编辑事件监听
        document.querySelectorAll('.url-content').forEach(content => {
            content.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                startEditUrl(index);
            });
        });
        
        // 访问事件监听
        document.querySelectorAll('.visit-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                visitUrl(index);
            });
        });
        
        // 释放事件监听
        document.querySelectorAll('.release-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                toggleReleaseUrl(index);
            });
        });
        
        // 添加删除事件监听
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                deleteUrl(index);
            });
        });

        // 点击「重定向到」整块（文字 / 箭头 / 目标数）→ 展开 / 收起列表
        document.querySelectorAll('.redirect-header').forEach(header => {
            header.addEventListener('click', function(e) {
                e.stopPropagation(); // 避免冒泡触发卡片编辑
                const toggle = this.querySelector('.redirect-toggle');
                const index = parseInt(toggle.getAttribute('data-index'));
                const list = document.querySelector(`.redirect-list[data-index="${index}"]`);
                const open = list.classList.toggle('open');
                toggle.classList.toggle('open', open);
                if (open) {
                    expandedRedirects.add(index);
                } else {
                    expandedRedirects.delete(index);
                }
            });
        });

        // 添加提醒开关事件监听（label 与 checkbox 都阻止冒泡，避免误触发编辑）
        document.querySelectorAll('.reminder-toggle').forEach(label => {
            label.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        });
        document.querySelectorAll('.reminder-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                toggleReminderEnabled(index, this.checked);
            });
        });

        // 更新规则计数
        const activeCount = blockedUrls.filter(item => !item.released).length;
        document.getElementById('ruleCount').textContent = `共 ${blockedUrls.length} 条规则，生效中 ${activeCount} 条`;
    });
}

// 构建重定向URL输入框HTML
function buildRedirectInputs(index, redirectUrls) {
    let html = `<div class="redirect-inputs-list" data-rule-index="${index}">`;
    redirectUrls.forEach(url => {
        html += `
            <div class="redirect-input-row">
                <input type="text" class="edit-input redirect-edit-input" value="${url}" placeholder="重定向到的URL">
                <button class="btn remove-redirect-btn" title="删除此重定向URL">-</button>
            </div>
        `;
    });
    html += '</div>';
    return html;
}

// 为编辑模式的重定向输入框绑定删除事件
function bindRedirectInputEvents(index) {
    const urlItem = document.querySelector(`.url-content[data-index="${index}"]`).parentNode;
    urlItem.querySelectorAll('.remove-redirect-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            this.closest('.redirect-input-row').remove();
        });
    });
}

// 开始编辑URL
function startEditUrl(index) {
    chrome.storage.local.get(['urlBlockingRules'], function(result) {
        const blockedUrls = (result.urlBlockingRules || []).map(normalizeRule);
        const item = blockedUrls[index];
        const urlItem = document.querySelector(`.url-content[data-index="${index}"]`).parentNode;
        
        urlItem.innerHTML = `
            <div class="url-content edit-mode" data-index="${index}">
                <strong>阻止</strong>
                <input type="text" class="edit-input" id="edit-url-${index}" value="${item.url}" placeholder="要阻止的URL">
                <strong>重定向到</strong>
                ${buildRedirectInputs(index, item.redirectUrls)}
                <button class="btn add-redirect-btn" data-index="${index}">+ 添加重定向URL</button>
            </div>
            <div class="url-actions">
                <button class="btn cancel-btn" data-index="${index}">取消</button>
                <span class="actions-spacer"></span>
                <button class="btn save-btn" data-index="${index}">保存</button>
            </div>
        `;
        
        bindRedirectInputEvents(index);
        
        // 添加保存事件监听
        document.querySelector(`.save-btn[data-index="${index}"]`).addEventListener('click', function(e) {
            e.stopPropagation();
            saveEditUrl(index);
        });
        
        // 添加取消事件监听
        document.querySelector(`.cancel-btn[data-index="${index}"]`).addEventListener('click', function(e) {
            e.stopPropagation();
            loadBlockedUrls();
        });
        
        // 添加重定向URL输入框
        document.querySelector(`.add-redirect-btn[data-index="${index}"]`).addEventListener('click', function(e) {
            e.stopPropagation();
            const list = document.querySelector(`.redirect-inputs-list[data-rule-index="${index}"]`);
            const newRow = document.createElement('div');
            newRow.className = 'redirect-input-row';
            newRow.innerHTML = `
                <input type="text" class="edit-input redirect-edit-input" value="" placeholder="重定向到的URL">
                <button class="btn remove-redirect-btn" title="删除此重定向URL">-</button>
            `;
            list.appendChild(newRow);
            newRow.querySelector('.remove-redirect-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                newRow.remove();
            });
        });
    });
}

// 保存编辑的URL
function saveEditUrl(index) {
    const newUrl = document.getElementById(`edit-url-${index}`).value.trim();
    const redirectInputs = document.querySelectorAll(`.redirect-inputs-list[data-rule-index="${index}"] .redirect-edit-input`);
    let newRedirectUrls = Array.from(redirectInputs)
        .map(input => input.value.trim())
        .filter(Boolean)
        .map(url => formatRedirectUrl(url));
    
    if (!newUrl || newRedirectUrls.length === 0) {
        alert('请填写完整的URL信息');
        return;
    }
    
    if (newRedirectUrls.some(url => !isValidUrl(url))) {
        alert('重定向URL格式无效，请输入有效的URL');
        return;
    }
    
    // 检查是否阻止到自身（避免重定向循环）
    if (newRedirectUrls.some(url => normalizeUrl(newUrl) === normalizeUrl(url))) {
        alert('警告：阻止URL和重定向URL相同，这可能导致重定向循环！');
        return;
    }
    
    chrome.storage.local.get(['urlBlockingRules'], function(result) {
        const blockedUrls = result.urlBlockingRules || [];
        blockedUrls[index].url = newUrl;
        blockedUrls[index].redirectUrls = newRedirectUrls;
        delete blockedUrls[index].redirectUrl;
        
        chrome.storage.local.set({urlBlockingRules: blockedUrls}, function() {
            loadBlockedUrls();
            chrome.runtime.sendMessage({action: 'updateRules'});
        });
    });
}

// 验证URL格式
function isValidUrl(url) {
    try {
        // 如果是相对路径或域名，添加https://前缀进行验证
        const testUrl = url.includes('://') ? url : `https://${url}`;
        new URL(testUrl);
        return true;
    } catch {
        return false;
    }
}

// 格式化重定向URL
function formatRedirectUrl(url) {
    if (url.includes('://')) {
        return url;
    }
    // 如果没有协议，默认使用https://
    return `https://${url}`;
}

// 规范化URL用于比较
function normalizeUrl(url) {
    return url.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
}

// 添加新的阻止URL
function addBlockedUrl() {
    const blockUrl = document.getElementById('blockUrl').value.trim();
    let redirectUrl = document.getElementById('redirectUrl').value.trim();
    
    if (!blockUrl || !redirectUrl) {
        alert('请填写完整的URL信息');
        return;
    }
    
    // 格式化重定向URL
    redirectUrl = formatRedirectUrl(redirectUrl);
    
    if (!isValidUrl(redirectUrl)) {
        alert('重定向URL格式无效，请输入有效的URL');
        return;
    }
    
    // 检查是否阻止到自身（避免重定向循环）
    if (normalizeUrl(blockUrl) === normalizeUrl(redirectUrl)) {
        alert('警告：阻止URL和重定向URL相同，这可能导致重定向循环！');
        return;
    }
    
    chrome.storage.local.get(['urlBlockingRules'], function(result) {
        const blockedUrls = result.urlBlockingRules || [];
        
        // 检查重复规则（同一被阻止URL只能有一条规则）
        const isDuplicate = blockedUrls.some(item => item.url === blockUrl);
        
        if (isDuplicate) {
            alert('已存在相同的阻止URL，请编辑现有规则以添加更多重定向URL');
            return;
        }
        
        blockedUrls.push({
            url: blockUrl,
            redirectUrls: [redirectUrl],
            released: false,
            reminderEnabled: false
        });
        
        chrome.storage.local.set({urlBlockingRules: blockedUrls}, function() {
            document.getElementById('blockUrl').value = '';
            document.getElementById('redirectUrl').value = '';
            loadBlockedUrls();
            chrome.runtime.sendMessage({action: 'updateRules'});
        });
    });
}

// 切换URL释放状态
function toggleReleaseUrl(index) {
    chrome.storage.local.get(['urlBlockingRules'], function(result) {
        const blockedUrls = result.urlBlockingRules || [];
        const wasReleased = blockedUrls[index].released;
        const item = blockedUrls[index];
        item.released = !item.released;

        chrome.storage.local.set({urlBlockingRules: blockedUrls}, function() {
            console.log(`URL释放状态切换: 索引 ${index}, 原状态: ${wasReleased}, 新状态: ${item.released}`);
            loadBlockedUrls();
            // 通知后台更新规则
            chrome.runtime.sendMessage({action: 'updateRules'});

            // 如果变为释放且开启了提醒，通知后台开始提醒会话
            if (item.released && item.reminderEnabled) {
                chrome.runtime.sendMessage({
                    action: 'startReminderSession',
                    rule: { url: item.url }
                });
            }
            // 如果由释放变为拦截，通知后台停止提醒会话
            if (!item.released) {
                chrome.runtime.sendMessage({
                    action: 'stopReminderSession',
                    rule: { url: item.url }
                });
            }

            // 添加调试信息显示
            chrome.runtime.sendMessage({action: 'getRulesInfo'}, function(response) {
                console.log('当前活动规则数量:', response.activeRuleCount);
                console.log('当前规则ID数组:', response.currentRuleIds);
            });
        });
    });
}

// 切换规则提醒开关
function toggleReminderEnabled(index, enabled) {
    chrome.storage.local.get(['urlBlockingRules'], function(result) {
        const blockedUrls = result.urlBlockingRules || [];
        const item = blockedUrls[index];
        item.reminderEnabled = enabled;
        chrome.storage.local.set({ urlBlockingRules: blockedUrls }, function() {
            if (enabled && item.released) {
                chrome.runtime.sendMessage({ action: 'startReminderSession', rule: { url: item.url } });
            } else if (!enabled) {
                chrome.runtime.sendMessage({ action: 'stopReminderSession', rule: { url: item.url } });
            }
        });
    });
}

// 删除阻止URL
function deleteUrl(index) {
    chrome.storage.local.get(['urlBlockingRules'], function(result) {
        const blockedUrls = result.urlBlockingRules || [];
        const removed = blockedUrls.splice(index, 1);

        chrome.storage.local.set({urlBlockingRules: blockedUrls}, function() {
            loadBlockedUrls();
            // 通知后台更新规则
            chrome.runtime.sendMessage({action: 'updateRules'});
            // 停止被删除规则的提醒会话
            if (removed.length > 0) {
                chrome.runtime.sendMessage({
                    action: 'stopReminderSession',
                    rule: { url: removed[0].url }
                });
            }
        });
    });
}

// 一键访问被阻止的URL
function visitUrl(index) {
    chrome.storage.local.get(['urlBlockingRules'], function(result) {
        const blockedUrls = result.urlBlockingRules || [];
        const item = blockedUrls[index];
        if (!item) return;
        
        // 格式化URL：如果没有协议则添加https://
        let targetUrl = item.url;
        if (!targetUrl.includes('://')) {
            targetUrl = 'https://' + targetUrl;
        }
        
        chrome.tabs.create({ url: targetUrl });
    });
}



// 显示存储数据（安全调试方法）
function showStoredData() {
    chrome.storage.local.get(['urlBlockingRules'], function(result) {
        const blockedUrls = result.urlBlockingRules || [];
        const dataStr = JSON.stringify(blockedUrls, null, 2);
        
        // 创建调试面板
        const debugPanel = document.createElement('div');
        debugPanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 80%;
            max-height: 80%;
            overflow: auto;
            font-family: monospace;
        `;
        
        debugPanel.innerHTML = `
            <h3 style="margin-top: 0; color: #2c3e50;">存储数据调试面板</h3>
            <textarea id="debugData" style="width: 100%; height: 200px; font-family: monospace; padding: 10px; border: 2px solid #e9ecef; border-radius: 8px; margin-bottom: 10px;">${dataStr}</textarea>
            <div style="display: flex; gap: 10px;">
                <button id="saveDebugData" style="padding: 10px 16px; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer;">保存修改</button>
                <button id="closeDebugPanel" style="padding: 10px 16px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">关闭</button>
                <button id="reloadDebugData" style="padding: 10px 16px; background: #007acc; color: white; border: none; border-radius: 6px; cursor: pointer;">重新加载</button>
            </div>
            <p style="font-size: 12px; color: #6c757d; margin-top: 10px;">
                警告：修改数据可能导致扩展功能异常，请谨慎操作！
            </p>
        `;
        
        document.body.appendChild(debugPanel);
        
        // 保存按钮事件
        document.getElementById('saveDebugData').addEventListener('click', function() {
            try {
                const newData = JSON.parse(document.getElementById('debugData').value);
                chrome.storage.local.set({urlBlockingRules: newData}, function() {
                    alert('数据保存成功！');
                    loadBlockedUrls();
                    chrome.runtime.sendMessage({action: 'updateRules'});
                    debugPanel.remove();
                });
            } catch (e) {
                alert('JSON格式错误：' + e.message);
            }
        });
        
        // 关闭按钮事件
        document.getElementById('closeDebugPanel').addEventListener('click', function() {
            debugPanel.remove();
        });
        
        // 重新加载按钮事件
        document.getElementById('reloadDebugData').addEventListener('click', function() {
            debugPanel.remove();
            showStoredData();
        });
    });
}

// 打开设置弹窗
function openSettingsModal() {
    chrome.storage.local.get(['reminderIntervalMinutes'], function(result) {
        const interval = typeof result.reminderIntervalMinutes === 'number' ? result.reminderIntervalMinutes : 15;
        document.getElementById('intervalInput').value = interval;
        document.getElementById('settingsModal').classList.add('show');
    });
}

// 关闭设置弹窗
function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('show');
}

// 保存设置
function saveSettings() {
    const input = document.getElementById('intervalInput');
    let interval = parseInt(input.value, 10);
    if (Number.isNaN(interval) || interval < 1) {
        interval = 15;
    }
    interval = Math.max(1, Math.min(interval, 1440));
    input.value = interval;

    chrome.storage.local.set({ reminderIntervalMinutes: interval }, function() {
        // 通知后台重新调度提醒
        chrome.runtime.sendMessage({ action: 'settingsUpdated' });
        closeSettingsModal();
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    showRandomQuote();
    loadBlockedUrls();

    document.getElementById('addBtn').addEventListener('click', addBlockedUrl);

    // 支持回车键添加
    document.getElementById('redirectUrl').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addBlockedUrl();
        }
    });

    // 设置弹窗
    document.getElementById('openSettings').addEventListener('click', function(e) {
        e.stopPropagation();
        openSettingsModal();
    });
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('cancelSettings').addEventListener('click', closeSettingsModal);
    // 点击遮罩区域关闭
    document.getElementById('settingsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSettingsModal();
        }
    });
});