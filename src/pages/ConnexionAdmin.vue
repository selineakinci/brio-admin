<template>
  <div class="login-page">
    <div class="carte login-box">
      <h1>BRIO Admin</h1>

      <input class="input-brio" placeholder="Identifiant" />
      <input class="input-brio" type="password" placeholder="Mot de passe" />

      <button
        class="bouton-principal"
        @click="$router.push('/parties')"
      >
        Connexion
      </button>
    </div>
  </div>
</template>

<style>
.login-page {
  position: relative;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* FILIGRANE LOGO BRIO */
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

.login-box {
  position: relative;
  z-index: 1;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
}
</style>
