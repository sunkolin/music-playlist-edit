<template>
  <div class="management-container">
    <div class="page-header">
      <h1>
        <svg class="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
        </svg>
        歌单管理
      </h1>
      <div class="header-actions">
        <button @click="showCreateDialog = true" class="btn-add">
          <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          新建
        </button>
        <button @click="showImportDialog = true" class="btn-import">
          <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          导入
        </button>
        <button 
          @click="showExportDialog = true"
          class="btn-export"
          :disabled="!selectedPlaylist || !m3u8Content"
        >
          <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          导出
        </button>
      </div>
    </div>

    <div class="content-wrapper">
      <!-- 左侧：歌单列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <h2>歌单列表</h2>
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
              <span class="item-count">{{ playlist.itemCount || 0 }} 首歌曲</span>
            </div>
            <div class="playlist-actions">
              <button @click.stop="editPlaylist(playlist)" class="btn-icon" title="编辑">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button @click.stop="deletePlaylist(playlist.id)" class="btn-icon" title="删除">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="loading" class="loading-state">
            <p>加载中...</p>
          </div>
          
          <div v-else-if="playlists.length === 0" class="empty-state">
            <p>暂无歌单，点击上方按钮创建</p>
          </div>
        </div>
      </div>
      
      <!-- 右侧：m3u8 内容和导出 -->
      <div class="right-panel">
        <div class="panel-header">
          <h2 v-if="selectedPlaylist">{{ selectedPlaylist.name }} - M3U8 内容</h2>
          <h2 v-else>选择歌单查看内容</h2>
        </div>
        
        <div class="m3u8-content-wrapper">
          <div v-if="!selectedPlaylist" class="empty-state">
            <p>请在左侧选择一个歌单</p>
          </div>
          
          <div v-else-if="loadingM3U8" class="loading-state">
            <p>加载 m3u8 内容...</p>
          </div>
          
          <div v-else-if="m3u8Content" class="m3u8-display">
            <pre>{{ m3u8Content }}</pre>
          </div>
          
          <div v-else class="empty-state">
            <p>该歌单暂无歌曲</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建/编辑歌单对话框 -->
    <div v-if="showCreateDialog || showEditDialog" class="modal-overlay" @click.self="closeDialog">
      <div class="modal">
        <h2>{{ showEditDialog ? '编辑歌单' : '创建新歌单' }}</h2>
        <div class="form-group">
          <label>歌单名称</label>
          <input 
            v-model="currentPlaylist.name" 
            type="text" 
            placeholder="请输入歌单名称" 
            @keyup.enter="savePlaylist"
            ref="nameInput"
          />
        </div>
        <div class="form-group">
          <label>描述（可选）</label>
          <textarea v-model="currentPlaylist.description" placeholder="请输入描述"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="closeDialog" class="btn-cancel">取消</button>
          <button @click="savePlaylist" class="btn-confirm">{{ showEditDialog ? '保存' : '创建' }}</button>
        </div>
      </div>
    </div>

    <!-- 导入 M3U8 对话框 -->
    <div v-if="showImportDialog" class="modal-overlay" @click.self="closeImportDialog">
      <div class="modal">
        <h2>
          <svg class="modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          导入 M3U8 歌单
        </h2>
        <div class="form-group">
          <label>选择 M3U8 文件（支持多选）</label>
          <input 
            ref="fileInput"
            type="file" 
            accept=".m3u8,.m3u"
            multiple
            @change="handleFileSelect"
            style="display: none"
          />
          <button @click="$refs.fileInput.click()" class="btn-select-files">
            <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            选择文件
          </button>
          <div v-if="selectedFiles.length > 0" class="selected-files">
            <p class="file-count">已选择 {{ selectedFiles.length }} 个文件</p>
            <ul class="file-list">
              <li v-for="(file, index) in selectedFiles" :key="index">
                {{ file.name }}
              </li>
            </ul>
          </div>
        </div>
        <div class="export-info">
          <p>
            <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            提示：每个 m3u8 文件将创建一个独立的歌单
          </p>
        </div>
        <div class="modal-actions">
          <button @click="closeImportDialog" class="btn-cancel">取消</button>
          <button @click="importM3U8Files" class="btn-confirm" :disabled="selectedFiles.length === 0">
            确认导入 ({{ selectedFiles.length }} 个文件)
          </button>
        </div>
      </div>
    </div>

    <!-- 导出对话框 -->
    <div v-if="showExportDialog" class="modal-overlay" @click.self="showExportDialog = false">
      <div class="modal">
        <h2>
          <svg class="modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          导出 M3U8 文件
        </h2>
        <div class="export-info">
          <p>
            <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            导出歌单：<strong>{{ selectedPlaylist?.name }}</strong>
          </p>
          <p>
            <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
            </svg>
            文件将包含 {{ m3u8Items }} 首歌曲的路径
          </p>
        </div>
        <div class="modal-actions">
          <button @click="showExportDialog = false" class="btn-cancel">取消</button>
          <button @click="downloadM3U8" class="btn-confirm">
            <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17,21 17,13 7,13 7,21"/>
              <polyline points="7,3 7,8 15,8"/>
            </svg>
            下载文件
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist, getPlaylistM3U8, exportPlaylist, importPlaylist, importPlaylistContent } from '../api';

