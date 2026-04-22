<template>
  <q-page class="auth-page flex flex-center">
    <div class="auth-hero-bg absolute-full">
      <div class="absolute-full bg-pattern opacity-10"></div>
    </div>

    <q-card class="auth-card shadow-24">
      <q-tabs
        v-model="tab"
        class="text-grey-7 q-mt-sm"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="Prijava" label="Prijava" @click="register = false" />
        <q-tab name="Registracija" label="Registracija" @click="register = true" />
      </q-tabs>

      <q-separator q-mx-md />

      <q-card-section class="q-pa-xl">
        <div class="text-h4 text-weight-bold text-primary text-center q-mb-md">
          {{ tab }}
        </div>
        <div class="divider-gradient q-mb-xl"></div>

        <form @submit.prevent="onSubmit" class="q-gutter-y-lg">
          <q-input
            v-model="credentials.korisnicko_ime"
            outlined
            label="Korisničko ime"
            color="purple-7"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="credentials.lozinka"
            outlined
            type="password"
            label="Lozinka"
            color="purple-7"
          >
            <template v-slot:prepend>
              <q-icon name="lock" color="primary" />
            </template>
          </q-input>

          <div class="row q-col-gutter-md q-pt-md">
            <div class="col-6">
              <q-btn
                flat
                label="Odustani"
                class="full-width q-py-sm btn-rounded text-grey-7"
                to="/"
              />
            </div>
            <div class="col-6">
              <q-btn
                unelevated
                :label="tab"
                class="full-width q-py-sm btn-rounded bg-gradient-btn text-white"
                type="submit"
              />
            </div>
          </div>
        </form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue"
import axios from "axios"
import { useRouter, useRoute } from "vue-router"

const route = useRoute()
const router = useRouter()

const register = ref(false)
const tab = ref('Prijava')

const credentials = reactive({
  korisnicko_ime: '',
  lozinka: ''
})

const updateTabFromRoute = () => {
  if (route.query.mode === 'register') {
    register.value = true
    tab.value = 'Registracija'
  } else {
    register.value = false
    tab.value = 'Prijava'
  }
}

onMounted(() => updateTabFromRoute())
watch(() => route.query.mode, () => updateTabFromRoute())

const onSubmit = async () => {
  if (!credentials.korisnicko_ime || !credentials.lozinka) {
    alert('Unesite korisničko ime i lozinku')
    return
  }
  try {
    const endpoint = register.value ? "/register" : "/login"
    const res = await axios.post(`http://localhost:4200${endpoint}`, credentials)

    if (res.data.success) {
      if (register.value) {
        alert("Registracija uspješna! Sad se možete prijaviti.")
        register.value = false
        tab.value = "Prijava"
      } else {
       // Unutar onSubmit funkcije u Login.vue
const user = res.data.user;
localStorage.setItem("user", JSON.stringify(user));

if (user.uloga === 'administrator') {
  router.push("/admin"); // Vodi na admin stranicu
} else {
  router.push("/"); // Vodi na početnu za obične korisnike
}
      }
    } else {
      alert(res.data.message)
    }
  } catch (err) {
    alert("Greška na serveru")
  }
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: 100vh;
  position: relative;
}

.auth-hero-bg {
  background: linear-gradient(to right, #4f46e5, #7e22ce, #4c1d95) !important;
  z-index: 0;
}

.bg-pattern {
  background-image: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnpNNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTM2IDM0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==") !important;
}

.auth-card {
  width: 90%;
  max-width: 450px;
  z-index: 10;
  border-radius: 16px;
  background: white;
}

.divider-gradient {
  width: 80px;
  height: 5px;
  background: linear-gradient(to right, #facc15, #a855f7) !important;
  border-radius: 10px;
  margin: 0 auto;
}

.bg-gradient-btn {
  background: linear-gradient(to right, #4f46e5, #7e22ce) !important;
  transition: all 0.3s ease;
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }
}

.btn-rounded {
  border-radius: 10px;
}
</style>