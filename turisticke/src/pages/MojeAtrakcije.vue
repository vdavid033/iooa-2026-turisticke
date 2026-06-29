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
          Pregled atrakcija koje si dodao
        </p>
      </div>

      <div v-if="!korisnik" class="text-center q-py-xl">
        <q-icon name="lock" size="90px" color="grey-4" />
        <p class="text-h5 text-grey-6 q-mt-md text-weight-light">
          Moraš biti prijavljen kako bi vidio svoje atrakcije.
        </p>
        <q-btn
          unelevated
          rounded
          color="primary"
          label="Prijava"
          icon="login"
          no-caps
          to="/auth?mode=login"
          class="q-mt-sm"
        />
      </div>

      <main v-else class="q-pb-xl">
        <div v-if="ucitavanje" class="text-center q-py-xl">
          <q-spinner color="primary" size="48px" />
        </div>

        <div v-else-if="mojeAtrakcije.length > 0" class="row q-col-gutter-xl">
          <div
            v-for="attraction in mojeAtrakcije"
            :key="attraction.id_atrakcije"
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card
              class="attraction-card shadow-15 cursor-pointer"
              @click="otvoriDetalje(attraction.id_atrakcije)"
            >
              <q-img :src="attraction.slika" :ratio="16/9" class="rounded-borders">
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

              <q-card-actions align="right" class="q-pa-md q-gutter-sm">
                <q-btn
                  flat
                  color="primary"
                  label="Uredi"
                  icon="edit"
                  no-caps
                  @click.stop="otvoriUredi(attraction.id_atrakcije)"
                />
                <q-btn flat color="primary" label="Pogledaj detalje" icon-right="arrow_forward" no-caps />
              </q-card-actions>
            </q-card>
          </div>
        </div>

        <div v-else class="text-center q-py-xl">
          <q-icon name="explore_off" size="100px" color="grey-4" />
          <p class="text-h5 text-grey-6 q-mt-md text-weight-light">
            Još nisi dodao nijednu atrakciju.
          </p>
          <q-btn
            unelevated
            rounded
            color="primary"
            label="Dodaj atrakciju"
            icon="add_location_alt"
            no-caps
            to="/unos"
            class="q-mt-sm"
          />
        </div>
      </main>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const mojeAtrakcije = ref([])
const ucitavanje = ref(false)
const korisnik = ref(null)

const procitajKorisnika = () => {
  try {
    korisnik.value = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    korisnik.value = null
  }
}

const dohvatiMojeAtrakcije = async () => {
  if (!korisnik.value?.id) {
    return
  }

  ucitavanje.value = true

  try {
    const response = await api.get('/atrakcije', {
      params: {
        id_korisnika: korisnik.value.id,
      },
    })

    mojeAtrakcije.value = Array.isArray(response.data) ? response.data : []
  } catch (error) {
    console.error('Greška pri dohvatu mojih atrakcija:', error)
  } finally {
    ucitavanje.value = false
  }
}

const otvoriDetalje = (id) => {
  router.push({ name: 'one_atraction', params: { id } })
}

const otvoriUredi = (id) => {
  router.push({ name: 'UrediMojuAtrakciju', params: { id } })
}

onMounted(() => {
  procitajKorisnika()
  dohvatiMojeAtrakcije()
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
