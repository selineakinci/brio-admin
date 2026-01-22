<template>
  <div class="page-file-attente">
    <div class="carte carte-attente">

      <!-- EN-TÊTE -->
      <div class="entete">
        <h1>{{ partie.nom }}</h1>
        <span class="etat">
          {{ joueursPrets }}/{{ joueurs.length }} joueurs prêts
        </span>
      </div>

      <!-- QR CODE (même design que ListeParties) -->
      <div class="qr" v-if="qrCode" @click.stop>
        <img :src="qrCode" alt="QR Code" />
        <span class="qr-label">Scanner pour rejoindre</span>
      </div>

      <!-- LISTE DES JOUEURS -->
      <div class="liste-joueurs">
        <div
          v-for="joueur in joueurs"
          :key="joueur.id"
          class="carte carte-joueur"
        >
          <!-- IDENTITÉ -->
          <div class="identite">
            <div class="avatar">
              {{ joueur.pseudo.charAt(0).toUpperCase() }}
            </div>
            <span class="nom-joueur">{{ joueur.pseudo }}</span>
          </div>

          <!-- ÉQUIPEMENTS -->
          <div class="equipements">
            <span class="equipement" :class="{ ok: joueur.pret }">🔫</span>
            <span class="equipement" :class="{ ok: joueur.pret }">🦺</span>
          </div>

          <!-- STATUT -->
          <div class="statut" :class="joueur.pret ? 'pret' : 'attente'">
            {{ joueur.pret ? "Prêt" : "En attente" }}
          </div>
        </div>
      </div>

      <!-- ACTION -->
      <button
        class="bouton-lancer"
        :disabled="!tousPrets"
        @click="lancerPartie"
      >
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
      partie: {
        nom: "File d’attente",
      },
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
      return this.joueurs.length > 0 &&
             this.joueurs.every(j => j.pret);
    },
  },

  async mounted() {
    if (!this.codePartie) {
      console.error("❌ Code de partie manquant dans l’URL");
      return;
    }

    // 🔹 QR code (comme ListeParties)
    this.qrCode = await QRCode.toDataURL(this.codePartie, {
      width: 140,
      margin: 1,
    });

    // 🔹 Chargement initial complet
    await this.chargerJoueurs();

    // 🔹 Polling léger (uniquement prêt / pas prêt)
    this.pollingId = setInterval(this.pollingEtatEquipements, 2000);
  },

  beforeUnmount() {
    if (this.pollingId) {
      clearInterval(this.pollingId);
      this.pollingId = null;
    }
  },

  methods: {
    async chargerJoueurs() {
      try {
        const response = await axios.get(
          `/api/games/${this.codePartie}/players/`
        );

        this.joueurs = response.data.map(player => ({
          id: player.id,
          pseudo: player.pseudo,
          pret: player.equipment_id !== null,
        }));
      } catch (error) {
        console.error(
          "Erreur chargement joueurs :",
          error.response?.data || error
        );
      }
    },

    async pollingEtatEquipements() {
      try {
        const response = await axios.get(
          `/api/games/${this.codePartie}/players/`
        );

        response.data.forEach(bp => {
          const local = this.joueurs.find(j => j.id === bp.id);
          if (local) {
            local.pret = bp.equipment_id !== null;
          }
        });
      } catch (error) {
        console.error("Erreur polling équipements :", error);
      }
    },

    lancerPartie() {
      if (!this.tousPrets) return;

      // 🔮 futur endpoint backend :
      // await axios.post(`/api/games/${this.codePartie}/start/`);

      this.$router.push({
        name: "PartieEnCours",
        params: { code: this.codePartie },
      });
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
  gap: 8px;
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
  text-align: center;
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
</style>
