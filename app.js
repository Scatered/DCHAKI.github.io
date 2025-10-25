// 主应用程序 - Roblox注入器聚合平台
class RobloxInjectorApp {
    constructor() {
        this.resources = this.loadResourceData();
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.initApp();
    }
    
    // 初始化应用
    initApp() {
        this.renderResources();
        this.initEventListeners();
        this.initSearchAndFilter();
    }
    
    // 加载资源数据
    loadResourceData() {
        // 这里使用硬编码的数据，实际项目中可以从API加载
        return {
            sections: [
                {
                    id: "mobile",
                    name: "手机注入器",
                    resources: [
                        { id: "krnl", name: "Krnl", url: "https://krnl.cat/", type: "free", status: "active" },
                        { id: "codex", name: "CodeX", url: "https://codex.lol/", type: "paid", status: "active" },
                        { id: "delta", name: "Delta", url: "https://deltaexploits.gg/", type: "free", status: "active" },
                        { id: "arceusx", name: "ArceusX", url: "https://spdmteam.com/index", type: "paid", status: "active" },
                        { id: "vegex", name: "VegeX", url: "https://vegax.gg/", type: "free", status: "active" }
                    ]
                },
                {
                    id: "pc-free",
                    name: "电脑免费注入器", 
                    resources: [
                        { id: "tng", name: "TNG", url: "https://tngexploit.vercel.app/", status: "active" },
                        { id: "solara", name: "Solara", url: "https://getsolara.dev/", status: "active" },
                        { id: "xeno", name: "Xeno", url: "https://xenoexecutor.live/", status: "active" },
                        { id: "zenith", name: "Zenith", url: "https://zenith.win/", status: "active" },
                        { id: "synz", name: "SynZ", url: "https://synapsez.net/", status: "active" },
                        { id: "world", name: "World Client", url: "https://useworld.xyz/", status: "active" },
                        { id: "nexora", name: "Nexora", url: "https://getnexora.vercel.app/", status: "active" },
                        { id: "nucleus", name: "Nucleus", url: "https://nucleus.rip/", status: "active" },
                        { id: "drift", name: "Drift", url: "https://getdrift.me/", status: "active" },
                        { id: "valex", name: "Valex", url: "https://valex.io/", status: "active" },
                        { id: "saturn", name: "Saturn X", url: "https://saturn-website-gamma.vercel.app/", status: "active" },
                        { id: "arctic", name: "Arctic", url: "https://discord.gg/arctic-studios-1329873465897128058", status: "active" }
                    ]
                },
                {
                    id: "pc-paid", 
                    name: "电脑付费注入器",
                    resources: [
                        { id: "arceusx-pc", name: "ArceusX", url: "https://spdmteam.com/index", status: "active" },
                        { id: "codex-pc", name: "CodeX", url: "https://codex.lol/", status: "active" },
                        { id: "zenith-pc", name: "Zenith", url: "https://zenith.win/", status: "active" },
                        { id: "wave", name: "Wave", url: "https://getwave.gg/", status: "active" },
                        { id: "potassium", name: "Potassium", url: "https://potassium.pro/", status: "active" },
                        { id: "seliware", name: "Seliware", url: "https://seliware.com/", status: "active" },
                        { id: "sirhurt", name: "SirHurt", url: "https://sirhurt.net/", status: "active" }
                    ]
                },
                {
                    id: "aggregators",
                    name: "注入器聚合网站",
                    resources: [
                        { id: "samrat", name: "Samrat Executors", url: "https://executors.samrat.lol/", description: "包含Mac注入器" },
                        { id: "voxlis", name: "Voxlis", url: "https://voxlis.net/roblox/", description: "所有活跃注入器" },
                        { id: "whatexps", name: "WhatExpsAreOnline", url: "https://whatexpsare.online/", description: "任何活的注入器" }
                    ]
                }
            ]
        };
    }
    
