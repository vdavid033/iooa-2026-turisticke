<template>
  <q-page class="bg-grey-1 q-pa-md">
    <div class="max-w-7xl mx-auto">
      <div class="row items-center justify-between q-mb-md">
        <div>
          <h1 class="text-h4 text-primary text-weight-bold q-ma-none">
            Karta atrakcija
          </h1>
          <p class="text-grey-7 q-mt-sm q-mb-none">
            Pregled svih atrakcija na karti. Klikom na marker otvara se mali prozor s detaljima atrakcije.
          </p>
        </div>

        <q-btn
          unelevated
          rounded
          color="primary"
          icon="arrow_back"
          label="Natrag"
          to="/"
          no-caps
        />
      </div>

      <q-card flat bordered class="q-pa-md rounded-borders">
        <div id="map" class="map-container"></div>
      </q-card>

      <div v-if="loading" class="text-center q-mt-md text-grey-7">
        Učitavanje atrakcija...
      </div>

      <div v-if="errorMessage" class="text-center q-mt-md text-negative">
        {{ errorMessage }}
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()

const attractions = ref([])
const loading = ref(false)
const errorMessage = ref('')

let map = null
let markersLayer = null

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const getAttractionsWithCoords = () => {
  return attractions.value.filter((attr) => {
    return (
      attr.geografska_sirina !== null &&
      attr.geografska_duzina !== null &&
      attr.geografska_sirina !== '' &&
      attr.geografska_duzina !== '' &&
      !isNaN(parseFloat(attr.geografska_sirina)) &&
      !isNaN(parseFloat(attr.geografska_duzina))
    )
  })
}

const initMap = () => {
  if (map) return

  map = L.map('map').setView([45.3271, 14.4422], 10)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)
}

const renderMarkers = () => {
  if (!map || !markersLayer) return

  markersLayer.clearLayers()

  const attractionsWithCoords = getAttractionsWithCoords()
  const bounds = []

  attractionsWithCoords.forEach((attr) => {
    const lat = parseFloat(attr.geografska_sirina)
    const lng = parseFloat(attr.geografska_duzina)

    const shortOpis = attr.opis
      ? attr.opis.length > 120
        ? attr.opis.substring(0, 120) + '...'
        : attr.opis
      : 'Nema opisa za ovu atrakciju.'

    const popupContent = `
      <div class="popup-card">
        <img
          src="${attr.slika || 'https://via.placeholder.com/250x140?text=Atrakcija'}"
          alt="${attr.naziv || 'Atrakcija'}"
          class="popup-image"
        />
        <div class="popup-title">${attr.naziv ?? 'Atrakcija'}</div>
        <div class="popup-address">${attr.adresa ?? ''}</div>
        <div class="popup-description">${shortOpis}</div>
        <button class="popup-btn" data-id="${attr.id_atrakcije}">
          Otvori stranicu atrakcije
        </button>
      </div>
    `

    const marker = L.marker([lat, lng]).addTo(markersLayer)

    marker.bindPopup(popupContent, { maxWidth: 280 })

    marker.on('popupopen', () => {
      setTimeout(() => {
        const button = document.querySelector(`.popup-btn[data-id="${attr.id_atrakcije}"]`)
        if (button) {
          button.addEventListener('click', () => {
            router.push({
              name: 'one_atraction',
              params: { id: attr.id_atrakcije }
            })
          })
        }
      }, 0)
    })

    bounds.push([lat, lng])
  })

  if (bounds.length === 1) {
    map.setView(bounds[0], 13)
  } else if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [40, 40] })
  }
}

const fetchAttractions = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.get('http://localhost:4200/atrakcije')
    attractions.value = response.data

    await nextTick()
    initMap()
    renderMarkers()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Greška pri dohvaćanju atrakcija.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAttractions()
})
</script>

<style scoped>
.max-w-7xl {
  max-width: 1200px;
  margin: 0 auto;
}

.map-container {
  width: 100%;
  height: 600px;
  border-radius: 16px;
  overflow: hidden;
}

.rounded-borders {
  border-radius: 16px;
}

:deep(.popup-card) {
  width: 240px;
  font-family: Arial, sans-serif;
}

:deep(.popup-image) {
  width: 100%;
  height: 130px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 8px;
}

:deep(.popup-title) {
  font-size: 16px;
  font-weight: bold;
  color: #4f46e5;
  margin-bottom: 4px;
}

:deep(.popup-address) {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

:deep(.popup-description) {
  font-size: 13px;
  color: #333;
  margin-bottom: 12px;
  line-height: 1.4;
}

:deep(.popup-btn) {
  width: 100%;
  border: none;
  background: #fbbf24;
  color: #000;
  padding: 10px 12px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
}

:deep(.popup-btn:hover) {
  background: #f59e0b;
}
</style>