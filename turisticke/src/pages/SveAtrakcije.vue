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

      <div class="text-center q-mb-xl">
        <h1 class="text-h3 text-primary text-weight-bold q-margin-none">
          Sve Atrakcije
        </h1>
      </div>

      <div class="row justify-center q-mb-xl">
        <div class="col-12 col-md-7">
          <q-input
            v-model="searchQuery"
            rounded
            outlined
            placeholder="Pretraži atrakcije po nazivu ili lokaciji..."
            bg-color="white"
            class="search-input shadow-2"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
            <template v-slot:append v-if="searchQuery">
              <q-icon 
                name="close" 
                @click="searchQuery = ''" 
                class="cursor-pointer" 
              />
            </template>
          </q-input>
        </div>
      </div>

      <main class="q-pb-xl">
        <div v-if="filteredAttractions.length > 0" class="row q-col-gutter-xl">
          <div 
            v-for="attraction in filteredAttractions" 
            :key="attraction.id_atrakcije" 
            class="col-12 col-sm-6 col-md-4"
          >
            <q-card 
              class="attraction-card shadow-15 cursor-pointer"
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

        <div v-else class="text-center q-py-xl">
          <q-icon name="explore_off" size="100px" color="grey-4" />
          <p class="text-h5 text-grey-6 q-mt-md text-weight-light">
            Nažalost, nismo pronašli atrakciju pod nazivom "{{ searchQuery }}"
          </p>
          <q-btn 
            flat 
            color="primary" 
            label="Prikaži sve atrakcije" 
            @click="searchQuery = ''" 
            class="q-mt-sm"
          />
        </div>
      </main>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

const searchQuery = ref('')
const attractions = ref([])

const fetchAttractions = async () => {
  try {
    const response = await axios.get('http://localhost:4200/atrakcije')
    attractions.value = response.data
    console.log("Ukupno učitano atrakcija:", attractions.value.length)
  } catch (error) {
    console.error("Greška pri dohvatu podataka s backenda:", error)
  }
}

const filteredAttractions = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return attractions.value
  
  return attractions.value.filter(attr => 
    attr.naziv.toLowerCase().includes(query) || 
    (attr.opis && attr.opis.toLowerCase().includes(query)) ||
    (attr.adresa && attr.adresa.toLowerCase().includes(query))
  )
})

onMounted(() => {
  fetchAttractions()
})
</script>

<style lang="scss" scoped>
.max-w-7xl {
  max-width: 1200px;
  margin: 0 auto;
}

.search-input {
  transition: transform 0.3s ease;
  &:focus-within {
    transform: translateY(-2px);
  }
}

.attraction-card {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.12) !important;
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