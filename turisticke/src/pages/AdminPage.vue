<template>
  <q-page class="q-pa-md bg-grey-2">


    <!-- HEADER -->
    <!--
    <div class="text-h5 text-weight-bold q-mb-md text-primary">
      🛡️ Admin Moderation Panel
    </div>
    -->

    <!-- TABS -->
    <q-tabs v-model="tab" class="q-mb-md">
      <q-tab name="comments" label="Comments" />
      <q-tab name="attractions" label="Attractions" />
    </q-tabs>

    <!-- ========================= -->
    <!-- ATRAKCIJE -->
    <!-- ========================= -->
    <div v-if="tab === 'attractions'">

      <!-- HEADER -->
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h6">Attractions Management</div>
          <div class="text-grey">Add, view, and manage attractions</div>
        </div>

        <q-btn color="amber" icon="add" label="Add Attraction" />
      </div>

      <!-- STATISTIKA -->
      <div class="row q-col-gutter-md q-mb-md">
        <q-card class="col stats-card">
          <q-card-section>
            <div>Total Attractions</div>
            <div class="stats-value">
              {{ attractions.length }}
            </div>
          </q-card-section>
        </q-card>

        <q-card class="col stats-card">
          <q-card-section>
            <div>Average Rating</div>
            <div class="stats-value">
              {{ averageRating }}
            </div>
          </q-card-section>
        </q-card>

        <q-card class="col stats-card">
          <q-card-section>
            <div>Categories</div>
            <div class="stats-value">
              {{ categoriesCount }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- LISTA ATRAKCIJA -->
      <div class="row q-col-gutter-md">

        <q-card
          v-for="attr in attractions"
          :key="attr.id_atrakcije"
          class="col-12 col-md-6 q-mb-md"
        >
          <q-card-section>

            <div class="row justify-between items-center">
              <div>
                <div class="text-subtitle1 text-weight-bold">
                  {{ attr.naziv }}
                </div>
                <div class="text-grey text-caption">
                  📍 {{ attr.adresa }}
                </div>
              </div>

              <q-btn
                flat
                round
                icon="delete"
                color="negative"
                @click="deleteAttraction(attr.id_atrakcije)"
              />
            </div>

            <div class="q-mt-sm text-grey">
              {{ attr.opis }}
            </div>

            <div class="q-mt-sm">
              <q-chip color="green-2" text-color="black">
                {{ attr.kategorija || "General" }}
              </q-chip>

              <q-chip color="purple-2">
                ⭐ {{ attr.avg_ocjena || 0 }}
              </q-chip>
            </div>

          </q-card-section>
        </q-card>

      </div>
    </div>

    <!-- ========================= -->
    <!-- KOMENTARI -->
    <!-- ========================= -->
    <div v-if="tab === 'comments'">

      <!-- HEADER -->
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h6">Comment Moderation</div>
          <div class="text-grey">Review and moderate user comments</div>
        </div>

        <q-chip color="orange" text-color="black">
          {{ pendingCount }} Pending
        </q-chip>
      </div>

      <!-- FILTERI -->
      <div class="q-mb-md">
        <q-btn-group>
          <q-btn flat :color="filter === 'all' ? 'primary' : 'grey'" label="All" @click="filter='all'" />
          <q-btn flat :color="filter === 'pending' ? 'primary' : 'grey'" label="Pending" @click="filter='pending'" />
          <q-btn flat :color="filter === 'approved' ? 'primary' : 'grey'" label="Approved" @click="filter='approved'" />
          <q-btn flat :color="filter === 'rejected' ? 'primary' : 'grey'" label="Rejected" @click="filter='rejected'" />
        </q-btn-group>
      </div>

      <!-- LISTA KOMENTARA -->
      <q-card
        v-for="comment in filteredComments"
        :key="comment.ID_komentara"
        class="q-mb-md"
      >
        <q-card-section>

          <!-- HEADER -->
          <div class="row justify-between items-center">
            <div>
              <div class="text-weight-bold">
                Komentar #{{ comment.ID_komentara }}
              </div>
              <div class="text-caption text-grey">
                Atrakcija ID: {{ comment.VK_ID_atrakcije }}
              </div>
            </div>

            <q-chip
              :color="statusColor(comment.status)"
              text-color="white"
              size="sm"
            >
              {{ comment.status }}
            </q-chip>
          </div>

          <!-- TEKST -->
          <div class="q-mt-sm">
            {{ comment.Komentar }}
          </div>

          <!-- BUTTONI -->
          <div class="q-mt-md row q-gutter-sm">

            <q-btn
              color="green"
              icon="check"
              label="Approve"
              @click="updateStatus(comment, 'approved')"
            />

            <q-btn
              color="red"
              icon="close"
              label="Reject"
              @click="updateStatus(comment, 'rejected')"
            />

            <q-btn
              flat
              color="grey"
              label="Delete"
              @click="deleteComment(comment.ID_komentara)"
            />

          </div>

        </q-card-section>
      </q-card>

    </div>

  </q-page>
</template>

<script>
import { ref, onMounted, computed } from "vue"
import axios from "axios"
import { Notify } from "quasar"


export default {
  name: "AdminPage",

  setup() {
    const tab = ref("attractions")

    // =====================
    // ATRAKCIJE
    // =====================
    const attractions = ref([])

    const fetchAttractions = async () => {
      const res = await axios.get("http://localhost:4200/atrakcije")
      attractions.value = res.data
    }

    const deleteAttraction = async (id) => {
      try {
        await axios.delete(`http://localhost:4200/obrisi_atrakcije/${id}`)

        Notify.create({
          type: "positive",
          message: "Atrakcija uspješno obrisana ✅"
        })

        fetchAttractions()

      } catch (error) {
        Notify.create({
          type: "negative",
          message: "Greška pri brisanju atrakcije ❌"
        })
        console.error(error)
      }
    }

    // =====================
    // KOMENTARI
    // =====================
    const comments = ref([])
    const filter = ref("all")

    const fetchComments = async () => {
      const res = await axios.get("http://localhost:4200/komentari")
      comments.value = res.data.data
    }

    const filteredComments = computed(() => {
      if (filter.value === "all") return comments.value
      return comments.value.filter(c => c.status === filter.value)
    })

    const pendingCount = computed(() =>
      comments.value.filter(c => c.status === "pending").length
    )

    const statusColor = (status) => {
      if (status === "pending") return "orange"
      if (status === "approved") return "green"
      if (status === "rejected") return "red"
    }

    // =====================
    // AKCIJE
    // =====================
    const updateStatus = async (comment, status) => {
      try {
        if (status === "approved") {
          await axios.put(`http://localhost:4200/komentari/approve/${comment.ID_komentara}`)
        } else {
          await axios.put(`http://localhost:4200/komentari/reject/${comment.ID_komentara}`)
        }

        Notify.create({
          type: "info",
          message: `Komentar ${status === "approved" ? "odobren" : "odbijen"}`
        })

        fetchComments()

      } catch (error) {
        Notify.create({
          type: "negative",
          message: "Greška pri ažuriranju komentara ❌"
        })
      }
    }

    const deleteComment = async (id) => {
      try {
        await axios.delete(`http://localhost:4200/obrisi_komentar/${id}`)

        Notify.create({
          type: "positive",
          message: "Komentar obrisan 🗑️"
        })

        fetchComments()

      } catch (error) {
        Notify.create({
          type: "negative",
          message: "Greška pri brisanju komentara ❌"
        })
        console.error(error)
      }
    }

    // =====================
    // LOAD
    // =====================
    onMounted(() => {
      fetchAttractions()
      fetchComments()
    })

    const averageRating = computed(() => {
      if (attractions.value.length === 0) return 0

      const sum = attractions.value.reduce((acc, attr) => {
        return acc + (Number(attr.avg_ocjena) || 0)
      }, 0)

      return (sum / attractions.value.length).toFixed(1)
    })

    const categoriesCount = computed(() => {
      const categories = attractions.value.map(a => a.kategorija || "General")
      return new Set(categories).size
    })

    return {
      tab,

      // atrakcije
      attractions,
      deleteAttraction,

      // komentari
      comments,
      filter,
      filteredComments,
      pendingCount,
      statusColor,
      updateStatus,
      deleteComment,
      averageRating,
      categoriesCount,
    }
  }
}
</script>

<style scoped>

/* POZADINA */
.q-page {
  background-color: #f5f0dc;
}

/* HEADER (posebna klasa da ne dira text-h5 globalno!) */
.admin-header {
  background: linear-gradient(90deg, #6a11cb, #9b5de5);
  color: white;
  padding: 15px;
  border-radius: 12px;
  font-weight: bold;
}

/* TABS */
.q-tabs {
  background: #e6ddf7;
  border-radius: 20px;
  padding: 5px;
}

.q-tab {
  border-radius: 20px;
}

.q-tab--active {
  background: white;
  color: #7b2ff7;
  font-weight: bold;
}

/* NASLOVI */
.text-h6 {
  font-weight: 600;
}

/* KARTICE */
.q-card {
  border-radius: 15px;
  border: 1px solid #e0d6ff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  background: white;
}

/* HOVER */
.q-card:hover {
  transform: translateY(-2px);
  transition: 0.2s;
}

/* STATISTIKA */
.stats-card {
  padding: 10px;
}

.stats-value {
  background: linear-gradient(90deg, #6a11cb, #9b5de5);
  color: white; /* FIX KONTRASTA */
  padding: 12px;
  border-radius: 10px;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
}

/* CHIPOVI */
.q-chip {
  border-radius: 10px;
  font-size: 12px;
}

/* STATUS CHIP */
.q-chip.bg-orange {
  background: #ffcc80 !important;
  color: black !important;
}

.q-chip.bg-green {
  background: #81c784 !important;
}

.q-chip.bg-red {
  background: #e57373 !important;
}

/* KOMENTARI */
.q-card-section {
  padding: 15px;
}

/* KOMENTAR TEKST */
.comment-text {
  font-size: 14px;
  color: #444;
}

/* BUTTONI */
.q-btn {
  border-radius: 10px;
  text-transform: none;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .admin-header {
    font-size: 18px;
  }
}

</style>
