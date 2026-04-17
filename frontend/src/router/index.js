import { createRouter, createWebHistory } from 'vue-router'
import PlaylistManagement from '../views/PlaylistManagement.vue'
import PlaylistEditor from '../views/PlaylistEditor.vue'

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
    path: '/editor',
    name: 'PlaylistEditor',
    component: PlaylistEditor
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
