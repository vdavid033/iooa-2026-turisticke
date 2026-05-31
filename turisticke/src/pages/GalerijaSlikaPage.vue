<template>
  <q-page padding class="bg-grey-2">

    <div class="text-h3 text-center text-primary q-mb-xl">
      Galerija slika atrakcija
    </div>

    <div class="row justify-center q-mb-xl">

      <div style="width: 350px">

        <q-select
          v-model="odabranaAtrakcija"
          :options="opcijeAtrakcija"
          label="Filtriraj po atrakciji"
          outlined
          clearable
          emit-value
          map-options
        />

      </div>

    </div>

    <div class="row justify-center q-mb-lg">
      <q-btn color="primary" icon="add_photo_alternate" label="Dodaj sliku" @click="uploadDialog = true" />
    </div>

    <div class="row q-col-gutter-lg">

      <div
        v-for="slika in filtriraneSlike"
        :key="slika.id_slike"
        class="col-12 col-sm-6 col-md-4 col-lg-3"
      >

        <q-card class="gallery-card">

          <q-img
            :src="slika.slika_s"
            style="height: 250px"
            fit="cover"
            spinner-color="primary"
            class="cursor-pointer"
            @click="otvoriDialog(slika)"
          />

          <q-card-section>

            <div class="text-h6 text-center">
              {{ slika.naziv }}
            </div>

          </q-card-section>

          <q-card-actions align="center">

            <q-btn
              v-if="user && user.id == slika.id_korisnika"
              color="negative"
              label="Obriši"
              icon="delete"
              @click="obrisiSliku(slika.id_slike)"
            />

          </q-card-actions>

        </q-card>

      </div>

    </div>

    <q-dialog v-model="dialog">

      <q-card
        style="
          width: 90vw;
          max-width: 1200px;
          background: black;
        "
      >

        <q-img
          :src="selectedImage.slika_s"
          fit="contain"
          style="height: 80vh"
        />

        <q-card-section class="bg-black text-white">

          <div class="text-h5 text-center">
            {{ selectedImage.naziv }}
          </div>

        </q-card-section>

      </q-card>

    </q-dialog>


    <q-dialog v-model="uploadDialog">
      <q-card style="width:700px;max-width:95vw">
        <q-card-section><div class="text-h5 text-primary">Dodavanje slike</div></q-card-section>
        <q-separator />
        <q-card-section>
          <q-select v-model="uploadAtrakcija" :options="atrakcije" option-label="naziv" option-value="id_atrakcije" emit-value map-options outlined label="Odaberite atrakciju" class="q-mb-lg" />
          <input v-if="!file" type="file" accept=".jpg,.jpeg,.png" @change="onFileChange" />
          <div class="q-mt-lg" v-if="previewImage">
            <q-img :src="previewImage" style="height:350px" fit="contain" />
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn color="primary" label="Spremi sliku" @click="uploadImage" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import axios from "axios";
import imageCompression from "browser-image-compression";

export default {

  name: "GalerijaSlikaPage",

  data() {

    return {

      slike: [],

      dialog: false,

      selectedImage: {},

      odabranaAtrakcija: null,

      user: null,

      uploadDialog: false,
      atrakcije: [],
      uploadAtrakcija: null,
      file: null,
      previewImage: "",
      base64Image: ""

    };
  },

  computed: {

    opcijeAtrakcija() {

      const unique = [];

      this.slike.forEach((slika) => {

        const exists = unique.find(
          x => x.value === slika.id_atrakcije
        );

        if (!exists) {

          unique.push({
            label: slika.naziv,
            value: slika.id_atrakcije
          });

        }
      });

      return unique;
    },

    filtriraneSlike() {

      if (!this.odabranaAtrakcija) {

        return this.slike;

      }

      return this.slike.filter(
        slika =>
          slika.id_atrakcije === this.odabranaAtrakcija
      );
    }

  },

  mounted() {

    this.user = JSON.parse(localStorage.getItem("user"));

    this.dohvatiSlike();
    this.dohvatiAtrakcije();

  },

  methods: {

    async dohvatiSlike() {

      try {

        const response = await axios.get(
          "http://localhost:4200/dohvatiSveSlike"
        );

        this.slike = response.data;

      } catch (error) {

        console.error(error);

        alert("Greška pri dohvaćanju slika.");

      }
    },

    otvoriDialog(slika) {

      this.selectedImage = slika;

      this.dialog = true;

    },

    async obrisiSliku(id_slike){

      try{

        await axios.delete(
          `http://localhost:4200/obrisiSliku/${id_slike}`
        )

        this.slike = this.slike.filter(
          slika => slika.id_slike != id_slike
        )

      }catch(error){

        console.log(error)

        alert("Greška pri brisanju slike.")

      }
    }
,

    async dohvatiAtrakcije() { const response = await axios.get("http://localhost:4200/dohvatiAtrakcije"); this.atrakcije=response.data; },

    async onFileChange(event){ const selectedFile=event.target.files[0]; if(!selectedFile)return; this.file=selectedFile; await this.convertImage(); },

    async convertImage(){ const compressedFile=await imageCompression(this.file,{maxSizeMB:1,maxWidthOrHeight:1920,useWebWorker:true}); const reader=new FileReader(); reader.readAsDataURL(compressedFile); reader.onload=()=>{this.previewImage=reader.result; this.base64Image=reader.result;}},

    async uploadImage(){ const data={id_atrakcije:this.uploadAtrakcija,slika:this.base64Image,id_korisnika:this.user.id}; await axios.post("http://localhost:4200/dodajSlikuAtrakciji",data); this.uploadDialog=false; this.previewImage=""; this.base64Image=""; this.file=null; this.uploadAtrakcija=null; await this.dohvatiSlike();}


  }
};
</script>

<style scoped>
.gallery-card {
  border-radius: 18px;
  overflow: hidden;
  transition: 0.3s;
}

.gallery-card:hover {
  transform: scale(1.03);
}
</style>
