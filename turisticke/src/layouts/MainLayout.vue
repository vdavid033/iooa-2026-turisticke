<template>
  <q-layout view="lHh Lpr lFf" style="min-height: 100vh;">
    <q-header elevated style="background: linear-gradient(to right, #4f46e5, #7e22ce) !important; height: 100px; display: flex; align-items: center;">
      <q-toolbar class="q-px-md">
        <!-- Gumb za menu -->
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" class="text-white q-mr-sm" />

        <!-- LIJEVA STRANA: Registracija -->
        <q-btn
        v-if="!user"
          unelevated
          rounded
          color="amber-7"
          text-color="black"
          label="Registracija"
          to="/auth?mode=register"
          class="q-px-lg text-weight-bold"
        />

        <!-- SPACE: Ovo gura sve nakon njega na desnu stranu -->
        <q-space />

        <!-- DESNA STRANA: Prijava i Sve atrakcije -->
        <div class="q-gutter-sm">
          <q-btn
          v-if="!user"
            unelevated
            rounded
            color="amber-7"
            text-color="black"
            label="Prijava"
            to="/auth?mode=login"
            class="q-px-lg text-weight-bold"
          />

          <!-- Gumb Odjava (ako JE prijavljen) -->
          <q-btn
            v-else
            unelevated
            rounded
            color="red-5"
            text-color="white"
            label="Odjava"
            @click="logout"
            class="q-px-lg text-weight-bold"
          />

          <q-btn
            unelevated
            rounded
            color="amber-7"
            text-color="black"
            label="Sve atrakcije"
            to="/atrakcije"
            class="q-px-lg text-weight-bold"
          />
        </div>

      </q-toolbar>
    </q-header>

    <!-- Glavni izbornik -->
    <q-drawer v-model="leftDrawerOpen" bordered :width="270" class="menu-drawer text-white">
      <div class="column full-height">
        <!-- Zaglavlje: brend + pozdrav korisniku -->
        <div class="menu-header q-pa-md">
          <div class="row items-center no-wrap">
            <q-icon name="menu" size="26px" class="q-mr-sm text-amber-4" />
            <div class="text-h6 text-weight-bold">Izbornik</div>
          </div>
          <div v-if="user" class="row items-center q-mt-sm text-amber-3">
            <q-icon name="account_circle" size="20px" class="q-mr-xs" />
            <span class="text-body2">Pozdrav, {{ user.korisnicko_ime }}</span>
          </div>
          <div v-else class="text-grey-4 text-caption q-mt-sm">
            Prijavi se za sve mogućnosti
          </div>
        </div>

        <q-separator class="menu-separator" />

        <q-list class="menu-list q-py-sm">
          <!-- Početna -->
          <q-item
            clickable v-ripple to="/" exact
            active-class="menu-item--active" class="menu-item"
            @click="leftDrawerOpen = false"
          >
            <q-item-section avatar><q-icon name="home" /></q-item-section>
            <q-item-section>Početna</q-item-section>
          </q-item>

          <!-- Grupa: Atrakcije -->
          <q-expansion-item
            icon="place" label="Atrakcije" default-opened
            class="menu-group" header-class="menu-group__header"
          >
            <q-item
              v-for="link in atrakcijeLinks" :key="link.title"
              clickable v-ripple :to="link.link"
              active-class="menu-item--active" class="menu-item menu-item--nested"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar><q-icon :name="link.icon" /></q-item-section>
              <q-item-section>{{ link.title }}</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-separator class="menu-separator q-my-xs" />

          <!-- Grupa: Moj sadržaj (samo prijavljeni korisnici) -->
          <q-expansion-item
            v-if="user"
            icon="star" label="Moj sadržaj" default-opened
            class="menu-group" header-class="menu-group__header"
          >
            <q-item
              v-for="link in mojSadrzajLinks" :key="link.title"
              clickable v-ripple :to="link.link"
              active-class="menu-item--active" class="menu-item menu-item--nested"
              @click="leftDrawerOpen = false"
            >
              <q-item-section avatar><q-icon :name="link.icon" /></q-item-section>
              <q-item-section>{{ link.title }}</q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>

        <q-space />

        <!-- Dno: akcije računa -->
        <div class="menu-footer q-pa-md">
          <q-separator class="menu-separator q-mb-md" />
          <q-btn
            v-if="user"
            outline rounded color="amber-3" icon="logout" label="Odjava"
            class="full-width" @click="logout"
          />
          <div v-else class="column q-gutter-sm">
            <q-btn unelevated rounded color="amber-7" text-color="black" icon="login" label="Prijava" to="/auth?mode=login" @click="leftDrawerOpen = false" />
            <q-btn outline rounded color="amber-3" icon="person_add" label="Registracija" to="/auth?mode=register" @click="leftDrawerOpen = false" />
          </div>
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <GlobalChatbot />
  </q-layout>
</template>

<script>
//import EssentialLink from "components/EssentialLink.vue";

