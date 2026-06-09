const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/HomePage.vue"),
      },
      {
        path: "atrakcije",
        name: "SveAtrakcije",
        component: () => import("pages/SveAtrakcije.vue"),
      },
      {
        path: "karta-atrakcija",
        name: "KartaAtrakcija",
        component: () => import("pages/KartaAtrakcijaPage.vue"),
      },
      { path: "unos", component: () => import("pages/Unos_atrakcija.vue") },
      { path: "axo", component: () => import("pages/AxiosPageTest.vue") },
      { path: "dodavanje slika", component: () => import("pages/DodavanjeSlikaPage.vue"),},
      { path: "galerija slika", component: () => import("pages/GalerijaSlikaPage.vue"), },
      { path: "moje-atrakcije", name: "MojeAtrakcije", component: () => import("pages/MojeAtrakcije.vue"), },
    ],
  },

  {
    path: "/admin",
    component: () => import("layouts/AdminLayout.vue"),
    children: [{ path: "", component: () => import("pages/AdminPage.vue") }],
  },

  // 2. BLANK LAYOUT (Stranice bez Headera - Login, Detalji, Slike)
  {
    path: "/auth",
    component: () => import("layouts/BlankLayout.vue"),
    children: [{ path: "", component: () => import("pages/LoginPage.vue") }],
  },

  {
    path: "/one_atraction",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      {
        name: "one_atraction",
        path: ":id",
        component: () => import("pages/AtrakcijePage.vue"),
      },
    ],
  },

  {
    path: "/komentari",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      {
        name: "komentari",
        path: ":id",
        component: () => import("pages/komentariPage.vue"),
      },
    ],
  },

  {
    path: "/slika",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      {
        name: "slika",
        path: "",
        component: () => import("pages/dodaj_slika.vue"),
      },
    ],
  },

  // 404 Error
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
