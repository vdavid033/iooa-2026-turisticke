const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { 
        path: "", 
        component: () => import("pages/HomePage.vue") 
      },
      { 
        path: "atrakcije", 
        name: "SveAtrakcije",
        component: () => import("pages/SveAtrakcije.vue") 
      },
      { path: "unos", component: () => import("pages/Unos_atrakcija.vue") },
      { path: "axo", component: () => import("pages/AxiosPageTest.vue") },
    ],
  },

  // 2. BLANK LAYOUT (Stranice bez Headera - Login, Detalji, Slike)
  {
    path: "/auth",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      { path: "", component: () => import("pages/LoginPage.vue") },
    ],
  },

  {
    path: "/one_atraction",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      { name: "one_atraction", path: ":id", component: () => import("pages/AtrakcijePage.vue") },
    ],
  },

  {
    path: "/komentari",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      { name: "komentari", path: ":id", component: () => import("pages/komentariPage.vue") },
    ],
  },

  {
    path: "/slika",
    component: () => import("layouts/BlankLayout.vue"),
    children: [
      { name: "slika", path: "", component: () => import("pages/dodaj_slika.vue") },
    ],
  },

  // 404 Error 
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;