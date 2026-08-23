<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2">
    <!-- Gornja navigacija (Ljubičasta kao na slici) -->
    <q-header flat class="bg-purple-9 text-white">
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.push('/')" label="Natrag" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page v-for="post in posts" :key="post.id" class="q-pb-xl">

        <!-- HERO SEKCIJA: Velika slika s naslovom -->
        <div class="relative-position shadow-5" style="height: 450px; overflow: hidden">
          <q-img :src="post.slika" class="full-height">
            <div class="absolute-full flex flex-center" style="background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))">
              <div class="absolute-bottom q-pa-xl text-white">
                <div class="text-h2 text-weight-bold" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5)">{{ post.naziv }}</div>
                <div class="row items-center q-gutter-sm q-mt-sm">
                  <q-icon name="place" size="xs" color="orange-4" />
                  <span class="text-subtitle1">{{ post.adresa }}</span>
                  <q-rating :model-value="Number(post.avg_ocjena)" readonly size="20px" color="orange-4" class="q-ml-md" />
                  <span class="text-caption">({{ post.avg_ocjena }} recenzija)</span>
                </div>

                <!-- Admin kontrole skrivene u gumbu na slici -->
                <div class="q-mt-md">
                  <q-btn-dropdown v-if="jeVlasnik(post)" outline color="white" label="Uredi Atrakciju" icon="edit" dense>
                    <q-list style="min-width: 250px">
                      <q-item
                        v-if="user && Number(user.id) === Number(post.id_korisnika)"
                        clickable
                        v-close-popup
                        @click="otvoriUrediAtrakciju(post)">
                        <q-item-section avatar>
                          <q-icon name="edit" />
                        </q-item-section>
                        <q-item-section>Uredi podatke atrakcije</q-item-section>
                      </q-item>

                    <q-item
                      v-if="user && Number(user.id) === Number(post.id_korisnika)"
                       clickable
                        v-close-popup
                        @click="obrisiAtrakciju(post.id_atrakcije)">
                      <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                      </q-item-section>
                      <q-item-section>Obriši atrakciju</q-item-section>
                    </q-item>

                    <q-separator />

                      <q-separator />

                      
                      <q-separator />
                      
                      
                    </q-list>
                  </q-btn-dropdown>
                </div>
              </div>
            </div>
          </q-img>
        </div>

        <!-- GLAVNI SADRŽAJ -->
        <div class="q-px-md q-mt-xl row justify-center">
          <div class="col-12 col-md-8 col-lg-7">

            <!-- BIJELA KARTICA: O Atrakciji -->
            <q-card flat bordered class="rounded-borders q-pa-lg shadow-1 bg-white">
              <div class="text-h5 text-purple-9 text-weight-bold q-mb-md">O Atrakciji</div>
              <div class="text-body1 text-grey-9 line-height-relaxed">
                {{ post.opis }}

              <q-separator class="q-my-lg" />

              <div v-if="slikeAtrakcije.length">
                <div class="text-h5 text-purple-9 text-weight-bold q-mb-md">
                  Fotografije posjetitelja
                </div>

                <div class="row q-col-gutter-md">
                  <div
                    v-for="slika in slikeAtrakcije"
                    :key="slika.id_slike"
                    class="col-12 col-sm-6 col-md-4"
                  >
                    <q-card flat bordered>
                      <q-img
                        :src="slika.slika_s"
                        style="height:250px"
                        fit="cover"
                        class="cursor-pointer"
                        @click="otvoriSliku(slika.slika_s)"
                      />
                    </q-card>
                  </div>
                </div>
              </div>
              </div>

              <q-separator class="q-my-lg" />

              <div class="row q-col-gutter-md">
                <div class="col-6">
                  <div class="text-caption text-grey-7 text-uppercase text-weight-bold">Geografska širina</div>
                  <div class="text-subtitle1 text-weight-medium">{{ post.geografska_sirina }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-7 text-uppercase text-weight-bold">Geografska dužina</div>
                  <div class="text-subtitle1 text-weight-medium">{{ post.geografska_duzina }}</div>
                </div>
              </div>
            </q-card>

            <!-- RECENZIJE SEKCIJA -->
            <div class="q-mt-xl">
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h5 text-purple-9 text-weight-bold">Recenzije</div>
                <div class="row items-center q-gutter-xs">
                  <q-icon name="star" color="orange-4" size="md" />
                  <span class="text-h5 text-weight-bold">{{ post.avg_ocjena }}</span>
                  <span class="text-grey-7">/ 5</span>
                </div>
              </div>

              <!-- PLAVA/LJUBIČASTA KARTICA: Forma za komentar (kao na slici) -->
              <q-card flat bordered class="bg-blue-0 q-pa-lg q-mb-xl rounded-borders" style="background-color: #f8f9ff">
                <div class="text-subtitle1 text-purple-9 text-weight-bold q-mb-md">Ostavi svoju recenziju</div>

                <div class="q-mb-md">
                  <div class="text-caption text-grey-8 q-mb-xs">Ocjena</div>
                  <q-btn-dropdown color="orange-4" :label="odabranaOcjena ? `${odabranaOcjena} / 5` : 'Odaberi ocjenu'" unelevated text-color="black">
                    <q-list>
                      <q-item v-for="n in 5" :key="n" clickable v-close-popup @click="dodajOcjenu(n)">
                        <q-item-section>{{ n }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>

                <q-input
  v-model="komentar"
  outlined
  type="textarea"
  autogrow
  label="Dodaj detaljan komentar..."
  class="q-mb-md"
/>

<q-btn
  color="orange-4"
  text-color="black"
  label="Dodaj komentar"
  class="text-weight-bold q-px-lg"
  unelevated
  @click="dodajKomentar(komentar, post.id_atrakcije)"
/>

<div v-if="message" class="text-positive q-mt-sm">
  {{ message }}
</div>
              </q-card>

              <!-- LISTA KOMENTARA -->
              <div class="text-subtitle2 text-grey-7 q-mb-md">Ovdje možete pogledati komentare o atrakciji</div>
              <div class="q-gutter-y-md">
                <q-card v-for="item in comments" :key="item.ID_komentara" flat bordered class="rounded-borders q-pa-md bg-white">
                  <div class="row items-center justify-between">
                    <div class="row items-center q-gutter-sm">
                      <q-avatar size="40px">
                        <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                      </q-avatar>
                      <div>
                        <div class="text-weight-bold text-primary">
                          {{ item.korisnicko_ime || 'Nepoznati korisnik' }}
                        </div>
                        <div v-if="ocjenaKomentara(item) > 0" class="row items-center q-gutter-xs">
                          <q-rating :model-value="ocjenaKomentara(item)" readonly size="14px" color="orange-4" />
                          <span class="text-caption text-grey-7">{{ ocjenaKomentara(item) }}/5</span>
                        </div>
                        <div v-else class="text-caption text-grey-6">
                          Nema ocjene
                        </div>
                      </div>
                    </div>
                    <div class="text-caption text-grey">
                      <q-icon name="event" class="q-mr-xs" /> Danas
                    </div>
                  </div>
                  <div class="q-mt-sm text-grey-9 text-body2">
                    {{ item.Komentar }}
                  </div>
                </q-card>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>

    <!-- FOOTER (Tamni kao na slici)
   <q-footer absolute class="bg-blue-grey-10 q-pa-lg text-center">
      <div class="text-subtitle2 text-blue-2">Otkrijte ljepotu Hrvatske na svoj način</div>
      <div class="text-caption text-blue-grey-4 q-mt-xs">
        © 2026 Hrvatska Turistička Atrakcija. Sva prava pridržana.
      </div>
    </q-footer>-->
<q-dialog v-model="editDialog">
  <q-card style="min-width: 400px">
    <q-card-section>
      <div class="text-h6">Uredi atrakciju</div>
    </q-card-section>

    <q-card-section class="q-gutter-md">
      <q-input v-model="editForm.naziv" label="Naziv atrakcije" filled />
      <q-input v-model="editForm.opis" label="Opis atrakcije" filled type="textarea" />
      <q-input v-model="editForm.slika" label="Naslovna slika (link)" filled />
      <q-file
        v-model="novaSlikaUredivanja"
        filled
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        label="Odaberi novu sliku s računala"
        @update:model-value="odaberiSlikuZaUredivanje"
      >
        <template #prepend>
          <q-icon name="upload" />
        </template>
      </q-file>

      <q-img v-if="editForm.slika" :src="editForm.slika" :ratio="16/9" class="rounded-borders"/>
      <q-input v-model="editForm.adresa" label="Adresa" filled />
      <q-input v-model="editForm.geografska_sirina" label="Geografska širina" filled />
      <q-input v-model="editForm.geografska_duzina" label="Geografska dužina" filled />
    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat label="Odustani" color="grey" v-close-popup />
      <q-btn label="Spremi promjene" color="primary" @click="spremiUredenuAtrakciju" />
    </q-card-actions>
  </q-card>
</q-dialog>

<q-dialog v-model="dialog">
  <q-card style="width:90vw;max-width:1200px;background:black;">
    <q-img :src="selectedImage" fit="contain" style="height:80vh" />
  </q-card>
</q-dialog>

</q-layout>
</template>

<script setup>

import { ref, onMounted } from "vue"
import { api } from 'boot/axios'
import { useRoute, useRouter } from 'vue-router';

const posts = ref([])
const comments = ref([])
const slikeAtrakcije = ref([])
const dialog = ref(false)
const selectedImage = ref("")
const name = ref("") // Za input linka slike
const route = useRoute()
const router = useRouter()
const komentar = ref('')
const odabranaOcjena = ref(null)
const message = ref('')
const user = ref(JSON.parse(localStorage.getItem("user")))
const novaSlikaUredivanja = ref(null)

const trenutniID = route.params.id

const jeVlasnik = (post) => {
  return user.value && Number(user.value.id) === Number(post.id_korisnika)
}

const dohvatiSlikeAtrakcije = async () => {
  try {
    const response = await api.get(`/dohvatiSlikeAtrakcije/${trenutniID}`)
    slikeAtrakcije.value = response.data
  } catch (error) {
    console.log(error)
  }
}

const otvoriSliku = (src) => {
  selectedImage.value = src
  dialog.value = true
}

const getPosts = async () => {
  try {
    const response = await api.get(`/atrakcije/${trenutniID}`)
    posts.value = response.data
    console.log("USER IZ LOCALSTORAGE:", user.value)
    console.log("ATRAKCIJA:", posts.value)
    const komentari = await api.get(`/komentari/${trenutniID}`)
    comments.value = komentari.data.data
    await dohvatiSlikeAtrakcije()
  } catch (error) {
    console.log(error)
  }
}

const spremiSliku = async (link, id) => {
  try {
    await api.put(`http://localhost:4200/dodajSliku/${id}`, {
      slika: link,
      id_korisnika: user.value.id
    });
    getPosts();
  } catch (error) {
    console.log(error);
  }
}

const dodajOcjenu = (ocjena) => {
  odabranaOcjena.value = ocjena
}

const ocjenaKomentara = (item) => {
  const ocjena = Number(item.ocjena)
  return Number.isInteger(ocjena) && ocjena >= 1 && ocjena <= 5 ? ocjena : 0
}

const obrisi_sliku = async (id) => {
  try {
    await api.delete(`http://localhost:4200/obrisi_sliku_atrakcije/${id}`, {
      params: { id_korisnika: user.value.id }
    });
    getPosts();
  } catch (error) {
    console.log(error);
  }
}

const deleteOcjena = async (id) => {
  try {
    await api.delete(`http://localhost:4200/obrisi_ocjenu_atrakcije/${id}`, {
      params: { id_korisnika: user.value.id }
    });
    getPosts();
  } catch (error) {
    console.log(error);
  }
}
const otvoriUrediAtrakciju = (post) => {
  const user = JSON.parse(localStorage.getItem("user"))

  if (!user) {
    alert("Morate biti prijavljeni kako biste uredili atrakciju.")
    router.push("/auth")
    return
  }

  editForm.value = {
    id_atrakcije: post.id_atrakcije,
    naziv: post.naziv,
    opis: post.opis,
    slika: post.slika,
    prosjecna_ocjena: post.prosjecna_ocjena,
    geografska_sirina: post.geografska_sirina,
    geografska_duzina: post.geografska_duzina,
    adresa: post.adresa
  }
  novaSlikaUredivanja.value = null

  editDialog.value = true
}

const procitajSlikuKaoBase64 = (datoteka) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      resolve(reader.result)
      return
    }

    reject(new Error('Preglednik nije uspio pročitati odabranu sliku.'))
  }
  reader.onerror = () => reject(reader.error || new Error('Preglednik nije uspio pročitati odabranu sliku.'))
  reader.readAsDataURL(datoteka)
})

