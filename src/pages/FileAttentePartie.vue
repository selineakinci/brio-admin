<template>
  <div class="page-file-attente">
    <div class="carte carte-attente">

      <div class="entete">
        <h1>{{ partie.nom }}</h1>
        <span class="etat">
          {{ joueursPrets }}/{{ joueurs.length }} joueurs prêts
        </span>
      </div>

      <!-- QR + CODE -->
      <div class="qr" v-if="qrCode">
        <img :src="qrCode" />
        <span class="qr-label">Scanner pour rejoindre</span>

        <div class="code-partie">
          <span class="label">Code de la partie</span>
          <div class="code-box" @click="copierCode">
            {{ codePartie }}
            <span class="copy"></span>
          </div>
        </div>
      </div>

      <!-- JOUEURS -->
      <div class="liste-joueurs">
        <div v-for="j in joueurs" :key="j.id" class="carte carte-joueur">
          <div class="identite">
            <div class="avatar">{{ j.pseudo[0].toUpperCase() }}</div>
            <span class="nom-joueur">{{ j.pseudo }}</span>
          </div>

          <div class="equipements">
            <span class="equipement" :class="{ ok: j.pret }">🔫</span>
            <span class="equipement" :class="{ ok: j.pret }">🦺</span>
          </div>

          <div class="statut" :class="j.pret ? 'pret' : 'attente'">
            {{ j.pret ? "Prêt" : "En attente" }}
          </div>
        </div>
      </div>

      <button class="bouton-lancer" :disabled="!tousPrets" @click="lancerPartie">
        Lancer la partie
      </button>

    </div>
  </div>
</template>




<script>
import axios from "axios";
import QRCode from "qrcode";

export default {
  name: "FileAttentePartie",

  data() {
    return {
      partie: { nom: "File d’attente" },
      joueurs: [],
      qrCode: null,
      pollingId: null,
    };
  },

  computed: {
    codePartie() {
      return this.$route.params.code;
    },

    joueursPrets() {
      return this.joueurs.filter(j => j.pret).length;
    },

    tousPrets() {
      return this.joueurs.length > 0 && this.joueurs.every(j => j.pret);
    },
  },

  async mounted() {
    if (!this.codePartie) return;

    this.qrCode = await QRCode.toDataURL(this.codePartie, {
      width: 160,
      margin: 0, // 🔥 pas d’espace blanc
    });

    await this.chargerJoueurs();
    this.pollingId = setInterval(this.chargerJoueurs, 2000);
  },

  beforeUnmount() {
    if (this.pollingId) clearInterval(this.pollingId);
  },

  methods: {
    async chargerJoueurs() {
      const res = await axios.get(
        `/api/games/${this.codePartie}/players/`
      );

      this.joueurs = res.data.map(p => ({
        id: p.id,
        pseudo: p.pseudo,
        pret: p.equipment_id !== null,
      }));
    },

    async lancerPartie() {
      await axios.post(`/api/games/${this.codePartie}/start/`);
      this.$router.push({
        name: "PartieEnCours",
        params: { code: this.codePartie },
      });
    },

    copierCode() {
      navigator.clipboard.writeText(this.codePartie);
    },
  },
};
</script>





<style>
.page-file-attente {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  padding-top: 50px;
}

.carte-attente {
  width: 720px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* EN-TÊTE */
.entete {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.etat {
  opacity: 0.85;
  font-weight: bold;
}

/* QR (identique ListeParties) */
.qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* carré blanc propre */
.qr-wrapper {
  background: white;
  padding: 6px;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
}

.qr-wrapper img {
  width: 150px;
  height: 150px;
  display: block;
  border-radius: 8px;
}


.qr img {
  width: 130px;
  height: 130px;
  background: white;
  padding: 8px;
  border-radius: 12px;
}

.qr-label {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
}

/* LISTE JOUEURS */
.liste-joueurs {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.carte-joueur {
  display: grid;
  grid-template-columns: 1.4fr 1fr auto;
  align-items: center;
  padding: 16px;
}

/* IDENTITÉ */
.identite {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--degrade-brio);
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.nom-joueur {
  font-size: 16px;
  font-weight: bold;
}

/* ÉQUIPEMENTS */
.equipements {
  display: flex;
  gap: 14px;
  font-size: 20px;
}

.equipement {
  opacity: 0.25;
}

.equipement.ok {
  opacity: 1;
}

/* STATUT */
.statut {
  padding: 6px 16px;
  border-radius: 20px;
  font-weight: bold;
  font-size: 14px;
}

.pret {
  background-color: #22c55e;
}

.attente {
  background-color: #f59e0b;
}

/* ACTION */
.bouton-lancer {
  margin-top: 10px;
  height: 48px;
  border-radius: 16px;
  border: none;
  background: var(--degrade-brio);
  color: white;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}

.bouton-lancer:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
/* ===== CODE PARTIE ===== */

.code-partie {
  margin-top: 6px;
  padding: 10px 18px;
  border-radius: 16px;

  background: rgba(255, 255, 255, 0.08);
  border: 1px dashed rgba(255, 255, 255, 0.25);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  cursor: pointer;
  transition: all 0.2s ease;
}

.code-partie:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: scale(1.04);
}

.code-label {
  font-size: 11px;
  letter-spacing: 2px;
  opacity: 0.65;
  text-transform: uppercase;
}

.code-value {
  font-family: monospace;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 2px;

  background: var(--degrade-brio);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
</style>
