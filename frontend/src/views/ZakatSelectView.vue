<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { HandCoins, TrendingUp, ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col items-center justify-center !px-4 !py-20">
    <div class="w-full max-w-3xl !mx-auto">

      <!-- Header -->
      <div class="text-center space-y-4 !mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Badge variant="outline" class="border-primary/50 text-primary !px-4 !py-1 rounded-full">
          Payment
        </Badge>
        <h1 class="text-4xl md:text-5xl font-black tracking-tight uppercase">
          Choose Zakat <span class="text-primary">Type</span>
        </h1>
        <p class="text-muted-foreground text-lg">Select the type of Zakat you wish to pay.</p>
      </div>

      <!-- Selection Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-700">

        <!-- Fitrah Zakat -->
        <RouterLink to="/fitrah-zakat-calculator" class="group outline-none">
          <div class="relative h-full !p-8 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col gap-6 cursor-pointer">
            <div class="!p-4 bg-primary/10 rounded-2xl text-primary w-fit group-hover:bg-primary/20 transition-colors">
              <HandCoins class="w-8 h-8" />
            </div>
            <div class="flex-1 space-y-2">
              <h2 class="text-2xl font-black">Fitrah Zakat</h2>
              <p class="text-muted-foreground text-sm leading-relaxed">
                Mandatory annual contribution per person at the end of Ramadan. Pay for yourself and your dependents.
              </p>
            </div>
            <div class="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-4 transition-all">
              Pay Fitrah <ArrowRight class="w-4 h-4" />
            </div>
          </div>
        </RouterLink>

        <!-- Income Zakat -->
        <RouterLink to="/income-zakat-calculator" class="group outline-none">
          <div class="relative h-full !p-8 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 flex flex-col gap-6 cursor-pointer">
            <div class="!p-4 bg-primary/10 rounded-2xl text-primary w-fit group-hover:bg-primary/20 transition-colors">
              <TrendingUp class="w-8 h-8" />
            </div>
            <div class="flex-1 space-y-2">
              <h2 class="text-2xl font-black">Income Zakat</h2>
              <p class="text-muted-foreground text-sm leading-relaxed">
                2.5% on your annual eligible income. Calculate based on gross earnings or with Had Kifayah deductions.
              </p>
            </div>
            <div class="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-4 transition-all">
              Pay Income Zakat <ArrowRight class="w-4 h-4" />
            </div>
          </div>
        </RouterLink>

      </div>

      <!-- Back -->
      <div class="text-center !mt-10">
        <RouterLink to="/" class="text-sm text-muted-foreground hover:text-primary transition-colors">
          ← Back to Home
        </RouterLink>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
