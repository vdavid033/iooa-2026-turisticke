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

      <div class="text-center q-mt-lg q-mb-lg">
        <h1 class="text-h3 text-primary text-weight-bold q-margin-none">
          Uređivanje atrakcije
        </h1>
      </div>

      <div v-if="ucitavanje" class="text-center q-py-xl">
        <q-spinner color="primary" size="48px" />
      </div>

      <div v-else-if="statusPoruka" class="text-center q-py-xl">
        <q-icon name="lock" size="90px" color="grey-4" />
        <p class="text-h5 text-grey-6 q-mt-md text-weight-light">
          {{ statusPoruka }}
        </p>
        <q-btn
          v-if="!korisnik"
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

      <div v-else class="row q-col-gutter-lg q-pb-xl">
        <div class="col-12 col-md-7">
          <q-card class="edit-card shadow-4">
            <q-card-section>
              <div class="text-h6 text-primary text-weight-bold">
                Podaci atrakcije
              </div>
            </q-card-section>

            <q-card-section class="q-gutter-md">
              <q-input v-model="forma.naziv" label="Naziv atrakcije" filled />
              <q-input v-model="forma.opis" label="Opis atrakcije" filled type="textarea" />
              <q-input v-model="forma.adresa" label="Adresa" filled />
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <q-input v-model="forma.geografska_sirina" label="Geografska širina" filled />
                </div>
                <div class="col-12 col-sm-6">
                  <q-input v-model="forma.geografska_duzina" label="Geografska dužina" filled />
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat color="grey" label="Odustani" no-caps @click="otvoriDetalje" />
              <q-btn color="primary" label="Spremi promjene" no-caps @click="spremiPodatke" />
            </q-card-actions>
          </q-card>
        </div>

        <div class="col-12 col-md-5">
          <q-card class="edit-card shadow-4">
            <q-card-section>
              <div class="text-h6 text-primary text-weight-bold">
                Slika atrakcije
              </div>
            </q-card-section>

            <q-card-section class="q-gutter-md">
              <q-img
                v-if="forma.slika"
                :src="forma.slika"
                :ratio="16/9"
                class="rounded-borders"
              />
              <div v-else class="image-placeholder flex flex-center text-grey-6">
                Nema spremljene slike
              </div>

              <q-input v-model="forma.slika" label="Link nove slike" filled />
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md q-gutter-sm">
              <q-btn flat color="negative" label="Obriši sliku" icon="delete" no-caps @click="obrisiSliku" />
              <q-btn color="primary" label="Spremi sliku" icon="image" no-caps @click="spremiSliku" />
            </q-card-actions>
          </q-card>

          <q-card class="edit-card shadow-4 q-mt-lg">
            <q-card-section>
              <div class="text-h6 text-primary text-weight-bold">
                Dodatne akcije
              </div>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md q-gutter-sm">
              <q-btn flat color="warning" label="Resetiraj ocjene" icon="star_outline" no-caps @click="resetirajOcjene" />
              <q-btn flat color="negative" label="Obriši atrakciju" icon="delete" no-caps @click="obrisiAtrakciju" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const idAtrakcije = route.params.id
const korisnik = ref(null)
const ucitavanje = ref(true)
const statusPoruka = ref('')

const forma = ref({
  naziv: '',
  opis: '',
  adresa: '',
  geografska_sirina: '',
  geografska_duzina: '',
  slika: '',
  prosjecna_ocjena: 0,
})

const procitajKorisnika = () => {
  try {
    korisnik.value = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    korisnik.value = null
  }
}

