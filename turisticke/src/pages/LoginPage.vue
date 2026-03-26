<template>
  <div class="auth-page">
    <div class="overlay"></div>

    <q-card class="auth-card">
      <q-btn
        icon="arrow_back"
        flat
        round
        color="primary"
        class="back-btn"
        @click="$router.back()"
      />

      <q-card-section class="text-center q-pb-none">
        <div class="brand-badge">
          <q-icon name="person_add" size="28px" />
        </div>

        <div class="text-h4 text-weight-bold title">Registracija</div>

        <p class="subtitle">
          Izradite novi račun i nastavite koristiti aplikaciju
        </p>
      </q-card-section>

      <q-card-section class="q-pt-lg">
        <q-input
          v-model="korisnicko_ime"
          label="Korisničko ime"
          outlined
          rounded
          color="primary"
          class="q-mb-md custom-input"
          lazy-rules
          :rules="[
            (val) => !!val || 'Unesite korisničko ime',
            (val) => val.length >= 3 || 'Najmanje 3 znaka',
          ]"
        >
          <template #prepend>
            <q-icon name="person" />
          </template>
        </q-input>

        <q-input
          v-model="lozinka"
          :type="showPassword ? 'text' : 'password'"
          label="Lozinka"
          outlined
          rounded
          color="primary"
          class="q-mb-md custom-input"
          lazy-rules
          :rules="[
            (val) => !!val || 'Unesite lozinku',
            (val) => val.length >= 6 || 'Lozinka mora imati barem 6 znakova',
          ]"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>

          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-input
          v-model="potvrda_lozinke"
          :type="showConfirmPassword ? 'text' : 'password'"
          label="Potvrdite lozinku"
          outlined
          rounded
          color="primary"
          class="q-mb-sm custom-input"
          lazy-rules
          :rules="[
            (val) => !!val || 'Potvrdite lozinku',
            (val) => val === lozinka || 'Lozinke se ne podudaraju',
          ]"
          @keyup.enter="register"
        >
          <template #prepend>
            <q-icon name="verified_user" />
          </template>

          <template #append>
            <q-icon
              :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showConfirmPassword = !showConfirmPassword"
            />
          </template>
        </q-input>

        <div class="password-hint q-mb-lg">
          Lozinka treba sadržavati barem 6 znakova.
        </div>

        <q-btn
          label="Registriraj se"
          color="primary"
          unelevated
          rounded
          no-caps
          class="full-width auth-main-btn q-mb-sm"
          @click="register"
        />

        <q-btn
          label="Već imate račun? Prijavite se"
          outline
          color="primary"
          rounded
          no-caps
          class="full-width q-mb-sm"
          to="/auth"
        />

        <q-btn
          label="Početna stranica"
          flat
          color="grey-8"
          rounded
          no-caps
          class="full-width"
          to="/"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LoginPage",

  data() {
    return {
      korisnicko_ime: "",
      lozinka: "",
      potvrda_lozinke: "",
      showPassword: false,
      showConfirmPassword: false,
    };
  },

  methods: {
    async register() {
      if (!this.korisnicko_ime || !this.lozinka || !this.potvrda_lozinke) {
        this.$q.notify({
          type: "negative",
          message: "Molim ispunite sva polja",
          position: "top",
        });
        return;
      }

      if (this.lozinka !== this.potvrda_lozinke) {
        this.$q.notify({
          type: "negative",
          message: "Lozinke se ne podudaraju",
          position: "top",
        });
        return;
      }

      try {
        const response = await axios.post("http://localhost:4200/register", {
          korisnicko_ime: this.korisnicko_ime,
          lozinka: this.lozinka,
        });

        this.$q.notify({
          type: "positive",
          message: response.data.message || "Registracija uspješna",
          position: "top",
        });

        this.$router.push("/auth");
      } catch (error) {
        console.error(error);

        this.$q.notify({
          type: "negative",
          message: "Greška pri registraciji",
          position: "top",
        });
      }
    },
  },
};
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 24px;
  background: linear-gradient(
      135deg,
      rgba(15, 32, 39, 0.94),
      rgba(32, 58, 67, 0.88),
      rgba(44, 83, 100, 0.92)
    ),
    url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80")
      center/cover no-repeat;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(6px);
  background: rgba(8, 20, 40, 0.18);
}

.auth-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 460px;
  padding: 18px 14px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.93);
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.back-btn {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 3;
}

.brand-badge {
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1976d2, #42a5f5);
  color: white;
  box-shadow: 0 10px 25px rgba(25, 118, 210, 0.35);
}

.title {
  color: #0f172a;
  letter-spacing: 0.3px;
}

.subtitle {
  margin-top: 8px;
  margin-bottom: 0;
  color: #64748b;
  font-size: 15px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 16px;
  height: 56px;
  background: rgba(248, 250, 252, 0.92);
}

.password-hint {
  font-size: 13px;
  color: #64748b;
  padding-left: 4px;
}

.auth-main-btn {
  height: 50px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 10px 24px rgba(25, 118, 210, 0.28);
}

@media (max-width: 600px) {
  .auth-page {
    padding: 16px;
  }

  .auth-card {
    border-radius: 20px;
    padding: 10px 6px;
  }

  .title {
    font-size: 28px;
  }

  .subtitle {
    font-size: 14px;
  }
}
</style>
