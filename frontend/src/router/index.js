import { createRouter, createWebHistory } from 'vue-router'
import PlaylistList from '../views/PlaylistList.vue'

const routes = [
  {
    path: '/',
    name: 'PlaylistList',
    component: PlaylistList
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
