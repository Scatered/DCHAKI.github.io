// 超级管理员权限控制系统
class AdminControlSystem {
    constructor() {
        this.isAdmin = false;
        this.adminPrivileges = {
            CONTENT_MANAGEMENT: {
                editAnyText: true,
                removeResources: true,
                modifySections: true,
                directPublish: true
            },
            USER_MANAGEMENT: {
                banUsers: true,
                modifyRoles: true,
                viewAllData: true
            },
            SYSTEM_CONTROL: {
                modifyCode: true,
                changeSecurity: true,
                backupRestore: true
            }
        };
        
        this.initAdminSystem();
    }
    
    // 初始化管理员系统
    initAdminSystem() {
        this.initEventListeners();
        this.checkExistingAdminSession();
    }
    
    // 初始化事件监听
    initEventListeners() {
        const adminLogin = document.getElementById('adminLogin');
        const adminModal = document.getElementById('adminModal');
        const closeAdmin = document.getElementById('closeAdmin');
        const verifyAdmin = document.getElementById('verifyAdmin');
        
        // 显示管理员登录
        if (adminLogin) {
            adminLogin.addEventListener('click', () => {
                this.showAdminLogin();
            });
        }
        
        // 关闭管理员模态框
        if (closeAdmin) {
            closeAdmin.addEventListener('click', () => {
                this.hideAdminLogin();
            });
        }
        
        // 验证管理员
        if (verifyAdmin) {
            verifyAdmin.addEventListener('click', () => {
                this.verifyAdminCredentials();
            });
        }
        
        // 回车键验证
        const adminKeyInput = document.getElementById('adminKey');
        if (adminKeyInput) {
            adminKeyInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.verifyAdminCredentials();
                }
            });
        }
    }
    
    // 检查现有管理员会话
    checkExistingAdminSession() {
        const adminSession = DCHAKI_Security.dcsys_secureStorage.get('adminSession');
        if (adminSession && adminSession.expires > Date.now()) {
            this.activateAdminMode(adminSession);
        }
    }
    
    // 显示管理员登录
    showAdminLogin() {
        const adminModal = document.getElementById('adminModal');
        const adminKeyInput = document.getElementById('adminKey');
        
        if (adminModal && adminKeyInput) {
            adminModal.style.display = 'flex';
            adminKeyInput.focus();
        }
    }
    
    // 隐藏管理员登录
    hideAdminLogin() {
        const adminModal = document.getElementById('adminModal');
        const adminKeyInput = document.getElementById('adminKey');
        
        if (adminModal) {
            adminModal.style.display = 'none';
        }
        if (adminKeyInput) {
            adminKeyInput.value = '';
        }
    }
    
    // 验证管理员凭证
    verifyAdminCredentials() {
        const adminKeyInput = document.getElementById('adminKey');
        if (!adminKeyInput) return;
        
        const inputKey = adminKeyInput.value.trim();
        if (!inputKey) {
            this.showAdminError('请输入管理员密钥');
            return;
        }
        
        // 验证密钥
        if (DCHAKI_Security.dcsys_verifyAdmin(inputKey)) {
            this.activateAdminMode();
            this.hideAdminLogin();
            this.showAdminSuccess('管理员身份验证成功！');
        } else {
            this.showAdminError('管理员密钥错误');
            adminKeyInput.value = '';
            adminKeyInput.focus();
        }
    }
    
    // 激活管理员模式
    activateAdminMode(sessionData = null) {
        this.isAdmin = true;
        
        // 创建管理员会话
        const adminSession = sessionData || {
            loginTime: Date.now(),
            expires: Date.now() + (24 * 60 * 60 * 1000), // 24小时
            privileges: this.adminPrivileges
        };
        
        // 保存会话
        DCHAKI_Security.dcsys_secureStorage.set('adminSession', adminSession);
        
        // 显示管理员按钮
        const adminLogin = document.getElementById('adminLogin');
        if (adminLogin) {
            adminLogin.textContent = '🔧 管理员模式';
            adminLogin.style.background = 'var(--success-color)';
        }
        
        // 启用实时编辑
        this.enableLiveEditing();
        
        // 启用资源管理
        this.enableResourceManagement();
        
        console.log('✅ 管理员模式已激活');
    }
    
    // 启用实时编辑
    enableLiveEditing() {
        document.addEventListener('dblclick', this.handleDoubleClick.bind(this));
        
        // 为可编辑元素添加视觉提示
        this.addEditIndicators();
    }
    
    // 处理双击事件
    handleDoubleClick(e) {
        if (!this.isAdmin) return;
        
        const element = e.target;
        if (this.isEditableElement(element)) {
            this.activateEditMode(element);
        }
    }
    
    // 判断元素是否可编辑
    isEditableElement(element) {
        const editableClasses = ['resource-name', 'resource-description', 'resource-url'];
        return editableClasses.some(className => element.classList.contains(className));
    }
    
    // 激活编辑模式
    activateEditMode(element) {
        const originalContent = element.textContent;
        const elementType = element.tagName.toLowerCase();
        
        // 创建编辑界面
        if (elementType === 'input' || elementType === 'textarea') {
            element.focus();
            element.select();
        } else {
            const input = document.createElement('textarea');
            input.value = originalContent;
            input.style.cssText = `
                width: 100%;
                min-height: 100px;
                padding: 0.5rem;
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border: 2px solid var(--text-accent);
                border-radius: 4px;
                font-family: inherit;
                font-size: inherit;
                resize: vertical;
            `;
            
            element.style.display = 'none';
            element.parentNode.insertBefore(input, element);
            
            const saveEdit = () => {
                const newContent = input.value.trim();
                if (newContent && newContent !== originalContent) {
                    this.saveEdit(element, newContent);
                }
                input.remove();
                element.style.display = '';
            };
            
            const cancelEdit = () => {
                input.remove();
                element.style.display = '';
            };
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                    saveEdit();
                } else if (e.key === 'Escape') {
                    cancelEdit();
                }
            });
            
            input.addEventListener('blur', saveEdit);
            input.focus();
        }
    }
    
    // 保存编辑
    saveEdit(element, newContent) {
        const editData = {
            elementId: this.getElementId(element),
            originalContent: element.textContent,
            newContent: newContent,
            timestamp: Date.now(),
            admin: 'DCHAKI233'
        };
        
        // 更新界面
        element.textContent = newContent;
        
        // 保存到本地存储
        this.saveEditToStorage(editData);
        
        // 显示成功提示
        this.showAdminSuccess('内容已更新');
        
        console.log('📝 内容编辑已保存:', editData);
    }
    
    // 获取元素ID
    getElementId(element) {
        return element.id || element.dataset.id || 
               `${element.className}-${Array.from(element.parentNode.children).indexOf(element)}`;
    }
    
    // 保存编辑到存储
    saveEditToStorage(editData) {
        const edits = DCHAKI_Security.dcsys_secureStorage.get('adminEdits') || [];
        edits.push(editData);
        DCHAKI_Security.dcsys_secureStorage.set('adminEdits', edits);
    }
    
    // 启用资源管理
    enableResourceManagement() {
        // 为资源卡片添加管理按钮
        this.addResourceManagementButtons();
    }
    
    // 添加资源管理按钮
    addResourceManagementButtons() {
        const resourceCards = document.querySelectorAll('.resource-card');
        resourceCards.forEach(card => {
            if (!card.querySelector('.admin-controls')) {
                const controls = document.createElement('div');
                controls.className = 'admin-controls';
                controls.style.cssText = `
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    display: flex;
                    gap: 0.25rem;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                `;
                
                controls.innerHTML = `
                    <button class="admin-btn edit-btn" title="编辑">✏️</button>
                    <button class="admin-btn delete-btn" title="删除">🗑️</button>
                    <button class="admin-btn hide-btn" title="隐藏">👁️</button>
                `;
                
                card.style.position = 'relative';
                card.appendChild(controls);
                
                // 显示/隐藏控制按钮
                card.addEventListener('mouseenter', () => {
                    controls.style.opacity = '1';
                });
                
                card.addEventListener('mouseleave', () => {
                    controls.style.opacity = '0';
                });
                
                // 绑定按钮事件
                this.bindResourceControlEvents(controls, card);
            }
        });
    }
    
    // 绑定资源控制事件
    bindResourceControlEvents(controls, card) {
        const editBtn = controls.querySelector('.edit-btn');
        const deleteBtn = controls.querySelector('.delete-btn');
        const hideBtn = controls.querySelector('.hide-btn');
        
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editResource(card);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteResource(card);
            });
        }
        
        if (hideBtn) {
            hideBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleResourceVisibility(card);
            });
        }
    }
    
    // 编辑资源
    editResource(card) {
        // 实现资源编辑逻辑
        console.log('编辑资源:', card);
        this.showAdminSuccess('资源编辑功能已触发');
    }
    
    // 删除资源
    deleteResource(card) {
        if (confirm('确定要删除这个资源吗？此操作不可撤销。')) {
            card.style.opacity = '0.5';
            card.style.pointerEvents = 'none';
            
            // 实际项目中这里应该调用API删除
            setTimeout(() => {
                card.remove();
                this.showAdminSuccess('资源已删除');
            }, 300);
        }
    }
    
    // 切换资源可见性
    toggleResourceVisibility(card) {
        const isHidden = card.style.display === 'none';
        card.style.display = isHidden ? 'block' : 'none';
        
        this.showAdminSuccess(`资源已${isHidden ? '显示' : '隐藏'}`);
    }
    
    // 添加编辑指示器
    addEditIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            .editable-indicator {
                position: relative;
            }
            
            .editable-indicator::after {
                content: '✏️';
                position: absolute;
                top: -5px;
                right: -5px;
                font-size: 12px;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }
            
            .editable-indicator:hover::after {
                opacity: 1;
            }
        `;
        
        document.head.appendChild(style);
        
        // 为可编辑元素添加指示器
        const editableElements = document.querySelectorAll('.resource-name, .resource-description');
        editableElements.forEach(el => {
            el.classList.add('editable-indicator');
        });
    }
    
    // 显示管理员错误
    showAdminError(message) {
        if (userPreferences && userPreferences.showNotification) {
            userPreferences.showNotification('❌ ' + message, 'error');
        } else {
            alert('管理员错误: ' + message);
        }
    }
    
    // 显示管理员成功信息
    showAdminSuccess(message) {
        if (userPreferences && userPreferences.showNotification) {
            userPreferences.showNotification('✅ ' + message, 'success');
        } else {
            alert('管理员成功: ' + message);
        }
    }
}

// 初始化管理员控制系统
let adminControls;
document.addEventListener('DOMContentLoaded', () => {
    adminControls = new AdminControlSystem();
});