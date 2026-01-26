<template>
  <div class="page-scores">

    <h1 class="titre">🏆 Scores finaux</h1>
    <p class="sous-titre">{{ partie.nom }}</p>

    <!-- TABLEAU SCORES -->
    <div class="carte scores-carte">
      <table class="table-scores">
        <thead>
          <tr>
            <th>#</th>
            <th>Joueur</th>
            <th>☠️ Kills</th>
            <th>💀 Morts</th>
            <th>🎯 Précision</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(j, index) in joueursTries"
            :key="j.id"
            :class="{ winner: index === 0 }"
          >
            <td>{{ index + 1 }}</td>
            <td>{{ j.pseudo }}</td>
            <td>{{ j.kills }}</td>
            <td>{{ j.deaths }}</td>
            <td>{{ j.accuracy ?? "—" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ACTIONS -->
    <div class="actions">
      <button class="btn-brio" @click="retourParties">
        🔙 Retour aux parties
      </button>
    </div>

  </div>
</template>



<script>
import axios from "axios";

export default {
  name: "Scores",

  data() {
    return {
      partie: {
        nom: "Chargement...",
        code: null,
      },
      joueurs: [],
    };
  },

  computed: {
    codePartie() {
      return this.$route.params.code;
    },

    joueursTries() {
      return [...this.joueurs].sort((a, b) => {
        if (b.kills !== a.kills) return b.kills - a.kills;
        return a.deaths - b.deaths;
      });
    },
  },

  mounted() {
    if (!this.codePartie) {
      console.error("❌ Code de partie manquant");
      this.$router.push("/parties");
      return;
    }

    this.partie.code = this.codePartie;
    this.chargerScores();
  },

  methods: {
    async chargerScores() {
      try {
        const res = await axios.get(
          `/api/games/${this.partie.code}/scores/`
        );

        this.partie.nom = res.data.game_name ?? "Partie terminée";
        this.joueurs = res.data.players ?? [];
      } catch (err) {
        console.error("Erreur chargement scores", err);
      }
    },

    retourParties() {
      this.$router.push("/parties");
    },
  },
};
</script>



<style>
.page-scores {
  padding: 32px;
}

.titre {
  font-size: 36px;
  font-weight: 900;
  text-align: center;
}

.sous-titre {
  text-align: center;
  opacity: 0.7;
  margin-bottom: 24px;
}

.scores-carte {
  background: rgba(0,0,0,0.35);
  border-radius: 16px;
  padding: 20px;
}

.table-scores {
  width: 100%;
  border-collapse: collapse;
}

.table-scores th,
.table-scores td {
  padding: 12px;
  text-align: center;
}

.table-scores thead {
  opacity: 0.6;
  font-size: 13px;
  letter-spacing: 2px;
}

.table-scores tbody tr {
  background: rgba(255,255,255,0.04);
}

.table-scores tbody tr.winner {
  background: linear-gradient(90deg,#facc15,#eab308);
  color: black;
  font-weight: 900;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
