<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import zakatLogo from '@/assets/image/zakat-chain/zakatchain-logo.webp'
import muddarLogo from '@/assets/image/mudaar-tech/mudaartech-logo.webp'
import { 
  Phone, 
  Mail, 
  Globe, 
  ChevronDown, 
  Layers, 
  Facebook, 
  Github,
  Instagram, 
  Twitter, 
  Send,
  Calculator,
  Info,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Menu,
  X
} from 'lucide-vue-next'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const updateScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', updateScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScroll)
})

const footerLinks = {
  quickLinks: [
    { name: 'Main', href: '#' },
    { name: 'About Us', href: '#' },
    { name: 'Earning Zakat Info', href: '#' },
  ]
}
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans">
  

    <header 
      :class="[
        'sticky top-0 z-50 w-full transition-all duration-300 border-b flex justify-center',
        isScrolled ? 'bg-background/80 backdrop-blur-md h-20 shadow-sm border-white/5' : 'bg-transparent h-24 border-transparent'
      ]"
    >
      <nav class="w-full max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-between md:justify-center gap-8 md:gap-16 lg:gap-24">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-3 group shrink-0 ">
          <div class="!ml-[20px]  w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
            <img :src="zakatLogo" alt="Zakat Chain Logo" class="w-full h-full object-contain drop-shadow-lg " />
          </div>
          <div class="flex flex-col">
            <span class="text-xl font-black tracking-tight text-foreground">ZAKAT CHAIN</span>
            <span class="text-[10px] font-bold text-primary tracking-widest uppercase">Decentralized Payment</span>
          </div>
        </RouterLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8 lg:gap-12">
          <RouterLink to="/" class="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">Main</RouterLink>
          <div class="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer whitespace-nowrap">
            About Us
          </div>
          <div class="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer whitespace-nowrap">
            Zakat Info
          </div>
        </div>

        <!-- Mobile Menu Toggle -->
        <button 
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden p-2 text-foreground hover:bg-white/5 rounded-lg transition-colors !mr-5"
        >
          <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
          <X v-else class="w-6 h-6" />
        </button>

      </nav>

      <!-- Mobile Menu -->
      <div 
        v-if="isMobileMenuOpen" 
        class="md:hidden absolute top-full left-0 w-full bg-background/95 backdrop-blur-xl border-b border-white/5 shadow-2xl !px-10 py-12 space-y-8 animate-in fade-in slide-in-from-top-8 flex flex-col items-end text-right z-50"
      >
        <RouterLink to="/" @click="isMobileMenuOpen = false" class="group flex items-center gap-5 text-lg font-black text-foreground hover:text-primary transition-all">
          <span>Main</span>
          <div class="w-12 h-12 rounded-2xl !my-2 bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
            <Globe class="w-6 h-6 text-primary" />
          </div>
        </RouterLink>
        
        <div @click="isMobileMenuOpen = false" class="group flex items-center gap-5 text-lg font-black text-foreground hover:text-primary transition-all cursor-pointer">
          <span>About Us</span>
          <div class="w-12 h-12 rounded-2xl !my-2 bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
            <Info class="w-6 h-6 text-primary" />
          </div>
        </div>

        <div @click="isMobileMenuOpen = false" class="group flex items-center gap-5 text-lg font-black text-foreground hover:text-primary transition-all cursor-pointer">
          <span>Zakat Info</span>
          <div class="w-12 h-12 rounded-2xl !my-2 bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-all duration-300">
            <BookOpen class="w-6 h-6 text-primary" />
          </div>
        </div>

      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow">
      <RouterView />
    </main>

    <footer class="bg-card/30 border-t border-white/5 w-full flex flex-col items-center justify-center">
      <div class="!my-10 max-w-7xl w-full px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-center justify-items-center">
        <!-- Brand & Mission -->
        <div class="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
          <RouterLink to="/" class="flex items-center">
            <div class="h-10 flex items-center justify-center">
              <img :src="muddarLogo" alt="Muddar Tech Logo" class="h-full object-contain filter opacity-80" />
            </div>
          </RouterLink>
          <p class="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Empowering the global Ummah through decentralized transparency and blockchain-verified zakat management.
          </p>
          <div class="flex gap-3">
            <a href="https://github.com/arfhkmi/zakat-chain" target="_blank" class="!my-2 w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all duration-300">
              <Github class="w-5 h-5" />
            </a>
          </div>
        </div>

        <!-- Resources -->
        <div class="flex flex-col items-center lg:items-start text-center lg:text-left">
          <h4 class="text-foreground font-bold text-sm mb-8 tracking-widest uppercase !mb-2">Resources</h4>
          <ul class="space-y-4">
            <li v-for="link in footerLinks.quickLinks" :key="link.name">
              <a :href="link.href" class="text-sm !text-text hover:!text-primary hover:translate-x-1 transition-all flex items-center gap-2 group">
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div class="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
          <h4 class="text-foreground font-bold text-sm !mb-2 tracking-widest uppercase">Contact Us</h4>
          <div class="space-y-5">
            <div class="flex items-center gap-2 group">
              <div class="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Mail class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-muted-foreground uppercase">Email Supported</p>
                <p class="text-sm text-foreground font-medium">hello@muddar.tech</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Bottom Bar -->
        <div class="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-center gap-6 text-muted-foreground/50 text-[10px] font-bold tracking-[0.2em] uppercase">
          <p>© 2026 MUDDAR TECH. ALL RIGHTS RESERVED.</p>
          <div class="flex flex-wrap items-center justify-center gap-8">
            <p class="flex items-center gap-2 text-primary/80"><ShieldCheck class="w-4 h-4" /> SECURED BY BLOCKCHAIN</p>
          </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.animate-in {
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
