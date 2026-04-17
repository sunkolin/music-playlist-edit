import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    console.error('响应错误:', error.response?.data?.error || error.message);
    return Promise.reject(error);
  }
);

// ==================== 歌单 API ====================

// 获取所有歌单
export const getPlaylists = () => {
  return api.get('/playlists');
};

// 创建歌单
export const createPlaylist = (name, description) => {
  return api.post('/playlists', { name, description });
};

// 更新歌单
export const updatePlaylist = (id, name, description) => {
  return api.put(`/playlists/${id}`, { name, description });
};

// 删除歌单
export const deletePlaylist = (id) => {
  return api.delete(`/playlists/${id}`);
};

// ==================== 歌单项 API ====================

// 获取歌单中的所有歌曲
export const getPlaylistItems = (playlistId) => {
  return api.get(`/playlists/${playlistId}/items`);
};

// 添加歌曲到歌单
export const addPlaylistItem = (playlistId, name, filePath, fileSize, duration) => {
  return api.post(`/playlists/${playlistId}/items`, {
    name,
    filePath,
    fileSize,
    duration
  });
};

// 删除歌单中的歌曲
export const deletePlaylistItem = (playlistId, itemId) => {
  return api.delete(`/playlists/${playlistId}/items/${itemId}`);
};

// 获取歌单的 m3u8 内容
export const getPlaylistM3U8 = (playlistId) => {
  return api.get(`/playlists/${playlistId}/m3u8`);
};

// 导出 m3u8 文件
export const exportPlaylist = (playlistId, exportDir) => {
  return api.post(`/playlists/${playlistId}/export`, { exportDir });
};

// 导入 m3u8 文件（从本地文件路径）
export const importPlaylist = (filePath, playlistName) => {
  return api.post('/playlists/import', { filePath, playlistName });
};

// 导入 m3u8 文件内容（前端上传）
export const importPlaylistContent = (content, playlistName) => {
  return api.post('/playlists/import-content', { content, playlistName });
};

// ==================== 文件系统 API ====================

// 浏览目录
export const browseDirectory = (dir) => {
  return api.get('/filesystem', {
    params: { dir: dir || '' }
  });
};

// 获取文件信息
export const getFileInfo = (filePath) => {
  return api.get('/filesystem/fileinfo', {
    params: { filePath }
  });
};

// ==================== 歌曲目录 API ====================

// 获取所有歌曲目录
export const getMusicDirectories = () => {
  return api.get('/music-directories');
};

// 添加歌曲目录
export const addMusicDirectory = (path, name) => {
  return api.post('/music-directories', { path, name });
};

// 删除歌曲目录
export const deleteMusicDirectory = (id) => {
  return api.delete(`/music-directories/${id}`);
};

export default api;