const ucitajAtrakciju = async () => {
  procitajKorisnika()

  if (!korisnik.value?.id) {
    statusPoruka.value = 'Moraš biti prijavljen kako bi uređivao atrakciju.'
    ucitavanje.value = false
    return
  }

  try {
    const response = await api.get(`/atrakcije/${idAtrakcije}`)
    const atrakcija = response.data?.data

    if (!atrakcija) {
      statusPoruka.value = 'Atrakcija ne postoji.'
      return
    }

    if (Number(atrakcija.id_korisnika) !== Number(korisnik.value.id)) {
      statusPoruka.value = 'Nemaš pravo uređivati ovu atrakciju.'
      return
    }

    forma.value = {
      naziv: atrakcija.naziv || '',
      opis: atrakcija.opis || '',
      adresa: atrakcija.adresa || '',
      geografska_sirina: atrakcija.geografska_sirina || '',
      geografska_duzina: atrakcija.geografska_duzina || '',
      slika: atrakcija.slika || '',
      prosjecna_ocjena: atrakcija.prosjecna_ocjena || 0,
    }
  } catch (error) {
    console.error(error)
    statusPoruka.value = 'Greška pri dohvaćanju atrakcije.'
  } finally {
    ucitavanje.value = false
  }
}

const otvoriDetalje = () => {
  router.push({ name: 'one_atraction', params: { id: idAtrakcije } })
}

const spremiPodatke = async () => {
  if (!forma.value.naziv || !forma.value.opis) {
    alert('Naziv i opis atrakcije su obavezni.')
    return
  }

  try {
    await api.put(`/atrakcije/azuriraj/${idAtrakcije}`, {
      naziv: forma.value.naziv,
      opis: forma.value.opis,
      slika: forma.value.slika,
      prosjecna_ocjena: forma.value.prosjecna_ocjena,
      geografska_sirina: forma.value.geografska_sirina,
      geografska_duzina: forma.value.geografska_duzina,
      adresa: forma.value.adresa,
      id_korisnika: korisnik.value.id,
    })

    alert('Atrakcija je uspješno uređena.')
    otvoriDetalje()
  } catch (error) {
    console.error(error)
    alert('Greška pri uređivanju atrakcije.')
  }
}

const spremiSliku = async () => {
  try {
    await api.put(`/dodajSliku/${idAtrakcije}`, {
      slika: forma.value.slika,
      id_korisnika: korisnik.value.id,
    })

    alert('Slika je uspješno spremljena.')
    await ucitajAtrakciju()
  } catch (error) {
    console.error(error)
    alert('Greška pri spremanju slike.')
  }
}

const obrisiSliku = async () => {
  try {
    await api.delete(`/obrisi_sliku_atrakcije/${idAtrakcije}`, {
      params: { id_korisnika: korisnik.value.id },
    })

    forma.value.slika = ''
    alert('Slika je obrisana.')
  } catch (error) {
    console.error(error)
    alert('Greška pri brisanju slike.')
  }
}

const resetirajOcjene = async () => {
  try {
    await api.delete(`/obrisi_ocjenu_atrakcije/${idAtrakcije}`, {
      params: { id_korisnika: korisnik.value.id },
    })

    forma.value.prosjecna_ocjena = 0
    alert('Ocjene su resetirane.')
  } catch (error) {
    console.error(error)
    alert('Greška pri resetiranju ocjene.')
  }
}

const obrisiAtrakciju = async () => {
  const potvrda = confirm('Jeste li sigurni da želite obrisati ovu atrakciju?')

  if (!potvrda) {
    return
  }

  try {
    await api.delete(`/atrakcije/obrisi/${idAtrakcije}/${korisnik.value.id}`)

    alert('Atrakcija je obrisana.')
    router.push('/moje-atrakcije')
  } catch (error) {
    console.error(error)
    alert('Greška pri brisanju atrakcije.')
  }
}

onMounted(() => {
  ucitajAtrakciju()
})
</script>

<style scoped>
.max-w-7xl {
  max-width: 1200px;
  margin: 0 auto;
}

.edit-card {
  border-radius: 16px;
}

.image-placeholder {
  min-height: 220px;
  border: 1px dashed #bdbdbd;
  border-radius: 16px;
  background: #fafafa;
}

.hover-opacity:hover {
  opacity: 0.7;
}
</style>
