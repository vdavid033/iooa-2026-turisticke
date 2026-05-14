<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="main-header">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <div class="text-h6 app-title"><b>Turističke atrakcije</b></div>
        </q-toolbar-title>

        <div v-if="tokenExists" class="user-role">
          <q-icon name="verified_user" class="q-mr-sm" />
          <span><b>Prijavljeni ste kao:</b> {{ userRole }}</span>
        </div>

        <q-btn
          flat
          icon="logout"
          label="ODJAVA"
          v-if="tokenExists"
          @click="logout"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered overlay class="sidebar-drawer">
      <q-list padding>
        <q-item-label header class="menu-header">Izbornik</q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
          @click="closeDrawer"
        />

        <q-separator v-if="tokenExists" class="q-my-md" />

        <q-item
          v-if="tokenExists"
          clickable
          v-ripple
          @click="logout"
          class="logout-item"
        >
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Odjava</q-item-label>
            <q-item-label caption>Odjavi se iz sustava</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container @click="handlePageClick">
      <router-view />
    </q-page-container>

    <GlobalChatbot />

    <div class="main-footer">
      <div class="footer-wrapper">
        <div class="footer-top">
          <div class="footer-brand">
            <div class="footer-logo">
              <q-icon name="travel_explore" size="30px" />
            </div>
            <div>
              <h3>Turističke atrakcije</h3>
              <p>
                Moderna aplikacija za pregled, istraživanje i upravljanje
                turističkim atrakcijama.
              </p>
            </div>
          </div>

          <div class="footer-links">
            <div class="footer-column">
              <h4>Navigacija</h4>
              <router-link to="/" class="footer-link">Početna</router-link>
              <router-link to="/auth" class="footer-link">Prijava</router-link>
              <router-link to="/registracijaputanja" class="footer-link"
                >Registracija</router-link
              >
            </div>

            <div class="footer-column" v-if="tokenExists">
              <h4>Sadržaj</h4>
              <router-link to="/index" class="footer-link"
                >Moje atrakcije</router-link
              >
              <router-link to="/unos" class="footer-link"
                >Unos atrakcija</router-link
              >
            </div>

            <div class="footer-column">
              <h4>Informacije</h4>
              <div class="footer-info">
                <q-icon name="place" size="18px" />
                <span>Hrvatska</span>
              </div>
              <div class="footer-info">
                <q-icon name="email" size="18px" />
                <span>turisticke.atrakcije@app.hr</span>
              </div>
              <div class="footer-info">
                <q-icon name="info" size="18px" />
                <span>Dostupno 24/7</span>
              </div>
            </div>
          </div>
        </div>

        <q-separator dark class="footer-separator" />

        <div class="footer-bottom">
          <span>© 2026 Turističke atrakcije. Sva prava pridržana.</span>
          <span class="footer-made"
            >Izrađeno s pažnjom za moderno korisničko iskustvo.</span
          >
        </div>
      </div>
    </div>
  </q-layout>
</template>

<script>
import {
  defineComponent,
  ref,
  onMounted,
  onBeforeUnmount,
  computed,
  watch,
} from "vue";
import { useRouter, useRoute } from "vue-router";
import EssentialLink from "components/EssentialLink.vue";
import GlobalChatbot from "components/GlobalChatbot.vue";
import { jwtDecode } from "jwt-decode";

const linksList = [
  {
    title: "Početna",
    caption: "glavna početna stranica",
    icon: "home",
    link: "/",
    target: "_self",
    requiresAuth: false,
    onlyGuest: true,
  },
  {
    title: "Prijava",
    caption: "prijava u sustav",
    icon: "login",
    link: "/auth",
    target: "_self",
    requiresAuth: false,
    onlyGuest: true,
  },
  {
    title: "Registracija",
    caption: "izrada korisničkog računa",
    icon: "person_add",
    link: "/registracijaputanja",
    target: "_self",
    requiresAuth: false,
    onlyGuest: true,
  },
  {
    title: "Moje atrakcije",
    caption: "pregled mojih atrakcija",
    icon: "favorite",
    link: "/index",
    target: "_self",
    requiresAuth: true,
    onlyGuest: false,
  },
  {
    title: "Unos atrakcija",
    caption: "dodavanje novih atrakcija",
    icon: "add_location",
    link: "/unos",
    target: "_self",
    requiresAuth: true,
    onlyGuest: false,
  },
];

