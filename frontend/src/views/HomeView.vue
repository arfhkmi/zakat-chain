<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion'
import { Calculator, CheckCircle, HandCoins, ShieldCheck, Wallet, Receipt, Award } from 'lucide-vue-next'

const features = ref([
  {
    title: 'Smart Zakat Management',
    description: 'Automated calculation and distribution of Zakat using blockchain technology.',
    icon: Award,
  },
  {
    title: 'Transparent Chain',
    description: 'Every transaction is verifiable on the ledger, ensuring complete transparency.',
    icon: CheckCircle,
  },
  {
    title: 'Secure & Decentralized',
    description: 'Built on top of secure smart contracts to protect your contributions.',
    icon: ShieldCheck,
  }
])

const steps = ref([
  {
    title: 'Choose Zakat',
    description: 'Select the type of zakat you wish to pay.',
    icon: HandCoins,
  },
  {
    title: 'Calculate Zakat',
    description: 'Use the calculator to compute the exact amount.',
    icon: Calculator,
  },
  {
    title: 'Pay Zakat',
    description: 'Complete your payment securely via the blockchain.',
    icon: Wallet,
  },
  {
    title: 'Receive Receipt',
    description: 'Get your verifiable digital receipt instantly.',
    icon: Receipt,
  }
])
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col items-center overflow-x-hidden">
    <!-- Animated background element -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
      <div class="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
    </div>

    <main class="w-full max-w-6xl px-6 py-20 space-y-32 z-10">
      
      <!-- Hero Section -->
      <section class="text-center space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Badge variant="secondary" class="mb-4 bg-primary/10 text-primary hover:bg-primary/20 text-sm py-1.5 px-4 rounded-full border-none">
          <span class="relative flex h-2 w-2 mr-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Powered by Muddar Tech
        </Badge>
        
        <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          PAY ZAKAT ONLINE <br />
          <span class="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">EASY, FAST & TRUSTED</span>
        </h1>
        
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Your decentralized platform for transparent giving. Fulfill your zakat obligations with complete trust and traceability.
        </p>

        <div class="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <Button size="lg" class="px-8 py-6 text-lg rounded-xl shadow-xl shadow-primary/20 transition-transform active:scale-95 group">
            <Wallet class="mr-2 h-5 w-5 group-hover:-translate-y-1 group-hover:rotate-12 transition-transform" />
            Pay Zakat Now
          </Button>
          <Button size="lg" variant="outline" class="px-8 py-6 text-lg rounded-xl border-border hover:bg-accent hover:text-accent-foreground transition-all">
            <Calculator class="mr-2 h-5 w-5" />
            Zakat Calculator
          </Button>
        </div>
      </section>

      <!-- Why Zakat Chain -->
      <section class="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        <div class="text-center space-y-4">
          <h2 class="text-3xl md:text-4xl font-bold">Why Zakat Chain?</h2>
          <p class="text-muted-foreground text-lg">The trusted and recognized decentralized zakat platform.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card v-for="feature in features" :key="feature.title" class="bg-card/50 backdrop-blur-xl border-border/50 hover:border-primary/50 transition-colors duration-300">
            <CardHeader>
              <component :is="feature.icon" class="h-12 w-12 text-primary mb-4" />
              <CardTitle class="text-xl">{{ feature.title }}</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-muted-foreground">{{ feature.description }}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <!-- 4 Easy Steps -->
      <section class="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
        <div class="text-center space-y-4">
          <h2 class="text-3xl md:text-4xl font-bold">4 Easy Steps to Pay Zakat</h2>
          <p class="text-muted-foreground text-lg">A simple and fast payment process</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          <!-- Connecting Line for desktop -->
          <div class="hidden lg:block absolute top-[20%] left-[12%] right-[12%] h-0.5 bg-border -z-10"></div>
          
          <div v-for="(step, index) in steps" :key="step.title" class="flex flex-col items-center text-center space-y-4 relative bg-background/80 p-6 rounded-2xl">
            <div class="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 shadow-inner border border-primary/20">
              <span class="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-lg">
                {{ index + 1 }}
              </span>
              <component :is="step.icon" class="h-8 w-8" />
            </div>
            <h3 class="text-lg font-bold">{{ step.title }}</h3>
            <p class="text-sm text-muted-foreground">{{ step.description }}</p>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
        <div class="text-center space-y-4">
          <h2 class="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
          <p class="text-muted-foreground text-lg">Answers to commonly asked questions</p>
        </div>

        <Accordion type="single" collapsible class="w-full">
          <AccordionItem value="item-1" class="border-border">
            <AccordionTrigger class="text-left text-lg hover:text-primary">Should Income Zakat be calculated on gross or net income?</AccordionTrigger>
            <AccordionContent class="text-muted-foreground text-base leading-relaxed">
              Income Zakat must be calculated on gross income, not net. There are 2 methods: <br/><br/>
              1. Calculation Without Basic Expenses Deduction (Had Kifayah) <br/>
              2. Calculation With Basic Expenses Deduction (Had Kifayah)
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" class="border-border">
            <AccordionTrigger class="text-left text-lg hover:text-primary">When can Income Zakat be paid?</AccordionTrigger>
            <AccordionContent class="text-muted-foreground text-base leading-relaxed">
              <strong>Annually:</strong> after one full year (haul) of income has passed. <br/>
              <strong>Monthly:</strong> by deducting continuously from your salary (this method is recommended to remain consistent and make managing your obligations easier).
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" class="border-border">
            <AccordionTrigger class="text-left text-lg hover:text-primary">Are official receipts issued through Zakat Chain recognized for tax deduction?</AccordionTrigger>
            <AccordionContent class="text-muted-foreground text-base leading-relaxed">
              Yes, official zakat receipts issued via Zakat Chain offer verifiable cryptographic proof of payment, and are recognized by relevant inland revenue boards depending on your jurisdiction.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
      
    </main>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
