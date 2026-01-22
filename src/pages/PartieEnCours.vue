<template>
  <div class="page-partie-en-cours">

    <!-- ================= ZONE JEU ================= -->
    <div class="zone-jeu">

      <!-- NOM PARTIE (BACKEND) -->
      <h1 class="titre-partie">{{ partie.nom }}</h1>

      <!-- MINUTEUR (BACKEND) -->
      <div class="minuteur-glow">{{ tempsAffiche }}</div>

      <!-- CONTROLES ADMIN -->
      <div class="actions-partie">
        <button class="btn-brio" @click="pausePartie">⏸ Pause</button>
        <button class="btn-brio" @click="reprendrePartie">▶ Reprendre</button>
        <button class="btn-brio danger" @click="terminerPartie">
          ⛔ Mettre fin
        </button>
      </div>

      <!-- ================= JOUEURS ================= -->
      <div class="liste-joueurs">

        <div
          v-for="j in joueurs"
          :key="j.id"
          class="carte-joueur"
          :class="{
            mort: j.mort,
            vivant: !j.mort,
            danger: !j.mort && j.vie <= 25
          }"
        >

          <!-- DONNÉES JOUEUR -->
          <div class="zone zone-identite">
            <div class="zone-titre">JOUEUR</div>

            <!-- Nom joueur -->
            <div class="nom" :style="{ color: j.couleur }">
              {{ j.nom }}
            </div>

            <!-- ETAT CENTRAL GRAND FORMAT -->
            <div class="etat-central">

              <!-- JOUEUR EN VIE -->
              <template v-if="!j.mort && j.vie > 25">
                <div class="etat-circle alive"></div>
                <div class="etat-text alive">EN VIE</div>
              </template>

              <!-- JOUEUR EN DANGER -->
              <template v-else-if="!j.mort && j.vie <= 25">
                <div class="etat-circle danger"></div>
                <div class="etat-text danger">DANGER</div>
              </template>

              <!-- JOUEUR MORT -->
              <template v-else>
                <div class="etat-text dead">ÉLIMINÉ</div>
              </template>

            </div>
          </div>

          <!-- STATS -->
          <div class="zone zone-stats">
            <div class="zone-titre">STATISTIQUES</div>

            <!-- contenu centré -->
            <div class="stats-centered">
              
              <!-- ❤️ VIE -->
              <div class="stat-block">
                <div class="stat-icon">❤️</div>
                <div class="barre big">
                  <div class="vie" :style="{ width: j.vie + '%' }"></div>
                  <span class="barre-text center">{{ j.vie }}%</span>
                </div>
              </div>

              <!-- 🛡️ BOUCLIER -->
              <div class="stat-block">
                <div class="stat-icon">🛡️</div>
                <div class="barre big">
                  <div class="bouclier" :style="{ width: j.bouclier + '%' }"></div>
                  <span class="barre-text center">{{ j.bouclier }}%</span>
                </div>
              </div>

              <!-- 🔫 MUNITIONS -->
              <div class="stat-block munitions-block">
                <div class="weapon-icon">🔫</div>

                <div class="ammo-capsules">
                  <span
                    v-for="n in j.munitionsMax"
                    :key="n"
                    :class="{ active: n <= j.munitions }"
                  ></span>
                </div>

                <div class="ammo-count">
                  {{ j.munitions }} / {{ j.munitionsMax }}
                </div>
              </div>

            </div>
          </div>

          <!-- ================= ACTIONS ADMIN ================= -->
          <div class="zone zone-actions">
            <div class="zone-titre">ACTIONS ADMIN</div>

            <!-- JOUEUR VIVANT -->
            <template v-if="!j.mort">

              <!-- ❤️ VIE -->
              <div class="admin-section">
                <div class="admin-label">❤️ VIE</div>
                <div class="admin-life-control">
                  <button class="btn-admin minus" @click="modifierVie(j, -10)">−</button>
                  <div class="admin-life-bar">
                    <div class="admin-life-fill vie" :style="{ width: j.vie + '%' }"></div>
                  </div>
                  <button class="btn-admin plus" @click="modifierVie(j, 10)">+</button>
                </div>
              </div>

              <!-- 🛡️ BOUCLIER (FIX) -->
              <div class="admin-section">
                <div class="admin-label">🛡️ BOUCLIER</div>
                <div class="admin-life-control">
                  <button class="btn-admin minus" @click="modBouclier(j, -10)">−</button>
                  <div class="admin-life-bar">
                    <div class="admin-life-fill bouclier" :style="{ width: j.bouclier + '%' }"></div>
                  </div>
                  <button class="btn-admin plus" @click="modBouclier(j, 10)">+</button>
                </div>
              </div>

              <!-- 🔫 MUNITIONS (FIX) -->
              <div class="admin-section">
                <div class="admin-label">🔫 MUNITIONS</div>
                <div class="admin-life-control">
                  <button class="btn-admin minus" @click="modMunitions(j, -1)">−</button>
                  <div class="admin-life-bar">
                    <div
                      class="admin-life-fill munitions"
                      :style="{ width: (j.munitions / j.munitionsMax * 100) + '%' }"
                    ></div>
                  </div>
                  <button class="btn-admin plus" @click="modMunitions(j, 1)">+</button>
                </div>
              </div>

              <!-- ☠️ ÉLIMINER (DESIGN AMÉLIORÉ) -->
              <div class="admin-section critical">
                <button
                  class="btn-admin kill full"
                  @click="j.confirmKill = !j.confirmKill"
                >
                  ☠️ ÉLIMINER LE JOUEUR
                </button>

                <div v-if="j.confirmKill" class="confirm-inline">
                  <span>Confirmer ?</span>
                  <button class="btn-admin confirm" @click="tuer(j)">OUI</button>
                  <button class="btn-admin cancel" @click="j.confirmKill = false">NON</button>
                </div>
              </div>

            </template>

            <!-- JOUEUR MORT -->
            <template v-else>
              <div class="admin-section critical">
                <button class="btn-admin respawn full" @click="resusciter(j)">
                  ♻️ RÉANIMER
                </button>
              </div>
            </template>
          </div>

          <!-- SCORE -->
          <div class="zone zone-score">
            <div class="zone-titre">SCORE</div>
            <div class="kills">☠️ {{ j.kills }}</div>
          </div>

        </div>
      </div>
    </div>

    <!-- ================= HUD DROIT ================= -->
    <div class="hud-droite">

      <!-- HISTORIQUE -->
      <div class="hud-carte">
        <div class="hud-titre">HISTORIQUE</div>
        <div class="feed">
          <div
            v-for="(e,i) in historique"
            :key="i"
            :style="{ color: e.couleur }"
          >
            {{ e.texte }}
          </div>
        </div>
      </div>

      <!-- COMMS -->
      <div class="hud-carte chat">
        <div class="hud-titre">CHAT</div>

        <div class="chat-messages">
          <div v-for="(m,i) in messages" :key="i">
            <span :style="{ color: m.couleur }">{{ m.auteur }}</span> :
            {{ m.texte }}
          </div>
        </div>

        <div class="chat-input">
          <input
            v-model="nouveauMessage"
            placeholder="Message admin..."
            @keydown.enter="envoyerMessage"
          />
          <button @click="envoyerMessage">➤</button>
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
        nom: "Chargement...",
        status: null, // 🔥 IMPORTANT
      },
      temps: 0,

      // ⚠️ joueurs laissés EN DUR comme demandé
      joueurs: [
        {
          id: 1,
          nom: "Mathis",
          couleur: "#ef4444",
          vie: 100,
          bouclier: 80,
          munitions: 10,
          munitionsMax: 12,
          kills: 2,
          mort: false,
          confirmKill: false
        },
        {
          id: 2,
          nom: "Matteo",
          couleur: "#22c55e",
          vie: 100,
          bouclier: 40,
          munitions: 6,
          munitionsMax: 12,
          kills: 1,
          mort: false,
          confirmKill: false
        }
      ]
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
    this.chargerInfosPartie();

    // ⏱ Décompte local (visuel)
    setInterval(() => {
      if (this.temps > 0 && this.partie.status === "running") {
        this.temps--;
      }
    }, 1000);
  },

  methods: {
    /* =========================
       INFOS PARTIE (BACKEND)
       ========================= */
    async chargerInfosPartie() {
      try {
        const res = await axios.get("/api/games/");
        const game = res.data.find(g => g.code === this.codePartie);

        if (!game) {
          console.error("❌ Partie introuvable");
          return;
        }

        this.partie.nom = game.name;
        this.partie.status = game.status; // 🔥 CRUCIAL
        this.temps = game.duration_seconds;
      } catch (err) {
        console.error("Erreur chargement partie", err);
      }
    },

    /* =========================
       CONTROLES ADMIN
       ========================= */

    // ⏸ PAUSE → uniquement si RUNNING
    async pausePartie() {
      if (this.partie.status !== "running") return;

      try {
        await axios.post(`/api/games/${this.codePartie}/pause/`);
        this.partie.status = "paused"; // 🔥 sync front
      } catch (err) {
        console.error("Erreur pause", err.response?.data || err);
      }
    },

    // ▶ REPRENDRE → uniquement si PAUSED
    async reprendrePartie() {
      if (this.partie.status !== "paused") return;

      try {
        await axios.post(`/api/games/${this.codePartie}/resume/`);
        this.partie.status = "running"; // 🔥 sync front
      } catch (err) {
        console.error("Erreur reprise", err.response?.data || err);
      }
    },

    // ⛔ FIN → toujours autorisé sauf FINISHED
    async terminerPartie() {
      if (this.partie.status === "finished") return;

      try {
        await axios.post(`/api/games/${this.codePartie}/end/`, {
          reason: "admin",
        });

        this.partie.status = "finished";

        this.$router.push("/parties");
      } catch (err) {
        console.error("Erreur fin de partie", err.response?.data || err);
      }
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
  height:100%;
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

  margin-bottom: 8px;
}

/* ===== SCORE ===== */
.zone-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
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

.hud-carte:first-child {
  flex: 1;
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
.hud-droite {
  position: fixed;
  top: 24px;
  right: 24px;
  width: 22%;
  height: calc(100vh - 48px);
  pointer-events: none; /* évite de bloquer le scroll */
}
.hud-droite {
  pointer-events: none;
}

.hud-droite .hud-carte {
  pointer-events: auto;
}


/* Les cartes restent interactives */
.hud-carte {
  pointer-events: auto;
}

/* ===== HISTORIQUE FIXE EN HAUT ===== */
.hud-carte:not(.chat) {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  max-height: 45vh;
}

/* feed scrollable */
.hud-carte:not(.chat) .feed {
  max-height: 35vh;
  overflow-y: auto;
}

/* ===== CHAT FIXE EN BAS ===== */
.hud-carte.chat {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  max-height: 40vh;
  min-height: 140px;
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
  justify-content: flex-start;
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

</style>

