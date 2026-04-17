import { createRouter, createWebHistory } from 'vue-router'
import PlaylistManagement from '../views/PlaylistManagement.vue'
import MusicEditor from '../views/MusicEditor.vue'
import DirectoryManagement from '../views/DirectoryManagement.vue'

const routes = [
  {
    path: '/',
    redirect: '/playlists'
  },
  {
    path: '/playlists',
    name: 'PlaylistManagement',
    component: PlaylistManagement
  },
  {
    path: '/music-editor',
    name: 'MusicEditor',
    component: MusicEditor
  },
  {
    path: '/directories',
    name: 'DirectoryManagement',
    component: DirectoryManagement
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
