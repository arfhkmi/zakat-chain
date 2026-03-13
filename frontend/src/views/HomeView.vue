<script setup lang="ts">
import NavBar from '@/components/NavBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import WhySection from '@/components/WhySection.vue'
import StepsSection from '@/components/StepsSection.vue'
import ZakatCalculator from '@/components/ZakatCalculator.vue'
import FAQSection from '@/components/FAQSection.vue'
import FooterSection from '@/components/FooterSection.vue'
</script>

<template>
  <div>
    <NavBar />
    <main>
      <div id="hero">
        <HeroSection />
      </div>
      <WhySection />
      <StepsSection />
      <ZakatCalculator />
      <FAQSection />
    </main>
    <FooterSection />
  </div>
</template>
