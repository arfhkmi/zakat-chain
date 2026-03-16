<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { ShieldCheck, LogOut, RefreshCw } from 'lucide-vue-next'

const router = useRouter()
const isLoading = ref(false)

const handleLogout = () => {
  localStorage.removeItem('admin_auth')
  router.push('/admin/login')
}

// Global refresh event for dashboard
const emitRefresh = () => {
  window.dispatchEvent(new CustomEvent('admin-refresh-data'))
}
</script>

<template>
  <div class="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary/30">
    <!-- Navbar -->
    <header class="sticky top-0 z-30 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
      <div class="container !mx-auto !px-4 h-16 flex items-center justify-between">
        <div class="flex items-center !gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
            <ShieldCheck class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-white leading-tight">Zakat Admin</h1>
            <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Control Panel v1.0</p>
          </div>
        </div>
        
        <div class="flex items-center !gap-4">
          <appkit-button size="sm" />
          <Button variant="ghost" size="icon" @click="emitRefresh" :disabled="isLoading">
            <RefreshCw class="w-5 h-5 text-slate-400" :class="{ 'animate-spin': isLoading }" />
          </Button>
          <Button variant="destructive" size="sm" class="!gap-2" @click="handleLogout">
            <LogOut class="w-4 h-4" />
            <span class="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>

    <main class="container !mx-auto !px-4 !py-8 max-w-7xl">
      <slot />
    </main>
    
    <footer class="!mt-20 !py-8 border-t border-white/5">
      <div class="container !mx-auto !px-4 text-center">
        <p class="text-slate-500 text-sm italic">"Truly, Allah knows what you do."</p>
        <p class="text-slate-600 text-xs !mt-2">Zakat Chain Backend Admin Interface • Powering Transparency</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
