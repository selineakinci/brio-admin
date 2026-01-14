<template>
  <div class="page-parties">
    <!-- Créer une partie -->
    <div class="creer-partie" @click="$router.push('/creer-partie')">
      <div class="bouton-plus"></div>
      <span>Créer une partie</span>
    </div>

    <!-- Liste -->
    <div class="liste-parties">
      <div
        class="carte carte-partie"
        v-for="partie in parties"
        :key="partie.id"
      >
        <!-- Statut -->
        <div
          class="statut"
          :class="partie.statut === 'en_cours' ? 'en-cours' : 'terminee'"
        >
          {{ partie.statut === 'en_cours'
            ? 'Partie en cours'
            : 'Partie terminée' }}
        </div>

        <!-- Nom de la partie -->
        <div class="nom-partie">
          {{ partie.nom }}
        </div>

        <!-- Infos -->
        <div class="infos">
          <template v-if="partie.statut === 'en_cours'">
            <div>
              <strong>Joueurs</strong> : {{ partie.joueurs }}
            </div>
            <div>
              <strong>Temps</strong> :
              <time :datetime="partie.tempsISO">
                {{ partie.temps }}
              </time>
            </div>
          </template>

          <template v-else>
            <div><strong>Gagnant</strong> : {{ partie.gagnant }}</div>
            <div>
              <strong>Date</strong> :
              <time :datetime="partie.dateISO">
                {{ partie.date }}
              </time>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ListeParties",
  data() {
    return {
      parties: [
        {
          id: 1,
          nom: "Alpha",
          statut: "en_cours",
          joueurs: 8,
          temps: "12:34",
          tempsISO: "PT12M34S",
        },
        {
          id: 2,
          nom: "Omega",
          statut: "terminee",
          gagnant: "Mathis",
          date: "12/01/2026",
          dateISO: "2026-01-12",
        },
      ],
    };
  },
};
</script>

<style>
.page-parties {
  min-height: 100vh;
  background: transparent;
  padding: 40px;
}

/* Bouton créer */
.creer-partie {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 32px;
  cursor: pointer;
  font-size: 18px;
}
/* ===== INTERACTION CARTES PARTIES ===== */

.carte-partie {
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.carte-partie:hover {
  transform: scale(1.02);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
}

/* Liste */
.liste-parties {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Carte */
.carte-partie {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  column-gap: 24px;
}

/* Statut */
.statut {
  min-width: 160px;
  height: 42px;
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.en-cours {
  background-color: #22c55e;
}

.terminee {
  background-color: #ef4444;
}

/* Nom */
.nom-partie {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
}

/* Infos */
.infos {
  text-align: right;
  font-size: 15px;
  color: var(--texte-secondaire);
}

.infos div {
  margin: 2px 0;
}
/* ===== BOUTON CRÉER UNE PARTIE ===== */

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

.creer-partie span {
  opacity: 0.9;
}

/* Rond + */
.bouton-plus {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--degrade-brio);
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35);
}

/* + centré optiquement */
.bouton-plus::after {
  content: "+";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -60%); /* centrage optique validé */
  font-size: 28px;
  font-weight: bold;
  color: white;
  line-height: 1;
}

/* Hover */
.creer-partie:hover .bouton-plus {
  transform: scale(1.08);
}

</style>
