<template>
  <div class="page-partie-en-cours">

    <!-- ================= ZONE JEU ================= -->
    <div class="zone-jeu">

      <h1 class="titre-partie">{{ partie.nom }}</h1>
      <div class="minuteur-glow">{{ tempsAffiche }}</div>

      <!-- CONTROLES PARTIE -->
      <div class="actions-partie">
        <button
          class="btn-brio"
          :disabled="partie.status !== 'running'"
          @click="pausePartie"
        >
          ⏸ Pause
        </button>

        <button
          class="btn-brio"
          :disabled="partie.status !== 'paused'"
          @click="reprendrePartie"
        >
          ▶ Reprendre
        </button>

        <button
          class="btn-brio danger"
          @click="terminerPartie"
        >
          ⛔ Mettre fin
        </button>
      </div>

      <!-- ================= JOUEURS ================= -->
      <div class="liste-joueurs">
        <div
          v-for="j in joueurs"
          :key="j.id"
          class="carte-joueur"
          :class="{ mort: !j.is_alive, danger: j.is_alive && j.hp <= 25 }"
        >

          <div class="zone zone-identite">
            <div class="zone-titre">JOUEUR</div>
            <div class="nom">{{ j.pseudo }}</div>

            <div class="etat-central">
              <div v-if="!j.is_alive" class="etat-text dead">ÉLIMINÉ</div>
              <div v-else-if="j.hp <= 25" class="etat-text danger">DANGER</div>
              <div v-else class="etat-text alive">EN VIE</div>
            </div>
          </div>

          <div class="zone zone-stats">
            <div class="zone-titre">STATISTIQUES</div>
            <div class="stats-contenu">
              <div class="stat-block">❤️ {{ j.hp }}%</div>
              <div class="stat-block">🛡️ {{ j.shield }}%</div>
              <div class="stat-block">🔫 {{ j.magazines ?? 0 }}</div>
            </div>
          </div>

          <div class="zone zone-actions">
            <div class="zone-titre">ACTIONS ADMIN</div>

            <template v-if="j.is_alive">
              <button @click="addHp(j)">+ Vie</button>
              <button @click="removeHp(j)">− Vie</button>
              <button @click="addShield(j)">+ Bouclier</button>
              <button @click="removeShield(j)">− Bouclier</button>
              <button @click="addMagazine(j)">+ Chargeur</button>
              <button @click="removeMagazine(j)">− Chargeur</button>

              <button class="btn-admin kill" @click="eliminer(j)">
                ☠️ ÉLIMINER
              </button>
            </template>

            <template v-else>
              <button class="btn-admin respawn" @click="reanimer(j)">
                ♻️ RÉANIMER
              </button>
            </template>
          </div>

          <div class="zone zone-score">
            <div class="zone-titre">SCORE</div>
            <div class="score-center">☠️ {{ j.kills }}</div>
          </div>

        </div>
      </div>
    </div>

    <!-- ================= HUD DROIT FIXE ================= -->
    <div class="hud-droite">

      <!-- ===== HUD INFOS (HAUT DROITE) ===== -->
      <div class="hud-carte hud-infos">
        <div class="hud-titre">INFOS PARTIE</div>

        <div class="hud-ligne">
          <span>⏱ Temps</span>
          <strong>{{ tempsAffiche }}</strong>
        </div>

        <div class="hud-ligne">
          <span>🎮 Statut</span>
          <strong>{{ partie.status }}</strong>
        </div>

        <div class="hud-ligne">
          <span>👥 Joueurs</span>
          <strong>{{ joueurs.length }}</strong>
        </div>
      </div>

      <!-- ===== HISTORIQUE (JUSTE EN DESSOUS) ===== -->
      <div class="hud-carte hud-historique">
        <div class="hud-titre">HISTORIQUE DE LA PARTIE</div>

        <div class="feed">
          <div
            v-for="(e, i) in historique"
            :key="i"
            class="event"
            :class="e.type"
          >
            <!-- TOUCHÉ -->
            <template v-if="e.type === 'hit'">
              🔫 <strong>{{ e.from }}</strong> touche
              <strong>{{ e.to }}</strong>
              <span class="value">−{{ e.value }}%</span>
            </template>

            <!-- MORT -->
            <template v-else-if="e.type === 'death'">
              ☠️ <strong>{{ e.player }}</strong>
              éliminé par <strong>{{ e.by }}</strong>
            </template>

            <!-- RÉSURRECTION ADMIN -->
            <template v-else-if="e.type === 'admin_revive'">
              ♻️ <strong>{{ e.player }}</strong>
              ressuscité par l’admin
            </template>

            <!-- ACTION ADMIN -->
            <template v-else-if="e.type === 'admin_action'">
              🛠️ {{ e.message }}
            </template>

            <!-- SYSTÈME -->
            <template v-else>
              ⚙️ {{ e.message }}
            </template>
          </div>
        </div>
      </div>

      <!-- ===== CHAT (BAS DROITE FIXE) ===== -->
      <div class="hud-carte chat">
        <div class="hud-titre">CHAT</div>

        <div class="chat-messages">
          <div class="chat-message system">
            Connexion WebSocket…
          </div>
        </div>

        <div class="chat-input">
          <input
            type="text"
            placeholder="Message admin…"
            disabled
          />
          <button disabled>➤</button>
        </div>
      </div>

    </div>

  </div>
