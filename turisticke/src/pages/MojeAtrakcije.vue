<template>
  <q-page class="bg-grey-1 q-pt-md">
    <div class="max-w-7xl mx-auto q-px-md">

      <div class="row items-center q-mb-sm">
        <q-btn
          flat
          no-caps
          color="primary"
          icon="arrow_back"
          label="Natrag na početnu"
          to="/"
          class="q-px-none hover-opacity"
        />
      </div>

      <div class="text-center q-mb-lg">
        <h1 class="text-h3 text-primary text-weight-bold q-margin-none">
          Moje atrakcije
        </h1>
        <p class="text-subtitle1 text-grey-7 q-mt-sm">
          Spremi atrakcije koje te zanimaju klikom na ❤️
        </p>
      </div>

      <!-- Prebacivanje između omiljenih i svih atrakcija -->
      <div class="row justify-center q-mb-xl">
        <q-btn-toggle
          v-model="prikaz"
          no-caps
          rounded
          unelevated
          toggle-color="primary"
          color="white"
          text-color="primary"
          class="shadow-2"
          :options="[
            { label: `Omiljene (${favoriti.length})`, value: 'omiljene', icon: 'favorite' },
            { label: 'Sve atrakcije', value: 'sve', icon: 'place' }
          ]"
        />
      </div>

      <main class="q-pb-xl">
        <div v-if="prikazaneAtrakcije.length > 0" class="row q-col-gutter-xl">
          <div
            v-for="attraction in prikazaneAtrakcije"
            :key="attraction.id_atrakcije"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card
              class="attraction-card shadow-15 cursor-pointer"
              @click="otvoriDetalje(attraction.id_atrakcije)"
            >
              <q-img :src="attraction.slika" :ratio="16/9" class="rounded-borders">
                <!-- Gumb za spremanje u omiljeno -->
                <div class="absolute-top-left q-ma-sm" style="background: transparent">
                  <q-btn
                    round
                    dense
                    :color="jeOmiljena(attraction.id_atrakcije) ? 'red-5' : 'white'"
                    :text-color="jeOmiljena(attraction.id_atrakcije) ? 'white' : 'red-5'"
                    :icon="jeOmiljena(attraction.id_atrakcije) ? 'favorite' : 'favorite_border'"
                    class="shadow-2"
                    @click.stop="prebaciOmiljeno(attraction.id_atrakcije)"
                  >
                    <q-tooltip>
                      {{ jeOmiljena(attraction.id_atrakcije) ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene' }}
                    </q-tooltip>
                  </q-btn>
                </div>

                <div class="absolute-top-right q-ma-sm" style="background: transparent">
                  <q-badge color="orange" text-color="white" class="q-pa-xs text-bold shadow-2">
                    <q-icon name="star" size="14px" class="q-mr-xs" />
                    {{ attraction.prosjecna_ocjena ? Number(attraction.prosjecna_ocjena).toFixed(1) : '0.0' }}
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
                <div class="text-body2 text-grey-7 q-mt-sm ellipsis-3-lines">
                  {{ attraction.opis }}
                </div>
              </q-card-section>

              <q-space />
              <q-separator inset />

              <q-card-actions align="right" class="q-pa-md">
                <q-btn flat color="primary" label="Pogledaj detalje" icon-right="arrow_forward" no-caps />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <!-- Prazno stanje za omiljene -->
        <div v-else-if="prikaz === 'omiljene'" class="text-center q-py-xl">
          <q-icon name="favorite_border" size="100px" color="grey-4" />
          <p class="text-h5 text-grey-6 q-mt-md text-weight-light">
            Još nemaš spremljenih atrakcija
          </p>
          <q-btn
            unelevated
            rounded
            color="primary"
            label="Pregledaj sve atrakcije"
            icon="place"
            no-caps
            @click="prikaz = 'sve'"
            class="q-mt-sm"
          />
        </div>

        <!-- Prazno stanje kad uopće nema atrakcija -->
        <div v-else class="text-center q-py-xl">
          <q-icon name="explore_off" size="100px" color="grey-4" />
          <p class="text-h5 text-grey-6 q-mt-md text-weight-light">
            Trenutno nema dostupnih atrakcija
          </p>
        </div>
      </main>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const atrakcije = ref([])
const favoriti = ref([])
const prikaz = ref('omiljene')

// Favoriti se spremaju po korisniku (ili "gost" ako nije prijavljen)
const korisnik = JSON.parse(localStorage.getItem('user') || 'null')
const kljucFavorita = `omiljeneAtrakcije_${korisnik?.id ?? 'gost'}`

const ucitajFavorite = () => {
  try {
    favoriti.value = JSON.parse(localStorage.getItem(kljucFavorita) || '[]')
  } catch {
    favoriti.value = []
  }
}

const spremiFavorite = () => {
  localStorage.setItem(kljucFavorita, JSON.stringify(favoriti.value))
}

const jeOmiljena = (id) => favoriti.value.includes(id)

const prebaciOmiljeno = (id) => {
  if (jeOmiljena(id)) {
    favoriti.value = favoriti.value.filter((x) => x !== id)
  } else {
    favoriti.value = [...favoriti.value, id]
  }
  spremiFavorite()
}

const dohvatiAtrakcije = async () => {
  try {
    const response = await axios.get('http://localhost:4200/atrakcije')
    atrakcije.value = response.data
  } catch (error) {
    console.error('Greška pri dohvatu atrakcija:', error)
  }
}

const prikazaneAtrakcije = computed(() => {
  if (prikaz.value === 'omiljene') {
    return atrakcije.value.filter((a) => favoriti.value.includes(a.id_atrakcije))
  }
  return atrakcije.value
})

const otvoriDetalje = (id) => {
  router.push({ name: 'one_atraction', params: { id } })
}

onMounted(() => {
  ucitajFavorite()
  dohvatiAtrakcije()
  // Ako nema spremljenih, odmah pokaži sve da korisnik može dodavati
  if (favoriti.value.length === 0) {
    prikaz.value = 'sve'
  }
})
</script>

<style lang="scss" scoped>
.max-w-7xl {
  max-width: 1200px;
  margin: 0 auto;
}

.attraction-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12) !important;
  }
}

.bg-black-opacity {
  background: rgba(0, 0, 0, 0.45) !important;
}

.ellipsis-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hover-opacity:hover {
  opacity: 0.7;
}
</style>
