<script setup lang="ts">
const features = [
  {
    icon: `<svg width="32" height="32" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>`,
    title: 'Amil Bertauliah',
    desc: 'Diiktiraf oleh Lembaga Zakat Selangor sebagai amil yang sah dan berdaftar.',
  },
  {
    icon: `<svg width="32" height="32" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>`,
    title: 'Selamat & Terjamin',
    desc: 'Teknologi enkripsi SSL 256-bit memastikan data dan pembayaran anda sentiasa selamat.',
  },
  {
    icon: `<svg width="32" height="32" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
    title: 'Mudah & Pantas',
    desc: 'Bayar zakat dalam masa kurang 3 minit dari telefon, tablet, atau komputer anda.',
  },
  {
    icon: `<svg width="32" height="32" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`,
    title: 'Resit Automatik',
    desc: 'Terima resit pembayaran digital secara automatik melalui e-mel selepas setiap transaksi.',
  },
  {
    icon: `<svg width="32" height="32" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>`,
    title: 'Kira Zakat Tepat',
    desc: 'Kalkulator zakat pintar untuk pelbagai jenis zakat — pendapatan, emas, simpanan dan lain-lain.',
  },
  {
    icon: `<svg width="32" height="32" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/></svg>`,
    title: 'Sokongan 24/7',
    desc: 'Pasukan sokongan kami sedia membantu anda pada bila-bila masa melalui pelbagai saluran.',
  },
]
</script>

<template>
  <section id="why" class="bg-[#1e73be] py-16 md:py-20">
    <div class="max-w-6xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-12">
        <span class="inline-block bg-[#f1d204] text-[#1a1a1a] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Kenapa eZakat?
        </span>
        <h2 class="text-3xl md:text-4xl font-black text-white mb-4">
          Platform Zakat Digital<br>
          <span class="text-[#f1d204]">Paling Dipercayai</span>
        </h2>
        <p class="text-blue-200 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
          Kami komited untuk menjadikan proses pembayaran zakat lebih mudah, telus, dan bermakna untuk semua.
        </p>
      </div>

      <!-- Feature Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(feature, i) in features"
          :key="i"
          class="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div class="text-[#f1d204] mb-4 group-hover:scale-110 transition-transform duration-300">
            <span v-html="feature.icon"></span>
          </div>
          <h3 class="text-white font-bold text-lg mb-2">{{ feature.title }}</h3>
          <p class="text-blue-200 text-sm leading-relaxed">{{ feature.desc }}</p>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div v-for="stat in [
          { value: '50,000+', label: 'Pembayar Zakat' },
          { value: 'RM 12M+', label: 'Zakat Dikutip' },
          { value: '99.9%', label: 'Kadar Keselamatan' },
          { value: '6 Jenis', label: 'Zakat Disokong' },
        ]" :key="stat.label" class="text-center">
          <div class="text-3xl md:text-4xl font-black text-[#f1d204]">{{ stat.value }}</div>
          <div class="text-blue-200 text-sm mt-1">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
