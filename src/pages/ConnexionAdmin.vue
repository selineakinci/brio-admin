<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const identifiant = ref('')
const motDePasse = ref('')
const erreur = ref('')
const motDePasseVisible = ref(false)

const IDENTIFIANT_ADMIN = 'admin'
const MOT_DE_PASSE_ADMIN = 'admin123'

const seConnecter = () => {
  erreur.value = ''

  if (!identifiant.value || !motDePasse.value) {
    erreur.value = 'Veuillez remplir tous les champs'
    return
  }

  if (
    identifiant.value === IDENTIFIANT_ADMIN &&
    motDePasse.value === MOT_DE_PASSE_ADMIN
  ) {
    localStorage.setItem('isAdmin', 'true')
    router.push('/parties')
  } else {
    erreur.value = 'Identifiant ou mot de passe incorrect'
  }
}

const basculerVisibiliteMotDePasse = () => {
  motDePasseVisible.value = !motDePasseVisible.value
}
</script>

<template>
  <div class="login-page">
    <div class="carte login-box">
      <h1>BRIO Admin</h1>

      <!-- Identifiant -->
      <div class="champ-saisi">
        <input
          v-model="identifiant"
          class="input-brio"
          placeholder="Identifiant"
          autocomplete="username"
        />
      </div>

      <!-- Mot de passe -->
      <div class="champ-saisi">
        <input
          v-model="motDePasse"
          class="input-brio"
          :type="motDePasseVisible ? 'text' : 'password'"
          placeholder="Mot de passe"
          autocomplete="current-password"
          @keyup.enter="seConnecter"
        />

        <button
          v-if="motDePasse"
          type="button"
          class="icone-oeil"
          @mousedown.prevent
          @click="basculerVisibiliteMotDePasse"
          tabindex="-1"
        >
          <svg v-if="!motDePasseVisible" viewBox="0 0 24 24">
            <path
              d="M12 5C7 5 2.7 8.1 1 12c1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7zm0 11a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
            />
          </svg>

          <svg v-else viewBox="0 0 24 24">
            <path
              d="M3 3l18 18M10.6 10.6A2 2 0 0 0 12 14a2 2 0 0 0 1.4-.6M6.6 6.6A10.9 10.9 0 0 0 1 12c1.7 3.9 6 7 11 7a11 11 0 0 0 5.4-1.4"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>

      <!-- Message d'erreur -->
      <div v-if="erreur" class="message-erreur">
        {{ erreur }}
      </div>

      <!-- Bouton connexion -->
      <button class="bouton-principal" @click="seConnecter">
        Connexion
      </button>
    </div>
  </div>
</template>

<style>
/* Typo globale */
.login-page,
.login-page * {
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
}

/* Page login */
.login-page {
  position: relative;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* Filigrane BRIO */
.login-page::before {
  content: "";
  position: absolute;
  inset: -50%;
  background-image: url("../assets/logo_brio.png");
  background-repeat: repeat;
  background-size: 360px;
  opacity: 0.07;
  transform: rotate(-30deg);
  z-index: 0;
}

/* Carte */
.login-box {
  position: relative;
  z-index: 1;
  width: 320px;
  padding: 28px;
  border-radius: 20px;
  background: rgba(90, 40, 110, 0.6);
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
}

/* CHAMP STABLE (encadré définitif) */
.champ-saisi {
  position: relative;
  height: 48px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
}

/* Input neutre */
.input-brio {
  width: 100%;
  height: 100%;
  padding: 12px 44px 12px 12px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  box-sizing: border-box;
}

/* Aucun effet focus */
.input-brio:focus,
.input-brio:focus-visible {
  outline: none;
}

/* Icône œil */
.icone-oeil {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #aaa;
  opacity: 0.6;
}

.icone-oeil svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.icone-oeil:hover {
  opacity: 0.8;
}

.icone-oeil:focus,
.icone-oeil:active {
  outline: none;
  box-shadow: none;
}

/* Message erreur */
.message-erreur {
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(255, 90, 90, 0.12);
  color: #ffb4b4;
  font-size: 0.95rem;
  text-align: left;
}

/* Bouton */
.bouton-principal {
  margin-top: 8px;
  padding: 14px;
  border-radius: 16px;
  border: none;
  background: linear-gradient(90deg, #e45757, #b36ae2);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
</style>
