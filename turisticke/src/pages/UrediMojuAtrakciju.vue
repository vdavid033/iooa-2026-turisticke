<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="max-w-7xl mx-auto">
      <q-btn
        flat
        no-caps
        color="primary"
        icon="arrow_back"
        label="Natrag na moje atrakcije"
        to="/moje-atrakcije"
        class="q-px-none hover-opacity"
      />

      <div class="text-center q-mt-xl">
        <h1 class="text-h3 text-primary text-weight-bold q-margin-none">
          Uređivanje atrakcije
        </h1>
        <p class="text-subtitle1 text-grey-7 q-mt-sm">
          ID atrakcije: {{ route.params.id }}
        </p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<style scoped>
.max-w-7xl {
  max-width: 1200px;
  margin: 0 auto;
}

.hover-opacity:hover {
  opacity: 0.7;
}
</style>
