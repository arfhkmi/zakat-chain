<script setup lang="ts">
const steps = [
  {
    number: '01',
    icon: `<svg width="40" height="40" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>`,
    title: 'Pilih Jenis Zakat',
    desc: 'Pilih jenis zakat yang bersesuaian dengan anda daripada senarai yang disediakan iaitu pendapatan, emas, simpanan dan lain-lain.',
    color: 'from-yellow-400 to-yellow-500',
  },
  {
    number: '02',
    icon: `<svg width="40" height="40" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
    title: 'Kira Zakat Anda',
    desc: 'Gunakan kalkulator zakat pintar kami untuk mengira amaun zakat yang perlu dibayar berdasarkan pendapatan dan harta anda.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: '03',
    icon: `<svg width="40" height="40" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>`,
    title: 'Bayar Zakat',
    desc: 'Lakukan pembayaran dengan selamat menggunakan FPX, kad kredit, atau kad debit melalui sistem pembayaran yang diiktiraf.',
    color: 'from-green-500 to-green-600',
  },
  {
    number: '04',
    icon: `<svg width="40" height="40" class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    title: 'Terima Resit',
    desc: 'Resit pembayaran akan dihantar terus ke e-mel anda sebagai bukti pembayaran zakat yang sah.',
    color: 'from-purple-500 to-purple-600',
  },
]
</script>

<template>
  <section id="steps" class="bg-gray-50 py-16 md:py-20">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-12">
        <span class="inline-block bg-[#f1d204] text-[#1a1a1a] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Cara Pembayaran
        </span>
        <h2 class="text-3xl md:text-4xl font-black text-[#004b98] mb-4">
          4 Langkah Mudah
        </h2>
        <p class="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
          Proses pembayaran zakat yang ringkas dan mudah dalam masa kurang dari 5 minit
        </p>
      </div>

      <!-- Steps Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        <!-- Connecting line (desktop only) -->
        <div class="hidden lg:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-yellow-400 via-blue-400 via-green-400 to-purple-400 opacity-30 z-0"></div>

        <div
          v-for="(step, i) in steps"
          :key="i"
          class="relative group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 z-10"
        >
          <!-- Number badge -->
          <div
            class="w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300"
            :class="step.color"
          >
            <span class="text-white" v-html="step.icon"></span>
          </div>

          <!-- Step number label -->
          <div class="absolute top-4 right-4 text-5xl font-black text-gray-100 select-none">
            {{ step.number }}
          </div>

          <h3 class="text-[#004b98] font-bold text-lg mb-3">{{ step.title }}</h3>
          <p class="text-gray-500 text-sm leading-relaxed">{{ step.desc }}</p>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center mt-10">
        <a
          href="#hero"
          @click.prevent="document.querySelector('#calculator')?.scrollIntoView({ behavior: 'smooth' })"
          class="inline-flex items-center gap-2 bg-[#1e73be] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#004b98] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
        >
          Mula Bayar Zakat
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
          </svg>
        </a>
      </div>
    </div>
  </section>
</template>
