<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Layout from './components/layout/Layout.vue'
import AdminLayout from './components/layout/AdminLayout.vue'

const route = useRoute()
const isAdminPage = computed(() => route.path.startsWith('/admin'))
const isAdminLogin = computed(() => route.path === '/admin/login' || route.path === '/admin')
</script>

<template>
  <template v-if="isAdminPage">
    <!-- Admin Login is standalone, other admin pages use AdminLayout -->
    <template v-if="isAdminLogin">
      <RouterView />
    </template>
    <template v-else>
      <AdminLayout>
        <RouterView />
      </AdminLayout>
    </template>
  </template>
  <template v-else>
    <Layout>
      <RouterView />
    </Layout>
  </template>
</template>
