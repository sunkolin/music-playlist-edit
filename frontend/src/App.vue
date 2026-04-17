<template>
  <div class="app-container">
    <!-- 左侧菜单栏 -->
    <aside class="sidebar">
      <div class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <h2>歌单编辑器</h2>
        <p class="logo-subtitle">Playlist Editor</p>
      </div>
      <nav class="menu">
        <router-link to="/playlists" class="menu-item" active-class="active" exact>
          <div class="menu-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div class="menu-item-content">
            <span class="menu-item-text">歌单管理</span>
            <span class="menu-item-badge"></span>
          </div>
        </router-link>
        <router-link to="/music-editor" class="menu-item" active-class="active">
          <div class="menu-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>
          </div>
          <div class="menu-item-content">
            <span class="menu-item-text">歌单音乐编辑</span>
            <span class="menu-item-badge"></span>
          </div>
        </router-link>
        <router-link to="/directories" class="menu-item" active-class="active">
          <div class="menu-item-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
          </div>
          <div class="menu-item-content">
            <span class="menu-item-text">歌曲目录管理</span>
            <span class="menu-item-badge"></span>
          </div>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <div class="version">v1.0.0</div>
      </div>
    </aside>

    <!-- 右侧内容区 -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #ffffff;
}

.sidebar {
  width: 240px;
  background: #ffffff;
  color: #333;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f0f0f0;
}

.logo {
  padding: 24px 20px;
  border-bottom: 1px solid #f5f5f5;
}

.logo-icon {
  display: none;
}

.logo h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.logo-subtitle {
  margin: 0;
  font-size: 12px;
  color: #999;
  font-weight: 400;
}

.menu {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.menu-item {
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  border-radius: 8px;
  text-decoration: none;
  color: #666;
  position: relative;
}

.menu-item:hover {
  background: #f5f5f5;
  color: #333;
}

.menu-item.active {
  background: #e8f0fe;
  color: #3498db;
}

.menu-item-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.menu-item-icon svg {
  width: 18px;
  height: 18px;
}

.menu-item-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.menu-item-text {
  font-size: 14px;
  font-weight: 500;
}

.menu-item-badge {
  display: none;
}

.sidebar-footer {
  display: none;
}

.content {
  flex: 1;
  overflow: hidden;
  background: #f5f7fa;
}
</style>