export default {
  name: 'PlaylistManagement',
  data() {
    return {
      playlists: [],
      selectedPlaylist: null,
      m3u8Content: '',
      m3u8Items: 0,
      loading: false,
      loadingM3U8: false,
      showCreateDialog: false,
      showEditDialog: false,
      showExportDialog: false,
      showImportDialog: false,
      selectedFiles: [],
      currentPlaylist: {
        id: null,
        name: '',
        description: ''
      }
    };
  },
  
  mounted() {
    this.loadPlaylists();
  },
  
  methods: {
    // 加载歌单列表
    async loadPlaylists() {
      this.loading = true;
      try {
        const res = await getPlaylists();
        this.playlists = res.data;
      } catch (error) {
        console.error('加载歌单失败:', error);
      } finally {
        this.loading = false;
      }
    },
    
    // 选择歌单
    async selectPlaylist(playlist) {
      this.selectedPlaylist = playlist;
      this.m3u8Content = '';
      this.m3u8Items = 0;
      
      // 加载 m3u8 内容
      this.loadingM3U8 = true;
      try {
        const res = await getPlaylistM3U8(playlist.id);
        this.m3u8Content = res.data.content;
        this.m3u8Items = res.data.itemCount;
      } catch (error) {
        console.error('加载 m3u8 失败:', error);
      } finally {
        this.loadingM3U8 = false;
      }
    },
    
    // 编辑歌单
    editPlaylist(playlist) {
      this.currentPlaylist = { ...playlist };
      this.showEditDialog = true;
      this.$nextTick(() => {
        if (this.$refs.nameInput) {
          this.$refs.nameInput.focus();
        }
      });
    },
    
    // 保存歌单
    async savePlaylist() {
      if (!this.currentPlaylist.name.trim()) {
        alert('请输入歌单名称');
        return;
      }
      
      try {
        if (this.showEditDialog) {
          await updatePlaylist(
            this.currentPlaylist.id,
            this.currentPlaylist.name,
            this.currentPlaylist.description
          );
          alert('歌单已更新');
        } else {
          await createPlaylist(
            this.currentPlaylist.name,
            this.currentPlaylist.description
          );
          alert('歌单已创建');
        }
        
        this.closeDialog();
        this.loadPlaylists();
      } catch (error) {
        alert('操作失败: ' + error.message);
      }
    },
    
    // 删除歌单
    async deletePlaylist(id) {
      if (!confirm('确定要删除这个歌单吗？删除后无法恢复。')) return;
      
      try {
        await deletePlaylist(id);
        if (this.selectedPlaylist?.id === id) {
          this.selectedPlaylist = null;
          this.m3u8Content = '';
        }
        this.loadPlaylists();
      } catch (error) {
        alert('删除歌单失败: ' + error.message);
      }
    },
    
    // 下载 m3u8 文件（导出）
    downloadM3U8() {
      if (!this.m3u8Content) {
        alert('暂无内容可导出');
        return;
      }
      
      // 创建 Blob 对象
      const blob = new Blob([this.m3u8Content], { type: 'audio/x-mpegurl' });
      const url = URL.createObjectURL(blob);
      
      // 创建下载链接
      const a = document.createElement('a');
      a.href = url;
      const safeName = this.selectedPlaylist.name.replace(/[^\w\u4e00-\u9fa5]/g, '_');
      a.download = `${safeName}.m3u8`;
      
      // 触发下载
      document.body.appendChild(a);
      a.click();
      
      // 清理
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showExportDialog = false;
    },
    
    // 处理文件选择
    handleFileSelect(event) {
      const files = Array.from(event.target.files);
      this.selectedFiles = files;
    },
    
    // 导入多个 m3u8 文件
    async importM3U8Files() {
      if (this.selectedFiles.length === 0) {
        alert('请选择要导入的文件');
        return;
      }
      
      let successCount = 0;
      let failCount = 0;
      const errors = [];
      
      for (const file of this.selectedFiles) {
        try {
          // 读取文件内容
          const content = await file.text();
          
          // 解析歌单名称
          const playlistName = this.extractPlaylistName(content);
          
          // 导入到数据库
          await importPlaylistContent(content, playlistName);
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`${file.name}: ${error.response?.data?.error || error.message}`);
        }
      }
      
      // 显示结果
      let message = `导入完成！\n成功：${successCount} 个\n失败：${failCount} 个`;
      if (errors.length > 0) {
        message += '\n\n失败详情：\n' + errors.join('\n');
      }
      
      alert(message);
      this.closeImportDialog();
      this.loadPlaylists();
    },
    
    // 从 m3u8 内容中提取歌单名称
    extractPlaylistName(content) {
      const lines = content.split('\n').map(line => line.trim()).filter(line => line);
      const playlistLine = lines.find(line => line.startsWith('#PLAYLIST:'));
      if (playlistLine) {
        return playlistLine.substring('#PLAYLIST:'.length);
      }
      return '未命名歌单';
    },
    
    // 关闭导入对话框
    closeImportDialog() {
      this.showImportDialog = false;
      this.selectedFiles = [];
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    
    // 关闭对话框
    closeDialog() {
      this.showCreateDialog = false;
      this.showEditDialog = false;
      this.currentPlaylist = {
        id: null,
        name: '',
        description: ''
      };
    }
  }
};
</script>

