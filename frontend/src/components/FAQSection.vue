<script setup lang="ts">
import { useZakatStore } from '@/stores/zakat'

const store = useZakatStore()

const faqs = [
  {
    q: 'Apakah itu zakat dan siapa yang wajib membayarnya?',
    a: 'Zakat adalah satu daripada rukun Islam yang wajib ditunaikan oleh setiap Muslim yang telah mencapai had nisab. Ia merangkumi pelbagai harta seperti pendapatan, emas, simpanan, dan perniagaan yang melebihi tahap yang ditetapkan selama satu tahun.',
  },
  {
    q: 'Berapa had nisab untuk zakat pendapatan?',
    a: 'Had nisab untuk zakat pendapatan di Malaysia adalah bersamaan dengan 85 gram emas. Pada harga semasa, ia adalah lebih kurang RM21,600 setahun atau RM1,800 sebulan. Jika pendapatan bersih tahunan anda melebihi had ini, anda wajib membayar zakat pendapatan.',
  },
  {
    q: 'Apakah kadar zakat yang dikenakan?',
    a: 'Kadar zakat yang standard adalah 2.5% daripada jumlah harta atau pendapatan bersih yang layak. Ini terpakai untuk kebanyakan jenis zakat termasuk pendapatan, emas, simpanan, dan perniagaan.',
  },
  {
    q: 'Bagaimana cara untuk membayar zakat secara online?',
    a: 'Anda boleh membayar zakat dengan mengisi borang maklumat pembayar di laman ini, memilih jenis zakat, dan meneruskan pembayaran menggunakan FPX (perbankan internet), kad kredit, atau kad debit. Resit akan dihantar ke e-mel anda selepas pembayaran berjaya.',
  },
  {
    q: 'Adakah pembayaran zakat secara online selamat?',
    a: 'Ya, sistem pembayaran kami menggunakan teknologi enkripsi SSL 256-bit yang sama seperti yang digunakan oleh bank-bank terkemuka. Semua transaksi adalah selamat dan terproteksi sepenuhnya.',
  },
  {
    q: 'Bolehkah saya mendapat resit pembayaran zakat?',
    a: 'Ya, resit pembayaran digital akan dihantar secara automatik ke alamat e-mel yang anda daftarkan. Resit ini adalah sah dan boleh digunakan sebagai bukti pembayaran zakat anda.',
  },
]
</script>

<template>
  <section id="faq" class="bg-gray-50 py-16 md:py-20">
    <div class="max-w-3xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-12">
        <span class="inline-block bg-[#f1d204] text-[#1a1a1a] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Soalan Lazim
        </span>
        <h2 class="text-3xl md:text-4xl font-black text-[#004b98] mb-4">
          Ada Soalan?
        </h2>
        <p class="text-gray-500 text-sm md:text-base">
          Jawapan kepada soalan-soalan yang sering ditanya tentang zakat
        </p>
      </div>

      <!-- FAQ Accordion -->
      <div class="space-y-3">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <button
            @click="store.toggleFaq(i)"
            class="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors duration-200"
          >
            <span
              class="font-semibold text-sm md:text-base transition-colors duration-200"
              :class="store.activeFaqIndex === i ? 'text-[#1e73be]' : 'text-gray-800'"
            >
              {{ faq.q }}
            </span>
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
              :class="store.activeFaqIndex === i
                ? 'bg-[#1e73be] rotate-45'
                : 'bg-gray-100'"
            >
              <svg
                width="16" height="16"
                class="w-4 h-4 transition-colors duration-200"
                :class="store.activeFaqIndex === i ? 'text-white' : 'text-gray-500'"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
          </button>

          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-96"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-96"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="store.activeFaqIndex === i" class="overflow-hidden">
              <div class="px-6 pb-5">
                <div class="w-full h-px bg-gray-100 mb-4"></div>
                <p class="text-gray-600 text-sm leading-relaxed">{{ faq.a }}</p>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Contact CTA -->
      <div class="mt-10 bg-[#004b98] rounded-2xl p-6 md:p-8 text-center">
        <p class="text-blue-200 text-sm mb-2">Tidak jumpa jawapan yang anda cari?</p>
        <h3 class="text-white font-bold text-xl mb-4">Hubungi Kami Terus</h3>
        <div class="flex flex-wrap gap-3 justify-center">
          <a href="tel:+60333437595" class="bg-[#f1d204] text-[#1a1a1a] font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-yellow-300 transition-colors">
            📞 +603-3343 7595
          </a>
          <a href="mailto:info@ezakat.org" class="bg-white/10 text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-white/20 transition-colors border border-white/20">
            ✉️ info@ezakat.org
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
