<template>
  <div class="page-parties">

    <!-- CRÉER -->
    <div class="creer-partie">
      <button class="bouton-plus" @click.stop="allerCreerPartie" />
      <span class="creer-texte">Créer une partie</span>
    </div>

    <!-- LISTE -->
    <div class="liste-parties">
      <div
        class="carte carte-partie"
        v-for="partie in parties"
        :key="partie.id"
        @click="allerVersPartie(partie)"
      >
        <div class="statut" :class="statusClass(partie.status)">
          {{ statusLabel(partie.status) }}
        </div>

        <div class="centre">
          <div class="nom-partie">{{ partie.nom }}</div>
          <div class="infos">
            <div><strong>Joueurs max</strong> : {{ partie.max_players }}</div>
            <div><strong>Temps</strong> : {{ partie.temps_affiche }}</div>
          </div>
        </div>

        <div class="qr" @click.stop>
          <img :src="partie.qrCode" />
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
      const routes = {
        waiting: "FileAttentePartie",
        running: "PartieEnCours",
        paused: "PartieEnCours",
        finished: "Scores",
      };

      this.$router.push({
        name: routes[partie.status],
        params: { code: partie.code },
      });
    },

    async chargerParties() {
      const res = await fetch("/api/games/");
      const games = await res.json();

      this.parties = await Promise.all(
        games.map(async (g) => {
          const qrCode = await QRCode.toDataURL(g.code, { width: 140 });

          return {
            id: g.id,
            code: g.code,
            nom: g.name,
            max_players: g.max_players,
            status: g.status,
            temps_affiche: this.computeTemps(g),
            qrCode,
          };
        })
      );
    },

    computeTemps(game) {
      if (game.status === "finished") {
        return `Partie a duré ${this.formatTemps(game.elapsed_seconds)}`;
      }

      if (game.status === "running" || game.status === "paused") {
        return this.formatTemps(game.remaining_seconds);
      }

      return this.formatTemps(game.duration_seconds);
    },

    formatTemps(sec = 0) {
      const m = String(Math.floor(sec / 60)).padStart(2, "0");
      const s = String(sec % 60).padStart(2, "0");
      return `${m}:${s}`;
    },

    statusLabel(s) {
      return {
        waiting: "En attente",
        running: "En cours",
        paused: "En pause",
        finished: "Terminée",
      }[s];
    },

    statusClass(s) {
      return {
        waiting: "attente",
        running: "en-cours",
        paused: "pause",
        finished: "terminee",
      }[s];
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
