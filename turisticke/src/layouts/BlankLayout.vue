<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <router-view />
    </q-page-container>

    <GlobalChatbot />
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import GlobalChatbot from "components/GlobalChatbot.vue";

export default defineComponent({
  name: "BlankLayout",
  components: {
    GlobalChatbot,
  },
});
</script>