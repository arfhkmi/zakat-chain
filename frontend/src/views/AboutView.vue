<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Github, 
  Linkedin, 
  ExternalLink, 
  Code2, 
  Database, 
  Layout, 
  Users,
  Trophy
} from 'lucide-vue-next'

import ariefImg from '@/assets/image/mudaar-tech/arief-pp.webp'
import danishImg from '@/assets/image/mudaar-tech/danish-pp.webp'
import muniifImg from '@/assets/image/mudaar-tech/muniff-pp.webp'

const team = ref([
  {
    name: 'Arief Hakimi',
    role: 'Blockchain Developer',
    description: 'Architected and deployed the ZakatChain smart contract on BSC Testnet, handling on-chain zakat payments, rate management, and fund collection.',
    icon: Code2,
    image: ariefImg,
    linkedin: 'https://www.linkedin.com/in/ariefhakimimohdazdi/',
    vanity: 'ariefhakimimohdazdi'
  },
  {
    name: 'Danish Fikri',
    role: 'Frontend Developer & Scrum Master',
    description: 'Built the ZakatChain frontend with Vue 3 and TypeScript, integrating Web3 wallet connections, zakat calculators, and the admin dashboard.',
    icon: Layout,
    image: danishImg,
    linkedin: 'https://www.linkedin.com/in/danish-fikri-546119299/',
    vanity: 'danish-fikri-546119299'
  },
  {
    name: 'Abdul Muniif',
    role: 'Backend & Ai Developer',
    description: 'Designs scalable backend systems and integrates LLM-powered chatbot solutions for the zakat chain platform.',
    icon: Database,
    image: muniifImg,
    linkedin: 'https://www.linkedin.com/in/abdul-muniif-620ba1215/',
    vanity: 'abdul-muniif-620ba1215'
  }
])

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://platform.linkedin.com/badges/js/profile.js'
  script.async = true
  script.defer = true
  document.head.appendChild(script)
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col items-center">
    <main class="w-full max-w-5xl !mx-auto !px-6 !py-20">
      
      <!-- Introduction section -->
      <section class="text-center !mb-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Badge variant="secondary" class="!mb-6 bg-primary/10 text-primary hover:bg-primary/20 !py-2 !px-6 rounded-full border-none">
          Our Story
        </Badge>
        <h1 class="text-5xl md:text-7xl font-black tracking-tighter !mb-8">About Zakat Chain</h1>
        <p class="text-xl text-muted-foreground max-w-3xl !mx-auto leading-relaxed">
          Zakat Chain was born during the <a href="https://sahur.dev/" target="_blank" class="text-primary hover:underline font-bold inline-flex items-center gap-1">Godamsahur Hackathon 2026 <ExternalLink class="w-4 h-4" /></a>. 
          Our mission is to bring radical transparency and trust to the distribution of Zakat through decentralized technology.
        </p>
      </section>

      <!-- Hackathon Dedication -->
      <div class="!mb-24 p-12 rounded-[2rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden group">
        <Trophy class="absolute -right-8 -bottom-8 w-64 h-64 text-primary/10 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
        <div class="relative z-10 max-w-2xl">
          <h2 class="text-3xl font-black !mb-6 text-primary !m-5">Born at Godamsahur 2026</h2>
          <p class="text-lg text-muted-foreground leading-relaxed !mb-8 !m-5">
            We built this system during the intensive hours of the Godamsahur Hackathon. Focused on the theme of Islamic technology, 
            we targeted the lack of transparency in traditional zakat collection systems by leveraging the immutable nature of the blockchain.
          </p>
          <a href="https://sahur.dev/" target="_blank" class="inline-flex items-center justify-center !px-8 !m-5 !py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            View Hackathon <ExternalLink class="!ml-2 w-5 h-5" />
          </a>
        </div>
      </div>

      <!-- Team Section -->
      <section class="!mb-24">
        <div class="flex items-center gap-4 !mb-12">
          <Users class="w-10 h-10 text-primary" />
          <h2 class="text-4xl font-black tracking-tight">Meet The Developers</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card v-for="member in team" :key="member.role" class="bg-card/30 backdrop-blur-md border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden group">
            <CardHeader class="!p-0">
              <div class="aspect-square w-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center relative overflow-hidden">
                <img v-if="member.image" :src="member.image" :alt="member.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <User v-else class="w-32 h-32 text-primary/40 group-hover:scale-110 group-hover:text-primary/60 transition-all duration-700" />
                <div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                 
                </div>
              </div>
            </CardHeader>
            <CardContent class="!p-8">
              <div class="flex items-center gap-2 !mb-2">
                 <component :is="member.icon" class="w-5 h-5 text-primary" />
                 <span class="text-xs font-black uppercase tracking-widest text-primary">{{ member.role }}</span>
              </div>
              <h3 class="text-2xl font-bold !mb-4">{{ member.name }}</h3>
              <p class="text-muted-foreground leading-relaxed !mb-8">{{ member.description }}</p>

              <!-- Individual LinkedIn Widget Space -->
              <div class="w-full !ml-[14%] justify-center !p-1  rounded-xl   transition-colors">
                <div v-if="member.vanity" class="w-full min-h-[250px] flex items-center justify-center">
                  <div 
                    class="badge-base LI-profile-badge" 
                    data-locale="en_US" 
                    data-size="medium" 
                    data-theme="dark" 
                    data-type="VERTICAL" 
                    :data-vanity="member.vanity" 
                    data-version="v1"
                  >
                  </div>
                </div>
                <div v-else class="w-full h-[180px] rounded-lg bg-black/20 flex flex-col items-center justify-center relative overflow-hidden">
                  <Linkedin class="w-8 h-8 text-primary/30 !mb-2" />
                  <span class="text-[8px] font-mono opacity-30 uppercase tracking-[0.2em]">{{ member.role }} WIDGET</span>
                  
                  <!-- Developer Tip: Replace this absolute positioned div with your LinkedIn Member Profile Script/Iframe -->
                  <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-primary/5 pointer-events-none">
                     <p class="text-[10px] text-primary/60 font-bold px-4 text-center leading-tight">Drop your LinkedIn Widget code here</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- Footer Call to Action -->
      <footer class="text-center !p-12 bg-primary/5 rounded-[3rem] border border-primary/10">
        <h3 class="text-2xl font-bold !mb-4">Want to collaborate?</h3>
        <p class="text-muted-foreground !mb-8 leading-relaxed max-w-xl !mx-auto">
          We are always looking for passionate people to help expand the Zakat Chain ecosystem. Reach out to us through any of our channels.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
           <a href="mailto:ariefhakimimohdazdi@gmail.com" class="!px-8 !py-3 bg-primary text-primary-foreground font-black rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center">Contact Us</a>
           <a href="https://github.com/arfhkmi/zakat-chain" target="_blank" class="!px-8 !py-3 bg-white/5 border border-white/10 text-foreground font-black rounded-xl hover:bg-white/10 transition-all flex items-center gap-2">
              <Github class="w-5 h-5" /> GitHub
           </a>
        </div>
      </footer>

    </main>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
