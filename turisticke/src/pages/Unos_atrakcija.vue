<template>
  <div class="bg-image">
    <q-page padding class="flex flex-center">
      <q-card style="width: 500px; max-width: 90vw">
  <q-card-section>
    <div class="text-h6 text-primary text-center">
      Unos nove atrakcije
    </div>
    <div class="text-grey text-center">
      Dodaj novu turističku atrakciju
    </div>
  </q-card-section>

  <q-card-section class="q-gutter-md">
    <q-input
      ref="nazivRef"
      v-model="inputNaziv"
      label="Naziv atrakcije"
      filled
    />

    <q-input
      ref="opisRef"
      v-model="inputOpis"
      label="Opis atrakcije"
      filled
      type="textarea"
    />

    <q-input
      ref="adresaRef"
      v-model="inputAdresa"
      label="Adresa"
      filled
    />

    <q-input
      ref="sirinaRef"
      v-model="inputSirina"
      label="Geografska širina"
      filled
    />

    <q-input
      ref="duzinaRef"
      v-model="inputDuzina"
      label="Geografska dužina"
      filled
    />

    <div>
      <input type="file" accept="image/*" @change="onFileChange" />

      <div v-if="base64Image" class="q-mt-md">
        <img
          :src="base64Image"
          style="max-width: 100%; max-height: 200px; border-radius: 8px;"
        />
      </div>
    </div>
  </q-card-section>

  <q-card-actions align="right">
    <q-btn
      flat
      label="Odustani"
      color="grey"
      @click="$router.push('/atrakcije')"
    />

    <q-btn
      label="Spremi atrakciju"
      color="primary"
      @click="submitForm"
    />
  </q-card-actions>

  <q-dialog v-model="showDialog">
    <q-card>
      <q-card-section>
        Atrakcija je uspješno dodana!
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="OK"
          color="primary"
          v-close-popup
          @click="closeAndReload"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</q-card>
    </q-page>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { QDialog } from "quasar";
import imageCompression from "browser-image-compression";
// eslint-disable-next-line no-unused-vars
import { ref } from "vue";
import axios from "axios"; // Import axios
export default {
  data() {
    return {
      inputNaziv: "",
      inputOpis: "",
      inputDuzina: "",
      inputSirina: "",
      inputAdresa: "",
      inputSlika: null,

      file: null,
      base64Image: "",
      base64Text: "",
      showDialog: false
    };
  },
  methods: {
    async onFileChange(e) {
      this.file = e.target.files[0];
      await this.convertImage();
    },
    async convertImage() {
      if (!this.file && !this.imageUrl) {
        return alert("Molimo odaberite sliku ili unesite URL slike.");
      }

      const options = {
        maxSizeMB: 1, // Maximum file size in MB
        maxWidthOrHeight: 1920, // Maximum width or height, whichever is smaller
        useWebWorker: true,
      };

      try {
        let compressedFile;

        if (this.imageUrl) {
          const response = await fetch(this.imageUrl);
          const blob = await response.blob();
          compressedFile = await imageCompression(blob, options);
        } else {
          compressedFile = await imageCompression(this.file, options);
        }

        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onload = () => {
          this.base64Image = reader.result;
          this.base64Text = reader.result.replace(
            /^data:image\/[a-z]+;base64,/,
            ""
          );
          this.inputSlika = "data:image/jpg;base64," + this.base64Text;
        };
        reader.onerror = (error) => {
          console.error(error);
        };
        
      } catch (error) {
        console.error(error);
        return alert("Došlo je do pogreške prilikom kompresije slike.");
      }
    },

    closeAndReload() {
  this.showDialog = false;
  this.$router.push("/atrakcije");
},

    onFileSelected(event) {
      this.inputSlika = event.target.files[0];
    },
    onUpload() {
      axios.post;
    },
    resetForm() {
  this.inputNaziv = "";
  this.inputOpis = "";
  this.inputDuzina = "";
  this.inputSirina = "";
  this.inputAdresa = "";
  this.inputSlika = "";
  this.file = null;
  this.base64Image = "";
  this.base64Text = "";

  this.$refs.nazivRef.resetValidation();
  this.$refs.opisRef.resetValidation();
  this.$refs.duzinaRef.resetValidation();
  this.$refs.sirinaRef.resetValidation();
  this.$refs.adresaRef.resetValidation();
},
    async submitForm() {

      const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Morate biti prijavljeni kako biste dodali atrakciju.");
    this.$router.push("/auth");
    return;
  }

  if (!this.inputNaziv || !this.inputOpis) {
    alert("Naziv i opis atrakcije su obavezni.");
    return;
  }

      const sampleData = {
        naziv: this.inputNaziv,
        opis: this.inputOpis,
        slika: this.inputSlika || null,
        prosjecna_ocjena: 0,
        geografska_duzina: this.inputDuzina,
        geografska_sirina: this.inputSirina,
        adresa: this.inputAdresa,
        id_korisnika: user.id
      };

      try {

        const response = await axios.post(
          "http://localhost:4200/unosAtrakcija",
          sampleData
        );

        console.log(response.data);

        this.showDialog = true;
        this.resetForm();

      } catch (error) {

        console.error(error);
        alert("Greška pri unosu atrakcije");

      }
    },
  },
};
</script>

<style>
.bg-image {
  background-image: url(https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.williamhortonphotography.com%2Fwp-content%2Fuploads%2F2017%2F09%2FCroatia-Krk-2015-10.jpg&f=1&nofb=1&ipt=374c233d6e256918b9237640e1c0d6b6d0d4a377be4c7dfc38405cba259d2566&ipo=images);
}
</style>
