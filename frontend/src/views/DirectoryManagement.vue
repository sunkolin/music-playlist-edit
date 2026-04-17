<template>
  <div class="directory-management-container">
    <!-- 顶部工具栏 -->
    <div class="page-header">
      <h1>歌曲目录管理</h1>
      <button @click="showAddDialog = true" class="btn-add">+ 添加目录</button>
    </div>
    
    <div class="content-area">
      <div v-if="loading" class="loading-state">
        <p>加载中...</p>
      </div>
      
      <div v-else-if="directories.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
        <p>暂无歌曲目录，点击上方按钮添加</p>
      </div>
      
      <div v-else class="directory-list">
        <div 
          v-for="dir in directories" 
          :key="dir.id"
          class="directory-item"
        >
          <div class="directory-info">
            <div class="directory-name">{{ dir.name }}</div>
            <div class="directory-path">{{ dir.path }}</div>
          </div>
          <button @click="deleteDirectory(dir.id)" class="btn-delete" title="删除目录">×</button>
        </div>
      </div>
    </div>
    
    <!-- 添加目录对话框 -->
    <div v-if="showAddDialog" class="modal-overlay" @click.self="showAddDialog = false">
      <div class="modal">
        <h2>添加歌曲目录</h2>
        <div class="form-group">
          <label>目录名称</label>
          <input 
            v-model="newDirectory.name" 
            type="text" 
            placeholder="例如：我的音乐" 
            @keyup.enter="addDirectory"
          />
        </div>
        <div class="form-group">
          <label>完整路径</label>
          <input 
            v-model="newDirectory.path" 
            type="text" 
            placeholder="例如：/Users/username/Music" 
            @keyup.enter="addDirectory"
          />
        </div>
        <div class="export-info">
          <p>
            <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            提示：请输入完整的绝对路径，只有已录入的目录才能在歌单音乐编辑中访问
          </p>
        </div>
        <div class="modal-actions">
          <button @click="showAddDialog = false" class="btn-cancel">取消</button>
          <button @click="addDirectory" class="btn-confirm">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMusicDirectories, addMusicDirectory, deleteMusicDirectory } from '../api/index';

export default {
  name: 'DirectoryManagement',
  data() {
    return {
      directories: [],
      loading: false,
      showAddDialog: false,
      newDirectory: {
        name: '',
        path: ''
      }
    };
  },
  
  mounted() {
    this.loadDirectories();
  },
  
  methods: {
    // 加载目录列表
    async loadDirectories() {
      this.loading = true;
      try {
        const res = await getMusicDirectories();
        this.directories = res.data;
      } catch (error) {
        console.error('加载目录失败:', error);
        alert('加载目录失败: ' + error.message);
      } finally {
        this.loading = false;
      }
    },
    
    // 添加目录
    async addDirectory() {
      if (!this.newDirectory.name.trim()) {
        alert('请输入目录名称');
        return;
      }
      
      if (!this.newDirectory.path.trim()) {
        alert('请输入目录路径');
        return;
      }
      
      // 验证路径是否为绝对路径
      const path = this.newDirectory.path.trim();
      if (!path.startsWith('/') && !/^[A-Z]:\\/i.test(path)) {
        alert('请输入有效的绝对路径');
        return;
      }
      
      try {
        await addMusicDirectory(path, this.newDirectory.name.trim());
        this.showAddDialog = false;
        this.newDirectory = { name: '', path: '' };
        this.loadDirectories();
        alert('目录添加成功');
      } catch (error) {
        alert('添加目录失败: ' + (error.response?.data?.error || error.message));
      }
    },
    
    // 删除目录
    async deleteDirectory(id) {
      if (!confirm('确定要删除这个目录吗？')) return;
      
      try {
        await deleteMusicDirectory(id);
        this.loadDirectories();
        alert('目录删除成功');
      } catch (error) {
        alert('删除目录失败: ' + error.message);
      }
    }
  }
};
</script>

<style scoped>
.directory-management-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: #f8f9fa;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.btn-add {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-add:hover {
  background: #2980b9;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px 30px;
}

.directory-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.directory-item {
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #e0e0e0;
  transition: all 0.2s;
}

.directory-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.1);
}

.directory-info {
  flex: 1;
}

.directory-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 5px;
}

.directory-path {
  font-size: 13px;
  color: #666;
  word-break: break-all;
}

.btn-delete {
  background: #e74c3c;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  flex-shrink: 0;
  margin-left: 15px;
}

.btn-delete:hover {
  background: #c0392b;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state svg.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.modal h2 {
  margin: 0 0 20px 0;
  font-size: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #3498db;
}

.export-info {
  margin: 15px 0;
  padding: 12px;
  background: #f0f8ff;
  border-radius: 6px;
  border-left: 3px solid #3498db;
}

.export-info p {
  margin: 0;
  font-size: 13px;
  color: #555;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  line-height: 1.5;
}

.info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 2px;
  color: #3498db;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

.btn-confirm {
  background: #3498db;
  color: white;
}

.btn-confirm:hover {
  background: #2980b9;
}
</style>