</template>



<script>
import axios from "axios";

export default {
  name: "PartieEnCours",

  data() {
    return {
      partie: {
        nom: "Chargement…",
        code: null,
        status: null,
      },
      temps: 0,
      joueurs: [],
      historique: []
    };
  },

  computed: {
    codePartie() {
      return this.$route.params.code;
    },

    tempsAffiche() {
      const m = String(Math.floor(this.temps / 60)).padStart(2, "0");
      const s = String(this.temps % 60).padStart(2, "0");
      return `${m}:${s}`;
    }
  },

  mounted() {
    if (!this.codePartie) {
      console.error("Code de partie manquant");
      return;
    }

    this.partie.code = this.codePartie;
    this.chargerPartie();
    this.chargerJoueurs();

    setInterval(() => {
      if (this.partie.status === "running" && this.temps > 0) {
        this.temps--;
      }
    }, 1000);
  },

  methods: {
    api(path) {
      return `/api/games/${this.partie.code}${path}`;
    },

    /* ===== INFOS PARTIE ===== */

    async chargerPartie() {
      const res = await axios.get("/api/games/");
      const game = res.data.find(g => g.code === this.partie.code);

      if (!game) return;

      this.partie.nom = game.name;
      this.partie.status = game.status;
      this.temps = game.duration_seconds;
    },

    async chargerJoueurs() {
      const res = await axios.get(this.api("/players/"));
      this.joueurs = res.data;
    },

    /* ===== CONTROLES ===== */

    async pausePartie() {
      await axios.post(this.api("/pause/"));
      this.partie.status = "paused";
      this.pushHistorique("⏸ Partie mise en pause par l'admin");
    },

    async reprendrePartie() {
      await axios.post(this.api("/resume/"));
      this.partie.status = "running";
      this.pushHistorique("▶ Partie reprise par l'admin");
    },

    async terminerPartie() {
      await axios.post(this.api("/end/"), { reason: "admin" });
      this.partie.status = "finished";
      this.pushHistorique("⛔ Partie terminée par l'admin");
      this.$router.push("/parties");
    },

    /* ===== HISTORIQUE ===== */

    pushHistorique(message) {
      this.historique.unshift({
        message,
        ts: Date.now()
      });
    },

    /* ===== ACTIONS JOUEURS ===== */

    async addHp(j) {
      Object.assign(j, (await axios.post(this.api(`/players/${j.id}/add-hp/`))).data);
    },
    async removeHp(j) {
      Object.assign(j, (await axios.post(this.api(`/players/${j.id}/remove-hp/`))).data);
    },
    async addShield(j) {
      Object.assign(j, (await axios.post(this.api(`/players/${j.id}/add-shield/`))).data);
    },
    async removeShield(j) {
      Object.assign(j, (await axios.post(this.api(`/players/${j.id}/remove-shield/`))).data);
    },
    async addMagazine(j) {
      Object.assign(j, (await axios.post(this.api(`/players/${j.id}/add-magazine/`))).data);
    },
    async removeMagazine(j) {
      Object.assign(j, (await axios.post(this.api(`/players/${j.id}/remove-magazine/`))).data);
    },
    async eliminer(j) {
      Object.assign(j, (await axios.post(this.api(`/players/${j.id}/kill/`))).data);
      this.pushHistorique(`☠️ ${j.pseudo} éliminé`);
    },
    async reanimer(j) {
      Object.assign(j, (await axios.post(this.api(`/players/${j.id}/resurrect/`))).data);
      this.pushHistorique(`♻️ ${j.pseudo} réanimé par l’admin`);
    }
  }
};
</script>










