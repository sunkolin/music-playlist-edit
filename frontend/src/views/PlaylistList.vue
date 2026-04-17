<template>
  <div class="playlist-list">
    <h1>🎵 歌单编辑器</h1>
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
