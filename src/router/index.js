import { createRouter, createWebHistory } from 'vue-router'

// Pages
import ConnexionAdmin from '../pages/ConnexionAdmin.vue'
import ListeParties from '../pages/ListeParties.vue'
import CreationPartie from '../pages/CreationPartie.vue'
import FileAttentePartie from '../pages/FileAttentePartie.vue'
import PartieEnCours from '../pages/PartieEnCours.vue'

/**
 * Définition des routes de l'application
 */
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
    meta: { necessiteAdmin: true },
  },
  {
    path: '/creer-partie',
    name: 'CreationPartie',
    component: CreationPartie,
    meta: { necessiteAdmin: true },
  },
  {
    path: '/file-attente',
    name: 'FileAttentePartie',
    component: FileAttentePartie,
    meta: { necessiteAdmin: true },
  },
  {
    path: '/partie-en-cours',
    name: 'PartieEnCours',
    component: PartieEnCours,
    meta: { necessiteAdmin: true },
  },
]

/**
 * Création du routeur
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * 🔐 Garde de navigation :
 * - Empêche l'accès aux pages admin si l'utilisateur n'est pas connecté
 */
router.beforeEach((to, from, next) => {
  const estAdmin = localStorage.getItem('isAdmin') === 'true'

  if (to.meta.necessiteAdmin && !estAdmin) {
    // Redirection vers la page de connexion
    next('/')
  } else {
    next()
  }
})

export default router
