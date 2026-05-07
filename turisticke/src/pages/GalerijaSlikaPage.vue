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

  </q-page>
</template>

<script>
import axios from "axios";

export default {

  name: "GalerijaSlikaPage",

  data() {

    return {

      slike: [],

      dialog: false,

      selectedImage: {},

      odabranaAtrakcija: null,

      user: null

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
