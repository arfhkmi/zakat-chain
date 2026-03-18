<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Calculator,
  BookOpen,
  Info,
  Scale,
  TrendingUp,
  Coins,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-vue-next'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { getIncomeInfo, type IncomeInfo } from '../../utils/zakatInteraction'

const incomeInfoData = ref<IncomeInfo | null>(null)
const isLoadingInfo = ref(false)
const infoError = ref<string | null>(null)

const fetchIncomeInfo = async () => {
  isLoadingInfo.value = true
  infoError.value = null
  try {
    incomeInfoData.value = await getIncomeInfo()
  } catch (e: any) {
    infoError.value = 'Failed to load income info from contract.'
    console.error(e)
  } finally {
    isLoadingInfo.value = false
  }
}

onMounted(fetchIncomeInfo)

const fmtRM = (v: number) => `RM ${v.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// rate is stored in basis points (250 = 2.5%)
const zakatRate = computed(() =>
  incomeInfoData.value ? `${(incomeInfoData.value.rate / 100).toFixed(2)}%` : '2.5%'
)

const nisabValue = computed(() =>
  incomeInfoData.value ? fmtRM(incomeInfoData.value.threshold) : '—'
)

const methods = computed(() => {
  const info = incomeInfoData.value
  const nisab = incomeInfoData.value ? fmtRM(incomeInfoData.value.threshold) : 'Nisab'
  const rate = zakatRate.value

  return [
    {
      title: 'MODE 1 — Without Deductions (Gross)',
      description: 'Direct calculation based on your total annual gross income from all sources.',
      details: `Simplest method: (Monthly Salary × 12) + Other Income. If the total is >= ${nisab}, you pay ${rate}.`,
      formula: `Total Annual Income × ${rate}`,
      steps: [
        'Total Annual Income = (Monthly Salary × 12) + Other Income',
        `Check if Total >= ${nisab} (Nisab)`,
        `Zakat = Total × ${rate}`
      ],
      deductions: null,
    },
    {
      title: 'MODE 2 — With Deductions (Had Kifayah)',
      description: 'Calculated on "Eligible Income" after subtracting allowable basic necessities (Had Kifayah).',
      details: 'This follows specific guidelines for self, family, education, and parents to determine your actual zakat-able wealth.',
      formula: `(Annual Income - Total Deductions) × ${rate}`,
      steps: null,
      deductions: [
        { label: 'Self Allowance', value: info ? `${fmtRM(info.selfDeduction)} (Fixed)` : '—' },
        { label: 'Wives', value: info ? `${fmtRM(info.wifeDeduction)} per wife (Max 4)` : '—' },
        { label: 'Children (<18)', value: info ? `${fmtRM(info.childMinorDeduction)} per child` : '—' },
        { label: 'Children (18+ Studying)', value: info ? `${fmtRM(info.childStudyDeduction)} per child` : '—' },
        { label: 'EPF Contributions', value: '11% of annual salary' },
        { label: 'Self Education (Max)', value: info ? `${fmtRM(info.studyMaxDeduction)} cap` : '—' },
      ],
    }
  ]
})

const conditions = ref([
  'Muslim individual',
  'Ownership of wealth (Milk-al-Tam)',
  'Reached the Nisab (Current market value of 85g of gold)',
  'Full year has passed (Haul) OR pay monthly on salary'
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
        <h1 class="text-4xl md:text-6xl font-black tracking-tight !mb-10">Income Zakat Info</h1>
        <p class="text-muted-foreground text-lg max-w-2xl !mx-auto">
          Learn everything you need to know about Income Zakat (Zakat Pendapatan), 
          the religious obligation on your professional income and wealth.
        </p>
      </section>

      <!-- Understanding Income Zakat -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 !mb-16">
        <Card class="bg-card/30 backdrop-blur-sm border-white/5 overflow-hidden">
          <CardHeader class="bg-primary/5">
            <div class="flex items-center gap-3">
              <div class="!p-2 bg-primary/20 rounded-lg text-primary !m-1">
                <Coins class="w-6 h-6" />
              </div>
              <CardTitle>What is it?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground leading-relaxed !px-2 !mb-6">
              Income Zakat is an obligatory contribution (2.5%) for Muslims on income earned through professional work, businesses, or investments, provided it meets the Nisab threshold.
            </p>
          </CardContent>
        </Card>

        <Card class="bg-card/30 backdrop-blur-sm border-white/5 overflow-hidden">
          <CardHeader class="bg-primary/5">
            <div class="flex items-center gap-3">
              <div class="!p-2 bg-primary/20 rounded-lg text-primary !m-1">
                <Scale class="w-6 h-6" />
              </div>
              <CardTitle>The Nisab ({{ nisabValue }})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p class="text-muted-foreground leading-relaxed !px-2 !mb-6">
              The threshold (Nisab) for Income Zakat is set at <strong>{{ nisabValue }}</strong> per year. If your annual eligible income exceeds this value, zakat of <strong>{{ zakatRate }}</strong> becomes obligatory.
            </p>
          </CardContent>
        </Card>
      </div>

      <!-- Calculation Methods -->
      <section class="!mb-16">
        <h2 class="text-3xl font-bold !mb-8 flex items-center gap-3">
          <Calculator class="text-primary w-8 h-8" />
          Calculation Modes
          <RefreshCw v-if="isLoadingInfo" class="w-5 h-5 animate-spin text-primary opacity-60" />
        </h2>
        <p v-if="infoError" class="text-sm text-destructive !mb-4">{{ infoError }}</p>
        <div class="space-y-8">
          <div v-for="method in methods" :key="method.title" class="group !p-8 !mb-10 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-primary/20 transition-all duration-300">
            <h3 class="text-2xl font-black !mb-3 text-primary">{{ method.title }}</h3>
            <p class="text-muted-foreground !mb-6 text-lg">{{ method.description }}</p>
            
            <!-- Specific Logic for Mode 1 steps -->
            <div v-if="method.steps" class="flex flex-col gap-3 !mb-6">
               <div v-for="(step, i) in method.steps" :key="i" class="flex items-center gap-3 text-sm font-medium opacity-80">
                  <div class="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">{{ i + 1 }}</div>
                  {{ step }}
               </div>
            </div>

            <!-- Specific Logic for Mode 2 deductions -->
            <div v-if="method.deductions" class="grid grid-cols-1 sm:grid-cols-2 gap-4 !mb-6">
               <div v-for="deduction in method.deductions" :key="deduction.label" class="!p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col">
                  <span class="text-[10px] uppercase tracking-widest text-muted-foreground !mb-1">{{ deduction.label }}</span>
                  <span class="text-sm font-bold text-primary">{{ deduction.value }}</span>
               </div>
            </div>

            <div class="!p-5 bg-black/40 rounded-2xl font-mono text-primary border border-primary/20 shadow-xl shadow-primary/5">
              <span class="text-[10px] block opacity-50 !mb-2 uppercase tracking-tighter">Formula</span>
              <span class="text-lg">{{ method.formula }}</span>
            </div>
            <p class="text-sm text-muted-foreground !mt-6 italic border-l-2 border-primary/30 !pl-4">{{ method.details }}</p>
          </div>
        </div>
      </section>

      <!-- Conditions -->
      <section class="!mb-16 bg-primary/5 rounded-3xl !p-8 border border-primary/10">
        <h2 class="text-2xl font-black !mb-6 flex items-center gap-3 uppercase tracking-wider">
          <TrendingUp class="text-primary w-6 h-6" />
          Eligibility Factors
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
          <h2 class="text-3xl font-bold">Deeper Insights</h2>
        </div>
        <Accordion type="single" collapsible class="w-full space-y-4">
          <AccordionItem value="item-1" class="border-white/5 bg-card/20 rounded-xl !px-4">
            <AccordionTrigger class="hover:text-primary transition-colors !py-4">Is bonus income taxable for zakat?</AccordionTrigger>
            <AccordionContent class="text-muted-foreground !pb-4 leading-relaxed">
              Yes, bonuses are considered earned income and should be included in your gross annual calculation. Many choose to pay 2.5% immediately upon receiving the bonus for ease of management.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" class="border-white/5 bg-card/20 rounded-xl !px-4">
            <AccordionTrigger class="hover:text-primary transition-colors !py-4">What if I have debt?</AccordionTrigger>
            <AccordionContent class="text-muted-foreground !pb-4 leading-relaxed">
              Under the 'Had Kifayah' method, basic loan repayments (for necessities like housing or transport) can often be deducted from your gross income before calculating the zakat portion.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" class="border-white/5 bg-card/20 rounded-xl !px-4">
            <AccordionTrigger class="hover:text-primary transition-colors !py-4">What happens if my income changes?</AccordionTrigger>
            <AccordionContent class="text-muted-foreground !pb-4 leading-relaxed">
              If your income increases, you simply adjust your monthly deduction or annual total. If it drops below the Nisab, zakat is no longer technically obligatory, though voluntary Sadaqah is always encouraged.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <!-- Call to Action -->
      <footer class="text-center !p-12 bg-gradient-to-t from-primary/10 to-transparent rounded-t-3xl border-t border-primary/20">
        <h3 class="text-2xl font-bold !mb-4">Ready to fulfill your obligation?</h3>
        <p class="text-muted-foreground !mb-8">Join thousands of others using the blockchain for a more transparent future of giving.</p>
        <RouterLink to="/income-zakat-calculator" class="inline-flex items-center justify-center rounded-xl !px-8 !py-4 bg-primary text-primary-foreground font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
          Pay Zakat Now
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
