<template>
  <div class="page-parties">
    <!-- Créer une partie -->
    <div
      class="creer-partie"
      @click="$router.push('/creer-partie')"
    >
      <div class="bouton-plus"></div>
      <span>Créer une partie</span>
    </div>

    <!-- Liste des parties -->
    <div class="liste-parties">
      <div
        class="carte carte-partie"
        v-for="partie in parties"
        :key="partie.id"
      >
        <!-- Statut (BACKEND DRIVEN) -->
        <div
          class="statut"
          :class="statusClass(partie.status)"
        >
          {{ statusLabel(partie.status) }}
        </div>

        <!-- Nom -->
        <div class="nom-partie">
          {{ partie.nom }}
        </div>

        <!-- Infos -->
        <div class="infos">
          <div><strong>Code</strong> : {{ partie.code }}</div>
          <div><strong>Joueurs</strong> : {{ partie.max_players }}</div>
          <div><strong>Temps restant</strong> : {{ partie.temps_restant }}</div>

          <!-- QR CODE -->
          <div class="qr">
            <img :src="partie.qrCode" alt="QR Code" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from "qrcode";

export default {
  name: "ListeParties",

  data() {
    return {
      parties: [],
    };
  },

  mounted() {
    this.chargerParties();
  },

  methods: {
    async chargerParties() {
      try {
        const response = await fetch("/api/games/");
        const games = await response.json();

        this.parties = await Promise.all(
          games.map(async game => {
            const qrCode = await QRCode.toDataURL(game.code, {
              width: 140,
              margin: 1,
            });

            return {
              id: game.id,
              nom: game.name,
              code: game.code,
              max_players: game.max_players,
              status: game.status, // waiting | running | paused | finished
              duration_seconds: game.duration_seconds,
              temps_restant: this.formatTemps(game.duration_seconds),
              qrCode,
            };
          })
        );
      } catch (error) {
        console.error("Erreur chargement parties :", error);
      }
    },

    formatTemps(secondes) {
      const h = Math.floor(secondes / 3600);
      const m = Math.floor((secondes % 3600) / 60);
      const s = Math.floor(secondes % 60);

      return (
        `${String(h).padStart(2, "0")}:` +
        `${String(m).padStart(2, "0")}:` +
        `${String(s).padStart(2, "0")}`
      );
    },

    statusLabel(status) {
      return {
        waiting: "En attente",
        running: "Partie en cours",
        paused: "En pause",
        finished: "Partie terminée",
      }[status] || status;
    },

    statusClass(status) {
      return {
        waiting: "attente",
        running: "en-cours",
        paused: "pause",
        finished: "terminee",
      }[status];
    },
  },
};
</script>




<style>
.page-parties {
  min-height: 100vh;
  padding: 40px;
}

/* ===== Bouton créer ===== */

.creer-partie {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.bouton-plus {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--degrade-brio);
  position: relative;
}

.bouton-plus::after {
  content: "+";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%);
  font-size: 28px;
  font-weight: bold;
  color: white;
}

/* ===== Liste ===== */

.liste-parties {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== Carte ===== */

.carte-partie {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 24px;
  padding: 20px;
  border-radius: 20px;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.carte-partie:hover {
  transform: scale(1.02);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
}

/* ===== Statuts ===== */

.statut {
  min-width: 160px;
  height: 42px;
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.attente {
  background-color: #facc15;
}

.en-cours {
  background-color: #22c55e;
}

.pause {
  background-color: #fb923c;
}

.terminee {
  background-color: #ef4444;
}

/* ===== Texte ===== */

.nom-partie {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

.infos {
  text-align: right;
  font-size: 15px;
}

/* ===== QR ===== */

.qr img {
  width: 140px;
  height: 140px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  margin-top: 8px;
}
</style>
