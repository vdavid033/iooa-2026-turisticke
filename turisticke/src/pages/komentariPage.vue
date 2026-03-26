<template>
  <div style="background-color: #229df9">
    <h3>Unos komentara</h3>
    <h6>U polje ispod upišite svoj komentar o atrakciji</h6>
    <div class="q-pa-md row items-start q-gutter-md">
      <q-input
        class="textarea"
        outlined
        v-model="komentar"
        label="Unesi svoj komentar.. "
        :dense="dense"
      />
    </div>
    <q-card-section>
      <q-btn
        label="Dodaj komentar"
        @click="dodajKomentar(komentar, trenutniID)"
      />
    </q-card-section>

    <q-card-section>
      <q-btn
        color="#4CAF50"
        @click="nazadNaPrethodnu"
        label="Natrag na atrakciju"
      />
    </q-card-section>

    <p>{{ message }}</p>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const trenutniID = route.params.id;
const message = ref("");
const komentar = ref("");

const dodajKomentar = async (komentar, trenutniID) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Token not found. Please log in.");
      message.value = "Potrebno se prijaviti za dodavanje komentara!";
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.post(
      `http://localhost:4200/dodajKomentar/${trenutniID}`,
      {
        Komentar: komentar,
      },
      config
    );

    console.log(response.data);
    message.value = "Uspješno ste dodali komentar!";

    nazadNaPrethodnu();
  } catch (error) {
    console.error(error);
    message.value = "Dogodila se greška pri dodavanju komentara.";
  }
};

const nazadNaPrethodnu = () => {
  router.go(-1);
};
</script>

<style scoped>
.textarea {
  width: 100%; /* Podesite širinu prema potrebi */
  max-width: 600px; /* Maksimalna širina okvira */
  height: 100px; /* Podesite visinu prema potrebi */
  margin: 0 auto; /* Centriranje okvira */
  padding: 10px; /* Unutarnji prostor unutar okvira */
  background-color: rgb(155, 197, 194); /* Boja pozadine */
}

button {
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
}

button:hover {
  background-color: #ff9900;
}
</style>
