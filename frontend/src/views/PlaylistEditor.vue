<template>
  <div class="editor-container">
    <div class="page-header">
      <h1>
        <svg class="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        歌单编辑
      </h1>
    </div>
    
    <div class="main-content">
      <!-- 左侧：歌单列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <h2>
            <svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            我的歌单
          </h2>
          <button @click="showCreateDialog = true" class="btn-add">+ 新建歌单</button>
        </div>
        
        <div class="playlist-list">
          <div 
            v-for="playlist in playlists" 
            :key="playlist.id"
            :class="['playlist-item', { active: selectedPlaylist?.id === playlist.id }]"
            @click="selectPlaylist(playlist)"
          >
            <div class="playlist-info">
              <h3>{{ playlist.name }}</h3>
              <p v-if="playlist.description">{{ playlist.description }}</p>
              <span class="item-count">{{ playlist.itemCount || 0 }} 首歌曲</span>
            </div>
            <button @click.stop="deletePlaylist(playlist.id)" class="btn-delete">×</button>
          </div>
          
          <div v-if="playlists.length === 0" class="empty-state">
            <p>暂无歌单，点击上方按钮创建</p>
          </div>
        </div>
      </div>
      
      <!-- 右侧：文件浏览器 -->
      <div class="right-panel">
        <div class="panel-header">
          <h2>
            <svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            文件浏览器
          </h2>
          <div class="breadcrumb">
            <button @click="navigateTo(parentDir)" :disabled="!parentDir || parentDir === currentDir">
              <svg class="breadcrumb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              上级目录
            </button>
            <span class="path">{{ currentDir || '加载中...' }}</span>
          </div>
        </div>
        
        <div class="file-list">
          <div 
            v-for="item in directoryItems" 
            :key="item.path"
            :class="['file-item', { 'is-directory': item.isDirectory, 'is-audio': item.isAudio }]"
            @click="handleItemClick(item)"
            @dblclick="handleItemDblClick(item)"
          >
            <div class="file-icon">
              <svg v-if="item.isDirectory" class="file-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
              <svg v-else-if="item.isAudio" class="file-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
              <svg v-else class="file-icon-svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
              </svg>
            </div>
            <div class="file-info">
              <span class="file-name">{{ item.name }}</span>
              <span v-if="!item.isDirectory" class="file-size">{{ formatFileSize(item.size) }}</span>
            </div>
            <button 
              v-if="item.isAudio && selectedPlaylist" 
              @click.stop="addToPlaylist(item)"
              class="btn-add-file"
              title="添加到歌单"
            >
              +
            </button>
          </div>
          
          <div v-if="loading" class="loading-state">
            <p>加载中...</p>
          </div>
          
          <div v-else-if="directoryItems.length === 0" class="empty-state">
            <p>该目录为空</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 创建歌单对话框 -->
    <div v-if="showCreateDialog" class="modal-overlay" @click.self="showCreateDialog = false">
      <div class="modal">
        <h2>创建新歌单</h2>
        <div class="form-group">
          <label>歌单名称</label>
          <input v-model="newPlaylist.name" type="text" placeholder="请输入歌单名称" @keyup.enter="createPlaylist" />
        </div>
        <div class="form-group">
          <label>描述（可选）</label>
          <textarea v-model="newPlaylist.description" placeholder="请输入描述"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="showCreateDialog = false" class="btn-cancel">取消</button>
          <button @click="createPlaylist" class="btn-confirm">创建</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPlaylists, createPlaylist, deletePlaylist, browseDirectory, addPlaylistItem } from '../api';

