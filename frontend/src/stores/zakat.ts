import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Swal from 'sweetalert2'

export type ZakatType =
  | 'pendapatan'
  | 'emas'
  | 'simpanan'
  | 'perniagaan'
  | 'saham'
  | 'cryptocurrency'

export type IdType = 'mykad' | 'passport' | 'tentera' | 'polis'

export const useZakatStore = defineStore('zakat', () => {
  // ── Payment Form ──────────────────────────────────────────────
  const payerName = ref('')
  const idType = ref<IdType>('mykad')
  const idNumber = ref('')
  const email = ref('')
  const phone = ref('')
  const selectedZakatType = ref<ZakatType>('pendapatan')

  // ── Calculator Inputs ─────────────────────────────────────────
  const activeCalculator = ref<ZakatType>('pendapatan')

  // Pendapatan (Income)
  const grossIncome = ref<number | null>(null)
  const deductionMode = ref<'tanpa' | 'dengan'>('dengan')
  const epf = ref<number | null>(null)
  const otherDeductions = ref<number | null>(null)

  // Emas (Gold)
  const goldGrams = ref<number | null>(null)
  const goldPricePerGram = ref<number | null>(null)

  // Simpanan (Savings)
  const savingsAmount = ref<number | null>(null)

  // Perniagaan (Business)
  const businessAssets = ref<number | null>(null)
  const businessLiabilities = ref<number | null>(null)

  // FAQ
  const activeFaqIndex = ref<number | null>(null)

  // Nav 
  const mobileMenuOpen = ref(false)
  const calculatorDropdownOpen = ref(false)

  // ── Computed Zakat Amount ─────────────────────────────────────
  // Nisab benchmark (RM) – approximated using 85g gold @ ~RM400/g
  const NISAB_RM = 21600
  const ZAKAT_RATE = 0.025 // 2.5%

  const zakatAmount = computed<number>(() => {
    switch (activeCalculator.value) {
      case 'pendapatan': {
        const gross = grossIncome.value ?? 0
        let deductions = 0
        if (deductionMode.value === 'dengan') {
          deductions = (epf.value ?? 0) + (otherDeductions.value ?? 0)
        }
        const net = Math.max(0, gross - deductions)
        const annual = net * 12
        return annual >= NISAB_RM ? annual * ZAKAT_RATE : 0
      }
      case 'emas': {
        const grams = goldGrams.value ?? 0
        const price = goldPricePerGram.value ?? 0
        const totalValue = grams * price
        // Nisab for gold = 85g
        const goldNisabValue = 85 * price
        return totalValue >= goldNisabValue ? totalValue * ZAKAT_RATE : 0
      }
      case 'simpanan': {
        const savings = savingsAmount.value ?? 0
        return savings >= NISAB_RM ? savings * ZAKAT_RATE : 0
      }
      case 'perniagaan': {
        const assets = businessAssets.value ?? 0
        const liabilities = businessLiabilities.value ?? 0
        const net = Math.max(0, assets - liabilities)
        return net >= NISAB_RM ? net * ZAKAT_RATE : 0
      }
      default:
        return 0
    }
  })

  // ── Actions ───────────────────────────────────────────────────
  function toggleFaq(index: number) {
    activeFaqIndex.value = activeFaqIndex.value === index ? null : index
  }

  function toggleMobileMenu() {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  function closeMobileMenu() {
    mobileMenuOpen.value = false
  }

  function toggleCalculatorDropdown() {
    calculatorDropdownOpen.value = !calculatorDropdownOpen.value
  }

  function closeCalculatorDropdown() {
    calculatorDropdownOpen.value = false
  }

  async function submitPaymentForm() {
    // Validation
    if (!payerName.value.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Nama diperlukan', text: 'Sila masukkan nama penuh anda.', confirmButtonColor: '#1e73be' })
      return
    }
    if (!idNumber.value.trim()) {
      await Swal.fire({ icon: 'warning', title: 'Nombor ID diperlukan', text: 'Sila masukkan nombor kad pengenalan anda.', confirmButtonColor: '#1e73be' })
      return
    }
    if (!email.value.trim() || !email.value.includes('@')) {
      await Swal.fire({ icon: 'warning', title: 'E-mel tidak sah', text: 'Sila masukkan alamat e-mel yang sah.', confirmButtonColor: '#1e73be' })
      return
    }
    if (!phone.value.trim() || phone.value.length < 9) {
      await Swal.fire({ icon: 'warning', title: 'Nombor telefon tidak sah', text: 'Sila masukkan nombor telefon yang sah.', confirmButtonColor: '#1e73be' })
      return
    }

    const zakatTypeLabel: Record<ZakatType, string> = {
      pendapatan: 'Zakat Pendapatan',
      emas: 'Zakat Emas',
      simpanan: 'Zakat Simpanan',
      perniagaan: 'Zakat Perniagaan',
      saham: 'Zakat Saham',
      cryptocurrency: 'Zakat Cryptocurrency',
    }

    const result = await Swal.fire({
      icon: 'question',
      title: 'Sahkan Pembayaran',
      html: `
        <div class="text-left space-y-2 text-sm">
          <p><strong>Nama:</strong> ${payerName.value}</p>
          <p><strong>E-mel:</strong> ${email.value}</p>
          <p><strong>Telefon:</strong> ${phone.value}</p>
          <p><strong>Jenis Zakat:</strong> ${zakatTypeLabel[selectedZakatType.value]}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Ya, Teruskan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#1e73be',
      cancelButtonColor: '#6b7280',
    })

    if (result.isConfirmed) {
      await Swal.fire({
        icon: 'success',
        title: 'Terima Kasih!',
        html: `
          <p class="text-gray-600">Permohonan anda telah diterima.<br>Anda akan dihubungi tidak lama lagi.</p>
          <p class="mt-3 text-xs text-gray-400">No. Rujukan: EZK-${Date.now().toString().slice(-8)}</p>
        `,
        confirmButtonColor: '#1e73be',
        confirmButtonText: 'Selesai',
      })
      // Reset form
      payerName.value = ''
      idNumber.value = ''
      email.value = ''
      phone.value = ''
      selectedZakatType.value = 'pendapatan'
    }
  }

  async function calculateAndShowResult() {
    const amount = zakatAmount.value
    if (amount === 0) {
      await Swal.fire({
        icon: 'info',
        title: 'Tidak Wajib Zakat',
        text: 'Berdasarkan maklumat yang dimasukkan, anda tidak mencapai had nisab. Zakat tidak wajib pada masa ini.',
        confirmButtonColor: '#1e73be',
      })
      return
    }

    await Swal.fire({
      icon: 'success',
      title: 'Amaun Zakat Anda',
      html: `
        <div class="text-center">
          <p class="text-4xl font-bold text-blue-700 my-4">RM ${amount.toFixed(2)}</p>
          <p class="text-gray-500 text-sm">sebulan</p>
          <p class="mt-4 text-gray-600">Kadar Zakat: 2.5% daripada pendapatan bersih tahunan RM ${(amount / 0.025).toFixed(2)}</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '💳 Bayar Sekarang',
      cancelButtonText: 'Tutup',
      confirmButtonColor: '#1e73be',
    })
  }

  return {
    // State
    payerName, idType, idNumber, email, phone, selectedZakatType,
    activeCalculator, deductionMode,
    grossIncome, epf, otherDeductions,
    goldGrams, goldPricePerGram,
    savingsAmount,
    businessAssets, businessLiabilities,
    activeFaqIndex, mobileMenuOpen, calculatorDropdownOpen,
    // Computed
    zakatAmount,
    // Actions
    toggleFaq, toggleMobileMenu, closeMobileMenu,
    toggleCalculatorDropdown, closeCalculatorDropdown,
    submitPaymentForm, calculateAndShowResult,
  }
})
