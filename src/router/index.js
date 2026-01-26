import { createRouter, createWebHistory } from "vue-router";

// Pages
import ConnexionAdmin from "../pages/ConnexionAdmin.vue";
import ListeParties from "../pages/ListeParties.vue";
import CreationPartie from "../pages/CreationPartie.vue";
import FileAttentePartie from "../pages/FileAttentePartie.vue";
import PartieEnCours from "../pages/PartieEnCours.vue";
import TableauScores from "../pages/TableauScores.vue";

// Layout
import AdminLayout from "../layouts/AdminLayout.vue";

/**
 * Définition des routes
 */
const routes = [
  /* =========================
     PAGE DE CONNEXION (SANS LAYOUT)
     ========================= */
  {
    path: "/",
    name: "ConnexionAdmin",
    component: ConnexionAdmin,
  },

  /* =========================
     DASHBOARD ADMIN (AVEC LAYOUT)
     ========================= */
  {
    path: "/",
    component: AdminLayout,
    meta: { necessiteAdmin: true },
    children: [
      {
        path: "parties",
        name: "ListeParties",
        component: ListeParties,
      },

      {
        path: "creer-partie",
        name: "CreationPartie",
        component: CreationPartie,
      },

      {
        path: "file-attente/:code",
        name: "FileAttentePartie",
        component: FileAttentePartie,
        props: true,
      },

      {
        path: "partie-en-cours/:code",
        name: "PartieEnCours",
        component: PartieEnCours,
        props: true,
      },

      /* ✅ PAGE SCORES */
      {
        path: "scores/:code",
        name: "Scores",          // 🔥 ALIGNÉ AVEC ListeParties.vue
        component: TableauScores,
        props: true,
      },
    ],
  },
];

/**
 * Création du routeur
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
});

/**
 * 🔐 Garde de navigation :
 * - bloque les pages admin si non connecté
 */
router.beforeEach((to, from, next) => {
  const estAdmin = localStorage.getItem("isAdmin") === "true";

  if (to.meta.necessiteAdmin && !estAdmin) {
    next("/");
  } else {
    next();
  }
});

export default router;