const odaberiSlikuZaUredivanje = async (datoteka) => {
  const slika = Array.isArray(datoteka) ? datoteka[0] : datoteka

  if (!slika) {
    return
  }

  const nazivDatoteke = String(slika.name || '')
  const tipDatoteke = String(slika.type || '').toLowerCase()
  const jePodrzanaSlika = ['image/jpeg', 'image/png'].includes(tipDatoteke)
    || /\.(jpe?g|png)$/i.test(nazivDatoteke)

  if (!jePodrzanaSlika) {
    novaSlikaUredivanja.value = null
    alert('Odaberite JPEG ili PNG sliku.')
    return
  }

  if (slika.size > 5 * 1024 * 1024) {
    novaSlikaUredivanja.value = null
    alert('Slika može imati najviše 5 MB.')
    return
  }

  try {
    editForm.value.slika = await procitajSlikuKaoBase64(slika)
  } catch (error) {
    console.error(error)
    novaSlikaUredivanja.value = null
    alert(error?.message || 'Došlo je do pogreške prilikom učitavanja slike.')
  }
}

const spremiUredenuAtrakciju = async () => {
  if (!user.value?.id) {
    alert("Morate biti prijavljeni kako biste uredili atrakciju.")
    router.push("/auth")
    return
  }

  if (!editForm.value.naziv || !editForm.value.opis) {
    alert("Naziv i opis atrakcije su obavezni.")
    return
  }

  try {
    await api.put(`/atrakcije/azuriraj/${editForm.value.id_atrakcije}`, {
      naziv: editForm.value.naziv,
      opis: editForm.value.opis,
      slika: editForm.value.slika,
      prosjecna_ocjena: editForm.value.prosjecna_ocjena,
      geografska_sirina: editForm.value.geografska_sirina,
      geografska_duzina: editForm.value.geografska_duzina,
      adresa: editForm.value.adresa,
      id_korisnika: user.value.id
    })

    editDialog.value = false
    novaSlikaUredivanja.value = null
    await getPosts()

    alert("Atrakcija je uspješno uređena.")
  } catch (error) {
    console.log(error)
    alert("Greška pri uređivanju atrakcije.")
  }
}