<style>
/* ===== LAYOUT ===== */
.page-partie-en-cours {
  display:grid;
  grid-template-columns:3fr 1.3fr;
  gap:24px;
  padding:24px;
}

/* ===== MINUTEUR ===== */
.minuteur-glow {
  font-size:64px;
  text-align:center;
  font-family:monospace;
  margin:20px 0;
  text-shadow:0 0 20px #ec4899;
}

/* ===== BOUTONS PARTIE ===== */
.actions-partie {
  display:flex;
  justify-content:center;
  gap:16px;
  margin-bottom:30px;
}
.btn-brio {
  padding:14px 22px;
  border-radius:16px;
  font-weight:bold;
  border:none;
  background:linear-gradient(90deg,#ef4444,#a855f7);
  color:white;
}

/* ===== JOUEURS ===== */
.carte-joueur {
  display:grid;
  grid-template-columns:1fr 2fr 1.2fr 0.6fr;
  gap:12px;
  padding:14px;
  margin-bottom:14px;
  background:rgba(0,0,0,0.35);
  border-radius:16px;
  align-items: stretch;
  overflow: hidden;
  position: relative;
}

/* ===== ZONES ===== */
.zone {
  background:rgba(255,255,255,0.05);
  border-radius:12px;
  padding:10px;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
}
.zone-titre {
  font-size: 11px;
  opacity: 0.65;
  letter-spacing: 2px;

  text-align: center;      
  align-self: center;      
  width: 100%;             

  margin-bottom: 10px;
}

.zone-stats.sans-reserve .stats-contenu {
  justify-content: center;
}

.zone-stats.sans-munitions .stats-contenu {
  justify-content: center;
}

.zone-stats.sans-munitions .weapon-icon {
  opacity: 0.35;
}

.zone-stats.sans-munitions .ammo-count {
  opacity: 0.4;
}


.stats-contenu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
  transition: all 0.25s ease;
}

/* ===== SCORE ===== */
.zone-score {
  display: flex;
  align-items: center;
  justify-content: center;
}
.score-center {
  font-size: 28px;
  font-weight: 900;
}
.zone-score .kills {
  font-size:22px;
  font-weight:bold;
}

