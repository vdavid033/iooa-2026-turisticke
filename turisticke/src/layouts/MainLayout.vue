<template>
  <q-layout view="lHh Lpr lFf" style="min-height: 100vh;">
    <q-header elevated style="background: linear-gradient(to right, #4f46e5, #7e22ce) !important; height: 100px; display: flex; align-items: center;">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title>
          <div class="text-h6"><b>Turističke atrakcije</b></div>
        </q-toolbar-title>

        <div>Bad Developers</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Izbornik </q-item-label>

        <EssentialLink v-for="link in essentialLinks" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container style="padding-bottom: 0 !important;">
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

      if (!user.value) {
        links.push({
          title: "Prijava",
          icon: "login",
          link: "/auth"
        })
      } else {
        links.push({
          title: "Odjava",
          icon: "logout",
          action: logout
        })
      }

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
      essentialLinks,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },
    }
  },
})
</script>
