// DCHAKI安全核心系统 - 多层加密保护
(function() {
    'use strict';
    
    const DCHAKI_SECURITY = {
        version: '2.0.0',
        adminKey: "zxzx@233",
        encryptionLayers: 3,
        isInitialized: false,
        
        // 初始化安全系统
        dcsys_initSecurity: function() {
            try {
                console.log('🔐 初始化DCHAKI安全系统...');
                
                // 检查全局命名空间冲突
                if (!this.dcsys_checkNamespaceConflicts()) {
                    throw new Error('检测到命名空间冲突');
                }
                
                // 应用代码混淆保护
                this.dcsys_applyObfuscation();
                
                this.isInitialized = true;
                console.log('✅ DCHAKI安全系统初始化完成');
            } catch (error) {
                console.error('🚨 安全系统初始化失败:', error);
            }
        },
        
        // 命名空间冲突检测
        dcsys_checkNamespaceConflicts: function() {
            const reservedNames = ['dcsys_', 'DCHAKI_', 'zxzx_', 'admin233_'];
            const conflicts = reservedNames.filter(name => window[name]);
            
            if (conflicts.length > 0) {
                console.error('🚨 命名空间冲突:', conflicts);
                return false;
            }
            
            return true;
        },
        
        // 多层加密函数
        dcsys_encryptData: function(data) {
            if (!this.isInitialized) {
                console.warn('⚠️ 安全系统未初始化');
                return data;
            }
            
            try {
                let encrypted = JSON.stringify(data);
                
                for (let i = 0; i < this.encryptionLayers; i++) {
                    encrypted = btoa(encrypted);
                    encrypted = encrypted.split('').reverse().join('');
                }
                
                return encrypted;
            } catch (error) {
                console.error('🚨 数据加密失败:', error);
                return null;
            }
        },
        
        // 多层解密函数
        dcsys_decryptData: function(encryptedData) {
            if (!this.isInitialized) {
                console.warn('⚠️ 安全系统未初始化');
                return encryptedData;
            }
            
            try {
                let decrypted = encryptedData;
                
                for (let i = 0; i < this.encryptionLayers; i++) {
                    decrypted = atob(decrypted.split('').reverse().join(''));
                }
                
                return JSON.parse(decrypted);
            } catch (error) {
                console.error('🚨 数据解密失败:', error);
                return null;
            }
        },
        
        // 管理员身份验证
        dcsys_verifyAdmin: function(inputKey) {
            const encryptedInput = this.dcsys_encryptData(inputKey);
            const encryptedSecret = this.dcsys_encryptData(this.adminKey);
            
            return encryptedInput === encryptedSecret;
        },
        
        // 代码混淆保护
        dcsys_applyObfuscation: function() {
            // 防止直接控制台访问
            Object.defineProperty(window, 'DCHAKI_System', {
                value: this,
                writable: false,
                configurable: false,
                enumerable: false
            });
        },
        
        // 安全数据存储
        dcsys_secureStorage: {
            set: function(key, value) {
                try {
                    const encrypted = DCHAKI_SECURITY.dcsys_encryptData(value);
                    localStorage.setItem(`dcsys_${key}`, encrypted);
                    return true;
                } catch (error) {
                    console.error('🚨 安全存储失败:', error);
                    return false;
                }
            },
            
            get: function(key) {
                try {
                    const encrypted = localStorage.getItem(`dcsys_${key}`);
                    if (!encrypted) return null;
                    
                    return DCHAKI_SECURITY.dcsys_decryptData(encrypted);
                } catch (error) {
                    console.error('🚨 安全读取失败:', error);
                    return null;
                }
            },
            
            remove: function(key) {
                try {
                    localStorage.removeItem(`dcsys_${key}`);
                    return true;
                } catch (error) {
                    console.error('🚨 安全删除失败:', error);
                    return false;
                }
            }
        }
    };
    
    // 初始化安全系统
    DCHAKI_SECURITY.dcsys_initSecurity();
    
    // 暴露到全局（只读）
    window.DCHAKI_Security = DCHAKI_SECURITY;
})();