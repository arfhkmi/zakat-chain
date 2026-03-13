<script setup lang="ts">
import { useZakatStore } from '@/stores/zakat'

const store = useZakatStore()

const zakatTypes = [
  { key: 'pendapatan', label: 'Zakat Pendapatan' },
  { key: 'emas', label: 'Zakat Emas' },
  { key: 'simpanan', label: 'Zakat Simpanan' },
  { key: 'perniagaan', label: 'Zakat Perniagaan' },
  { key: 'saham', label: 'Zakat Saham' },
  { key: 'cryptocurrency', label: 'Zakat Cryptocurrency' },
]

const idTypes = [
  { key: 'mykad', label: 'MyKad' },
  { key: 'passport', label: 'Pasport' },
  { key: 'tentera', label: 'No. Tentera' },
  { key: 'polis', label: 'No. Polis' },
]
</script>

<template>
  <section class="relative bg-[#004b98] overflow-hidden">
    <!-- Decorative background shapes -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-[#1e73be]/30 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-24 -left-24 w-96 h-96 bg-[#f1d204]/10 rounded-full blur-3xl"></div>
      <div class="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
    </div>

    <div class="relative max-w-6xl mx-auto px-4 py-16 md:py-20 grid md:grid-cols-2 gap-10 items-center">

      <!-- Left: Branding + Text -->
      <div class="text-white space-y-6">
        <!-- Badge -->
        <div class="inline-flex items-center gap-2 bg-[#f1d204]/20 border border-[#f1d204]/40 rounded-full px-4 py-1.5">
          <span class="w-2 h-2 rounded-full bg-[#f1d204] animate-pulse"></span>
          <span class="text-[#f1d204] text-xs font-semibold tracking-wider uppercase">Rasmi · Dipercayai · Selamat</span>
        </div>

        <h1 class="text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
          BAYAR ZAKAT<br>
          <span class="text-[#f1d204]">SELANGOR</span><br>
          SECARA ONLINE
        </h1>

        <p class="text-blue-200 text-base md:text-lg leading-relaxed">
          Platform zakat digital yang selamat, mudah, dan diiktiraf oleh Lembaga Zakat Selangor.
          Tunaikan kewajipan anda di mana sahaja, bila-bila masa.
        </p>

        <!-- Trust badges -->
        <div class="flex flex-wrap gap-4 pt-2">
          <div class="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <svg width="20" height="20" class="w-5 h-5 text-[#f1d204]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
            <span class="text-white text-xs font-medium">Amil Bertauliah</span>
          </div>
          <div class="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <svg width="20" height="20" class="w-5 h-5 text-[#f1d204]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
            <span class="text-white text-xs font-medium">SSL Selamat</span>
          </div>
          <div class="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
            <svg width="20" height="20" class="w-5 h-5 text-[#f1d204]" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clip-rule="evenodd"/></svg>
            <span class="text-white text-xs font-medium">FPX / Kad Kredit</span>
          </div>
        </div>
      </div>

      <!-- Right: Quick Payment Form -->
      <div class="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
        <h2 class="text-lg font-bold text-[#004b98] mb-1">Bayar Zakat Sekarang</h2>
        <p class="text-gray-400 text-xs mb-5">Isi maklumat di bawah untuk meneruskan pembayaran</p>

        <form @submit.prevent="store.submitPaymentForm()" class="space-y-4">

          <!-- Maklumat Pembayar -->
          <div>
            <label class="form-label">Nama Penuh</label>
            <input
              v-model="store.payerName"
              type="text"
              placeholder="Cth: Ahmad bin Abdullah"
              class="form-input"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Jenis ID</label>
              <select v-model="store.idType" class="form-input">
                <option v-for="t in idTypes" :key="t.key" :value="t.key">{{ t.label }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Nombor ID</label>
              <input
                v-model="store.idNumber"
                type="text"
                placeholder="000000-00-0000"
                class="form-input"
              />
            </div>
          </div>

          <div>
            <label class="form-label">E-mel</label>
            <input
              v-model="store.email"
              type="email"
              placeholder="nama@email.com"
              class="form-input"
            />
          </div>

          <div>
            <label class="form-label">No. Telefon</label>
            <input
              v-model="store.phone"
              type="tel"
              placeholder="01X-XXXXXXXX"
              class="form-input"
            />
          </div>

          <!-- Jenis Zakat -->
          <div>
            <label class="form-label">Jenis Zakat</label>
            <select v-model="store.selectedZakatType" class="form-input">
              <option v-for="t in zakatTypes" :key="t.key" :value="t.key">{{ t.label }}</option>
            </select>
          </div>

          <button
            type="submit"
            class="w-full bg-[#1e73be] hover:bg-[#004b98] text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-sm tracking-wide"
          >
            TERUSKAN PEMBAYARAN →
          </button>

          <p class="text-center text-[10px] text-gray-400">
            🔒 Maklumat anda dilindungi dengan enkripsi SSL 256-bit
          </p>
        </form>
      </div>

    </div>
  </section>
</template>

<style scoped>
@reference "../assets/main.css";
.form-label {
  @apply block text-xs font-semibold text-gray-600 mb-1;
}

.form-input {
  @apply w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#1e73be] focus:ring-2 focus:ring-[#1e73be]/20 transition-all duration-150 bg-gray-50;
}
</style>
