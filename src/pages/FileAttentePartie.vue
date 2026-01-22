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
          <!-- IDENTITÉ -->
          <div class="identite">
            <div class="avatar">
              {{ joueur.pseudo.charAt(0).toUpperCase() }}
            </div>
            <span class="nom-joueur">{{ joueur.pseudo }}</span>
          </div>

          <!-- ÉQUIPEMENTS -->
          <div class="equipements">
            <span class="equipement" :class="{ ok: joueur.pret }">🔫</span>
            <span class="equipement" :class="{ ok: joueur.pret }">🦺</span>
          </div>

          <!-- STATUT -->
          <div
            class="statut"
            :class="joueur.pret ? 'pret' : 'attente'"
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
import axios from "axios";

export default {
  name: "FileAttentePartie",

  data() {
    return {
      partie: {
        nom: "File d’attente",
      },
      joueurs: [],
      pollingId: null,
    };
  },

  computed: {
    codePartie() {
      return this.$route.params.code;
    },

    joueursPrets() {
      return this.joueurs.filter(j => j.pret).length;
    },

    tousPrets() {
      return this.joueurs.length > 0 &&
             this.joueurs.every(j => j.pret);
    },
  },

  mounted() {
    if (!this.codePartie) {
      console.error("❌ Code de partie manquant");
      return;
    }

    // 1️⃣ Chargement initial COMPLET
    this.chargerJoueurs();

    // 2️⃣ Polling léger uniquement sur l'état prêt
    this.pollingId = setInterval(() => {
      this.pollingEtatEquipements();
    }, 2000);
  },

  beforeUnmount() {
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  },

  methods: {
    /* =========================
       CHARGEMENT INITIAL
       ========================= */
    async chargerJoueurs() {
      try {
        const response = await axios.get(
          `/api/games/${this.codePartie}/players/`
        );

        this.joueurs = response.data.map(player => ({
          id: player.id,
          pseudo: player.pseudo,
          pret: player.equipment_id !== null,
        }));
      } catch (error) {
        console.error(
          "Erreur chargement joueurs :",
          error.response?.data || error
        );
      }
    },

    /* =========================
       POLLING OPTIMISÉ
       ========================= */
    async pollingEtatEquipements() {
      try {
        const response = await axios.get(
          `/api/games/${this.codePartie}/players/`
        );

        const backendPlayers = response.data;

        // 🔥 Mise à jour UNIQUEMENT du champ `pret`
        backendPlayers.forEach(bp => {
          const localPlayer = this.joueurs.find(j => j.id === bp.id);

          if (localPlayer) {
            const nouveauPret = bp.equipment_id !== null;

            if (localPlayer.pret !== nouveauPret) {
              localPlayer.pret = nouveauPret;
            }
          }
        });
      } catch (error) {
        console.error("Erreur polling équipements :", error);
      }
    },

    lancerPartie() {
      if (!this.tousPrets) return;

      // 🔮 futur endpoint backend
      // await axios.post(`/api/games/${this.codePartie}/start/`);

      this.$router.push({
        name: "PartieEnCours",
        params: { code: this.codePartie },
      });
    },
  },
};
</script>


<style>
.page-file-attente {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding-top: 50px;
}

.carte-attente {
  width: 720px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.etat {
  opacity: 0.85;
  font-weight: bold;
}

.liste-joueurs {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.carte-joueur {
  display: grid;
  grid-template-columns: 1.4fr 1fr auto;
  align-items: center;
  padding: 16px;
}

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

.equipements {
  display: flex;
  gap: 14px;
  font-size: 20px;
}

.equipement {
  opacity: 0.25;
  transition: opacity 0.2s ease;
}

.equipement.ok {
  opacity: 1;
}

.statut {
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
  user-select: none;
}

.pret {
  background-color: #22c55e;
}

.attente {
  background-color: #f59e0b;
}

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
}

.bouton-lancer:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
</style>
