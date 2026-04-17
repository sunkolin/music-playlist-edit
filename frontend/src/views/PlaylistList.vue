<template>
  <div class="playlist-list">
    <h1>
      <svg style="width:28px;height:28px;vertical-align:middle;" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
      歌单编辑器
    </h1>
    <div class="playlist-container">
      <div v-for="playlist in playlists" :key="playlist.id" class="playlist-card">
        <h2>{{ playlist.name }}</h2>
        <p>{{ playlist.description }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlaylistList',
  data() {
    return {
      playlists: []
    }
  },
  mounted() {
    // 后续添加API调用
  }
}
</script>

<style scoped>
.playlist-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.playlist-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.playlist-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
