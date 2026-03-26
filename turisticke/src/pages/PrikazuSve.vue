<template>
  <q-page class="attractions-page">
    <section class="top-section">
      <div class="top-content">
        <div class="page-badge">
          <q-icon name="place" size="18px" />
          <span>Sve atrakcije</span>
        </div>

        <h1 class="page-title">Istraži turističke atrakcije</h1>
        <p class="page-subtitle">
          Pregledaj najzanimljivije lokacije, usporedi ocjene i pronađi
          atrakcije koje želiš posjetiti.
        </p>

        <div class="actions-row">
          <q-btn
            label="Sortiraj uzlazno"
            icon="north"
            color="positive"
            unelevated
            rounded
            no-caps
            @click="sortPostsAsc"
          />
          <q-btn
            label="Sortiraj silazno"
            icon="south"
            color="orange"
            unelevated
            rounded
            no-caps
            @click="sortPostsDesc"
          />
        </div>
      </div>
    </section>

    <section class="cards-section">
      <div v-if="posts.length === 0" class="empty-state">
        <q-icon name="travel_explore" size="64px" color="primary" />
        <h3>Trenutno nema dostupnih atrakcija</h3>
        <p>Pokušaj ponovno kasnije ili dodaj novu atrakciju.</p>
      </div>

      <div v-else class="cards-grid">
        <q-card
          v-for="post in posts"
          :key="post.id_atrakcije"
          class="attraction-card"
        >
          <div class="image-wrapper">
            <q-img
              :src="post.slika"
              class="card-image"
              spinner-color="primary"
            />

            <div class="image-overlay"></div>

            <div class="card-top-actions">
              <q-btn
                round
                glossy
                color="primary"
                icon="place"
                :to="'/one_atraction/' + post.id_atrakcije"
              >
                <q-tooltip>Detalji atrakcije</q-tooltip>
              </q-btn>

              <q-btn
                v-if="isAdmin"
                round
                glossy
                color="negative"
                icon="delete"
                @click="deleteById(post.id_atrakcije)"
              >
                <q-tooltip>Obriši atrakciju</q-tooltip>
              </q-btn>
            </div>
          </div>

          <q-card-section class="card-content">
            <div class="title-row">
              <div class="attraction-title">{{ post.naziv }}</div>
            </div>

            <div class="rating-row">
              <q-rating
                v-model="post.prosjecna_ocjena"
                :max="5"
                readonly
                size="24px"
                color="amber"
              />
              <span class="rating-value">
                {{ Number(post.prosjecna_ocjena || 0).toFixed(1) }}
              </span>
            </div>

            <div class="address-row">
              <q-icon name="location_on" size="18px" color="primary" />
              <span>{{ post.adresa }}</span>
            </div>

            <div class="description">
              {{ post.opis }}
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="between" class="card-actions-bottom">
            <q-btn
              flat
              color="primary"
              icon="visibility"
              label="Pogledaj više"
              no-caps
              :to="'/one_atraction/' + post.id_atrakcije"
            />
          </q-card-actions>
        </q-card>
      </div>
    </section>
  </q-page>
</template>

<script>
import { ref, onMounted } from "vue";
import { api } from "boot/axios";
import { jwtDecode } from "jwt-decode";

export default {
  name: "PrikazuSve",

  setup() {
    const posts = ref([]);
    const token = localStorage.getItem("token");
    const decodedToken = token ? jwtDecode(token) : {};
    const isAdmin = ref(decodedToken.uloga === "admin");

    const getPosts = async () => {
      try {
        const response = await api.get("sveatrakcije");
        posts.value = response.data;
      } catch (error) {
        console.error(error);
      }
    };

    const sortPostsAsc = () => {
      posts.value.sort(
        (a, b) => (a.prosjecna_ocjena || 0) - (b.prosjecna_ocjena || 0)
      );
    };

    const sortPostsDesc = () => {
      posts.value.sort(
        (a, b) => (b.prosjecna_ocjena || 0) - (a.prosjecna_ocjena || 0)
      );
    };

    const deleteById = async (id_atrakcije) => {
      try {
        const confirmation = window.confirm(
          "Jeste li sigurni da želite izbrisati atrakciju?"
        );

        if (!confirmation) {
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token not found. Please log in.");
          return;
        }

        const decodedToken = jwtDecode(token);
        const id_korisnika = decodedToken.id;
        const uloga = decodedToken.uloga;

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            id_korisnika,
            uloga,
          },
        };

        await api.delete(
          `http://localhost:4200/obrisi_atrakcije/${id_atrakcije}`,
          config
        );

        getPosts();
        window.alert("Atrakcija je izbrisana.");
      } catch (error) {
        console.error("Failed to delete post:", error);
      }
    };

    onMounted(getPosts);

    return {
      posts,
      sortPostsAsc,
      sortPostsDesc,
      deleteById,
      isAdmin,
    };
  },
};
</script>

<style scoped>
.attractions-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
}

.top-section {
  padding: 48px 24px 24px;
  background: linear-gradient(
      135deg,
      rgba(15, 32, 39, 0.9),
      rgba(32, 58, 67, 0.82),
      rgba(44, 83, 100, 0.88)
    ),
    url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80")
      center/cover no-repeat;
}

.top-content {
  max-width: 1200px;
  margin: 0 auto;
  color: white;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  font-weight: 600;
  margin-bottom: 18px;
}

.page-title {
  margin: 0;
  font-size: 46px;
  line-height: 1.1;
  font-weight: 800;
}

.page-subtitle {
  margin-top: 16px;
  max-width: 760px;
  font-size: 18px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.9);
}

.actions-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  margin-top: 28px;
}

.cards-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 26px;
}

.attraction-card {
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.1);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.attraction-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.14);
}

.image-wrapper {
  position: relative;
}

.card-image {
  height: 240px;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(15, 23, 42, 0.28), transparent);
}

.card-top-actions {
  position: absolute;
  top: 14px;
  left: 14px;
  right: 14px;
  display: flex;
  justify-content: space-between;
  z-index: 2;
}

.card-content {
  padding: 20px 20px 16px;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.attraction-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.3;
}

.rating-row {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-value {
  font-weight: 700;
  color: #475569;
}

.address-row {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #334155;
  font-weight: 500;
}

.description {
  margin-top: 14px;
  color: #64748b;
  line-height: 1.7;
  min-height: 90px;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-actions-bottom {
  padding: 10px 14px 14px;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
  border-radius: 24px;
  background: white;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.08);
}

.empty-state h3 {
  margin: 18px 0 10px;
  color: #0f172a;
}

.empty-state p {
  margin: 0;
  color: #64748b;
}

@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .page-title {
    font-size: 38px;
  }
}

@media (max-width: 700px) {
  .cards-grid {
    grid-template-columns: 1fr;
  }

  .top-section,
  .cards-section {
    padding-left: 16px;
    padding-right: 16px;
  }

  .page-title {
    font-size: 30px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .card-image {
    height: 220px;
  }
}
</style>
