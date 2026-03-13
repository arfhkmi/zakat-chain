<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSwal } from '../../utils/useSwal'

const { handleSuccess, handleError, handleLoading } = useSwal()

onMounted(() => {
  handleError('Your decentralized platform for transparent giving.', 'Welcome to Zakat Chain', true)
})

const features = ref([
  {
    title: 'Smart Zakat Management',
    description: 'Automated calculation and distribution of Zakat using blockchain technology.',
    icon: '✨'
  },
  {
    title: 'Transparent Chain',
    description: 'Every transaction is verifiable on the ledger, ensuring complete transparency.',
    icon: '🔗'
  },
  {
    title: 'Secure & Decentralized',
    description: 'Built on top of secure smart contracts to protect your contributions.',
    icon: '🛡️'
  }
])
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center">
    <!-- Animated background element -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
    </div>

    <main class="relative z-10 max-w-4xl w-full space-y-12">
      <!-- Header Section -->
      <section class="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div class="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <span class="relative flex h-2 w-2 mr-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Next-Gen Zakat Infrastructure
        </div>
        
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
          Welcome to <span class="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Zakat Chain</span>
        </h1>
        <p class="text-sm font-bold tracking-[0.2em] uppercase text-muted-foreground/60">Powered by Muddar Tech</p>
        
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The blank canvas for your decentralized Zakat application. Start building the future of transparent philanthropy today.
        </p>

        <div class="flex flex-wrap justify-center gap-4 mt-8">
          <button class="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-primary/20">
            Get Started
          </button>
          <button class="px-8 py-4 bg-white/5 border border-white/10 text-foreground rounded-xl font-semibold hover:bg-white/10 transition-all">
            Documentation
          </button>
        </div>
      </section>

      <!-- Features Grid -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
        <div v-for="feature in features" :key="feature.title" 
             class="group p-8 bg-card/50 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-primary/50 transition-all duration-300 text-left">
          <div class="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{{ feature.icon }}</div>
          <h3 class="text-xl font-bold text-foreground mb-2">{{ feature.title }}</h3>
          <p class="text-muted-foreground leading-relaxed">{{ feature.description }}</p>
        </div>
      </section>

      <!-- Footer Placeholder -->
      <footer class="pt-12 text-muted-foreground/40 text-sm animate-in fade-in duration-1000 delay-500">
        Press <kbd class="px-2 py-1 bg-white/5 rounded border border-white/10 text-xs">Ctrl + C</kbd> to stop the dev server.
      </footer>
    </main>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
