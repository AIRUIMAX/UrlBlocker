// 内容脚本：处理提醒弹窗

(function() {
    'use strict';

    // 避免重复注入
    if (window.__urlBlockerReminderInjected) {
        return;
    }
    window.__urlBlockerReminderInjected = true;

    let currentOverlay = null;

    function createReminderOverlay(data) {
        if (currentOverlay) {
            currentOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'url-blocker-reminder-overlay';
        overlay.innerHTML = `
            <div class="url-blocker-reminder-mask"></div>
            <div class="url-blocker-reminder-card">
                <div class="reminder-icon">⏰</div>
                <h2>你已经使用了 ${data.intervalMinutes} 分钟</h2>
                <p>是否重新拦截该 URL？</p>
                <p class="reminder-url">${data.url}</p>
                <div class="reminder-actions">
                    <button id="url-blocker-reminder-block" class="reminder-btn reminder-btn-primary">是，重新拦截</button>
                    <button id="url-blocker-reminder-continue" class="reminder-btn reminder-btn-secondary">不，继续使用</button>
                </div>
            </div>
        `;

        const style = document.createElement('style');
        style.textContent = `
            #url-blocker-reminder-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 2147483647;
                display: flex;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .url-blocker-reminder-mask {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.45);
                backdrop-filter: blur(4px);
            }
            .url-blocker-reminder-card {
                position: relative;
                background: white;
                border-radius: 16px;
                padding: 32px;
                width: 90%;
                max-width: 420px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                text-align: center;
                animation: urlBlockerReminderIn 0.25s ease-out;
            }
            @keyframes urlBlockerReminderIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .reminder-icon {
                font-size: 48px;
                margin-bottom: 12px;
            }
            .url-blocker-reminder-card h2 {
                margin: 0 0 12px 0;
                color: #2c3e50;
                font-size: 20px;
            }
            .url-blocker-reminder-card p {
                margin: 0 0 8px 0;
                color: #495057;
                font-size: 15px;
            }
            .url-blocker-reminder-card .reminder-url {
                font-size: 13px;
                color: #6c757d;
                word-break: break-all;
                margin-bottom: 24px;
            }
            .reminder-actions {
                display: flex;
                flex-direction: column;
                gap: 12px;
            }
            .reminder-btn {
                padding: 12px 16px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            .reminder-btn-primary {
                background: linear-gradient(135deg, #007acc, #005a9e);
                color: white;
            }
            .reminder-btn-primary:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0,122,204,0.3);
            }
            .reminder-btn-secondary {
                background: #e9ecef;
                color: #495057;
            }
            .reminder-btn-secondary:hover {
                background: #dee2e6;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);
        currentOverlay = overlay;

        overlay.querySelector('#url-blocker-reminder-block').addEventListener('click', () => {
            chrome.runtime.sendMessage({
                action: 'reminderResponse',
                url: data.url,
                response: 'block'
            });
            removeOverlay();
        });

        overlay.querySelector('#url-blocker-reminder-continue').addEventListener('click', () => {
            chrome.runtime.sendMessage({
                action: 'reminderResponse',
                url: data.url,
                response: 'continue'
            });
            removeOverlay();
        });

        function removeOverlay() {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            if (style && style.parentNode) {
                style.parentNode.removeChild(style);
            }
            currentOverlay = null;
        }
    }

    chrome.runtime.onMessage.addListener((request, _sender, _sendResponse) => {
        if (request.action === 'showReminder') {
            createReminderOverlay(request);
        }
    });
})();
