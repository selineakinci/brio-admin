<template>
  <div class="page-partie-en-cours">

    <!-- ================= ZONE JEU ================= -->
    <div class="zone-jeu">

      <h1 class="titre-partie">{{ partie.nom }}</h1>

      <!-- MINUTEUR -->
      <div class="minuteur-glow">{{ tempsAffiche }}</div>

      <!-- CONTROLES -->
      <div class="actions-partie">
        <button class="btn-brio">⏸ Pause</button>
        <button class="btn-brio">▶ Reprendre</button>
        <button class="btn-brio danger">⛔ Mettre fin</button>
        <button class="btn-brio secondaire">↻ Réinitialiser</button>
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
            <div class="nom" :style="{ color: j.couleur }">{{ j.nom }}</div>

            <div class="etat">
              <span v-if="j.mort">☠️ Éliminé</span>

              <span v-else-if="j.vie <= 25" class="etat-danger">
                ⚠️ EN DANGER DE MORT
              </span>

              <span v-else class="etat-vital">
                <span class="pulse-dot"></span>
                EN VIE
              </span>
            </div>
          </div>

          <!-- STATS -->
          <div class="zone zone-stats">
            <div class="zone-titre">STATISTIQUES</div>

            <div class="stat">
              ❤️
              <div class="barre">
                <div class="vie" :style="{ width: j.vie + '%' }"></div>
              </div>
            </div>

            <div class="stat">
              🛡️
              <div class="barre">
                <div class="bouclier" :style="{ width: j.bouclier + '%' }"></div>
              </div>
            </div>

            <div class="stat">
              🔫
              <div class="munitions">
                <span
                  v-for="n in j.munitionsMax"
                  :key="n"
                  :class="{ active: n <= j.munitions }"
                />
              </div>
              <span class="compteur">
                {{ j.munitions }}/{{ j.munitionsMax }}
              </span>
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
        <div class="hud-titre">COMMS JOUEURS</div>

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
export default {
  name: "PartieEnCours",

  data() {
    return {
      partie: { nom: "BRIO – Night Battle" },
      temps: 420,

      // conservés (panneaux contextuels / compatibilité)
      joueurBouclier: null,
      joueurMunitions: null,

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
        },
        {
          id: 3,
          nom: "Julie",
          couleur: "#3b82f6",
          vie: 100,
          bouclier: 60,
          munitions: 12,
          munitionsMax: 12,
          kills: 0,
          mort: false,
          confirmKill: false
        }
      ],

      historique: [],
      messages: [],
      nouveauMessage: ""
    };
  },

  computed: {
    tempsAffiche() {
      const m = String(Math.floor(this.temps / 60)).padStart(2, "0");
      const s = String(this.temps % 60).padStart(2, "0");
      return `${m}:${s}`;
    }
  },

  mounted() {
    setInterval(() => {
      if (this.temps > 0) this.temps--;
    }, 1000);
  },

  methods: {
    /* ===================== ÉLIMINATION ===================== */

    tuer(j) {
      j.mort = true;
      j.confirmKill = false;

      this.historique.unshift({
        texte: `☠️ ${j.nom} éliminé`,
        couleur: j.couleur
      });
    },

    resusciter(j) {
      j.mort = false;
      j.vie = 50;
      j.bouclier = 0;
      j.confirmKill = false;

      this.historique.unshift({
        texte: `♻️ ${j.nom} réanimé par l’admin`,
        couleur: j.couleur
      });
    },

    /* ===================== VIE ===================== */

    modifierVie(j, valeur) {
      if (j.mort) return;

      j.vie = Math.max(0, Math.min(100, j.vie + valeur));

      if (j.vie === 0) {
        this.tuer(j);
      }
    },

    /* ===================== BOUCLIER (CORRIGÉ) ===================== */
    /* identique à la logique de la vie */

    modBouclier(j, valeur) {
      if (j.mort) return;

      j.bouclier = Math.max(
        0,
        Math.min(100, j.bouclier + valeur)
      );
    },

    /* ===================== MUNITIONS (CORRIGÉ) ===================== */
    /* identique à la logique de la vie */

    modMunitions(j, valeur) {
      if (j.mort) return;

      j.munitions = Math.max(
        0,
        Math.min(j.munitionsMax, j.munitions + valeur)
      );
    },

    /* ===================== CHAT ===================== */

    envoyerMessage() {
      if (!this.nouveauMessage) return;

      this.messages.push({
        auteur: "Admin",
        texte: this.nouveauMessage,
        couleur: "#a855f7"
      });

      this.nouveauMessage = "";
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
  font-size:11px;
  opacity:0.6;
  margin-bottom:6px;
}

/* ===== SCORE ===== */
.zone-score {
  display:flex;
  justify-content:center;
  align-items:center;
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
/* ===== HUD DROIT STRUCTURE ===== */
.hud-droite {
  position: relative;
  height: 100%;
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
/* ===== HISTORIQUE AU-DESSUS ===== */
.hud-carte:not(.chat) {
  margin-bottom: calc(40vh + 16px);
}

</style>