export default {
  name: 'PlaylistEditor',
  data() {
    return {
      playlists: [],
      selectedPlaylist: null,
      directoryItems: [],
      currentDir: '',
      parentDir: '',
      loading: false,
      showCreateDialog: false,
      newPlaylist: {
        name: '',
        description: ''
      }
    };
  },
  
  mounted() {
    this.loadPlaylists();
    this.loadDirectory();
  },
  
  methods: {
    // 加载歌单列表
    async loadPlaylists() {
      try {
        const res = await getPlaylists();
        this.playlists = res.data;
      } catch (error) {
        console.error('加载歌单失败:', error);
      }
    },
    
    // 选择歌单
    selectPlaylist(playlist) {
      this.selectedPlaylist = playlist;
    },
    
    // 创建歌单
    async createPlaylist() {
      if (!this.newPlaylist.name.trim()) {
        alert('请输入歌单名称');
        return;
      }
      
      try {
        await createPlaylist(this.newPlaylist.name, this.newPlaylist.description);
        this.showCreateDialog = false;
        this.newPlaylist = { name: '', description: '' };
        this.loadPlaylists();
      } catch (error) {
        alert('创建歌单失败: ' + error.message);
      }
    },
    
    // 删除歌单
    async deletePlaylist(id) {
      if (!confirm('确定要删除这个歌单吗？')) return;
      
      try {
        await deletePlaylist(id);
        if (this.selectedPlaylist?.id === id) {
          this.selectedPlaylist = null;
        }
        this.loadPlaylists();
      } catch (error) {
        alert('删除歌单失败: ' + error.message);
      }
    },
    
    // 加载目录
    async loadDirectory(dir) {
      this.loading = true;
      try {
        const res = await browseDirectory(dir);
        const data = res.data;
        this.currentDir = data.currentDir;
        this.parentDir = data.parentDir;
        
        // 先显示目录，再显示文件
        this.directoryItems = data.items.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });
      } catch (error) {
        console.error('加载目录失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // 导航到目录
    navigateTo(dir) {
      if (dir) {
        this.loadDirectory(dir);
      }
    },
    
    // 单击文件项
    handleItemClick(item) {
      // 可以添加选中逻辑
    },
    
    // 双击目录
    handleItemDblClick(item) {
      if (item.isDirectory) {
        this.loadDirectory(item.path);
      }
    },
    
    // 添加到歌单
    async addToPlaylist(item) {
      if (!this.selectedPlaylist) {
        alert('请先选择一个歌单');
        return;
      }
      
      try {
        await addPlaylistItem(
          this.selectedPlaylist.id,
          item.name,
          item.path,
          item.size
        );
        alert('已添加到歌单');
        this.loadPlaylists();
      } catch (error) {
        alert('添加失败: ' + error.message);
      }
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
      if (!bytes) return '';
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = bytes;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      return `${size.toFixed(2)} ${units[unitIndex]}`;
    }
  }
};
</script>

<style scoped>
.editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  background: #f8f9fa;
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel,
.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
}

.right-panel {
  border-right: none;
}

.panel-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.panel-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.btn-add {
  background: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-add:hover {
  background: #2980b9;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
}

.breadcrumb button {
  background: #fff;
  border: 1px solid #ddd;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.breadcrumb button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.breadcrumb .path {
  font-size: 12px;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.playlist-list,
.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.playlist-item {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.playlist-item:hover {
  border-color: #3498db;
}

.playlist-item.active {
  background: #ebf5ff;
  border-color: #3498db;
}

.playlist-info h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.playlist-info p {
  margin: 0 0 5px 0;
  font-size: 13px;
  color: #666;
}

.item-count {
  font-size: 12px;
  color: #999;
}

.btn-delete {
  background: #e74c3c;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.file-item {
  background: white;
  padding: 12px 15px;
  margin-bottom: 5px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.file-item:hover {
  background: #f0f0f0;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon-svg {
  width: 20px;
  height: 20px;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 14px;
  color: #333;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.btn-add-file {
  background: #3498db;
  color: white;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.btn-add-file:hover {
  background: #2980b9;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
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
  width: 400px;
  max-width: 90%;
}

.modal h2 {
  margin: 0 0 20px 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel,
.btn-confirm {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-cancel {
  background: #95a5a6;
  color: white;
}

.btn-confirm {
  background: #3498db;
  color: white;
}
</style>
