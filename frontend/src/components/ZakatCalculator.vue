<script setup lang="ts">
import { useZakatStore } from '@/stores/zakat'

const store = useZakatStore()

type Tab = 'pendapatan' | 'emas' | 'simpanan' | 'perniagaan'

const tabs: { key: Tab; label: string }[] = [
  { key: 'pendapatan', label: '💰 Pendapatan' },
  { key: 'emas', label: '🥇 Emas' },
  { key: 'simpanan', label: '🏦 Simpanan' },
  { key: 'perniagaan', label: '🏢 Perniagaan' },
]
</script>

<template>
  <section id="calculator" class="bg-white py-16 md:py-20">
    <div class="max-w-4xl mx-auto px-4">
      <!-- Header -->
      <div class="text-center mb-10">
        <span class="inline-block bg-[#f1d204] text-[#1a1a1a] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Kalkulator Zakat
        </span>
        <h2 class="text-3xl md:text-4xl font-black text-[#004b98] mb-4">
          Kira Zakat Anda
        </h2>
        <p class="text-gray-500 max-w-xl mx-auto text-sm">
          Gunakan kalkulator di bawah untuk menganggarkan amaun zakat yang perlu anda tunaikan
        </p>
      </div>

      <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <!-- Tab Headers -->
        <div class="flex overflow-x-auto bg-gray-50 border-b border-gray-100">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="store.activeCalculator = tab.key"
            class="flex-1 min-w-[140px] py-4 px-4 text-sm font-semibold transition-all duration-200 whitespace-nowrap"
            :class="store.activeCalculator === tab.key
              ? 'bg-white text-[#1e73be] border-b-2 border-[#1e73be]'
              : 'text-gray-500 hover:text-[#1e73be] hover:bg-white/50'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="p-6 md:p-8">

          <!-- ── Zakat Pendapatan ── -->
          <div v-if="store.activeCalculator === 'pendapatan'" class="space-y-5">
            <div class="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p class="text-blue-700 text-xs font-semibold mb-1">ℹ️ Cara Pengiraan</p>
              <p class="text-blue-600 text-xs">Zakat Pendapatan = 2.5% × Pendapatan Bersih Tahunan (jika melebihi nisab RM21,600)</p>
            </div>

            <div>
              <label class="calc-label">Pendapatan Bulanan Kasar (RM)</label>
              <input
                v-model.number="store.grossIncome"
                type="number"
                min="0"
                placeholder="Cth: 5000"
                class="calc-input"
              />
            </div>

            <!-- Deduction Mode -->
            <div>
              <label class="calc-label">Kaedah Pengiraan</label>
              <div class="flex gap-3">
                <label
                  v-for="opt in [{ val: 'dengan', label: 'Dengan Tolakan' }, { val: 'tanpa', label: 'Tanpa Tolakan' }]"
                  :key="opt.val"
                  class="flex-1 flex items-center justify-center gap-2 border-2 rounded-xl py-3 cursor-pointer transition-all duration-200 text-sm font-medium"
                  :class="store.deductionMode === opt.val
                    ? 'border-[#1e73be] bg-blue-50 text-[#1e73be]'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'"
                >
                  <input type="radio" :value="opt.val" v-model="store.deductionMode" class="accent-[#1e73be]" />
                  {{ opt.label }}
                </label>
              </div>
            </div>

            <div v-if="store.deductionMode === 'dengan'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="calc-label">Caruman KWSP (RM)</label>
                <input v-model.number="store.epf" type="number" min="0" placeholder="Cth: 550" class="calc-input" />
              </div>
              <div>
                <label class="calc-label">Potongan Lain (RM)</label>
                <input v-model.number="store.otherDeductions" type="number" min="0" placeholder="Cth: 0" class="calc-input" />
              </div>
            </div>
          </div>

          <!-- ── Zakat Emas ── -->
          <div v-else-if="store.activeCalculator === 'emas'" class="space-y-5">
            <div class="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
              <p class="text-yellow-700 text-xs font-semibold mb-1">ℹ️ Cara Pengiraan</p>
              <p class="text-yellow-600 text-xs">Nisab Emas = 85 gram. Zakat = 2.5% × (berat emas × harga semasa)</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="calc-label">Berat Emas (gram)</label>
                <input v-model.number="store.goldGrams" type="number" min="0" placeholder="Cth: 100" class="calc-input" />
              </div>
              <div>
                <label class="calc-label">Harga Semasa (RM/gram)</label>
                <input v-model.number="store.goldPricePerGram" type="number" min="0" placeholder="Cth: 390" class="calc-input" />
              </div>
            </div>
          </div>

          <!-- ── Zakat Simpanan ── -->
          <div v-else-if="store.activeCalculator === 'simpanan'" class="space-y-5">
            <div class="bg-green-50 border border-green-100 rounded-xl p-4">
              <p class="text-green-700 text-xs font-semibold mb-1">ℹ️ Cara Pengiraan</p>
              <p class="text-green-600 text-xs">Nisab = RM21,600. Zakat = 2.5% × jumlah simpanan jika melebihi nisab</p>
            </div>
            <div>
              <label class="calc-label">Jumlah Simpanan (RM)</label>
              <input v-model.number="store.savingsAmount" type="number" min="0" placeholder="Cth: 30000" class="calc-input" />
            </div>
          </div>

          <!-- ── Zakat Perniagaan ── -->
          <div v-else-if="store.activeCalculator === 'perniagaan'" class="space-y-5">
            <div class="bg-purple-50 border border-purple-100 rounded-xl p-4">
              <p class="text-purple-700 text-xs font-semibold mb-1">ℹ️ Cara Pengiraan</p>
              <p class="text-purple-600 text-xs">Zakat = 2.5% × (Aset Perniagaan − Liabiliti) jika melebihi nisab</p>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="calc-label">Aset Perniagaan (RM)</label>
                <input v-model.number="store.businessAssets" type="number" min="0" placeholder="Cth: 100000" class="calc-input" />
              </div>
              <div>
                <label class="calc-label">Liabiliti Perniagaan (RM)</label>
                <input v-model.number="store.businessLiabilities" type="number" min="0" placeholder="Cth: 20000" class="calc-input" />
              </div>
            </div>
          </div>

          <!-- ── Live Result Preview ── -->
          <div
            class="mt-6 rounded-xl overflow-hidden"
            :class="store.zakatAmount > 0 ? 'bg-gradient-to-r from-[#004b98] to-[#1e73be]' : 'bg-gray-50 border border-gray-200'"
          >
            <div class="px-6 py-5 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider" :class="store.zakatAmount > 0 ? 'text-blue-200' : 'text-gray-400'">
                  Anggaran Zakat Anda
                </p>
                <p class="text-3xl font-black mt-1" :class="store.zakatAmount > 0 ? 'text-white' : 'text-gray-300'">
                  {{ store.zakatAmount > 0 ? `RM ${store.zakatAmount.toFixed(2)}` : 'RM 0.00' }}
                </p>
                <p class="text-xs mt-1" :class="store.zakatAmount > 0 ? 'text-blue-200' : 'text-gray-400'">
                  {{ store.zakatAmount > 0 ? 'setahun / RM ' + (store.zakatAmount / 12).toFixed(2) + ' sebulan' : 'Masukkan maklumat untuk mengira' }}
                </p>
              </div>
              <button
                @click="store.calculateAndShowResult()"
                class="px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200"
                :class="store.zakatAmount > 0
                  ? 'bg-[#f1d204] text-[#1a1a1a] hover:bg-yellow-300 hover:shadow-lg'
                  : 'bg-[#1e73be] text-white hover:bg-[#004b98]'"
              >
                Kira Sekarang →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@reference "../assets/main.css";
.calc-label {
  @apply block text-xs font-semibold text-gray-600 mb-1.5;
}

.calc-input {
  @apply w-full border border-gray-200 rounded-lg px-3 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#1e73be] focus:ring-2 focus:ring-[#1e73be]/20 transition-all duration-150 bg-gray-50;
}
</style>
