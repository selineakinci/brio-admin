<template>
  <div class="page-creer-partie">
    <div class="carte carte-creer">

      <h1>Créer une partie</h1>

      <!-- NOM -->
      <div class="bloc">
        <div class="titre-bloc">Nom de la partie</div>
        <input
          type="text"
          placeholder="Ex : BRIO – Night Battle"
          v-model="nom"
        />
      </div>

      <!-- DURÉE -->
      <div class="bloc">
        <div class="titre-bloc">Durée de la partie</div>

        <div class="duree">
          <div class="curseur">
            <span>Heures</span>
            <input type="range" min="0" max="12" v-model.number="heures" />
            <strong>{{ heures }} h</strong>
          </div>

          <div class="curseur">
            <span>Minutes</span>
            <input type="range" min="0" max="59" v-model.number="minutes" />
            <strong>{{ minutes }} min</strong>
          </div>

          <div class="curseur">
            <span>Secondes</span>
            <input type="range" min="0" max="59" v-model.number="secondes" />
            <strong>{{ secondes }} s</strong>
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
        class="bouton-creer"
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
      heures: 0,
      minutes: 0,
      secondes: 0,
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

    async creerPartie() {
      const duration_seconds =
        this.heures * 3600 +
        this.minutes * 60 +
        this.secondes;

      if (!this.nom || this.joueurs < 2 || duration_seconds < 60) {
        alert("Veuillez renseigner un nom, au moins 2 joueurs et une durée ≥ 1 min");
        return;
      }

      this.chargement = true;

      try {
        await axios.post("/api/games/", {
          name: this.nom,
          max_players: this.joueurs,
          duration_seconds,
        });

        // Retour à la liste
        this.$router.push("/parties");
      } catch (error) {
        console.error(error);
        alert("Erreur lors de la création de la partie");
      } finally {
        this.chargement = false;
      }
    },
  },
};
</script>

<style>
.page-creer-partie {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 60px;
}

.carte-creer {
  width: 520px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

h1 {
  text-align: center;
}

.bloc {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.titre-bloc {
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  opacity: 0.85;
}

input[type="text"] {
  height: 44px;
  border-radius: 12px;
  border: none;
  padding: 0 14px;
  font-size: 16px;
}

.duree {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.curseur {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 12px;
}

input[type="range"] {
  accent-color: #ec4899;
}

.joueurs {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.joueurs button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  font-size: 24px;
  background: var(--degrade-brio);
  color: white;
  cursor: pointer;
}

.joueurs span {
  font-size: 22px;
  font-weight: bold;
}

.bouton-creer {
  margin-top: 20px;
  height: 48px;
  border-radius: 16px;
  border: none;
  background: var(--degrade-brio);
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.bouton-creer:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