//const linksList = [
/*
{
    title: "Homepage",
    caption: "Main page",
    icon: "home",
    link: "/home",
    target: "_self",
  },
{
    title: "Moje atrakcije",
    caption: "popis mojih atrakcija",
    icon: "favorite",
    link: "/",
    target: "_self",
  },
  {
  title: "Karta atrakcija",
  caption: "prikaz atrakcija na karti",
  icon: "map",
  link: "/karta-atrakcija",
  target: "_self",
  },
  {
    title: "Unos atrakcija",
    caption: "nos novih atrakcija",
    icon: "swap_horizontal_circle",
    link: "unos",
    target: "_self",
  },
  {
    title: "Testiranje Axiosa",
    caption: "služi za testiranje Axiosa",
    icon: "swap_horizontal_circle",
    link: "axo",
    target: "_self",
  },
  // {
  //   title: "",
  //   caption: "forum.quasar.dev",
  //   icon: "record_voice_over",
  //   link: "https://forum.quasar.dev",
  // },
  // {
  //   title: "",
  //   caption: "@quasarframework",
  //   icon: "rss_feed",
  //   link: "https://twitter.quasar.dev",
  // },
  // {
  //   title: "",
  //   caption: "@QuasarFramework",
  //   icon: "public",
  //   link: "https://facebook.quasar.dev",
  // },
  // {
  //   title: "",
  //   caption: "Community Quasar projects",
  //   icon: "favorite",
  //   link: "https://awesome.quasar.dev",
  // },
];*/

// Layout skripta za dinamično mijenjanje kartice Prijave i Odjave

import { defineComponent, ref } from "vue";
import GlobalChatbot from "components/GlobalChatbot.vue";

export default defineComponent({
  name: "MainLayout",

  components: {
    GlobalChatbot,
  },

  setup() {
    const leftDrawerOpen = ref(false)

    const user = ref(JSON.parse(localStorage.getItem("user")))

    const logout = () => {
      localStorage.removeItem("user")
      location.reload()
    }

    // Grupa "Atrakcije" – pregled, karta, galerija
    const atrakcijeLinks = [
      {
        title: "Sve atrakcije",
        caption: "Pregled svih atrakcija",
        icon: "place",
        link: "/atrakcije",
      },
      {
        title: "Karta atrakcija",
        caption: "Prikaz svih atrakcija na karti",
        icon: "map",
        link: "/karta-atrakcija",
      },
      {
        title: "Galerija slika",
        caption: "Galerija slika korisnika",
        icon: "photo_library",
        link: "/galerija slika",
      },
    ]

    // Grupa "Moj sadržaj" – samo za prijavljene korisnike
    const mojSadrzajLinks = [
      {
        title: "Moje atrakcije",
        caption: "Spremljene / omiljene atrakcije",
        icon: "favorite",
        link: "/moje-atrakcije",
      },
      {
        title: "Unos atrakcije",
        caption: "Unos nove atrakcije",
        icon: "add_location_alt",
        link: "/unos",
      },
    ]

    return {
      user,
      logout,
      atrakcijeLinks,
      mojSadrzajLinks,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
    }
  },
})
</script>

<style lang="scss">
/* Koristimo globalni stil da pokrijemo sve praznine */
.bg-main {
  /* Postavljamo najtamniju boju gradijenta kao bazu */
  background-color: #4c1d95 !important;
}

/* Osiguravamo da i kontejner stranica ne forsira bijelu boju */
.q-page-container {
  background-color: transparent !important;
}

body {
  background: linear-gradient(to right, #4f46e5, #7e22ce, #4c1d95) fixed !important;
}

/* ===== Glavni izbornik (drawer) ===== */
.menu-drawer {
  background: linear-gradient(160deg, #4f46e5 0%, #7e22ce 55%, #4c1d95 100%) !important;
  color: #fff !important;
}

.menu-drawer .menu-header {
  background: rgba(0, 0, 0, 0.15);
}

.menu-drawer .menu-separator {
  background: rgba(255, 255, 255, 0.15) !important;
}

/* Zaglavlja grupa (Atrakcije / Moj sadržaj) */
.menu-drawer .menu-group__header {
  color: #fcd34d; /* amber-4 */
  font-weight: 700;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  font-size: 0.85rem;
}

/* Stavke izbornika */
.menu-drawer .menu-item {
  border-radius: 10px;
  margin: 3px 10px;
  border-left: 4px solid transparent;
  color: rgba(255, 255, 255, 0.92);
  transition: background 0.2s ease, transform 0.2s ease;
}
.menu-drawer .menu-item:hover {
  background: rgba(255, 255, 255, 0.12);
  transform: translateX(3px);
}
.menu-drawer .menu-item--nested {
  margin-left: 18px;
}

/* Aktivna stavka — zlatni naglasak */
.menu-drawer .menu-item--active {
  background: rgba(250, 204, 21, 0.18);
  border-left-color: #facc15;
  color: #fde68a;
  font-weight: 700;
}
</style>
