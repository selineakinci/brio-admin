<template>
  <div class="page-creer-partie">
    <div class="carte carte-creer">

      <h1>Créer une partie</h1>

      <!-- NOM DE LA PARTIE -->
      <div class="bloc">
        <label>Nom de la partie</label>
        <input
          type="text"
          placeholder="Ex : BRIO – Night Battle"
          v-model="nom"
        />
      </div>

      <!-- DURÉE -->
      <div class="bloc">
        <label>Durée de la partie</label>

        <div class="duree">
          <div class="curseur">
            <span>Heures</span>
            <input type="range" min="0" max="12" v-model="heures" />
            <strong>{{ heures }} h</strong>
          </div>

          <div class="curseur">
            <span>Minutes</span>
            <input type="range" min="0" max="59" v-model="minutes" />
            <strong>{{ minutes }} min</strong>
          </div>

          <div class="curseur">
            <span>Secondes</span>
            <input type="range" min="0" max="59" v-model="secondes" />
            <strong>{{ secondes }} s</strong>
          </div>
        </div>
      </div>

      <!-- JOUEURS -->
      <div class="bloc">
        <label>Nombre de joueurs</label>

        <div class="joueurs">
          <button @click="retirerJoueur">−</button>
          <span>{{ joueurs }}</span>
          <button @click="ajouterJoueur">+</button>
        </div>
      </div>

    <!-- BOUTON -->
    <button
    class="bouton-creer"
    @click="$router.push('/file-attente')"
    >
    Créer cette partie
    </button>


    </div>
  </div>
</template>

<script>
export default {
  name: "CreerPartie",
  data() {
    return {
      nom: "",
      heures: 0,
      minutes: 15,
      secondes: 0,
      joueurs: 8,
    };
  },
  methods: {
    ajouterJoueur() {
      if (this.joueurs < 32) this.joueurs++;
    },
    retirerJoueur() {
      if (this.joueurs > 2) this.joueurs--;
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

/* Carte principale */
.carte-creer {
  width: 520px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

h1 {
  text-align: center;
  margin-bottom: 10px;
}

/* Blocs */
.bloc {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

label {
  font-weight: bold;
  opacity: 0.9;
}

/* Input texte */
input[type="text"] {
  height: 44px;
  border-radius: 12px;
  border: none;
  padding: 0 14px;
  font-size: 16px;
}

/* DURÉE */
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

/* JOUEURS */
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

/* Bouton créer */
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
</style>