const obrisiAtrakciju = async (id_atrakcije) => {
  const potvrda = confirm("Jeste li sigurni da želite obrisati ovu atrakciju?")

  if (!potvrda) {
    return
  }

  try {
    await api.delete(`/atrakcije/obrisi/${id_atrakcije}/${user.value.id}`)

    alert("Atrakcija je uspješno obrisana.")
    router.push("/atrakcije")
  } catch (error) {
    console.log(error)
    alert("Greška pri brisanju atrakcije.")
  }
}

onMounted(() => {
  getPosts()
})


const dodajKomentar = async (komentarTekst, id) => {
  if (!komentarTekst) {
    alert("Komentar je obavezan.")
    return
  }

  if (!odabranaOcjena.value) {
    alert("Odaberite ocjenu od 1 do 5.")
    return
  }

  try {
    await api.post(`http://localhost:4200/dodajKomentar/${id}`, {
      Komentar: komentarTekst,
      ocjena: odabranaOcjena.value,
      id_korisnika: user.value?.id
    });


    komentar.value = ''
    odabranaOcjena.value = null

    // refresh komentara odmah
    const komentari = await api.get(`/komentari/${id}`)
    comments.value = komentari.data.data
    await dohvatiSlikeAtrakcije()

  } catch (error) {
    console.log(error)
  }
}
const editDialog = ref(false)

const editForm = ref({
  id_atrakcije: null,
  naziv: '',
  opis: '',
  adresa: '',
  geografska_sirina: '',
  geografska_duzina: '',
  slika: '',
  prosjecna_ocjena: 0
})
</script>

<style scoped>
.rounded-borders {
  border-radius: 16px;
}
.line-height-relaxed {
  line-height: 1.7;
}
.bg-blue-0 {
  background-color: #f0f4ff;
}
</style>
