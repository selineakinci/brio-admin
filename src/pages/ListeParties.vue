<template>
  <div class="page-parties">
    <!-- CRÉER UNE PARTIE -->
    <div class="creer-partie">
      <button
        class="bouton-plus"
        @click.stop="allerCreerPartie"
        aria-label="Créer une partie"
      ></button>
      <span class="creer-texte">Créer une partie</span>
    </div>

    <!-- LISTE DES PARTIES -->
    <div class="liste-parties">
      <div
        class="carte carte-partie"
        v-for="partie in parties"
        :key="partie.id"
        @click="allerVersPartie(partie)"
      >
        <!-- STATUT -->
        <div class="statut" :class="statusClass(partie.status)">
          {{ statusLabel(partie.status) }}
        </div>

        <!-- INFOS -->
        <div class="centre">
          <div class="nom-partie">{{ partie.nom }}</div>
          <div class="infos">
            <div><strong>Joueurs max</strong> : {{ partie.max_players }}</div>
            <div><strong>Temps restant</strong> : {{ partie.temps_restant }}</div>
          </div>
        </div>

        <!-- QR (ne déclenche PAS la navigation) -->
        <div class="qr" @click.stop>
          <img :src="partie.qrCode" alt="QR Code" />
          <span class="qr-label">Scanner pour rejoindre</span>
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
    allerCreerPartie() {
      this.$router.push("/creer-partie");
    },

    allerVersPartie(partie) {
      if (!partie.code) {
        console.error("❌ Code de partie manquant", partie);
        return;
      }

      if (partie.status === "waiting") {
        this.$router.push({
          name: "FileAttentePartie",
          params: { code: partie.code },
        });
      } 
      else if (partie.status === "running") {
        this.$router.push({
          name: "PartieEnCours",
          params: { code: partie.code },
        });
      } 
      else if (partie.status === "finished") {
        this.$router.push({
          name: "Scores",
          params: { code: partie.code },
        });
      }
    },

    async chargerParties() {
      try {
        const response = await fetch("/api/games/");
        const games = await response.json();

        this.parties = await Promise.all(
          games.map(async (game) => {
            const qrCode = await QRCode.toDataURL(game.code, {
              width: 140,
              margin: 1,
            });

            return {
              id: game.id,
              code: game.code, // 🔥 IMPORTANT
              nom: game.name,
              max_players: game.max_players,
              status: game.status,
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
      }[status];
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

/* ===== CRÉER UNE PARTIE ===== */

.creer-partie {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;

  /* 🔒 Empêche tout clic global */
  pointer-events: none;

  font-size: 18px;
  font-weight: bold;
  color: white;
}

/* TEXTE NON CLIQUABLE */
.creer-texte {
  opacity: 0.85;
  user-select: none;
  cursor: default;
}

/* ===== BOUTON + (SEUL ÉLÉMENT INTERACTIF) ===== */

.bouton-plus {
  pointer-events: auto; /* 🔥 seul élément cliquable */

  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--degrade-brio);
  border: none;
  position: relative;

  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.bouton-plus::after {
  content: "+";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -48%);
  font-size: 28px;
  font-weight: bold;
  color: white;
}

.bouton-plus:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

.bouton-plus:active {
  transform: scale(0.96);
}

/* ===== LISTE ===== */

.liste-parties {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* ===== CARTE ===== */

.carte-partie {
  position: relative;
  display: grid;
  grid-template-columns: 170px 1fr 200px;
  align-items: center;
  gap: 24px;
  padding: 24px;
  border-radius: 20px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.carte-partie:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
}

/* ===== STATUTS ===== */

.statut {
  height: 42px;
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 14px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Attente */
.attente {
  background: #a16207;
  color: #fff7ed;
}

/* En cours */
.en-cours {
  background: #15803d;
  color: #ecfdf5;
}

/* Pause */
.pause {
  background: #c2410c;
  color: #fff7ed;
}

/* Terminée */
.terminee {
  background: #7f1d1d;
  color: #fee2e2;
}

/* ===== CENTRE ===== */

.centre {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nom-partie {
  font-size: 22px;
  font-weight: bold;
}

.infos {
  font-size: 15px;
  opacity: 0.9;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* ===== QR ===== */

.qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: transform 0.25s ease;
}

.qr img {
  width: 130px;
  height: 130px;
  background: white;
  padding: 8px;
  border-radius: 12px;
  transition: box-shadow 0.25s ease;
}

/* TEXTE TOUJOURS VISIBLE */
.qr-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
  text-align: center;
}

/* ===== INTERACTIONS ===== */

.carte-partie:hover .qr {
  transform: scale(1.08);
}

.carte-partie:hover .qr img {
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
}

/* ===== EN COURS – GLOW VERT ===== */

.carte-partie:has(.en-cours) {
  animation: pulse-green 2.2s infinite;
}

.carte-partie:has(.en-cours):hover {
  transform: translateY(-4px);
  box-shadow:
    0 0 40px rgba(34, 197, 94, 0.45),
    0 20px 60px rgba(34, 197, 94, 0.55);
}

@keyframes pulse-green {
  0% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.25);
  }
  50% {
    box-shadow:
      0 0 45px rgba(34, 197, 94, 0.65),
      0 0 80px rgba(34, 197, 94, 0.45);
  }
  100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.25);
  }
}

/* ===== TERMINÉE – QR DÉSACTIVÉ ===== */

.carte-partie:has(.terminee) {
  opacity: 0.55;
  filter: saturate(0.6);
}

.carte-partie:has(.terminee):hover {
  transform: none;
  box-shadow: none;
}

.carte-partie:has(.terminee) .qr {
  transform: none !important;
  cursor: not-allowed;
}

.carte-partie:has(.terminee) .qr img {
  filter: grayscale(1) blur(1px);
  opacity: 0.4;
  pointer-events: none;
  box-shadow: none !important;
}

.carte-partie:has(.terminee) .qr-label {
  color: #fca5a5;
}

.carte-partie:has(.terminee) .qr-label::after {
  content: " (terminée)";
}

</style>
