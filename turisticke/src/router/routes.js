const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/IndexPage.vue") },
      { path: "atrakcije", component: () => import("pages/PrikazuSve.vue") },
      { path: "unos", component: () => import("pages/Unos_atrakcija.vue") },
      { path: "axo", component: () => import("pages/AxiosPageTest.vue") },
    ],
  },

  {
    path: "/auth",
    component: () => import("layouts/BlankLayout.vue"),
    children: [{ path: "", component: () => import("pages/PrijavaNovo.vue") }],
  },

  {
    path: "/registracijaputanja",
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

  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