/* ===== BARRES STATS ===== */
.barre {
  height:8px;
  background:rgba(255,255,255,0.2);
  border-radius:6px;
  overflow:hidden;
}
.vie { height:100%; background:#ef4444; }
.bouclier { height:100%; background:#3b82f6; }

/* ===== MUNITIONS STATS ===== */
.munitions {
  display:flex;
  align-items:flex-end;
}
.munitions span {
  width:6px;
  height:16px;
  margin-right:2px;
  background:rgba(255,255,255,0.2);
  border-radius:2px;
}
.munitions span.active {
  background:#facc15;
}

/* ===== ACTIONS ADMIN ===== */
.zone-actions {
  display:flex;
  flex-direction:column;
  gap:10px;
  justify-content:space-between;
  position: relative;
}
.carte-joueur.mort .zone-actions {
  display: flex;
  align-items: center;      /* centré verticalement */
  justify-content: center;  /* centré horizontalement */
}
.carte-joueur.mort .admin-section.admin-center {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* bouton réanimer */
.btn-admin.respawn.full {
  width: 100%;
  max-width: 180px;
  height: 44px;
  font-size: 14px;
  letter-spacing: 2px;
  border-radius: 14px;
}

/* ===== ADMIN : CHARGEURS ===== */
.admin-section .admin-life-control {
  align-items: center;
}

.admin-section .btn-admin.minus,
.admin-section .btn-admin.plus {
  width: 32px;
  height: 32px;
}
/* bouton désactivé chargeur */
.btn-admin:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  box-shadow: none;
}

/* Sections internes */
.admin-section {
  background:rgba(0,0,0,0.25);
  border-radius:10px;
  padding:8px;
  display:flex;
  flex-direction:column;
  gap:8px;
}

.admin-label {
  font-size:10px;
  opacity:0.6;
  letter-spacing:1px;
}

/* ===== BARRES ADMIN (IDENTIQUES À LA VIE) ===== */
.admin-life-control {
  display:flex;
  align-items:center;
  gap:6px;
}

.admin-life-bar {
  flex:1;
  height:8px;
  background:rgba(255,255,255,0.2);
  border-radius:6px;
  overflow:hidden;
}

.admin-life-fill {
  height:100%;
}

/* couleurs cohérentes */
.admin-life-fill.vie {
  background:#ef4444;
}
.admin-life-fill.bouclier {
  background:#3b82f6;
}
.admin-life-fill.munitions {
  background:#facc15;
}

/* ===== BOUTONS ADMIN ===== */
.btn-admin {
  border:none;
  border-radius:10px;
  height:32px;
  min-width:32px;
  font-weight:bold;
  color:white;
  cursor:pointer;
  background:rgba(255,255,255,0.15);
  transition:all .2s ease;
}
.btn-admin:hover {
  background:rgba(255,255,255,0.25);
}

/* Variantes */
.btn-admin.minus {
  background:rgba(239,68,68,.35);
}
.btn-admin.plus {
  background:rgba(34,197,94,.35);
}

/* ===== BOUTON ÉLIMINER — CORRIGÉ ===== */
.btn-admin.kill {
  width:100%;
  height:36px;
  border-radius:12px;
  background:linear-gradient(90deg,#ef4444,#b91c1c);
  box-shadow:0 0 10px rgba(239,68,68,.4);
  letter-spacing:1px;
}
.btn-admin.kill:hover {
  box-shadow:0 0 18px rgba(239,68,68,.7);
}

.btn-admin.confirm {
  background:rgba(239,68,68,.75);
}
.btn-admin.cancel {
  background:rgba(255,255,255,.25);
}
.btn-admin.respawn {
  width:100%;
  background:linear-gradient(90deg,rgba(34,197,94,.35),rgba(16,185,129,.35));
}

/* ===== ETAT EN VIE ===== */
.etat-vital {
  display:flex;
  align-items:center;
  gap:6px;
  font-size:11px;
  letter-spacing:1px;
  color:#22c55e;
  font-weight:bold;
}
.pulse-dot {
  width:8px;
  height:8px;
  border-radius:50%;
  background:#22c55e;
  animation:pulse-dot 1.6s infinite;
}

/* ===== DANGER ===== */
.carte-joueur.danger {
  background:rgba(120,0,0,.45);
  animation:danger-pulse 1.4s infinite;
}
.etat-danger {
  font-size:11px;
  color:#fecaca;
  background:rgba(255,0,0,.2);
  padding:4px 10px;
  border-radius:12px;
}

/* ===== JOUEUR MORT ===== */
.carte-joueur.mort {
  background:rgba(120,0,0,0.55);
  box-shadow:
    0 0 20px rgba(255,0,0,0.6),
    inset 0 0 30px rgba(0,0,0,0.6);
}
/* ===== CONFIRMATION ÉLIMINATION ===== */
.confirm-inline {
  margin-top: 8px;
  padding: 8px;
  border-radius: 10px;
  background: rgba(0,0,0,0.35);

  display: flex;
  flex-direction: column;
  gap: 6px;
}

.confirm-inline span {
  font-size: 11px;
  opacity: 0.7;
  text-align: center;
  letter-spacing: 1px;
}

/* Boutons OUI / NON alignés */
.confirm-inline button {
  flex: 1;
}

.confirm-inline .btn-admin.confirm,
.confirm-inline .btn-admin.cancel {
  height: 30px;
}

/* Ligne boutons */
.confirm-inline-buttons {
  display: flex;
  gap: 8px;
}
/* ===== HUD HISTORIQUE - MODE ÉCRAN ===== */
.hud-droite {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.hud-carte {
  background: #050505;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
}

/* ================= HISTORIQUE ================= */

.hud-historique {
  flex: 1;                    /* prend l’espace entre infos et chat */
  min-height: 160px;

  display: flex;
  flex-direction: column;
}

.hud-historique .feed {
  flex: 1;
  overflow-y: auto;
}

/* titre */
.hud-titre {
  font-size: 11px;
  letter-spacing: 2px;
  opacity: 0.6;
  margin-bottom: 8px;
}

/* feed */
.feed {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 100%;
  overflow-y: auto;
  font-size: 13px;
}

.feed div {
  background: rgba(255,255,255,0.06);
  padding: 6px 10px;
  border-radius: 6px;
  font-family: monospace;
}

/* scrollbar */
.feed::-webkit-scrollbar {
  width: 4px;
}
.feed::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}



/* ===== CHAT JOUEURS - MODE JEU ===== */
.hud-carte.chat {
  display: flex;
  flex-direction: column;
  height: 320px;
  background: #080808;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: inset 0 0 25px rgba(0,0,0,0.9);
}

/* messages */
.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  font-size: 13px;
  padding-right: 4px;
}

.chat-messages div {
  background: rgba(255,255,255,0.05);
  padding: 6px 10px;
  border-radius: 8px;
}

.chat-messages span {
  font-weight: bold;
}

/* input fixé en bas */
.chat-input {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.chat-input input {
  flex: 1;
  background: #111;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  padding: 10px;
  color: white;
  font-size: 13px;
}

.chat-input button {
  border-radius: 12px;
  border: none;
  padding: 0 16px;
  background: linear-gradient(90deg,#a855f7,#ec4899);
  color: white;
  font-weight: bold;
  cursor: pointer;
}

/* scrollbar chat */
.chat-messages::-webkit-scrollbar {
  width: 4px;
}
.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
}
/* ===== HISTORIQUE ADAPTATIF ===== */
.hud-carte:first-child {
  display: flex;
  flex-direction: column;
  max-height: 45vh;
}

/* le feed grandit seulement si contenu */
.feed {
  flex-grow: 1;
  max-height: 35vh;
  overflow-y: auto;
}
/* ===== CHAT ADAPTATIF ===== */
.hud-carte.chat {
  max-height: 40vh;
  min-height: 120px;
}

/* messages */
.chat-messages {
  flex-grow: 1;
  max-height: 28vh;
  overflow-y: auto;
}

/* input toujours visible */
.chat-input {
  flex-shrink: 0;
}


/* ===== CHAT EN BAS À DROITE ===== */
.hud-carte.chat {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  max-height: 40vh;
  min-height: 120px;
}
/* ========================================================= */
/* ===== HUD FIXE TYPE JEU (HISTORIQUE + CHAT) ============== */
/* ========================================================= */

/* Conteneur HUD retiré du flow */
/* ================= HUD FIXE DROITE ================= */

.hud-droite {
  position: fixed;
  top: 120px;                 /* sous ta barre menu */
  right: 24px;
  width: 22%;
  height: calc(100vh - 140px);

  display: flex;
  flex-direction: column;
  gap: 16px;

  z-index: 50;
  pointer-events: none;
}

/* Les cartes restent cliquables */
.hud-droite .hud-carte {
  pointer-events: auto;
  position: relative;         /* 🔥 IMPORTANT */
}

/* ================= HUD INFOS ================= */




/* Les cartes restent interactives */
.hud-carte {
  pointer-events: auto;
}


/* feed scrollable */
.hud-carte:not(.chat) .feed {
  max-height: 35vh;
  overflow-y: auto;
}


/* messages scroll */
.chat-messages {
  max-height: 28vh;
  overflow-y: auto;
}
/* ===== ZONE JOUEUR — ETAT GRAND FORMAT ===== */

.zone-identite {
  justify-content: space-between;
  align-items: center;
  text-align: center;
}

/* conteneur central */
.etat-central {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
}

/* cercle d’état */
.etat-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
}

/* EN VIE */
.etat-circle.alive {
  background: #22c55e;
  box-shadow: 0 0 18px rgba(34,197,94,0.9);
  animation: alive-pulse 1.4s infinite;
}

.etat-text.alive {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 3px;
  color: #22c55e;
}

/* DANGER */
.etat-circle.danger {
  background: #ef4444;
  box-shadow: 0 0 18px rgba(239,68,68,0.9);
  animation: danger-pulse 1.2s infinite;
}

.etat-text.danger {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #fecaca;
}

/* MORT */
.etat-text.dead {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 3px;
  color: #fecaca;
}

/* animations */
@keyframes alive-pulse {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.4; }
  100% { transform: scale(1); opacity: 1; }
}
/* ===== TEXTE DANS LES BARRES (HUD JEU) ===== */
.barre {
  position: relative;
}

.barre-text {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 6px rgba(0,0,0,0.9);
  pointer-events: none;
  user-select: none;
}
/* ===== STATS CENTRÉES – MODE JEU ===== */
.stats-centered {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.zone-stats {
  display: flex;
  flex-direction: column;
}

/* bloc générique */
.stat-block {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

/* icônes */
.stat-icon {
  font-size: 20px;
  opacity: 0.85;
}

/* barres larges */
.barre.big {
  width: 100%;
  height: 14px;
  border-radius: 10px;
}

/* texte centré dans la barre */
.barre-text.center {
  left: 50%;
  right: auto;
  transform: translate(-50%, -50%);
  font-size: 11px;
  letter-spacing: 1px;
}

/* ===== MUNITIONS – DESIGN INNOVANT ===== */
.munitions-block {
  margin-top: 6px;
}

.weapon-icon {
  font-size: 26px;
  text-shadow: 0 0 10px rgba(250,204,21,0.6);
}

/* capsules */
.ammo-capsules {
  display: flex;
  gap: 4px;
}

.ammo-capsules span {
  width: 8px;
  height: 16px;
  border-radius: 4px;
  background: rgba(255,255,255,0.15);
  box-shadow: inset 0 0 4px rgba(0,0,0,0.8);
}

.ammo-capsules span.active {
  background: linear-gradient(180deg,#facc15,#eab308);
  box-shadow: 0 0 6px rgba(250,204,21,0.8);
}

/* compteur */
.ammo-count {
  font-size: 12px;
  letter-spacing: 1px;
  opacity: 0.8;
}
/* ===== CHARGEURS (ADMIN) ===== */
.mag-count {
  min-width: 36px;
  text-align: center;
  font-weight: bold;
  color: #facc15;
}

.chargeurs-visu {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
}
/* ===== RACK ===== */
.chargeurs-rack {
  display: flex;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(0,0,0,0.35);
  border-radius: 10px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.6);
}
.chargeur {
  position: relative;
  width: 14px;
  height: 32px;
  border-radius: 3px 3px 2px 2px;
  background: linear-gradient(
    180deg,
    #4b5563 0%,
    #1f2937 60%,
    #020617 100%
  );
  box-shadow:
    inset 0 0 6px rgba(0,0,0,0.8),
    0 2px 6px rgba(0,0,0,0.7);
  outline: 1px solid rgba(255,255,255,0.08);
}
/* bouton désactivé */
.btn-admin:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
/* encoche bas du chargeur */
.chargeur::after {
  content: "";
  position: absolute;
  bottom: -3px;
  left: 3px;
  width: 8px;
  height: 4px;
  background: #020617;
  border-radius: 0 0 2px 2px;
}

/* léger glow pour lisibilité */
.chargeur {
  outline: 1px solid rgba(255,255,255,0.08);
}

.chargeur-balles {
  position: absolute;
  top: -3px;
  left: 1px;
  right: 1px;
  height: 6px;
  background:
    repeating-linear-gradient(
      90deg,
      #facc15 0px,
      #facc15 3px,
      #ca8a04 3px,
      #ca8a04 5px
    );
  border-radius: 2px 2px 0 0;
  box-shadow:
    inset 0 0 2px rgba(0,0,0,0.6),
    0 0 4px rgba(250,204,21,0.6);
}
.chargeurs-rail {
  display: flex;
  gap: 12px;
  padding: 10px;
  background: rgba(0,0,0,0.4);
  border-radius: 14px;
  justify-content: center;
}

.chargeur-arme {
  width: 14px;
  height: 36px;
  background: linear-gradient(180deg,#2a2a2a,#020617);
  border-radius: 3px;
  position: relative;
}


.chargeur-arme::before {
  content: "";
  position: absolute;
  top: -3px;
  left: 1px;
  right: 1px;
  height: 4px;
  background: #111;
  border-radius: 2px 2px 0 0;
}

/* encoche inférieure (signature chargeur arme) */
.chargeur-arme::after {
  content: "";
  position: absolute;
  bottom: -4px;
  left: 2px;
  width: 6px;
  height: 4px;
  background: #020617;
  border-radius: 0 0 2px 2px;
}

/* ===== INFO / LÉGENDE ===== */
.chargeurs-info {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.75;
}

/* ===== INDICATEUR RÉSERVE ===== */
.chargeurs-info {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.75;
}

/* balle / ogive */
.ammo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;

  background: radial-gradient(
    circle at 30% 30%,
    #fde68a,
    #facc15 60%,
    #ca8a04 100%
  );

  box-shadow:
    0 0 8px rgba(250,204,21,0.9),
    inset 0 0 3px rgba(0,0,0,0.6);

  animation: ammo-pulse 1.6s infinite;
}

/* label discret mais stylé */
.chargeurs-label {
  font-size: 9px;
  letter-spacing: 3px;
  text-transform: uppercase;
  font-weight: 600;

  color: rgba(255,255,255,0.55);

  position: relative;
  top: 1px;
}

/* animation subtile */
@keyframes ammo-pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.35);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}



/* ===== OGIVES (BALLES) VISIBLES ===== */
.chargeur-arme .ogives {
  position: absolute;
  top: -6px;
  left: 1px;
  right: 1px;
  height: 6px;
  background: repeating-linear-gradient(
    90deg,#facc15 0 3px,#92400e 3px 5px
  );
}
/* ===================== */
/* JOUEURS – MODE CHARGEUR */
/* ===================== */

.joueurs-chargeurs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

/* chargeur */
.chargeur-visuel {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
  background: linear-gradient(180deg,#1f2937,#020617);
  border-radius: 14px;
  box-shadow:
    inset 0 0 10px rgba(0,0,0,0.8),
    0 4px 14px rgba(0,0,0,0.6);
}

/* ogive */
.ogive {
  width: 10px;
  height: 28px;
  border-radius: 3px 3px 2px 2px;
  background: linear-gradient(180deg,#374151,#020617);
  cursor: pointer;
  position: relative;
  transition: transform .15s ease, box-shadow .15s ease;
}

/* balle active */
.ogive.active {
  background: linear-gradient(180deg,#facc15,#ca8a04);
  box-shadow: 0 0 8px rgba(250,204,21,0.8);
}

/* pointe balle */
.ogive::before {
  content: "";
  position: absolute;
  top: -4px;
  left: 1px;
  right: 1px;
  height: 6px;
  background: linear-gradient(180deg,#fde68a,#facc15);
  border-radius: 2px 2px 0 0;
}

/* hover */
.ogive:hover {
  transform: translateY(-2px);
}

/* compteur */
.joueurs-compteur {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 1px;
  background: var(--degrade-brio);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* actions */
.joueurs-actions {
  display: flex;
  gap: 16px;
}

.joueurs-actions button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: none;
  font-size: 22px;
  background: var(--degrade-brio);
  color: white;
  cursor: pointer;
  transition: transform .15s ease, opacity .15s ease;
}

.joueurs-actions button:hover {
  transform: scale(1.1);
}

.joueurs-actions button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}


/* espace entre munitions et réserve */
.chargeurs-hud {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  align-items: center; /* ⬅️ centre par rapport au bloc stats */
  transition: margin-top 0.2s ease, opacity 0.2s ease;
}
/* ===== CENTRAGE BOUTONS CHARGEURS ===== */
.admin-section .admin-life-control {
  justify-content: center;
}

.mag-count {
  min-width: 40px;
  text-align: center;
  font-size: 18px;
  font-weight: 900;
  color: #facc15;
}

/* ===== STATS ADAPTATIVES SELON RÉSERVE ===== */
.zone-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* quand il n'y a PLUS de réserve */
.zone-stats.sans-reserve {
  justify-content: center;   /* ⬅️ vrai recentrage vertical */
  gap: 18px;
}


/* la réserve ne force PLUS la hauteur */
.chargeurs-hud {
  margin-top: 16px;
}

/* quand elle n'existe pas, rien ne "bloque" */
.zone-stats.sans-reserve .chargeurs-hud {
  display: none;
}

/* ================================ */
/* STATS — COMPORTEMENT ADAPTATIF */
/* ================================ */

.zone-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: all 0.25s ease;
}

/* ─────────────────────────────── */
/* Quand il n’y a PLUS de réserve */
/* ─────────────────────────────── */
.zone-stats.sans-reserve {
  gap: 12px;
}

/* ─────────────────────────────── */
/* Quand il n’y a PLUS de munitions */
/* ─────────────────────────────── */
.zone-stats.sans-munitions {
  justify-content: center;
  align-items: center;
  gap: 22px;
}

/* option : rendre l’arme plus "vide" */
.zone-stats.sans-munitions .weapon-icon {
  opacity: 0.35;
  filter: grayscale(1);
}
.zone-stats.sans-reserve .munitions-block {
  margin-top: 0;
}
.zone-stats.sans-reserve .stat-block,
.zone-stats.sans-munitions .stat-block {
  align-items: center;
}


/* option : capsules grisées */
.zone-stats.sans-munitions .ammo-capsules span {
  background: rgba(255,255,255,0.08);
  box-shadow: none;
}

/* texte munitions discret */
.zone-stats.sans-munitions .ammo-count {
  opacity: 0.4;
  letter-spacing: 2px;
}

/* ========================================= */
/* MODE MORT — BOUTON RÉANIMER GLOBAL */
/* ========================================= */

/* la carte devient un conteneur */
.carte-joueur.etat-mort {
  position: relative;
}

/* on masque visuellement les actions admin */
.carte-joueur.etat-mort .zone-actions {
  background: none;
  padding: 0;
}

/* supprime le bloc noir derrière */
.carte-joueur.etat-mort .admin-section {
  background: none;
  padding: 0;
  box-shadow: none;
}

/* bouton réanimer AU CENTRE DE LA CARTE */
.carte-joueur.etat-mort .btn-admin.respawn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  width: 220px;
  height: 52px;

  font-size: 15px;
  letter-spacing: 3px;
  font-weight: 900;

  border-radius: 18px;
  z-index: 10;

  background: linear-gradient(90deg,#22c55e,#16a34a);
  box-shadow:
    0 0 25px rgba(34,197,94,0.8),
    0 0 60px rgba(34,197,94,0.4);
}

/* hover */
.carte-joueur.etat-mort .btn-admin.respawn:hover {
  transform: translate(-50%, -50%) scale(1.08);
}
/* fond assombri quand mort */
.carte-joueur.etat-mort > .zone:not(.zone-actions) {
  opacity: 0.35;
  filter: grayscale(1);
  pointer-events: none;
}

/* ===== BOUTONS PARTIE – INTERACTIFS ===== */

.btn-brio {
  cursor: pointer;
  opacity: 1;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    opacity 0.15s ease;
}

/* Hover visible */
.btn-brio:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}

/* Click */
.btn-brio:active:not(:disabled) {
  transform: scale(0.96);
}

/* Désactivé = vraiment désactivé */
.btn-brio:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  filter: grayscale(0.6);
  box-shadow: none;
}

/* ================= HUD FIXE DROITE ================= */

.hud-droite {
  position: fixed;
  top: 120px;              /* ⬅️ DESCEND LE HUD (ajuste si besoin) */
  right: 24px;
  width: 22%;
  height: calc(100vh - 140px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  pointer-events: none;
  z-index: 50;
}


/* Les cartes restent interactives */
.hud-droite .hud-carte {
  pointer-events: auto;
}


/* lignes infos */
.hud-ligne {
  display: flex;
  justify-content: space-between;
  padding: 6px 4px;
  font-size: 13px;
  opacity: 0.9;
}

.hud-ligne span {
  opacity: 0.6;
}

.hud-ligne strong {
  font-weight: 800;
}

/* ================= CHAT ================= */

.hud-carte.chat {
  flex-shrink: 0;
  min-height: 160px;
  max-height: 32vh;

  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
}

.chat-message.system {
  opacity: 0.5;
  font-style: italic;
}

.chat-input {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.chat-input input {
  flex: 1;
  background: #111;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.15);
  padding: 10px;
  color: white;
  font-size: 13px;
}

.chat-input button {
  border-radius: 12px;
  border: none;
  padding: 0 16px;
  background: linear-gradient(90deg,#a855f7,#ec4899);
  color: white;
  font-weight: bold;
  cursor: not-allowed;
  opacity: 0.4;
}
/* ===== HISTORIQUE ÉVÉNEMENTS ===== */

.feed .event {
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.4;
  font-family: monospace;
  background: rgba(255,255,255,0.06);
}

/* Dégâts */
.feed .event.hit {
  border-left: 3px solid #facc15;
}

/* Mort */
.feed .event.death {
  border-left: 3px solid #ef4444;
  color: #fecaca;
}

/* Résurrection */
.feed .event.admin_revive {
  border-left: 3px solid #22c55e;
  color: #bbf7d0;
}

/* Admin */
.feed .event.admin_action {
  border-left: 3px solid #a855f7;
}

/* Système */
.feed .event.system {
  border-left: 3px solid #64748b;
  opacity: 0.85;
}

/* valeur dégâts */
.feed .value {
  margin-left: 6px;
  color: #facc15;
  font-weight: bold;
}



</style>

