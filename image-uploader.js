// 安全图片上传处理器
class SecureImageUploader {
    constructor() {
        this.allowedTypes = ['image/webp', 'image/jpeg', 'image/png', 'image/avif'];
        this.maxSize = 5 * 1024 * 1024; // 5MB
        this.currentFile = null;
        this.initEventListeners();
    }
    
    // 初始化事件监听
    initEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const uploadModal = document.getElementById('uploadModal');
        const closeUpload = document.getElementById('closeUpload');
        const cancelUpload = document.getElementById('cancelUpload');
        const confirmUpload = document.getElementById('confirmUpload');
        
        // 点击上传区域
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                imageInput.click();
            });
            
            // 拖拽上传
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--text-accent)';
                uploadArea.style.background = 'var(--bg-tertiary)';
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.background = 'transparent';
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--border-color)';
                uploadArea.style.background = 'transparent';
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });
        }
        
        // 文件选择
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileSelect(e.target.files[0]);
                }
            });
        }
        
        // 模态框控制
        if (closeUpload) {
            closeUpload.addEventListener('click', () => {
                uploadModal.style.display = 'none';
                this.resetUpload();
            });
        }
        
        if (cancelUpload) {
            cancelUpload.addEventListener('click', () => {
                uploadModal.style.display = 'none';
                this.resetUpload();
            });
        }
        
        if (confirmUpload) {
            confirmUpload.addEventListener('click', () => {
                this.uploadImage();
            });
        }
    }
    
    // 处理文件选择
    handleFileSelect(file) {
        // 验证文件
        if (!this.validateFile(file)) {
            return;
        }
        
        this.currentFile = file;
        this.showPreview(file);
        this.showUploadModal();
    }
    
    // 验证文件
    validateFile(file) {
        // 检查文件类型
        if (!this.allowedTypes.includes(file.type)) {
            this.showError('不支持的文件格式。请选择 JPG、PNG、WebP 或 AVIF 格式的图片。');
            return false;
        }
        
        // 检查文件大小
        if (file.size > this.maxSize) {
            this.showError('文件太大。请选择小于 5MB 的图片。');
            return false;
        }
        
        return true;
    }
    
    // 显示图片预览
    showPreview(file) {
        const preview = document.getElementById('uploadPreview');
        if (!preview) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML = `
                <img src="${e.target.result}" alt="预览图片">
                <div style="margin-top: 0.5rem; color: var(--text-secondary);">
                    文件名: ${file.name}<br>
                    大小: ${this.formatFileSize(file.size)}
                </div>
            `;
        };
        reader.readAsDataURL(file);
    }
    
    // 显示上传模态框
    showUploadModal() {
        const uploadModal = document.getElementById('uploadModal');
        if (uploadModal) {
            uploadModal.style.display = 'flex';
        }
    }
    
    // 上传图片
    async uploadImage() {
        if (!this.currentFile) {
            this.showError('没有选择文件');
            return;
        }
        
        const confirmUpload = document.getElementById('confirmUpload');
        const originalText = confirmUpload.textContent;
        
        try {
            // 显示上传中状态
            confirmUpload.textContent = '上传中...';
            confirmUpload.disabled = true;
            
            // 压缩图片（如果支持）
            const compressedBlob = await this.compressImage(this.currentFile);
            
            // 创建表单数据
            const formData = new FormData();
            formData.append('image', compressedBlob, this.currentFile.name);
            formData.append('timestamp', Date.now());
            formData.append('securityToken', this.generateSecurityToken());
            
            // 发送上传请求
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`上传失败: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // 上传成功
            this.showSuccess('图片上传成功！');
            this.hideUploadModal();
            
            // 返回图片URL供其他功能使用
            if (typeof this.onUploadSuccess === 'function') {
                this.onUploadSuccess(result.url);
            }
            
        } catch (error) {
            console.error('🚨 图片上传失败:', error);
            this.showError('上传失败: ' + error.message);
        } finally {
            // 恢复按钮状态
            confirmUpload.textContent = originalText;
            confirmUpload.disabled = false;
        }
    }
    
    // 压缩图片
    async compressImage(file, quality = 0.8) {
        return new Promise((resolve) => {
            // 如果是小文件，不压缩
            if (file.size < 1024 * 1024) { // 小于1MB
                resolve(file);
                return;
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // 计算压缩尺寸
                let width = img.width;
                let height = img.height;
                const maxDimension = 1920;
                
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    } else {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // 绘制压缩图片
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为Blob
                canvas.toBlob((blob) => {
                    resolve(blob || file);
                }, file.type, quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    }
    
    // 生成安全令牌
    generateSecurityToken() {
        return DCHAKI_Security.dcsys_encryptData({
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            random: Math.random().toString(36).substr(2, 9)
        });
    }
    
    // 隐藏上传模态框
    hideUploadModal() {
        const uploadModal = document.getElementById('uploadModal');
        if (uploadModal) {
            uploadModal.style.display = 'none';
        }
        this.resetUpload();
    }
    
    // 重置上传状态
    resetUpload() {
        this.currentFile = null;
        const preview = document.getElementById('uploadPreview');
        if (preview) {
            preview.innerHTML = '';
        }
        const imageInput = document.getElementById('imageInput');
        if (imageInput) {
            imageInput.value = '';
        }
    }
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // 显示错误信息
    showError(message) {
        if (userPreferences && userPreferences.showNotification) {
            userPreferences.showNotification(message, 'error');
        } else {
            alert('错误: ' + message);
        }
    }
    
    // 显示成功信息
    showSuccess(message) {
        if (userPreferences && userPreferences.showNotification) {
            userPreferences.showNotification(message, 'success');
        } else {
            alert('成功: ' + message);
        }
    }
    
    // 上传成功回调
    onUploadSuccess(url) {
        console.log('📸 图片上传成功:', url);
        // 可以在这里处理上传成功后的逻辑，比如更新资源图片等
    }
}

// 初始化图片上传系统
let imageUploader;
document.addEventListener('DOMContentLoaded', () => {
    imageUploader = new SecureImageUploader();
});