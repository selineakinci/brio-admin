<template>
  <div class="page-file-attente">
    <div class="carte carte-attente">

      <!-- EN-TÊTE -->
      <div class="entete">
        <h1>{{ partie.nom }}</h1>
        <span class="etat">
          {{ joueursPrets }}/{{ joueurs.length }} joueurs prêts
        </span>
      </div>

      <!-- LISTE DES JOUEURS -->
      <div class="liste-joueurs">
        <div
          v-for="joueur in joueurs"
          :key="joueur.id"
          class="carte carte-joueur"
        >
          <!-- Identité -->
          <div class="identite">
            <div class="avatar">
              {{ joueur.nom.charAt(0) }}
            </div>
            <span class="nom-joueur">{{ joueur.nom }}</span>
          </div>

          <!-- ÉQUIPEMENTS -->
          <div class="equipements">
            <span class="equipement" :class="{ ok: joueur.arme }">🔫</span>
            <span class="equipement" :class="{ ok: joueur.gilet }">🦺</span>
          </div>

          <!-- STATUT (CLIC ADMIN) -->
          <div
            class="statut"
            :class="joueur.pret ? 'pret' : 'attente'"
            @click="togglePret(joueur)"
          >
            {{ joueur.pret ? 'Prêt' : 'En attente' }}
          </div>
        </div>
      </div>

      <!-- ACTION -->
      <button
        class="bouton-lancer"
        :disabled="!tousPrets"
        @click="lancerPartie"
      >
        Lancer la partie
      </button>

    </div>
  </div>
</template>

<script>
export default {
  name: "FileAttentePartie",

  data() {
    return {
      partie: {
        nom: "BRIO – Night Battle",
      },

      joueurs: [
        { id: 1, nom: "Mathis",  arme: true,  gilet: true,  pret: true  },
        { id: 2, nom: "Matteo",  arme: true,  gilet: false, pret: false },
        { id: 3, nom: "Charles", arme: true,  gilet: true,  pret: true  },
        { id: 4, nom: "Séline",  arme: false, gilet: true,  pret: false },
        { id: 5, nom: "Julie",   arme: true,  gilet: true,  pret: true  },
        { id: 6, nom: "Adrien",  arme: true,  gilet: true,  pret: false },
      ],
    };
  },

  computed: {
    joueursPrets() {
      return this.joueurs.filter(j => j.pret).length;
    },

    tousPrets() {
      return this.joueurs.length > 0 &&
             this.joueurs.every(j => j.pret);
    }
  },

  methods: {
    togglePret(joueur) {
      joueur.pret = !joueur.pret;
    },

    lancerPartie() {
      if (!this.tousPrets) return;
      this.$router.push({ name: "PartieEnCours" });
    }
  }
};
</script>

<style>
.page-file-attente {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding-top: 50px;
}

/* Carte principale */
.carte-attente {
  width: 720px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* En-tête */
.entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.etat {
  opacity: 0.85;
  font-weight: bold;
}

/* Liste joueurs */
.liste-joueurs {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Carte joueur */
.carte-joueur {
  display: grid;
  grid-template-columns: 1.4fr 1fr auto;
  align-items: center;
  padding: 16px;
}

/* Identité */
.identite {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--degrade-brio);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.nom-joueur {
  font-size: 16px;
  font-weight: bold;
}

/* Équipements */
.equipements {
  display: flex;
  gap: 14px;
  font-size: 20px;
}

.equipement {
  opacity: 0.25;
}

.equipement.ok {
  opacity: 1;
}

/* Statut */
.statut {
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  user-select: none;
}

.pret {
  background-color: #22c55e;
}

.attente {
  background-color: #f59e0b;
}

/* Bouton lancer */
.bouton-lancer {
  margin-top: 10px;
  height: 48px;
  border-radius: 16px;
  border: none;
  background: var(--degrade-brio);
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.bouton-lancer:hover:not(:disabled) {
  transform: scale(1.03);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.bouton-lancer:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
