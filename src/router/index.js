import { createRouter, createWebHistory } from 'vue-router'

import ConnexionAdmin from '../pages/ConnexionAdmin.vue'
import ListeParties from '../pages/ListeParties.vue'
import CreationPartie from '../pages/CreationPartie.vue'
import FileAttentePartie from '../pages/FileAttentePartie.vue'
import PartieEnCours from '../pages/PartieEnCours.vue'


const routes = [
  {
    path: '/',
    name: 'ConnexionAdmin',
    component: ConnexionAdmin,
  },
  {
    path: '/parties',
    name: 'ListeParties',
    component: ListeParties,
  },
  {
    path: "/partie-en-cours",
    name: "PartieEnCours",
    component: () => import("../pages/PartieEnCours.vue")
  },
  {
  path: '/file-attente',
  name: 'FileAttentePartie',
  component: FileAttentePartie,
},
  {
    path: '/creer-partie',
    name: 'CreationPartie',
    component: CreationPartie,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
