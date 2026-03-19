<template>
  <!-- <q-header elevated class="bg-deep-purple text-white"> -->

  <q-tabs v-model="tab" class="bg-primary text-white ">
    <q-tab name="Prijava" label="Prijava" @click.prevent="register = false" />
    <q-tab name="Registracija" label="Registracija" @click.prevent="register = true" />
  </q-tabs>
  <!-- </q-header> -->

  <q-card class="my-card">
    <q-card-section>
      <form @submit.prevent="onSubmit">
        <div class="q-gutter-md full-with" style="max-width: 500px">
          <div class="loginText" style="text-align: center">{{ tab }}</div>

          <q-input v-model="credentials.korisnicko_ime" outlined label="Korisničko ime" />
          <div> </div>
          <q-input v-model="credentials.lozinka" outlined type="password" label="Lozinka" />


          <div class="row justify-between">
            <q-btn class="bg-primary text-white" to="/">Odustani</q-btn>
            <q-btn class="bg-primary text-white" type="submit">{{ tab }}</q-btn>
          </div>
        </div>

      </form>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { ref, reactive } from "vue"
//import { useStoreAuth } from "src/stores/storeAuth"


/*
store
*/
//const storeAuth = useStoreAuth()

// Router i axios
import axios from "axios"
import { useRouter } from "vue-router"

const router = useRouter()

const register = ref(false)
const tab = ref('')



if (!register.value) {
  tab.value = "Prijava"
}
else {
  tab.value = "Registracija"
}

/*
credentials
*/

const credentials = reactive({
  korisnicko_ime: '',
  lozinka: ''
})

/*
  submit
*/

const onSubmit = async () => {
  if (!credentials.korisnicko_ime || !credentials.lozinka) {
    alert('Unesite korisničko ime i lozinku')
    return
  }

  try {
    if (register.value) {
      // Registracija
      const res = await axios.post("http://localhost:4200/register", credentials)

      if (res.data.success) {
        alert("Registracija uspješna")
        register.value = false
        tab.value = "Prijava"
      } else {
        alert(res.data.message)
      }

    } else {
      // Login
      const res = await axios.post("http://localhost:4200/login", credentials)

      if (res.data.success) {
        alert("Prijava uspješna")

        localStorage.setItem("user", JSON.stringify(res.data.user))

        router.push("/")   
      } else {
        alert(res.data.message)
      }
    }
  } catch (err) {
    console.error(err)
    alert("Greška na serveru")
  }
}

</script>

<style lang="sass" scoped>
.my-card
    width: 100%
    max-width: 400px
    margin: 0 auto
    margin-top: 40px
    font-size: 36px
    width: 100%


</style>

<!-- .loginText
text-align: center
font-size: 36px

.input,  -->


