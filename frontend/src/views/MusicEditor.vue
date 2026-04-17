<template>
  <div class="editor-container">
    <!-- 顶部工具栏 -->
    <div class="page-header">
      <h1>歌单音乐编辑</h1>
    </div>
    
    <div class="main-content">
      <!-- 左侧：歌单列表 -->
      <div class="left-panel">
        <div class="panel-header">
          <h2>
            <svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            歌单列表
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
          
          <div v-if="playlists.length === 0" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <p>暂无歌单，点击上方按钮创建</p>
          </div>
        </div>
      </div>
      
      <!-- 右侧：文件浏览器 -->
      <div class="right-panel">
        <div class="panel-header">
          <div class="header-top">
            <h2>
              <svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              本地文件
            </h2>
            <div class="selection-info" v-if="selectedFileItems.length > 0">
              已选择 {{ selectedFileItems.length }} 个文件
              <button @click="addSelectedFilesToPlaylist" class="btn-batch-add" :disabled="!selectedPlaylist">
                添加到歌单
              </button>
              <button @click="clearSelection" class="btn-clear-selection">清除选择</button>
            </div>
          </div>
          
          <div class="breadcrumb">
            <span class="path">{{ currentDir || '加载中...' }}</span>
          </div>
        </div>
        
        <div class="file-list">
          <!-- 上级目录项 -->
          <div 
            v-if="parentDir && parentDir !== currentDir"
            class="file-item is-directory"
            @click="navigateUp"
          >
            <div class="file-icon">
              <svg class="file-icon-svg folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
            </div>
            <div class="file-info">
              <span class="file-name">..</span>
            </div>
          </div>
          
          <div 
            v-for="item in directoryItems" 
            :key="item.path"
            :class="['file-item', { 
              'is-directory': item.isDirectory, 
              'is-audio': item.isAudio,
              'is-selected': isFileSelected(item)
            }]"
            @click="handleItemClick(item, $event)"
            @dblclick="handleItemDblClick(item)"
          >
            <!-- 多选框（音频文件和文件夹） -->
            <input 
              v-if="item.isAudio || item.isDirectory" 
              type="checkbox" 
              :checked="isFileSelected(item)"
              @click.stop
              @change="toggleFileSelection(item)"
              class="file-checkbox"
            />
            
            <!-- 文件图标 -->
            <div class="file-icon">
              <svg v-if="item.isDirectory" class="file-icon-svg folder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
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
          
          <div v-if="loadingFiles" class="loading-state">
            <p>加载中...</p>
          </div>
          
          <div v-else-if="directoryItems.length === 0" class="empty-state">
            <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            <p>该目录为空</p>
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
          <input v-model="newPlaylist.name" type="text" placeholder="请输入歌单名称" @keyup.enter="savePlaylist" />
        </div>
        <div class="form-group">
          <label>描述（可选）</label>
          <textarea v-model="newPlaylist.description" placeholder="请输入描述"></textarea>
        </div>
        <div class="modal-actions">
          <button @click="closeDialog" class="btn-cancel">取消</button>
          <button @click="savePlaylist" class="btn-confirm">{{ showEditDialog ? '保存' : '创建' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist, browseDirectory, addPlaylistItem } from '../api/index';

export default {
  name: 'MusicEditor',
  data() {
    return {
      playlists: [],
      selectedPlaylist: null,
      directoryItems: [],
      currentDir: '',
      parentDir: '',
      loadingFiles: false,
      showCreateDialog: false,
      showEditDialog: false,
      newPlaylist: {
        name: '',
        description: ''
      },
      selectedFileItems: [], // 选中的文件列表
      lastSelectedIndex: -1, // 上次选择的索引，用于Shift多选
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
    
    // 编辑歌单
    editPlaylist(playlist) {
      this.newPlaylist = { ...playlist };
      this.showEditDialog = true;
    },
    
    // 保存编辑
    async savePlaylist() {
      if (!this.newPlaylist.name.trim()) {
        alert('请输入歌单名称');
        return;
      }
      
      try {
        if (this.showEditDialog) {
          await updatePlaylist(
            this.newPlaylist.id,
            this.newPlaylist.name,
            this.newPlaylist.description
          );
          alert('歌单已更新');
        } else {
          await createPlaylist(this.newPlaylist.name, this.newPlaylist.description);
          alert('歌单已创建');
        }
        this.closeDialog();
        this.loadPlaylists();
      } catch (error) {
        alert('操作失败: ' + error.message);
      }
    },
    
    // 关闭对话框
    closeDialog() {
      this.showCreateDialog = false;
      this.showEditDialog = false;
      this.newPlaylist = {
        id: null,
        name: '',
        description: ''
      };
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
      this.loadingFiles = true;
      try {
        const res = await browseDirectory(dir);
        const data = res.data;
        this.currentDir = data.currentDir;
        this.parentDir = data.parentDir;
        
        // 只保留目录和音乐文件，过滤隐藏文件和目录
        this.directoryItems = data.items
          .filter(item => {
            const name = item.name;
            return !name.startsWith('.');
          })
          .sort((a, b) => {
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;
            return a.name.localeCompare(b.name);
          });
          
        // 切换目录时清除选择状态
        this.clearSelection();
      } catch (error) {
        console.error('加载目录失败:', error);
      } finally {
        this.loadingFiles = false;
      }
    },
    
    // 导航到上一级目录
    navigateUp() {
      if (this.parentDir && this.parentDir !== this.currentDir) {
        this.loadDirectory(this.parentDir);
      }
    },
    
    // 单击文件项
    handleItemClick(item, event) {
      // 如果是目录，点击进入目录
      if (item.isDirectory) {
        this.loadDirectory(item.path);
        return;
      }
      
      // 只有音频文件才能选择
      if (!item.isAudio) return;
      
      // 获取当前item的索引
      const currentIndex = this.directoryItems.indexOf(item);
      
      // 检查是否按下Shift键
      if (event.shiftKey && this.lastSelectedIndex !== -1 && this.lastSelectedIndex !== currentIndex) {
        // Shift多选：选择从上次选择到当前点击之间的所有项
        const start = Math.min(this.lastSelectedIndex, currentIndex);
        const end = Math.max(this.lastSelectedIndex, currentIndex);
        
        // 清空之前的选择
        this.selectedFileItems = [];
        
        // 选择范围内的所有音频文件和文件夹
        for (let i = start; i <= end; i++) {
          const rangeItem = this.directoryItems[i];
          if (rangeItem.isAudio || rangeItem.isDirectory) {
            this.selectedFileItems.push(rangeItem);
          }
        }
      } else {
        // 普通点击：切换当前项的选择状态
        this.toggleFileSelection(item);
        this.lastSelectedIndex = currentIndex;
      }
    },
    
    // 双击目录
    handleItemDblClick(item) {
      if (item.isDirectory) {
        this.loadDirectory(item.path);
      }
    },
    
    // 判断文件是否被选中
    isFileSelected(item) {
      return this.selectedFileItems.includes(item);
    },
    
    // 切换文件选择状态
    toggleFileSelection(item) {
      const index = this.selectedFileItems.indexOf(item);
      if (index > -1) {
        this.selectedFileItems.splice(index, 1);
      } else {
        this.selectedFileItems.push(item);
      }
    },
    
    // 清除所有选择
    clearSelection() {
      this.selectedFileItems = [];
      this.lastSelectedIndex = -1;
    },
    
    // 批量添加到歌单
    async addSelectedFilesToPlaylist() {
      if (!this.selectedPlaylist) {
        alert('请先选择一个歌单');
        return;
      }
      
      if (this.selectedFileItems.length === 0) {
        alert('请先选择要添加的文件');
        return;
      }
      
      let successCount = 0;
      let skipCount = 0;
      let failCount = 0;
      const errors = [];
      
      try {
        // 收集所有需要添加的文件（包括文件夹中的音乐）
        const filesToAdd = [];
        
        for (const item of this.selectedFileItems) {
          if (item.isDirectory) {
            // 如果是文件夹，递归获取所有音乐文件
            const musicFiles = await this.getMusicFilesFromDirectory(item.path);
            filesToAdd.push(...musicFiles);
          } else if (item.isAudio) {
            filesToAdd.push(item);
          }
        }
        
        // 添加所有收集到的音乐文件
        for (const file of filesToAdd) {
          try {
            const fileName = file.name.replace(/\.[^/.]+$/, ''); // 移除扩展名
            
            const result = await addPlaylistItem(
              this.selectedPlaylist.id,
              fileName,
              file.path,
              file.size,
              null
            );
            
            // 检查是否跳过了重复歌曲
            if (result.data && result.data.skipped) {
              skipCount++;
            } else {
              successCount++;
            }
          } catch (error) {
            console.error('添加文件失败:', file.name, error);
            failCount++;
            errors.push(`${file.name}: ${error.response?.data?.error || error.message}`);
          }
        }
        
        // 显示结果
        let message = `批量添加完成！\n成功: ${successCount} 个`;
        if (skipCount > 0) {
          message += `\n跳过(已存在): ${skipCount} 个`;
        }
        if (failCount > 0) {
          message += `\n失败: ${failCount} 个`;
        }
        if (errors.length > 0) {
          message += '\n\n失败详情：\n' + errors.join('\n');
        }
        alert(message);
        
        // 清除选择并刷新歌单列表
        this.clearSelection();
        this.loadPlaylists();
      } catch (error) {
        alert('批量添加失败: ' + error.message);
      }
    },
    
    // 递归获取文件夹下所有音乐文件
    async getMusicFilesFromDirectory(dirPath) {
      const musicFiles = [];
      
      try {
        const res = await browseDirectory(dirPath);
        const items = res.data.items.filter(item => !item.name.startsWith('.'));
        
        for (const item of items) {
          if (item.isAudio) {
            musicFiles.push(item);
          } else if (item.isDirectory) {
            // 递归获取子文件夹中的音乐
            const subFiles = await this.getMusicFilesFromDirectory(item.path);
            musicFiles.push(...subFiles);
          }
        }
      } catch (error) {
        console.error('获取文件夹音乐失败:', dirPath, error);
      }
      
      return musicFiles;
    },
    
    // 添加到歌单
    async addToPlaylist(item) {
      if (!this.selectedPlaylist) {
        alert('请先选择一个歌单');
        return;
      }
      
      try {
        const fileName = item.name.replace(/\.[^/.]+$/, ''); // 移除扩展名
        
        await addPlaylistItem(
          this.selectedPlaylist.id,
          fileName,
          item.path,
          item.size,
          null
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

.left-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
  min-width: 25%;
  max-width: 25%;
}

.right-panel {
  flex: 3;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header h2 {
  margin: 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
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

.selection-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
  background: #fff;
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.btn-batch-add {
  background: #3498db;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-batch-add:hover:not(:disabled) {
  background: #2980b9;
}

.btn-batch-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-clear-selection {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 5px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-clear-selection:hover {
  background: #7f8c8d;
}

.playlist-list,
.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.playlist-item {
  background: white;
  padding: 15px 20px;
  margin-bottom: 0;
  border-radius: 0;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.playlist-item:hover {
  background: #f5f5f5;
}

.playlist-item.active {
  background: #e8f0fe;
}

.playlist-info {
  flex: 1;
}

.playlist-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.playlist-info p {
  margin: 0 0 5px 0;
  font-size: 13px;
  color: #666;
}

.item-count {
  font-size: 14px;
  color: #3498db;
  font-weight: 500;
}

.playlist-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.playlist-item:hover .playlist-actions {
  opacity: 1;
}

.btn-icon {
  background: none;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #f0f0f0;
  color: #333;
}

.btn-icon svg {
  width: 16px;
  height: 16px;
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
  border: 2px solid transparent;
}

.file-item:hover {
  background: #f0f0f0;
}

.file-item.is-selected {
  background: #ebf5ff;
  border-color: #3498db;
}

.file-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  flex-shrink: 0;
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

.folder-icon {
  width: 22px;
  height: 22px;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px;
  color: #999;
  min-height: 200px;
}

.empty-state svg.empty-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
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