    // 渲染资源
    renderResources() {
        const container = document.getElementById('resourcesSection');
        if (!container) return;
        
        let html = '';
        
        this.resources.sections.forEach(section => {
            // 检查是否应该显示这个分区
            if (this.currentFilter !== 'all' && this.currentFilter !== section.id) {
                return;
            }
            
            const filteredResources = section.resources.filter(resource => {
                // 搜索过滤
                if (this.currentSearch) {
                    const searchTerm = this.currentSearch.toLowerCase();
                    return resource.name.toLowerCase().includes(searchTerm) ||
                           (resource.description && resource.description.toLowerCase().includes(searchTerm));
                }
                return true;
            });
            
            if (filteredResources.length === 0) return;
            
            html += `
                <div class="section-group">
                    <h2 class="section-title">${section.name}</h2>
                    <div class="resources-grid compact-section">
            `;
            
            filteredResources.forEach(resource => {
                html += this.createResourceCard(resource, section.id);
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html || '<div class="no-results">🔍 没有找到匹配的资源</div>';
        
        // 如果管理员模式已激活，重新添加管理按钮
        if (adminControls && adminControls.isAdmin) {
            setTimeout(() => {
                adminControls.addResourceManagementButtons();
            }, 100);
        }
    }
    
    // 创建资源卡片
    createResourceCard(resource, sectionId) {
        const badges = [];
        
        if (resource.type) {
            badges.push(`<span class="resource-badge badge-${resource.type}">${resource.type === 'free' ? '免费' : '付费'}</span>`);
        }
        
        if (resource.status) {
            badges.push(`<span class="resource-badge badge-${resource.status}">${resource.status === 'active' ? '活跃' : '不活跃'}</span>`);
        }
        
        return `
            <div class="resource-card glass-morphism" data-id="${resource.id}" data-section="${sectionId}">
                <div class="resource-header">
                    <h3 class="resource-name">${resource.name}</h3>
                    <div class="badge-container">
                        ${badges.join('')}
                    </div>
                </div>
                <a href="${resource.url}" target="_blank" rel="noopener" class="resource-url">${resource.url}</a>
                ${resource.description ? `<p class="resource-description">${resource.description}</p>` : ''}
                <div class="resource-meta">
                    <small>需要VPN: ${this.requiresVPN(resource.url) ? '是' : '否'}</small>
                </div>
            </div>
        `;
    }
    
    // 检查是否需要VPN
    requiresVPN(url) {
        const vpnDomains = ['krnl.cat', 'codex.lol', 'deltaexploits.gg', 'spdmteam.com', 'vegax.gg',
                           'tngexploit.vercel.app', 'getsolara.dev', 'xenoexecutor.live', 'zenith.win',
                           'synapsez.net', 'useworld.xyz', 'getnexora.vercel.app', 'nucleus.rip',
                           'getdrift.me', 'valex.io', 'saturn-website-gamma.vercel.app', 'getwave.gg',
                           'potassium.pro', 'seliware.com', 'sirhurt.net', 'executors.samrat.lol',
                           'voxlis.net', 'whatexpsare.online'];
        
        return vpnDomains.some(domain => url.includes(domain));
    }
    
    // 初始化事件监听
    initEventListeners() {
        // 导航按钮
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // 移除所有active类
                navButtons.forEach(b => b.classList.remove('active'));
                // 添加active类到当前按钮
                btn.classList.add('active');
                
                // 更新当前过滤器
                this.currentFilter = btn.dataset.section;
                this.renderResources();
            });
        });
        
        // 显示管理员登录按钮（始终显示，方便测试）
        const adminLogin = document.getElementById('adminLogin');
        if (adminLogin) {
            adminLogin.style.display = 'block';
        }
    }
    
    // 初始化搜索和过滤
    initSearchAndFilter() {
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const typeFilter = document.getElementById('typeFilter');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.renderResources();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                // 这里可以扩展状态过滤逻辑
                this.renderResources();
            });
        }
        
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                // 这里可以扩展类型过滤逻辑
                this.renderResources();
            });
        }
    }
    
    // 添加新资源（管理员功能）
    addNewResource(sectionId, resourceData) {
        const section = this.resources.sections.find(s => s.id === sectionId);
        if (section) {
            section.resources.push({
                id: this.generateResourceId(),
                ...resourceData
            });
            this.renderResources();
            this.saveResources();
        }
    }
    
    // 生成资源ID
    generateResourceId() {
        return 'resource_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // 保存资源数据
    saveResources() {
        // 实际项目中这里应该调用API保存
        DCHAKI_Security.dcsys_secureStorage.set('resourcesData', this.resources);
    }
}

// 初始化主应用
let robloxApp;
document.addEventListener('DOMContentLoaded', () => {
    robloxApp = new RobloxInjectorApp();
});

// 导出到全局（仅开发调试用）
if (typeof window !== 'undefined') {
    window.RobloxInjectorApp = RobloxInjectorApp;
}