<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  BookOpen,
  Info,
  Scale,
  CheckCircle2,
  Heart,
  Calendar,
  Waves,
  RefreshCw
} from 'lucide-vue-next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { getFitrahRate, type FitrahRate } from '../../utils/zakatInteraction'

const fitrahRateData = ref<FitrahRate | null>(null)
const isLoadingRates = ref(false)
const ratesError = ref<string | null>(null)

const rates = computed(() => {
  if (!fitrahRateData.value) {
    return [
      { title: 'Standard Rate', price: '—', description: 'Based on the price of local rice commonly consumed by the majority of the population.' },
      { title: 'Mid-Range Rate', price: '—', description: 'Based on higher quality rice (e.g., Fragrant Rice, Thai Rice).' },
      { title: 'Premium Rate', price: '—', description: 'Based on premium rice (e.g., Basmathi, Brown Rice).' },
    ]
  }
  const fmt = (v: number) => `RM ${v.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  return [
    { title: 'Standard Rate', price: fmt(fitrahRateData.value.localRate), description: 'Based on the price of local rice commonly consumed by the majority of the population.' },
    { title: 'Mid-Range Rate', price: fmt(fitrahRateData.value.importRate), description: 'Based on higher quality rice (e.g., Fragrant Rice, Thai Rice).' },
    { title: 'Premium Rate', price: fmt(fitrahRateData.value.basmathiRate), description: 'Based on premium rice (e.g., Basmathi, Brown Rice).' },
  ]
})

const fetchRates = async () => {
  isLoadingRates.value = true
  ratesError.value = null
  try {
    fitrahRateData.value = await getFitrahRate()
  } catch (e: any) {
    ratesError.value = 'Failed to load rates from contract.'
    console.error(e)
  } finally {
    isLoadingRates.value = false
  }
}

onMounted(fetchRates)

const conditions = ref([
  'Muslim individual',
  'Alive at the end of Ramadan and beginning of Syawal',
  'Possessing wealth above basic needs for self and dependents on the night and day of Eid-ul-Fitr'
])
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col items-center">
    <main class="w-full max-w-4xl !mx-auto !px-6 !py-20">
      
      <!-- Page Header -->
      <section class="text-center space-y-4 !mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Badge variant="outline" class="border-primary/50 text-primary !px-4 !py-1 rounded-full !mb-4">
          Education Center
        </Badge>
        <h1 class="text-4xl md:text-6xl font-black tracking-tight !mb-10 uppercase">Fitrah Zakat Info</h1>
        <p class="text-muted-foreground text-lg max-w-2xl !mx-auto">
          Fulfill your spiritual obligation during the holy month of Ramadan. 
          Learn about Zakat Fitrah and how it supports the community.
        </p>
      </section>

      <!-- Understanding Fitrah Zakat -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 !mb-16">
        <Card class="bg-card/30 backdrop-blur-sm border-white/5 overflow-hidden">
          <CardHeader class="bg-primary/5">
            <div class="flex items-center gap-3">
              <div class="!p-2 bg-primary/20 rounded-lg text-primary !m-1">
                <Heart class="w-6 h-6" />
              </div>
              <CardTitle>What is it?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground leading-relaxed !px-2 !mb-6">
              Zakat Fitrah is a mandatory charitable contribution required of every Muslim at the end of Ramadan. It is intended to purify those who fast from any indecent act or speech and to help the poor and needy.
            </p>
          </CardContent>
        </Card>

        <Card class="bg-card/30 backdrop-blur-sm border-white/5 overflow-hidden">
          <CardHeader class="bg-primary/5">
            <div class="flex items-center gap-3">
              <div class="!p-2 bg-primary/20 rounded-lg text-primary !m-1">
                <Calendar class="w-6 h-6" />
              </div>
              <CardTitle>When to Pay?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground leading-relaxed !px-2 !mb-6">
              The time for Zakat Fitrah begins from the start of Ramadan and ends before the Eid-ul-Fitr prayer. It is highly recommended to pay it early to ensure it reaches those in need before Eid.
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Rates Section -->
      <section class="!mb-16">
        <h2 class="text-3xl font-bold !mb-8 flex items-center gap-3">
          <Waves class="text-primary w-8 h-8" />
          Zakat Fitrah Rates
          <RefreshCw v-if="isLoadingRates" class="w-5 h-5 animate-spin text-primary opacity-60" />
        </h2>
        <p v-if="ratesError" class="text-sm text-destructive !mb-4">{{ ratesError }}</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="rate in rates" :key="rate.title" class="group !p-8 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-primary/20 transition-all duration-300 flex flex-col items-center text-center">
            <h3 class="text-xl font-black !mb-3 text-primary">{{ rate.title }}</h3>
            <span :class="['text-4xl font-black !mb-4 font-mono', isLoadingRates ? 'opacity-30' : '']">{{ rate.price }}</span>
            <p class="text-sm text-muted-foreground">{{ rate.description }}</p>
          </div>
        </div>
      </section>

      <!-- Conditions -->
      <section class="!mb-16 bg-primary/5 rounded-3xl !p-8 border border-primary/10">
        <h2 class="text-2xl font-black !mb-6 flex items-center gap-3 uppercase tracking-wider">
          <Users class="text-primary w-6 h-6" />
          Who Must Pay?
        </h2>
        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <li v-for="condition in conditions" :key="condition" class="flex items-start gap-3">
            <CheckCircle2 class="text-primary w-5 h-5 shrink-0 !mt-0.5" />
            <span class="text-sm font-medium leading-tight opacity-80">{{ condition }}</span>
          </li>
        </ul>
      </section>

      <!-- FAQ Section -->
      <section class="!mb-16">
        <div class="flex items-center gap-3 !mb-8">
          <BookOpen class="text-primary w-8 h-8" />
          <h2 class="text-3xl font-bold">Common Questions</h2>
        </div>
        <Accordion type="single" collapsible class="w-full space-y-4">
          <AccordionItem value="item-1" class="border-white/5 bg-card/20 rounded-xl !px-4">
            <AccordionTrigger class="hover:text-primary transition-colors !py-4">Can I pay for my family?</AccordionTrigger>
            <AccordionContent class="text-muted-foreground !pb-4 leading-relaxed">
              Yes, the head of the household can pay on behalf of their dependents (spouse, children, and parents) who are under their financial care.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" class="border-white/5 bg-card/20 rounded-xl !px-4">
            <AccordionTrigger class="hover:text-primary transition-colors !py-4">What if I forget to pay before Eid prayer?</AccordionTrigger>
            <AccordionContent class="text-muted-foreground !pb-4 leading-relaxed">
              Paying after the Eid prayer is considered normal charity (Sadaqah) and does not fulfill the obligation of Zakat Fitrah. One should seek forgiveness and ensure timely payment in the future.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" class="border-white/5 bg-card/20 rounded-xl !px-4">
            <AccordionTrigger class="hover:text-primary transition-colors !py-4">Is it better to pay in rice or cash?</AccordionTrigger>
            <AccordionContent class="text-muted-foreground !pb-4 leading-relaxed">
              While the traditional method is in kind (rice), modern scholars approve the use of cash (equivalent value) for greater ease and to better meet the immediate needs of the recipients.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <!-- Call to Action -->
      <footer class="text-center !p-12 bg-gradient-to-t from-primary/10 to-transparent rounded-t-3xl border-t border-primary/20">
        <h3 class="text-2xl font-bold !mb-4">Fulfill your Ramadan obligation</h3>
        <p class="text-muted-foreground !mb-8">Use our transparent platform to ensure your Fitrah reaches those in need instantly via blockchain.</p>
        <RouterLink to="/income-zakat-calculator?type=fitrah" class="inline-flex items-center justify-center rounded-xl !px-8 !py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
          Pay Fitrah Now
        </RouterLink>
      </footer>

    </main>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
