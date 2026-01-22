<template>
  <div class="admin-layout">
    <!-- HEADER -->
    <header class="admin-header carte">
      <!-- GAUCHE -->
      <div class="header-left">
        <img :src="logoBrio" alt="BRIO" class="logo-brio" />
        <div class="logo">
          <span class="logo-title">BRIO</span>
          <span class="logo-sub">Admin Dashboard</span>
        </div>
      </div>

      <!-- NAV : UN SEUL BOUTON -->
      <nav class="nav">
        <RouterLink to="/parties" class="nav-main">
          🎮 Parties
        </RouterLink>
      </nav>

      <!-- USER -->
      <div class="header-right">
        <div class="user-menu">
          <button class="user-trigger" @click="toggleMenu">
            <div class="avatar">A</div>
            <span class="user-name">Admin</span>
          </button>

          <div v-if="menuOpen" class="dropdown carte">
            <div class="dropdown-item disabled">
              Connecté en tant que <strong>Admin</strong>
            </div>
            <div class="dropdown-separator"></div>
            <div class="dropdown-item logout" @click="logout">
              Se déconnecter
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- CONTENT -->
    <main class="admin-content">
      <router-view />
    </main>
  </div>
</template>


<script>
import logoBrio from "../assets/logo_brio.png";

export default {
  name: "AdminLayout",

  data() {
    return {
      menuOpen: false,
      logoBrio,
    };
  },

  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    logout() {
      localStorage.removeItem("isAdmin");
      this.$router.push("/");
    },
  },
};
</script>




<style scoped>.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ================= HEADER ================= */

.admin-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 18px 32px;
  margin: 20px;

  background: var(--carte-bg);
  border: 1px solid var(--carte-bordure);
  border-radius: 24px;
  backdrop-filter: blur(16px);

  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
}

/* ================= GAUCHE ================= */

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo-brio {
  width: 46px;
  height: 46px;
  object-fit: contain;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45));
  transition: transform 0.25s ease;
}

.header-left:hover .logo-brio {
  transform: scale(1.06) rotate(-2deg);
}

.logo {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.logo-title {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.08em;

  background: var(--degrade-brio);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-sub {
  font-size: 12px;
  opacity: 0.75;
  letter-spacing: 0.03em;
}

/* ================= NAV ================= */

.nav {
  display: flex;
  justify-content: center;
}

.nav-main {
  padding: 10px 26px;
  border-radius: 999px;
  background: var(--degrade-brio);
  color: white;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-decoration: none;

  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nav-main:hover {
  transform: scale(1.07);
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.55);
}

/* ================= USER ================= */

.header-right {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 12px;

  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 14px;

  color: white;
  transition: background 0.2s ease;
}

.user-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Avatar */

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--degrade-brio);

  display: flex;
  align-items: center;
  justify-content: center;

  font-weight: 900;
  font-size: 16px;
  color: white;

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

/* ================= DROPDOWN ADMIN ================= */

.dropdown {
  position: absolute;
  top: calc(100% + 18px);
  right: 0;

  min-width: 260px;
  padding: 18px;

  background: rgba(20, 0, 28, 0.85);
  border: 1px solid var(--carte-bordure);
  border-radius: 20px;
  backdrop-filter: blur(16px);

  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.65),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05);

  display: flex;
  flex-direction: column;
  gap: 10px;

  animation: dropdownFade 0.25s ease;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-item {
  padding: 14px 16px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.dropdown-item.disabled {
  opacity: 0.75;
}

.dropdown-separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.15);
  margin: 6px 0;
}

/* Logout */

.dropdown-item.logout {
  cursor: pointer;
  color: #fecaca;
  transition: background 0.2s ease, transform 0.15s ease;
}

.dropdown-item.logout:hover {
  background: rgba(239, 68, 68, 0.18);
  transform: translateX(2px);
}

/* ================= CONTENT ================= */

.admin-content {
  padding: 24px 40px 40px;
}

</style>