export default defineComponent({
  name: "MainLayout",
  components: {
    EssentialLink,
    GlobalChatbot,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const leftDrawerOpen = ref(false);
    const userRole = ref("Niste prijavljeni");
    const tokenExists = ref(false);

    function refreshAuthState() {
      const token = localStorage.getItem("token");
      tokenExists.value = !!token;

      if (!token) {
        userRole.value = "Niste prijavljeni";
        return;
      }

      try {
        const decoded = jwtDecode(token);
        userRole.value = decoded.uloga || "korisnik";
      } catch (error) {
        console.error("Error decoding token:", error);
        userRole.value = "Niste prijavljeni";
        tokenExists.value = false;
      }
    }

    function closeDrawer() {
      leftDrawerOpen.value = false;
    }

    function handlePageClick() {
      if (leftDrawerOpen.value) {
        closeDrawer();
      }
    }

    function handleEsc(event) {
      if (event.key === "Escape" && leftDrawerOpen.value) {
        closeDrawer();
      }
    }

    function logout() {
      localStorage.clear();
      tokenExists.value = false;
      userRole.value = "Niste prijavljeni";
      leftDrawerOpen.value = false;
      router.push("/");
    }

    const filteredLinks = computed(() => {
      return linksList.filter((link) => {
        if (link.requiresAuth && !tokenExists.value) return false;
        if (link.onlyGuest && tokenExists.value) return false;
        return true;
      });
    });

    onMounted(() => {
      refreshAuthState();
      window.addEventListener("keydown", handleEsc);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("keydown", handleEsc);
    });

    watch(
      () => route.fullPath,
      () => {
        refreshAuthState();
        closeDrawer();
      }
    );

    return {
      essentialLinks: filteredLinks,
      leftDrawerOpen,
      tokenExists,
      userRole,
      logout,
      closeDrawer,
      handlePageClick,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

<style scoped>
.main-header {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  color: white;
  backdrop-filter: blur(8px);
}

.app-title {
  letter-spacing: 0.3px;
}

.user-role {
  display: flex;
  align-items: center;
  margin-right: 12px;
  font-size: 15px;
}

.sidebar-drawer {
  background: #ffffff;
}

.menu-header {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.logout-item {
  border-radius: 14px;
}

.main-footer {
  background: linear-gradient(135deg, #0b1720, #132935, #1d3a49);
  color: white;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 42px 24px 22px;
}

.footer-top {
  display: flex;
  justify-content: space-between;
  gap: 40px;
  flex-wrap: wrap;
}

.footer-brand {
  flex: 1 1 320px;
  display: flex;
  align-items: flex-start;
  gap: 18px;
}

.footer-logo {
  width: 62px;
  height: 62px;
  min-width: 62px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #42a5f5, #1976d2);
  box-shadow: 0 10px 24px rgba(25, 118, 210, 0.35);
}

.footer-brand h3 {
  margin: 0 0 10px;
  font-size: 24px;
  font-weight: 700;
}

.footer-brand p {
  margin: 0;
  max-width: 420px;
  color: rgba(255, 255, 255, 0.76);
  line-height: 1.7;
  font-size: 15px;
}

.footer-links {
  flex: 2 1 600px;
  display: flex;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}

.footer-column {
  min-width: 180px;
  display: flex;
  flex-direction: column;
}

.footer-column h4 {
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
}

.footer-link {
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  margin-bottom: 10px;
  transition: all 0.25s ease;
  font-size: 15px;
}

.footer-link:hover {
  color: #7dd3fc;
  transform: translateX(4px);
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 15px;
}

.footer-separator {
  margin: 28px 0 18px;
  opacity: 0.18;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.68);
}

.footer-made {
  text-align: right;
}

@media (max-width: 900px) {
  .footer-top {
    flex-direction: column;
  }

  .footer-links {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 600px) {
  .footer-wrapper {
    padding: 32px 16px 20px;
  }

  .footer-brand {
    flex-direction: column;
  }

  .footer-logo {
    width: 56px;
    height: 56px;
    min-width: 56px;
  }

  .footer-brand h3 {
    font-size: 21px;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }

  .footer-made {
    text-align: left;
  }
}
</style>