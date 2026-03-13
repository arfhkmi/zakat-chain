<script setup lang="ts">
import { useZakatStore } from '@/stores/zakat'
import { onMounted, onUnmounted } from 'vue'

const store = useZakatStore()

const calculatorTypes = [
  { key: 'pendapatan', label: 'Zakat Pendapatan' },
  { key: 'emas', label: 'Zakat Emas' },
  { key: 'simpanan', label: 'Zakat Simpanan' },
  { key: 'perniagaan', label: 'Zakat Perniagaan' },
  { key: 'saham', label: 'Zakat Saham' },
  { key: 'cryptocurrency', label: 'Zakat Cryptocurrency' },
]

function scrollToCalculator(key: string) {
  store.activeCalculator = key as any
  store.closeCalculatorDropdown()
  store.closeMobileMenu()
  const el = document.getElementById('calculator')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function handleOutsideClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('#nav-kira-btn') && !target.closest('#calc-dropdown')) {
    store.closeCalculatorDropdown()
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <!-- Top Bar -->
  <div class="bg-[#f1d204] text-[#1a1a1a] text-xs py-2 px-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
      <!-- Contact -->
      <div class="flex items-center gap-4">
        <a href="tel:+60333437595" class="flex items-center gap-1 hover:opacity-70 transition-opacity">
          <svg width="12" height="12" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.773-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
          +603-3343 7595
        </a>
        <a href="mailto:info@ezakat.org" class="flex items-center gap-1 hover:opacity-70 transition-opacity">
          <svg width="12" height="12" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
          info@ezakat.org
        </a>
      </div>
      <!-- Social + Lang -->
      <div class="flex items-center gap-3">
        <a href="#" class="hover:opacity-70 transition-opacity" aria-label="Facebook">
          <svg width="16" height="16" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
        </a>
        <a href="#" class="hover:opacity-70 transition-opacity" aria-label="Instagram">
          <svg width="16" height="16" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path fill="white" d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="white" stroke-width="2"/></svg>
        </a>
        <span class="text-[#1a1a1a]/40">|</span>
        <button class="font-semibold hover:opacity-70 transition-opacity">🇲🇾 BM</button>
        <button class="opacity-60 hover:opacity-100 transition-opacity">EN</button>
      </div>
    </div>
  </div>

  <!-- Main Nav -->
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2">
        <div class="w-10 h-10 rounded-lg bg-[#004b98] flex items-center justify-center">
          <span class="text-[#f1d204] font-black text-lg">e</span>
        </div>
        <div class="leading-tight">
          <div class="font-black text-[#004b98] text-xl tracking-tight">eZakat</div>
          <div class="text-[9px] text-gray-500 font-medium tracking-widest uppercase">Zakat Selangor</div>
        </div>
      </a>

      <!-- Desktop Nav Links -->
      <div class="hidden md:flex items-center gap-8">
        <a href="/" class="text-gray-600 hover:text-[#004b98] font-medium text-sm transition-colors">Utama</a>
        <a href="#why" class="text-gray-600 hover:text-[#004b98] font-medium text-sm transition-colors">Siapa Kami</a>
        <a href="#steps" class="text-gray-600 hover:text-[#004b98] font-medium text-sm transition-colors">Info Zakat</a>
        <a href="#faq" class="text-gray-600 hover:text-[#004b98] font-medium text-sm transition-colors">Artikel</a>

        <!-- KIRA ZAKAT dropdown -->
        <div class="relative">
          <button
            id="nav-kira-btn"
            @click.stop="store.toggleCalculatorDropdown()"
            class="bg-[#1e73be] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#004b98] transition-all duration-200 flex items-center gap-2"
          >
            KIRA ZAKAT
            <svg
              width="16" height="16"
              class="w-4 h-4 transition-transform duration-200"
              :class="store.calculatorDropdownOpen ? 'rotate-180' : ''"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown -->
          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-1 scale-95"
          >
            <div
              v-if="store.calculatorDropdownOpen"
              id="calc-dropdown"
              class="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
            >
              <button
                v-for="item in calculatorTypes"
                :key="item.key"
                @click="scrollToCalculator(item.key)"
                class="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#f1d204]/20 hover:text-[#004b98] font-medium transition-colors border-b border-gray-50 last:border-0"
              >
                {{ item.label }}
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Mobile Hamburger -->
      <button
        @click="store.toggleMobileMenu()"
        class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <svg width="24" height="24" v-if="!store.mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <svg width="24" height="24" v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-screen"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 max-h-screen"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="store.mobileMenuOpen" class="md:hidden border-t border-gray-100 bg-white overflow-hidden">
        <div class="px-4 py-3 space-y-1">
          <a href="/" @click="store.closeMobileMenu()" class="block py-2.5 px-4 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Utama</a>
          <a href="#why" @click="store.closeMobileMenu()" class="block py-2.5 px-4 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Siapa Kami</a>
          <a href="#steps" @click="store.closeMobileMenu()" class="block py-2.5 px-4 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Info Zakat</a>
          <a href="#faq" @click="store.closeMobileMenu()" class="block py-2.5 px-4 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Artikel</a>
          <div class="pt-2 border-t border-gray-100">
            <p class="text-xs text-gray-400 font-semibold uppercase tracking-wider px-4 pb-2">Kira Zakat</p>
            <button
              v-for="item in calculatorTypes"
              :key="item.key"
              @click="scrollToCalculator(item.key)"
              class="w-full text-left py-2.5 px-4 rounded-lg text-[#1e73be] hover:bg-blue-50 font-medium text-sm"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>
