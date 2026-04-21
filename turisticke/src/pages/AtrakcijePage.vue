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
                  <q-btn-dropdown outline color="white" label="Uredi Atrakciju" icon="edit" dense>
                    <q-list style="min-width: 250px">
                      <q-item-section class="q-pa-md">
                        <q-input filled v-model="name" label="Link nove slike" dense />
                        <q-btn color="primary" label="Spremi sliku" class="q-mt-sm" @click="spremiSliku(name, post.id_atrakcije)" />
                      </q-item-section>
                      <q-separator />
                      <q-item clickable v-close-popup @click="obrisi_sliku(post.id_atrakcije)" class="text-negative">
                        <q-item-section avatar><q-icon name="delete" /></q-item-section>
                        <q-item-section>Obriši sliku</q-item-section>
                      </q-item>
                      <q-item clickable v-close-popup @click="deleteOcjena(post.id_atrakcije)" class="text-warning">
                        <q-item-section avatar><q-icon name="star_outline" /></q-item-section>
                        <q-item-section>Resetiraj ocjene</q-item-section>
                      </q-item>
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
                  <q-btn-dropdown color="orange-4" :label="'Odaberi ocjenu'" unelevated text-color="black">
                    <q-list>
                      <q-item v-for="n in 5" :key="n" clickable v-close-popup @click="dodajOcjenu(n, post.id_atrakcije)">
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
                <q-card v-for="item in comments" :key="item.id" flat bordered class="rounded-borders q-pa-md bg-white">
                  <div class="row items-center justify-between">
                    <div class="row items-center q-gutter-sm">
                      <q-avatar size="40px">
                        <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                      </q-avatar>
                      <div>
                        <div class="text-weight-bold text-primary">Korisnik #{{ item.vk_id_korisnika }}</div>
                        <q-rating :model-value="4" readonly size="14px" color="orange-4" />
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

    <!-- FOOTER (Tamni kao na slici) -->
    <q-footer class="bg-blue-grey-10 q-pa-lg text-center">
      <div class="text-subtitle2 text-blue-2">Otkrijte ljepotu Hrvatske na svoj način</div>
      <div class="text-caption text-blue-grey-4 q-mt-xs">
        © 2026 Hrvatska Turistička Atrakcija. Sva prava pridržana.
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { api } from 'boot/axios'
import { useRoute, useRouter } from 'vue-router';

const posts = ref([])
const comments = ref([])
const name = ref("") // Za input linka slike
const route = useRoute()
const router = useRouter()
const komentar = ref('')
const message = ref('')

const trenutniID = route.params.id

const getPosts = async () => {
  try {
    const response = await api.get(`/atrakcije/${trenutniID}`)
    posts.value = response.data
    const komentari = await api.get(`/komentari/${trenutniID}`)
    comments.value = komentari.data.data
  } catch (error) {
    console.log(error)
  }
}

const spremiSliku = async (link, id) => {
  try {
    await api.put(`http://localhost:4200/dodajSliku/${id}`, { slika: link });
    getPosts();
  } catch (error) {
    console.log(error);
  }
}

const dodajOcjenu = async (ocjena, id) => {
  if (!ocjena) return;
  try {
    await api.post(`http://localhost:4200/dodajOcjenuOcjene/${id}`, { ocjena: ocjena });
    getPosts();
  } catch (error) {
    console.log(error);
  }
};

const obrisi_sliku = async (id) => {
  try {
    await api.delete(`http://localhost:4200/obrisi_sliku_atrakcije/${id}`);
    getPosts();
  } catch (error) {
    console.log(error);
  }
}

const deleteOcjena = async (id) => {
  try {
    await api.delete(`http://localhost:4200/obrisi_ocjenu_atrakcije/${id}`);
    getPosts();
  } catch (error) {
    console.log(error);
  }
}

onMounted(() => {
  getPosts()
})


const dodajKomentar = async (komentarTekst, id) => {
  if (!komentarTekst) return;

  try {
    await api.post(`http://localhost:4200/dodajKomentar/${id}`, {
      Komentar: komentarTekst
    });


    komentar.value = ''

    // refresh komentara odmah
    const komentari = await api.get(`/komentari/${id}`)
    comments.value = komentari.data.data

  } catch (error) {
    console.log(error)
  }
}

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
