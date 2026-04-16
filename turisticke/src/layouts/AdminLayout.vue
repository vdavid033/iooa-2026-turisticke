<template>
  <q-layout view="lHh Lpr lFf">

    <!-- HEADER -->
    <q-header elevated class="admin-header">
      <q-toolbar>
        <q-toolbar-title>
          🛡️ Admin Moderation Panel
        </q-toolbar-title>

        <q-btn flat icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR -->
    <q-drawer show-if-above bordered>
      <q-list>
        <q-item clickable to="/admin">
          <q-item-section>Dashboard</q-item-section>
        </q-item>

      </q-list>
    </q-drawer>

    <!-- CONTENT -->
    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script setup>
const logout = () => {
  localStorage.removeItem("user")
  location.reload()
}
</script>

<style scoped>
  .admin-header {
    background: linear-gradient(90deg, #6a11cb, #9b5de5);
    color: white;
  }
</style>
