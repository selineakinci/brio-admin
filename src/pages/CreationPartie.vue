<template>
  <div class="page-creer-partie">
    <div class="carte carte-creer">

      <h1>Créer une partie</h1>

      <!-- NOM -->
      <div class="bloc">
        <div class="titre-bloc">Nom de la partie</div>
        <input
          class="input-brio"
          type="text"
          placeholder="Ex : BRIO – Night Battle"
          v-model="nom"
        />
      </div>

      <!-- DURÉE -->
      <div class="bloc">
        <div class="titre-bloc">Durée de la partie</div>

        <div class="duree-box">
          <input
            type="range"
            min="1"
            max="120"
            v-model.number="minutes"
          />

          <div class="duree-affichage">
            {{ formatDuree(minutes) }}
          </div>

          <div class="duree-hint">

          </div>
        </div>
      </div>

      <!-- JOUEURS -->
      <div class="bloc">
        <div class="titre-bloc">Nombre de joueurs</div>

        <div class="joueurs">
          <button @click="retirerJoueur">−</button>
          <span>{{ joueurs }}</span>
          <button @click="ajouterJoueur">+</button>
        </div>
      </div>

      <!-- BOUTON -->
      <button
        class="bouton-principal bouton-creer"
        :disabled="chargement"
        @click="creerPartie"
      >
        {{ chargement ? "Création..." : "Créer cette partie" }}
      </button>

    </div>
  </div>
</template>


<script>
import axios from "axios";

export default {
  name: "CreationPartie",

  data() {
    return {
      nom: "",
      minutes: 30,   // valeur par défaut propre
      joueurs: 2,
      chargement: false,
    };
  },

  methods: {
    ajouterJoueur() {
      if (this.joueurs < 100) this.joueurs++;
    },

    retirerJoueur() {
      if (this.joueurs > 2) this.joueurs--;
    },

    formatDuree(min) {
      const h = Math.floor(min / 60);
      const m = min % 60;

      if (h === 0) return `${m} min`;
      return `${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")}`;
    },

    async creerPartie() {
      const duration_seconds = this.minutes * 60;

      if (!this.nom || this.joueurs < 2) {
        alert("Veuillez renseigner un nom et au moins 2 joueurs");
        return;
      }

      this.chargement = true;

      try {
        const response = await axios.post("/api/games/", {
          name: this.nom,
          max_players: this.joueurs,
          duration_seconds,
        });

        // Retour à la liste des parties
        this.$router.push(`/file-attente/${response.data.code}`);
      } catch (error) {
        console.error("Erreur backend :", error.response?.data);
        alert("Erreur lors de la création de la partie");
      } finally {
        this.chargement = false;
      }
    },
  },
};
</script>




<style scoped>
.page-creer-partie {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 80px;
}

.carte-creer {
  width: 520px;
  padding: 36px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

h1 {
  text-align: center;
  font-size: 26px;
  font-weight: 800;
}

/* BLOCS */

.bloc {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.titre-bloc {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.85;
}

/* DURÉE */

.duree-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input[type="range"] {
  accent-color: #ec4899;
}

.duree-affichage {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  background: var(--degrade-brio);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.duree-hint {
  font-size: 12px;
  text-align: center;
  opacity: 0.65;
}

/* JOUEURS */

.joueurs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 22px;
}

.joueurs button {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: none;
  font-size: 24px;
  background: var(--degrade-brio);
  color: white;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.joueurs button:hover {
  transform: scale(1.08);
}

.joueurs span {
  font-size: 24px;
  font-weight: bold;
}

/* BOUTON */

.bouton-creer {
  margin-top: 10px;
  height: 52px;
  font-size: 18px;
}

.bouton-creer:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
