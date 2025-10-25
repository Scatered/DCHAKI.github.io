// 用户个性化设置管理器
class UserPreferenceManager {
    constructor() {
        this.settings = this.loadSettings();
        this.applyAllSettings();
        this.initEventListeners();
    }
    
    // 加载用户设置
    loadSettings() {
        const defaultSettings = {
            theme: 'dark',
            fontSize: 'normal',
            layout: 'compact',
            notifications: true,
            language: 'zh-CN'
        };
        
        const saved = DCHAKI_Security.dcsys_secureStorage.get('userPreferences');
        return { ...defaultSettings, ...saved };
    }
    
    // 保存用户设置
    saveSettings() {
        return DCHAKI_Security.dcsys_secureStorage.set('userPreferences', this.settings);
    }
    
    // 应用所有设置
    applyAllSettings() {
        this.applyTheme(this.settings.theme);
        this.applyFontSize(this.settings.fontSize);
        this.applyLayout(this.settings.layout);
    }
    
    // 应用主题
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeButton(theme);
    }
    
    // 更新主题按钮图标
    updateThemeButton(theme) {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
        }
    }
    
    // 应用字体大小
    applyFontSize(size) {
        const sizes = {
            small: '14px',
            normal: '16px',
            large: '18px'
        };
        
        document.documentElement.style.fontSize = sizes[size];
    }
    
    // 应用布局
    applyLayout(layout) {
        const sections = document.querySelectorAll('.compact-section');
        sections.forEach(section => {
            if (layout === 'compact') {
                section.classList.add('compact-section');
                section.classList.remove('spacious-section');
            } else {
                section.classList.remove('compact-section');
                section.classList.add('spacious-section');
            }
        });
    }
    
    // 初始化事件监听
    initEventListeners() {
        // 主题切换
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = this.settings.theme === 'dark' ? 'light' : 'dark';
                this.settings.theme = newTheme;
                this.applyTheme(newTheme);
                this.saveSettings();
            });
        }
        
        // 设置面板
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsPanel = document.getElementById('settingsPanel');
        const closeSettings = document.getElementById('closeSettings');
        
        if (settingsBtn && settingsPanel && closeSettings) {
            settingsBtn.addEventListener('click', () => {
                this.populateSettingsForm();
                settingsPanel.style.display = 'block';
            });
            
            closeSettings.addEventListener('click', () => {
                settingsPanel.style.display = 'none';
            });
        }
        
        // 保存设置
        const saveSettings = document.getElementById('saveSettings');
        if (saveSettings) {
            saveSettings.addEventListener('click', () => {
                this.getSettingsFromForm();
                this.applyAllSettings();
                this.saveSettings();
                settingsPanel.style.display = 'none';
                
                // 显示保存成功提示
                this.showNotification('设置已保存成功！', 'success');
            });
        }
    }
    
    // 填充设置表单
    populateSettingsForm() {
        const themeSelect = document.getElementById('themeSelect');
        const layoutSelect = document.getElementById('layoutSelect');
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        
        if (themeSelect) themeSelect.value = this.settings.theme;
        if (layoutSelect) layoutSelect.value = this.settings.layout;
        if (fontSizeSelect) fontSizeSelect.value = this.settings.fontSize;
    }
    
    // 从表单获取设置
    getSettingsFromForm() {
        const themeSelect = document.getElementById('themeSelect');
        const layoutSelect = document.getElementById('layoutSelect');
        const fontSizeSelect = document.getElementById('fontSizeSelect');
        
        if (themeSelect) this.settings.theme = themeSelect.value;
        if (layoutSelect) this.settings.layout = layoutSelect.value;
        if (fontSizeSelect) this.settings.fontSize = fontSizeSelect.value;
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // 自动隐藏
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// 初始化用户偏好系统
let userPreferences;
document.addEventListener('DOMContentLoaded', () => {
    userPreferences = new UserPreferenceManager();
});