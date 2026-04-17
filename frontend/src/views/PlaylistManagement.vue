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
      
      <!-- 右侧：歌曲列表 + m3u8 内容 -->
      <div class="right-panel">
        <div class="right-panel-content">
          <!-- 左侧：歌曲列表 -->
          <div class="songs-panel">
            <div class="panel-header">
              <h2 v-if="selectedPlaylist">{{ selectedPlaylist.name }} - 歌曲列表</h2>
              <h2 v-else>选择歌单查看内容</h2>
              <div v-if="selectedPlaylist" class="panel-actions">
                <button 
                  v-if="selectedSongs.length > 0"
                  @click="deleteSelectedSongs"
                  class="btn-delete-songs"
                >
                  <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                  </svg>
                  删除 ({{ selectedSongs.length }})
                </button>
                <button 
                  @click="openAddSongDialog"
                  class="btn-add-song"
                >
                  <svg class="btn-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  增加
                </button>
              </div>
            </div>
            
            <div class="songs-list">
              <div v-if="!selectedPlaylist" class="empty-state">
                <p>请在左侧选择一个歌单</p>
              </div>
              
              <div v-else-if="loadingSongs" class="loading-state">
                <p>加载歌曲列表...</p>
              </div>
              
              <div v-else-if="songs.length > 0" class="songs-content">
                <div 
                  v-for="(song, index) in songs" 
                  :key="song.id"
                  :class="['song-item', { selected: selectedSongs.includes(song.id) }]"
                  @click="toggleSongSelection(song.id)"
                >
                  <div class="song-checkbox">
                    <input 
                      type="checkbox" 
                      :checked="selectedSongs.includes(song.id)"
                      @click.stop
                      @change="toggleSongSelection(song.id)"
                    />
                  </div>
                  <div class="song-index">{{ index + 1 }}</div>
                  <div class="song-info">
                    <div class="song-name">{{ song.name }}</div>
                    <div class="song-path">{{ song.file_path }}</div>
                  </div>
                </div>
              </div>
              
              <div v-else class="empty-state">
                <p>该歌单暂无歌曲</p>
              </div>
            </div>
          </div>
          
          <!-- 右侧：m3u8 内容 -->
          <div class="m3u8-panel">
            <div class="panel-header">
              <h2 v-if="selectedPlaylist">{{ selectedPlaylist.name }} - M3U8 内容</h2>
              <h2 v-else>M3U8 内容</h2>
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
      </div>
    </div>

    <!-- 添加歌曲对话框 -->
    <div v-if="showAddSongDialog" class="modal-overlay" @click.self="closeAddSongDialog">
      <div class="modal modal-large">
        <div class="modal-header">
          <h2>
            <svg class="modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
            添加歌曲到歌单
          </h2>
        </div>
        
        <div class="modal-body">
          <!-- 面包屑导航 -->
          <div class="breadcrumb">
            <button @click="navigateToDir(parentDir)" :disabled="!parentDir || parentDir === currentDir">
              <svg class="breadcrumb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 19V5M5 12l7-7 7 7"/>
              </svg>
              上级目录
            </button>
            <span class="path">{{ currentDir || '加载中...' }}</span>
          </div>
          
          <!-- 文件列表 -->
          <div class="file-browser">
            <div v-if="loadingFiles" class="loading-state">
              <p>加载中...</p>
            </div>
            <div v-else class="file-list-container">
              <div 
                v-for="item in directoryItems" 
                :key="item.path"
                :class="['file-item', { 'is-directory': item.isDirectory, 'is-audio': item.isAudio, selected: selectedFileItems.includes(item) }]"
                @click="handleFileItemClick(item)"
                @dblclick="handleFileItemDblClick(item)"
              >
                <div class="file-checkbox">
                  <input 
                    type="checkbox" 
                    :checked="selectedFileItems.includes(item)"
                    @click.stop
                    @change="toggleFileSelection(item)"
                    :disabled="item.isDirectory"
                  />
                </div>
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
              </div>
              
              <div v-if="directoryItems.length === 0" class="empty-state">
                <p>该目录为空</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <div class="export-info">
            <p>
              <svg class="info-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
              提示：双击目录进入，勾选音乐文件后点击确认添加
            </p>
          </div>
          <div class="modal-actions">
            <button @click="closeAddSongDialog" class="btn-cancel">取消</button>
            <button @click="addSelectedFilesToPlaylist" class="btn-confirm" :disabled="selectedFileItems.length === 0">
              确认添加 ({{ selectedFileItems.length }} 个文件)
            </button>
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
import { getPlaylists, createPlaylist, updatePlaylist, deletePlaylist, getPlaylistM3U8, getPlaylistItems, addPlaylistItem, deletePlaylistItem, exportPlaylist, importPlaylist, importPlaylistContent, browseDirectory } from '../api';

