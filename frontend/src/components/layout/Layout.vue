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
  Instagram, 
  Twitter, 
  Send,
  Calculator,
  Info,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Smartphone
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
      <nav class="max-w-7xl mx-auto h-full px-4 md:px-8 flex items-center justify-center gap-8 md:gap-16 lg:gap-24">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-3 group shrink-0">
          <div class="w-12 h-12 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
            <img :src="zakatLogo" alt="Zakat Chain Logo" class="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <div class="hidden lg:flex flex-col">
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

      </nav>

      <!-- Mobile Menu -->
      <div v-if="isMobileMenuOpen" class="md:hidden absolute top-full left-0 w-full bg-card border-b border-white/5 shadow-xl px-4 py-6 space-y-4 animate-in fade-in slide-in-from-top-4">
        <RouterLink to="/" class="block text-lg font-semibold text-foreground">Main</RouterLink>
        <div class="text-lg font-semibold text-foreground">About Us</div>
        <div class="text-lg font-semibold text-foreground">Zakat Info</div>
        <button class="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold transition-all hover:scale-[1.02]">CALCULATE ZAKAT</button>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-grow">
      <RouterView />
    </main>

    <footer class="bg-card/30 border-t border-white/5 w-full flex flex-col items-center">
      <div class="max-w-7xl w-full px-4 md:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-center justify-items-center">
        <!-- Brand & Address -->
        <div class="space-y-6 flex flex-col items-center text-center">
          <RouterLink to="/" class="flex items-center">
            <div class="h-14 flex items-center justify-center">
              <img :src="muddarLogo" alt="Muddar Tech Logo" class="h-full object-contain filter transition-all duration-300" />
            </div>
          </RouterLink>
          <div class="space-y-4 text-muted-foreground leading-relaxed text-sm">
            <p>Level 23, Blockchain Tower,<br>Persiaran Multimedia, Cyberjaya,<br>63000 Selangor, Malaysia.</p>
          </div>
          <div class="flex gap-4">
            <div class="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all cursor-pointer">
              <Facebook class="w-4 h-4" />
            </div>
            <div class="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all cursor-pointer">
              <Instagram class="w-4 h-4" />
            </div>
            <div class="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all cursor-pointer">
              <Twitter class="w-4 h-4" />
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="flex flex-col items-center">
          <h4 class="text-foreground font-bold uppercase tracking-wider text-xs mb-6">Quick Links</h4>
          <ul class="space-y-4">
            <li v-for="link in footerLinks.quickLinks" :key="link.name" class="flex justify-center">
              <a :href="link.href" class="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                <span class="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors"></span>
                {{ link.name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Contact & Us -->
        <div class="space-y-6 flex flex-col items-center">
          <h4 class="text-foreground font-bold uppercase tracking-wider text-xs mb-6">Contact Us</h4>
          <div class="space-y-4">
            <div class="flex items-start justify-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Mail class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email</p>
                <p class="text-sm text-foreground font-medium">hello@muddar.tech</p>
              </div>
            </div>
            <div class="flex items-start justify-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                <Phone class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone</p>
                <p class="text-sm text-foreground font-medium">+6012 345 6789</p>
              </div>
            </div>
            <div class="flex items-start justify-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                <Smartphone class="w-4 h-4" />
              </div>
              <div>
                <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Monday - Friday</p>
                <p class="text-sm text-foreground font-medium">9:00 AM - 5:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="bg-black/40 py-6 border-t border-white/5 w-full">
        <div class="max-w-7xl mx-auto px-4 md:px-8 flex flex-col items-center justify-center gap-4 text-muted-foreground/40 text-[10px] font-medium tracking-widest uppercase text-center">
          <p>© 2026 MUDDAR TECH (MALAYSIA) SDN BHD. ALL RIGHTS RESERVED.</p>
          <div class="flex flex-wrap items-center justify-center gap-6">
            <p class="flex items-center gap-2"><ShieldCheck class="w-3.5 h-3.5 text-primary" /> SECURED BY BLOCKCHAIN</p>
            <p class="hover:text-primary transition-colors cursor-pointer">PRIVACY POLICY</p>
          </div>
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
