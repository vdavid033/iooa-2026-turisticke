<template>
  <div class="bg-image">
    <q-page padding class="flex flex-center">
      <q-card style="width: 500px">
        <q-card-section>
          <div class="q-gutter-md full-width" style="max-width: 500px">
            <div class="full-width">
              <div class="q-gutter-md" style="max-width: 500px">
                <p
                  class="text-h5 text-weight-light text-center"
                  style="color: #2196f3"
                >
                  Unos nove atrakcije
                </p>
                <q-input
                  ref="nazivRef"
                  v-model="inputNaziv"
                  label="Naziv"
                  placeholder="Naziv atrakcije"
                ></q-input>
                <q-input
                  ref="opisRef"
                  v-model="inputOpis"
                  label="Opis"
                  placeholder="Opis atrakcije"
                ></q-input>
                <q-input
                  ref="adresaRef"
                  v-model="inputAdresa"
                  label="Adresa"
                  placeholder="Adresa atrakcije"
                ></q-input>

                <!-- Map container -->
                <div id="mapid" style="height: 300px; margin-top: 20px"></div>

                <q-input
                  ref="sirinaRef"
                  v-model="inputSirina"
                  label="Širina"
                  placeholder="Geografska Širina"
                ></q-input>
                <q-input
                  ref="duzinaRef"
                  v-model="inputDuzina"
                  label="Dužina"
                  placeholder="Geografska Dužina"
                ></q-input>

                <div>
                  <input type="file" @change="onFileChange" />
                  <q-separator></q-separator>
                  <div v-if="base64Image">
                    <q-separator></q-separator>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="row justify-center q-pa-md">
            <q-btn
              label="Unesi"
              @click="submitForm"
              color="blue"
              class="q-ml-sm"
            />
          </div>
          <q-dialog v-model="showDialog">
            <q-card>
              <q-card-section> Atrakcija je uspješno dodana! </q-card-section>
              <q-card-actions align="right">
                <q-btn
                  flat
                  label="Ok"
                  color="primary"
                  v-close-popup
                  @click="closeAndReload"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
        </q-card-section>
      </q-card>
    </q-page>
  </div>
</template>

<script>
import { ref } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import imageCompression from "browser-image-compression";
import { jwtDecode } from "jwt-decode";

export default {
  data() {
    return {
      inputNaziv: "",
      inputOpis: "",
      inputDuzina: "",
      inputSirina: "",
      inputAdresa: "",
      inputSlika: null,
      map: null,
      marker: null,
    };
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      this.map = L.map("mapid").setView([45.9258, 16.04], 3);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);

      const icon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/0/619.png",
        iconSize: [15, 30],
        iconAnchor: [9, 30],
        popupAnchor: [-3, -76],
      });

      this.map.on("click", (e) => {
        const { lat, lng } = e.latlng;
        this.inputSirina = lat.toFixed(6);
        this.inputDuzina = lng.toFixed(6);
        if (this.marker) {
          this.marker.setLatLng(e.latlng);
        } else {
          this.marker = L.marker(e.latlng, { icon }).addTo(this.map);
        }
      });
    },
    onFileChange(e) {
      const file = e.target.files[0];
      this.convertImage(file);
    },
    async convertImage(file) {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      try {
        const compressedFile = await imageCompression(file, options);
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onloadend = () => {
          this.base64Image = reader.result;
        };
      } catch (error) {
        console.error("Error processing image", error);
      }
    },
    submitForm() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token not found. Please log in.");
        return;
      }

      const sampleData = {
        naziv: this.inputNaziv,
        opis: this.inputOpis,
        slika: this.base64Image,
        geografska_duzina: this.inputDuzina,
        geografska_sirina: this.inputSirina,
        adresa: this.inputAdresa,
        id_korisnika: jwtDecode(token).id,
      };

      axios
        .post("http://localhost:4200/unosAtrakcija", sampleData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          this.showDialog = true;
          this.resetForm();
        })
        .catch((error) => {
          console.error("Error submitting form", error);
        });
    },
    closeAndReload() {
      this.showDialog = false;
      window.location.reload();
    },
    resetForm() {
      this.inputNaziv = "";
      this.inputOpis = "";
      this.inputDuzina = "";
      this.inputSirina = "";
      this.inputAdresa = "";
      this.inputSlika = null;
      if (this.marker) {
        this.map.removeLayer(this.marker);
        this.marker = null;
      }
    },
  },
};
</script>

<style>
.bg-image {
  background-image: url("https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.williamhortonphotography.com%2Fwp-content%2Fuploads%2F2017%2F09%2FCroatia-Krk-2015-10.jpg&f=1&nofb=1");
}

#mapid {
  height: 300px;
}
</style>