<style scoped>
.management-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-icon {
  width: 28px;
  height: 28px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-add,
.btn-import,
.btn-export {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-add:hover,
.btn-import:hover,
.btn-export:hover {
  background: #2980b9;
}

.btn-icon-svg {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.btn-select-files {
  width: 100%;
  background: #f0f0f0;
  border: 2px dashed #ccc;
  padding: 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-select-files:hover {
  background: #e3f2fd;
  border-color: #3498db;
  color: #333;
}

.selected-files {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.file-count {
  margin: 0 0 10px 0;
  font-weight: 500;
  color: #3498db;
}

.file-list {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 150px;
  overflow-y: auto;
}

.file-list li {
  padding: 8px 10px;
  margin-bottom: 5px;
  background: white;
  border-radius: 4px;
  font-size: 13px;
  color: #333;
  border-left: 3px solid #3498db;
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 33.33%;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  background: white;
}

.right-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.panel-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.playlist-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.playlist-item {
  background: white;
  padding: 15px;
  margin-bottom: 8px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.playlist-item:hover {
  border-color: #3498db;
  background: #f0f8ff;
}

.playlist-item.active {
  background: #e3f2fd;
  border-color: #3498db;
}

.playlist-info {
  flex: 1;
}

.playlist-info h3 {
  margin: 0 0 5px 0;
  font-size: 15px;
  color: #333;
}

.item-count {
  font-size: 12px;
  color: #3498db;
}

.playlist-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon svg {
  width: 16px;
  height: 16px;
}

.btn-icon:hover {
  opacity: 1;
}

.m3u8-content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.m3u8-display {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 20px;
  border-radius: 8px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
}

.m3u8-display pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 14px;
}

.export-info {
  background: #e3f2fd;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.export-info p {
  margin: 5px 0;
  font-size: 13px;
  color: #333;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.info-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-top: 1px;
  color: #3498db;
}

/* 模态框 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 0;
  border-radius: 16px;
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05);
}

.modal h2 {
  margin: 0;
  padding: 24px 28px;
  color: #1a1a1a;
  font-size: 22px;
  font-weight: 600;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  width: 24px;
  height: 24px;
}

.modal > div:not(.modal-actions) {
  padding: 24px 28px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  transition: all 0.2s ease;
  background: #fafafa;
}

.form-group input:hover,
.form-group textarea:hover {
  border-color: #d1d5db;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3498db;
  background: white;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 28px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-cancel:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-cancel:active {
  transform: translateY(0);
}

.btn-confirm {
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
}

.btn-confirm:hover {
  background: linear-gradient(135deg, #2980b9 0%, #2471a3 100%);
  box-shadow: 0 4px 8px rgba(52, 152, 219, 0.4);
  transform: translateY(-1px);
}

.btn-confirm:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(52, 152, 219, 0.3);
}

.btn-confirm:disabled {
  background: #d1d5db;
  box-shadow: none;
  cursor: not-allowed;
  transform: none;
}
</style>
