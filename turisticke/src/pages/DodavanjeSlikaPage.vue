<template>
  <q-page padding class="bg-image flex flex-center">

    <q-card
      style="
        width: 700px;
        max-width: 95vw;
        backdrop-filter: blur(8px);
        background: rgba(255,255,255,0.92);
      "
    >

      <q-card-section>

        <div class="text-h4 text-center text-primary">
          Dodavanje osobnih slika sa lokacija
        </div>

      </q-card-section>

      <q-separator />

      <q-card-section>

        <!-- ODABIR ATRAKCIJE -->

        <q-select
          v-model="odabranaAtrakcija"
          :options="atrakcije"
          option-label="naziv"
          option-value="id_atrakcije"
          emit-value
          map-options
          outlined
          label="Odaberite atrakciju"
          class="q-mb-lg"
        />

        <!-- UPLOAD -->

        <input
          v-if="!file"
          type="file"
          accept=".jpg,.jpeg,.png"
          @change="onFileChange"
        />

        <!-- PREVIEW -->

        <div class="q-mt-lg" v-if="previewImage">

          <q-img
            :src="previewImage"
            style="height: 350px"
            fit="contain"
          />

        </div>

      </q-card-section>

      <q-card-actions align="center">

        <q-btn
          color="primary"
          label="Spremi sliku"
          @click="uploadImage"
        />

      </q-card-actions>

    </q-card>

  </q-page>
</template>

<script>
import axios from "axios";
import imageCompression from "browser-image-compression";

export default {

  name: "DodavanjeSlikaPage",

  data() {

    return {

      atrakcije: [],

      odabranaAtrakcija: null,

      file: null,

      previewImage: "",

      base64Image: ""

    };
  },

  mounted() {

    this.dohvatiAtrakcije();

  },

  methods: {

    async dohvatiAtrakcije() {

      try {

        const response = await axios.get(
          "http://localhost:4200/dohvatiAtrakcije"
        );

        this.atrakcije = response.data;

      } catch (error) {

        console.error(error);

        alert("Greška pri dohvaćanju atrakcija.");

      }
    },

    async onFileChange(event) {

      const selectedFile = event.target.files[0];

      if (!selectedFile) return;

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
      ];

      if (!allowedTypes.includes(selectedFile.type)) {

        alert("Dozvoljene su samo JPG i PNG slike.");
        return;

      }

      if (selectedFile.size > 5 * 1024 * 1024) {

        alert("Slika ne smije biti veća od 5MB.");
        return;

      }

      this.file = selectedFile;

      await this.convertImage();
    },

    async convertImage() {

      try {

        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(
          this.file,
          options
        );

        const reader = new FileReader();

        reader.readAsDataURL(compressedFile);

        reader.onload = () => {

          this.previewImage = reader.result;

          this.base64Image = reader.result;

        };

        reader.onerror = (error) => {

          console.error(error);

        };

      } catch (error) {

        console.error(error);

        alert("Greška pri obradi slike.");

      }
    },

    async uploadImage() {

      if (!this.odabranaAtrakcija) {

        alert("Odaberite atrakciju.");
        return;

      }

      if (!this.base64Image) {

        alert("Odaberite sliku.");
        return;

      }

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      try {

        const data = {

          id_atrakcije: this.odabranaAtrakcija,

          slika: this.base64Image,

          id_korisnika: user.id

        };

        await axios.post(
          "http://localhost:4200/dodajSlikuAtrakciji",
          data
        );

        alert("Slika uspješno dodana.");

        this.previewImage = "";

        this.base64Image = "";

        this.file = null;

      } catch (error) {

        console.error(error);

        alert("Greška pri spremanju slike.");

      }
    }

  },
};
</script>

<style scoped>
.bg-image {

  background-image: url("/src/assets/OIP.jpg");

  background-size: cover;

  background-position: center;

  background-repeat: no-repeat;

  min-height: 100vh;

}
</style>
