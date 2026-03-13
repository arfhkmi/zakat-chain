<script setup lang="ts">
const footerLinks = {
  'Info Zakat': ['Zakat Pendapatan', 'Zakat Emas', 'Zakat Simpanan', 'Zakat Perniagaan', 'Zakat Saham', 'Zakat Crypto'],
  'Pautan Penting': ['Tentang Kami', 'Hubungi Kami', 'Soalan Lazim', 'Dasar Privasi', 'Terma Penggunaan'],
  'Cara Bayar': ['Panduan Pembayaran', 'FPX & Online Banking', 'Kad Kredit / Debit', 'Semak Status Bayaran'],
}
</script>

<template>
  <footer class="bg-[#002d5c] text-white">
    <!-- Main Footer -->
    <div class="max-w-6xl mx-auto px-4 py-12 md:py-16">
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

        <!-- Brand Column -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-[#f1d204] flex items-center justify-center">
              <span class="text-[#004b98] font-black text-2xl">e</span>
            </div>
            <div>
              <div class="font-black text-xl tracking-tight">eZakat</div>
              <div class="text-[10px] text-blue-300 font-medium tracking-widest uppercase">Zakat Selangor</div>
            </div>
          </div>
          <p class="text-blue-300 text-sm leading-relaxed">
            Platform zakat digital rasmi untuk negeri Selangor. Bayar zakat dengan mudah, selamat, dan dipercayai.
          </p>
          <!-- Social links -->
          <div class="flex gap-3">
            <a href="#" class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#f1d204] hover:text-[#004b98] transition-all duration-200" aria-label="Facebook">
              <svg width="16" height="16" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#f1d204] hover:text-[#004b98] transition-all duration-200" aria-label="Twitter">
              <svg width="16" height="16" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
            </a>
            <a href="#" class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#f1d204] hover:text-[#004b98] transition-all duration-200" aria-label="YouTube">
              <svg width="16" height="16" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
            </a>
          </div>
        </div>

        <!-- Link Columns -->
        <div v-for="(links, title) in footerLinks" :key="title">
          <h3 class="font-bold text-[#f1d204] text-sm mb-4 uppercase tracking-wider">{{ title }}</h3>
          <ul class="space-y-2.5">
            <li v-for="link in links" :key="link">
              <a href="#" class="text-blue-300 text-sm hover:text-white transition-colors duration-200 hover:underline decoration-[#f1d204] underline-offset-4">
                {{ link }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Contact Info -->
      <div class="mt-10 pt-8 border-t border-white/10 grid sm:grid-cols-3 gap-4">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#f1d204]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="16" height="16" class="w-4 h-4 text-[#f1d204]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
          </div>
          <div>
            <p class="text-white text-xs font-semibold mb-1">Alamat</p>
            <p class="text-blue-300 text-xs leading-relaxed">No. 2, Jalan Hira 7, Bandar Baru Salak Tinggi,<br>43900 Sepang, Selangor</p>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#f1d204]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="16" height="16" class="w-4 h-4 text-[#f1d204]" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.773-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
          </div>
          <div>
            <p class="text-white text-xs font-semibold mb-1">Telefon</p>
            <a href="tel:+60333437595" class="text-blue-300 text-xs hover:text-[#f1d204] transition-colors">+603-3343 7595</a>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#f1d204]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg width="16" height="16" class="w-4 h-4 text-[#f1d204]" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
          </div>
          <div>
            <p class="text-white text-xs font-semibold mb-1">E-mel</p>
            <a href="mailto:info@ezakat.org" class="text-blue-300 text-xs hover:text-[#f1d204] transition-colors">info@ezakat.org</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Copyright Bar -->
    <div class="border-t border-white/10 bg-black/20">
      <div class="max-w-6xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-blue-400">
        <span>© {{ new Date().getFullYear() }} eZakat Selangor. Hak Cipta Terpelihara.</span>
        <div class="flex items-center gap-4">
          <a href="#" class="hover:text-white transition-colors">Dasar Privasi</a>
          <a href="#" class="hover:text-white transition-colors">Terma Penggunaan</a>
        </div>
      </div>
    </div>
  </footer>
</template>
