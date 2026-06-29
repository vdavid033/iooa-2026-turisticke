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
    path: "/one_atraction/:id",
    name: "one_atraction",
    component: () => import("pages/AtrakcijePage.vue"),
  },

  // 404 Error
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
