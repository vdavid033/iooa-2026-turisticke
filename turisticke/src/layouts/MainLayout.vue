<template>
  <q-layout view="lHh Lpr lFf" style="min-height: 100vh;">
    <q-header elevated style="background: linear-gradient(to right, #4f46e5, #7e22ce) !important; height: 100px; display: flex; align-items: center;">
      <q-toolbar class="q-px-md">
        <!-- Gumb za menu (opcionalno, ostavio sam ga ako zatreba) -->
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
            to="/home"
            class="q-px-lg text-weight-bold"
          />
        </div>

      </q-toolbar>
    </q-header>

    <!-- Ostatak layouta ostaje isti -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Izbornik </q-item-label>
        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
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

import { defineComponent, ref, computed } from "vue";
import EssentialLink from "components/EssentialLink.vue";

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false)

    const user = ref(JSON.parse(localStorage.getItem("user")))

    const logout = () => {
      localStorage.removeItem("user")
      location.reload()
    }

    const essentialLinks = computed(() => {

      const links = []


      links.push(
         {
          title: "Homepage",
          caption: "Main page",
          icon: "home",
          link: "/home"
        },
        {
          title: "Moje atrakcije",
          caption: "popis mojih atrakcija",
          icon: "favorite",
          link: "/"
        },
        {
          title: "Unos atrakcija",
          caption: "unos novih atrakcija",
          icon: "swap_horizontal_circle",
          link: "/unos"
        },
        {
          title: "Testiranje Axiosa",
          caption: "služi za testiranje Axiosa",
          icon: "swap_horizontal_circle",
          link: "/axo"
        }
      )

      return links
    })

    return {
      user,
      logout,
      essentialLinks,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
    }
  },
})
</script>
