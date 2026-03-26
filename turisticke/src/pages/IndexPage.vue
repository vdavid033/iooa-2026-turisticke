<template>
  <q-page class="home-page">
    <section class="hero-section">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <div class="hero-badge">
          <q-icon name="travel_explore" size="20px" />
          <span>Turistička aplikacija</span>
        </div>

        <h1 class="hero-title">
          Otkrij najljepše turističke atrakcije na jednom mjestu
        </h1>

        <p class="hero-subtitle">
          Istraži zanimljive lokacije, pregledaj opise i ocjene atrakcija te
          pronađi inspiraciju za svoje sljedeće putovanje.
        </p>

        <div class="hero-actions" v-if="!isLoggedIn">
          <q-btn
            label="Prijava"
            outline
            color="white"
            rounded
            no-caps
            size="lg"
            class="hero-btn-secondary"
            to="/auth"
          />
          <q-btn
            label="Registracija"
            color="primary"
            rounded
            unelevated
            no-caps
            size="lg"
            class="hero-btn-primary"
            to="/registracijaputanja"
          />
        </div>
      </div>
    </section>

    <section class="features-section">
      <div class="section-header">
        <h2>Zašto koristiti našu aplikaciju?</h2>
        <p>
          Jednostavno pregledaj atrakcije, istraži detalje i organiziraj svoje
          turističko iskustvo na moderan način.
        </p>
      </div>

      <div class="features-grid">
        <q-card
          v-for="feature in features"
          :key="feature.title"
          class="feature-card"
          flat
        >
          <q-card-section>
            <div class="feature-icon" :class="feature.colorClass">
              <q-icon :name="feature.icon" size="32px" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </q-card-section>
        </q-card>
      </div>
    </section>

    <section class="highlight-section">
      <div class="section-header">
        <h2>Izdvojene atrakcije</h2>
        <p>
          Pogledaj nekoliko primjera atrakcija koje možeš pronaći unutar
          aplikacije.
        </p>
      </div>

      <div class="highlights-grid">
        <q-card
          v-for="highlight in highlights"
          :key="highlight.title"
          class="highlight-card"
        >
          <q-img :src="highlight.image" height="220px" />
          <q-card-section>
            <div class="text-h6 text-weight-bold">{{ highlight.title }}</div>
            <div class="text-grey-7">{{ highlight.description }}</div>
          </q-card-section>
        </q-card>
      </div>
    </section>

    <section class="cta-section" v-if="!isLoggedIn">
      <q-card class="cta-card" flat>
        <q-card-section class="text-center">
          <h2>Započni svoje turističko istraživanje već danas</h2>
          <p>
            Registriraj se, prijavi i istraži atrakcije kroz moderan i pregledan
            sustav.
          </p>

          <div class="cta-actions">
            <q-btn
              label="Registracija"
              color="primary"
              rounded
              unelevated
              no-caps
              to="/registracijaputanja"
            />
            <q-btn
              label="Prijava"
              outline
              color="primary"
              rounded
              no-caps
              to="/auth"
            />
          </div>
        </q-card-section>
      </q-card>
    </section>
  </q-page>
</template>

<script>
import { onMounted, ref } from "vue";

const FEATURES = [
  {
    icon: "map",
    colorClass: "blue",
    title: "Pregled atrakcija",
    description:
      "Brzo pronađi popularne lokacije i istraži što svaka atrakcija nudi.",
  },
  {
    icon: "star",
    colorClass: "green",
    title: "Ocjene i dojmovi",
    description:
      "Pregledaj ocjene korisnika i lakše odluči koje mjesto vrijedi posjetiti.",
  },
  {
    icon: "explore",
    colorClass: "orange",
    title: "Jednostavno istraživanje",
    description:
      "Uživaj u modernom prikazu, jednostavnoj navigaciji i preglednom sadržaju.",
  },
];

const HIGHLIGHTS = [
  {
    title: "Prirodne ljepote",
    description:
      "Otkrij parkove, šetnice, vidikovce i prekrasne prirodne lokacije.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Povijesne znamenitosti",
    description:
      "Istraži bogatu kulturnu baštinu, stare gradove i povijesne građevine.",
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Morski i obalni sadržaji",
    description:
      "Pronađi plaže, obalne šetnice i atraktivne destinacije uz more.",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  },
];

export default {
  name: "IndexPage",

  setup() {
    const isLoggedIn = ref(false);
    const features = ref(FEATURES);
    const highlights = ref(HIGHLIGHTS);

    onMounted(() => {
      isLoggedIn.value = Boolean(localStorage.getItem("token"));
    });

    return {
      isLoggedIn,
      features,
      highlights,
    };
  },
};
</script>

<style scoped>
.home-page {
  background: #f8fafc;
}

.hero-section {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  background: linear-gradient(
      135deg,
      rgba(15, 32, 39, 0.84),
      rgba(32, 58, 67, 0.7),
      rgba(44, 83, 100, 0.78)
    ),
    url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80")
      center/cover no-repeat;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(3px);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 900px;
  text-align: center;
  color: white;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  margin-bottom: 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(10px);
  font-weight: 600;
}

.hero-title {
  font-size: 56px;
  line-height: 1.1;
  font-weight: 800;
  margin: 0 0 20px;
}

.hero-subtitle {
  max-width: 760px;
  margin: 0 auto;
  font-size: 19px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.88);
}

.hero-actions {
  margin-top: 34px;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-btn-primary,
.hero-btn-secondary {
  min-width: 190px;
  height: 52px;
  font-weight: 600;
}

.features-section,
.highlight-section,
.cta-section {
  padding: 80px 24px;
}

.section-header {
  max-width: 760px;
  margin: 0 auto 40px;
  text-align: center;
}

.section-header h2 {
  margin: 0 0 12px;
  font-size: 36px;
  color: #0f172a;
}

.section-header p {
  margin: 0;
  font-size: 17px;
  line-height: 1.7;
  color: #64748b;
}

.features-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  border-radius: 22px;
  background: white;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-card:hover,
.highlight-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.feature-card h3 {
  margin: 18px 0 10px;
  font-size: 22px;
  color: #0f172a;
}

.feature-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.feature-icon {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.feature-icon.blue {
  background: linear-gradient(135deg, #1976d2, #42a5f5);
}

.feature-icon.green {
  background: linear-gradient(135deg, #16a34a, #4ade80);
}

.feature-icon.orange {
  background: linear-gradient(135deg, #f97316, #fb923c);
}

.highlights-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.highlight-card {
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.cta-card {
  max-width: 900px;
  margin: 0 auto;
  border-radius: 28px;
  padding: 24px;
  background: linear-gradient(135deg, #eff6ff, #ffffff);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
}

.cta-card h2 {
  margin: 0 0 12px;
  font-size: 34px;
  color: #0f172a;
}

.cta-card p {
  max-width: 680px;
  margin: 0 auto;
  color: #64748b;
  font-size: 17px;
  line-height: 1.7;
}

.cta-actions {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .features-grid,
  .highlights-grid {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 44px;
  }
}

@media (max-width: 600px) {
  .hero-section,
  .features-section,
  .highlight-section,
  .cta-section {
    padding-left: 16px;
    padding-right: 16px;
  }

  .hero-title {
    font-size: 34px;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .section-header h2,
  .cta-card h2 {
    font-size: 28px;
  }
}
</style>