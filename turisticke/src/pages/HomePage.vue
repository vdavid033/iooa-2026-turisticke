<template>
  <q-page class="bg-white" style="display: flex; flex-direction: column; min-height: calc(100vh - 100px) !important; padding: 0 !important; margin: 0 !important;">
    <header 
      class="hero-section text-white relative-position" 
      style="background: linear-gradient(to right, #4f46e5, #7e22ce, #4c1d95) !important; min-height: 500px; width: 100%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
    >
      <div class="absolute-full bg-pattern opacity-20"></div>
      <div class="relative-position max-w-7xl mx-auto px-md text-center">
        <div class="hero-content">
          <p class="text-h3 text-weight-bold italic leading-relaxed q-mx-auto hero-title" style="color: white !important;">
            "Ne budi ovca koja prati svih, izaberi svoje savršeno putovanje"
          </p>
          <p class="text-h5 q-mt-lg text-purple-1 opacity-90">
            Dođite i pridružite nam se u otkrivanju Hrvatske
          </p>
        </div>
      </div>
      <div class="absolute-bottom w-full">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; width: 100%">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white"/>
        </svg>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-md py-xl" style="flex: 1; width: 100%;">
      <div class="text-center q-mb-xl">
        <h2 class="text-h3 text-primary q-mb-sm">Naše najpopularnije destinacije</h2>
        <div class="divider-gradient mx-auto"></div>
        <p class="q-mt-lg text-body1 text-grey-8 max-w-2xl mx-auto">
          Od povijesnih gradova do prirodnih čuda, Hrvatska nudi nezaboravna iskustva za svakog putnika
        </p>
      </div>

      <div class="row q-col-gutter-xl q-mb-xl">
        <div 
          v-for="attraction in attractions" 
          :key="attraction.id_atrakcije" 
          class="col-12 col-sm-6 col-md-4"
        >
          <q-card 
            class="attraction-card shadow-15 hover-scale cursor-pointer"
            @click="$router.push({ name: 'one_atraction', params: { id: attraction.id_atrakcije } })"
          >
            <q-img :src="attraction.slika" :ratio="16/9" class="rounded-borders">
              <div class="absolute-top-right q-ma-sm" style="background: transparent">
                <q-badge color="orange" text-color="white" class="q-pa-xs text-bold shadow-2">
                  <q-icon name="star" size="14px" class="q-mr-xs" />
                  {{ attraction.prosjecna_ocjena ? attraction.prosjecna_ocjena.toFixed(1) : '0.0' }}
                </q-badge>
              </div>
              <div class="absolute-bottom text-h6 bg-black-opacity q-pa-sm">
                {{ attraction.naziv }}
              </div>
            </q-img>
            <q-card-section>
              <div class="text-subtitle1 text-grey-9 text-weight-medium">
                {{ attraction.adresa }}
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">Kliknite za više detalja</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </main>

    <footer class="footer-section text-white q-pa-xl text-center" style="margin-top: auto; width: 100%; margin-bottom: 0;">
      <div class="max-w-7xl mx-auto">
        <p class="text-purple-3 text-h6 q-mb-xs">Otkrijte ljepotu Hrvatske na svoj način</p>
        <p class="text-grey-5 opacity-70">© 2026 Hrvatska Turistička Atrakcija. Sva prava pridržana.</p>
      </div>
    </footer>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const attractions = ref([])

const fetchAttractions = async () => {
  try {
    const response = await axios.get('http://localhost:4200/atrakcije')
    attractions.value = response.data
  } catch (error) {
    console.error("Greška pri komunikaciji s backendom:", error)
  }
}

onMounted(() => {
  fetchAttractions()
})
</script>

<style lang="scss" scoped>
/* Osiguravamo da nema skrivenih margina na dnu stranice */
:deep(.q-page-container) {
  padding-bottom: 0 !important;
}

.hero-section {
  z-index: 1;
}

.bg-pattern {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnpNNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTM2IDM0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==") !important;
}

.hero-title {
  max-width: 900px;
  line-height: 1.2;
}

.divider-gradient {
  width: 120px;
  height: 5px;
  background: linear-gradient(to right, #facc15, #a855f7) !important;
  border-radius: 10px;
  margin: 0 auto !important;
}

.attraction-card {
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  overflow: hidden;
  &:hover {
    transform: translateY(-12px) scale(1.02);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
}

.bg-black-opacity {
  background: rgba(0, 0, 0, 0.4) !important;
}

.footer-section {
  background-color: #111827 !important;
  display: block; /* Osigurava da se ponaša kao block element */
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 1.8rem !important;
  }
}
</style>