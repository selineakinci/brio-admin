<template>
  <div class="page-scores">

    <!-- HEADER -->
    <header class="header">
      <h1 class="titre">🏆 Résultats</h1>
      <p class="sous-titre">{{ partie.nom }}</p>
    </header>

    <!-- TABLE -->
    <div class="carte scores-carte">
      <table class="table-scores">
        <thead>
          <tr>
            <th>#</th>
            <th>Joueur</th>
            <th>☠️ Kills</th>
            <th>💀 Morts</th>
            <th>🎯 %</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(j, index) in joueursTries"
            :key="j.id"
            :class="{
              winner: index === 0,
              dead: j.deaths > 0 && index !== 0
            }"
          >
            <td>{{ index + 1 }}</td>

            <td class="joueur">
              <span class="pseudo">{{ j.pseudo }}</span>

              <!-- BADGES -->
              <div class="badges">
                <span v-if="j.id === winnerId" class="badge gold">🏆 WIN</span>
                <span v-if="j.id === mvpId" class="badge red">💥 MVP</span>
                <span v-if="j.id === sniperId" class="badge blue">🎯 SNIPER</span>
                <span v-if="j.id === survivorId" class="badge green">🧠 SURVIVOR</span>
              </div>
            </td>

            <td>{{ j.kills }}</td>
            <td>{{ j.deaths }}</td>
            <td>{{ j.accuracy ?? "—" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ACTION -->
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
  name: "TableauScores",

  data() {
    return {
      partie: {
        nom: "Chargement...",
        code: null,
      },
      joueurs: [],
      socket: null,
    };
  },

  computed: {
    codePartie() {
      return this.$route.params.code;
    },

    joueursTries() {
      // Classement Battle Royale
      return [...this.joueurs].sort((a, b) => {
        if (b.kills !== a.kills) return b.kills - a.kills;
        return a.deaths - b.deaths;
      });
    },

    winnerId() {
      return this.joueursTries[0]?.id ?? null;
    },

    mvpId() {
      return [...this.joueurs]
        .sort((a, b) => b.kills - a.kills)[0]?.id ?? null;
    },

    sniperId() {
      return [...this.joueurs]
        .filter(j => j.accuracy !== null && j.shots_fired >= 10)
        .sort((a, b) => b.accuracy - a.accuracy)[0]?.id ?? null;
    },

    survivorId() {
      return [...this.joueurs]
        .sort((a, b) => b.survival_time_seconds - a.survival_time_seconds)[0]?.id ?? null;
    },
  },

  mounted() {
    if (!this.codePartie) {
      this.$router.push("/parties");
      return;
    }

    this.partie.code = this.codePartie;
    this.fetchStats();
    this.connectWebSocket();
  },

  beforeUnmount() {
    if (this.socket) this.socket.close();
  },

  methods: {
    async fetchStats() {
      try {
        const res = await axios.get(
          `/api/games/${this.partie.code}/stats/`
        );

        this.partie.nom = res.data.game_name ?? "Partie terminée";
        this.joueurs = res.data.players ?? [];
      } catch (err) {
        console.error("Erreur stats", err);
      }
    },

    connectWebSocket() {
      const wsUrl = `${location.protocol === "https:" ? "wss" : "ws"}://${
        location.host
      }/ws/games/${this.partie.code}/stats`;

      this.socket = new WebSocket(wsUrl);

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.players) {
          this.joueurs = data.players;
        }
      };

      this.socket.onerror = (e) => {
        console.error("WebSocket error", e);
      };
    },

    retourParties() {
      this.$router.push("/parties");
    },
  },
};
</script>



<style scoped>
.page-scores {
  padding: 32px;
  max-width: 1100px;
  margin: auto;
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.titre {
  font-size: 38px;
  font-weight: 900;
}

.sous-titre {
  opacity: 0.6;
  margin-top: 4px;
}

.scores-carte {
  background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(0,0,0,0.3));
  border-radius: 20px;
  padding: 20px;
  backdrop-filter: blur(6px);
}

.table-scores {
  width: 100%;
  border-collapse: collapse;
}

.table-scores th {
  opacity: 0.6;
  font-size: 12px;
  letter-spacing: 2px;
  padding: 12px;
}

.table-scores td {
  padding: 14px;
  text-align: center;
}

.table-scores tbody tr {
  background: rgba(255,255,255,0.03);
  transition: transform 0.15s ease, background 0.15s ease;
}

.table-scores tbody tr:hover {
  transform: scale(1.01);
  background: rgba(255,255,255,0.06);
}

.table-scores tr.winner {
  background: linear-gradient(90deg, #facc15, #eab308);
  color: black;
  font-weight: 900;
}

.table-scores tr.dead {
  opacity: 0.55;
}

.joueur {
  text-align: left;
}

.pseudo {
  font-weight: 700;
}

.badges {
  display: flex;
  gap: 6px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.badge {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  font-weight: 800;
}

.badge.gold { background: #facc15; color: black; }
.badge.red { background: #ef4444; color: white; }
.badge.blue { background: #3b82f6; color: white; }
.badge.green { background: #22c55e; color: white; }

.actions {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>