export default {
  name: 'PlaylistManagement',
  data() {
    return {
      playlists: [],
      selectedPlaylist: null,
      songs: [],
      m3u8Content: '',
      m3u8Items: 0,
      loading: false,
      loadingSongs: false,
      loadingM3U8: false,
      showCreateDialog: false,
      showEditDialog: false,
      showExportDialog: false,
      showImportDialog: false,
      showAddSongDialog: false,
      selectedFiles: [],
      selectedSongFiles: [],
      selectedSongs: [],
      directoryItems: [],
      currentDir: '',
      parentDir: '',
      loadingFiles: false,
      selectedFileItems: [],
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
      this.songs = [];
      this.selectedSongs = [];
      this.m3u8Content = '';
      this.m3u8Items = 0;
      
      // 加载歌曲列表
      this.loadingSongs = true;
      try {
        const res = await getPlaylistItems(playlist.id);
        this.songs = res.data;
      } catch (error) {
        console.error('加载歌曲列表失败:', error);
      } finally {
        this.loadingSongs = false;
      }
      
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
    
    // 处理音乐文件选择
    handleSongFileSelect(event) {
      const files = Array.from(event.target.files);
      this.selectedSongFiles = files;
    },
    
    // 关闭添加歌曲对话框
    closeAddSongDialog() {
      this.showAddSongDialog = false;
      this.selectedSongFiles = [];
      this.directoryItems = [];
      this.selectedFileItems = [];
      this.currentDir = '';
      this.parentDir = '';
      if (this.$refs.songFileInput) {
        this.$refs.songFileInput.value = '';
      }
    },
    
    // 打开添加歌曲对话框
    openAddSongDialog() {
      this.showAddSongDialog = true;
      this.loadDirectory();
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
      } catch (error) {
        console.error('加载目录失败:', error);
      } finally {
        this.loadingFiles = false;
      }
    },
    
    // 导航到目录
    navigateToDir(dir) {
      if (dir) {
        this.loadDirectory(dir);
      }
    },
    
    // 单击文件项
    handleFileItemClick(item) {
      if (item.isAudio) {
        this.toggleFileSelection(item);
      }
    },
    
    // 双击目录
    handleFileItemDblClick(item) {
      if (item.isDirectory) {
        this.loadDirectory(item.path);
      }
    },
    
    // 切换文件选择
    toggleFileSelection(item) {
      const index = this.selectedFileItems.indexOf(item);
      if (index > -1) {
        this.selectedFileItems.splice(index, 1);
      } else {
        this.selectedFileItems.push(item);
      }
    },
    
    // 添加选中的文件到歌单
    async addSelectedFilesToPlaylist() {
      if (this.selectedFileItems.length === 0 || !this.selectedPlaylist) {
        alert('请选择音乐文件');
        return;
      }
      
      let successCount = 0;
      let failCount = 0;
      let skipCount = 0;
      const errors = [];
      
      for (const item of this.selectedFileItems) {
        try {
          const fileName = item.name.replace(/\.[^/.]+$/, ''); // 移除扩展名
          
          const result = await addPlaylistItem(
            this.selectedPlaylist.id,
            fileName,
            item.path,
            item.size,
            null
          );
          
          // 检查是否跳过了重复歌曲
          if (result.data && result.data.skipped) {
            skipCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          failCount++;
          errors.push(`${item.name}: ${error.response?.data?.error || error.message}`);
        }
      }
      
      let message = `添加完成！\n成功：${successCount} 个\n跳过：${skipCount} 个（重复）\n失败：${failCount} 个`;
      if (errors.length > 0) {
        message += '\n\n失败详情：\n' + errors.join('\n');
      }
      
      alert(message);
      this.closeAddSongDialog();
      
      // 刷新歌单列表和歌曲列表
      this.selectPlaylist(this.selectedPlaylist);
      this.loadPlaylists();
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
    },
    
    // 切换歌曲选择
    toggleSongSelection(songId) {
      const index = this.selectedSongs.indexOf(songId);
      if (index > -1) {
        this.selectedSongs.splice(index, 1);
      } else {
        this.selectedSongs.push(songId);
      }
    },
    
    // 删除选中的歌曲
    async deleteSelectedSongs() {
      if (this.selectedSongs.length === 0) {
        alert('请先选择要删除的歌曲');
        return;
      }
      
      if (!confirm(`确定要删除选中的 ${this.selectedSongs.length} 首歌曲吗？`)) {
        return;
      }
      
      let successCount = 0;
      let failCount = 0;
      const errors = [];
      
      for (const songId of this.selectedSongs) {
        try {
          await deletePlaylistItem(this.selectedPlaylist.id, songId);
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`歌曲 ID ${songId}: ${error.response?.data?.error || error.message}`);
        }
      }
      
      let message = `删除完成！\n成功：${successCount} 首\n失败：${failCount} 首`;
      if (errors.length > 0) {
        message += '\n\n失败详情：\n' + errors.join('\n');
      }
      
      alert(message);
      this.selectedSongs = [];
      
      // 刷新列表
      this.selectPlaylist(this.selectedPlaylist);
      this.loadPlaylists();
    },
    
    // 添加歌曲到歌单
    async addSongsToPlaylist() {
      if (this.selectedSongFiles.length === 0 || !this.selectedPlaylist) {
        alert('请选择音乐文件');
        return;
      }
      
      // 检查是否所有文件都输入了路径
      const filesWithoutPath = this.selectedSongFiles.filter(f => !f.customPath || !f.customPath.trim());
      if (filesWithoutPath.length > 0) {
        alert(`请为所有文件输入完整路径，还有 ${filesWithoutPath.length} 个文件未填写路径`);
        return;
      }
      
      let successCount = 0;
      let failCount = 0;
      const errors = [];
      
      for (const file of this.selectedSongFiles) {
        try {
          // 使用用户输入的完整路径
          const filePath = file.customPath.trim();
          const fileName = file.name.replace(/\.[^/.]+$/, ''); // 移除扩展名
          
          await addPlaylistItem(
            this.selectedPlaylist.id,
            fileName,
            filePath,
            file.size,
            null
          );
          successCount++;
        } catch (error) {
          failCount++;
          errors.push(`${file.name}: ${error.response?.data?.error || error.message}`);
        }
      }
      
      let message = `添加完成！\n成功：${successCount} 个\n失败：${failCount} 个`;
      if (errors.length > 0) {
        message += '\n\n失败详情：\n' + errors.join('\n');
      }
      
      alert(message);
      this.closeAddSongDialog();
      
      // 刷新歌单列表和歌曲列表
      this.selectPlaylist(this.selectedPlaylist);
      this.loadPlaylists();
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
  max-height: 200px;
  overflow-y: auto;
}

.file-list li {
  padding: 10px;
  margin-bottom: 5px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #3498db;
}

.file-info-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-name {
  font-weight: 500;
  color: #333;
  font-size: 13px;
}

.file-path-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  box-sizing: border-box;
}

.file-path-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

/* 文件浏览器样式 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 15px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 15px;
}

.breadcrumb button {
  background: #fff;
  border: 1px solid #ddd;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.breadcrumb button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.breadcrumb-icon {
  width: 16px;
  height: 16px;
}

.breadcrumb .path {
  font-size: 13px;
  color: #666;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-browser {
  flex: 1;
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background: white;
}

.file-list-container {
  padding: 10px;
}

.file-item {
  background: white;
  padding: 10px 12px;
  margin-bottom: 5px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.file-item:hover {
  background: #f0f8ff;
}

.file-item.selected {
  background: #e3f2fd;
  border-color: #3498db;
}

.file-checkbox {
  flex-shrink: 0;
}

.file-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3498db;
}

.file-checkbox input[type="checkbox"]:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon-svg {
  width: 20px;
  height: 20px;
  color: #666;
}

.file-item.is-audio .file-icon-svg {
  color: #3498db;
}

.file-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #999;
}

.modal-large {
  width: 700px;
  max-width: 90%;
  height: 80vh;
  max-height: 800px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  padding: 20px 25px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-body {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 20px 25px;
  min-height: 0;
}

.modal-footer {
  padding: 15px 25px 20px;
  border-top: 1px solid #e0e0e0;
  background: white;
  flex-shrink: 0;
}

.modal-footer .export-info {
  margin-bottom: 15px;
}

.modal-footer .modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.left-panel {
  width: 25%;
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
  overflow: hidden;
}

.right-panel-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.songs-panel {
  width: 50%;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  background: white;
}

.m3u8-panel {
  width: 50%;
  display: flex;
  flex-direction: column;
  background: white;
}

.songs-list {
  flex: 1;
  overflow-y: auto;
}

.songs-content {
  padding: 10px;
}

.panel-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.btn-delete-songs {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-delete-songs:hover {
  background: #c0392b;
}

.song-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  background: #fafafa;
  transition: all 0.2s;
  cursor: pointer;
  border: 2px solid transparent;
}

.song-item:hover {
  background: #f0f8ff;
}

.song-item.selected {
  background: #e3f2fd;
  border-color: #3498db;
}

.song-checkbox {
  margin-right: 8px;
  padding-top: 4px;
}

.song-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3498db;
}

.song-index {
  width: 28px;
  height: 28px;
  background: #3498db;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
  margin-right: 12px;
}

.song-info {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.song-path {
  font-size: 12px;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-add-song {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-add-song:hover {
  background: #2980b9;
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
  padding: 20px;
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
