<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSwal } from '../../utils/useSwal'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  HandCoins,
  ChevronLeft,
  MinusCircle,
  PlusCircle,
  Wallet,
  ShieldCheck,
  RefreshCw,
  Receipt,
  ExternalLink,
  CheckCircle2,
  ArrowRight
} from 'lucide-vue-next'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/vue'
import { getFitrahRate, getSigner, payFitrahZakat, type FitrahRate } from '../../utils/zakatInteraction'
import apiService from '../../utils/api'
import { onMounted } from 'vue'

// FitrahRateType enum matches contract: 0=Local, 1=Import, 2=Basmathi
const RATE_TYPES = [
  { label: 'Standard (Local)', value: 0, key: 'localRate' as keyof FitrahRate },
  { label: 'Mid-Range (Import)', value: 1, key: 'importRate' as keyof FitrahRate },
  { label: 'Premium (Basmathi)', value: 2, key: 'basmathiRate' as keyof FitrahRate },
]

type Step = 'FORM' | 'RESULT' | 'NIYYAH' | 'PROCESSING' | 'SUCCESS'

const currentStep = ref<Step>('FORM')
const isLoading = ref(false)
const isCalculating = ref(false)
const txHash = ref('')

interface FitrahApiResult {
  numberOfPersons: number
  ratePerPerson: number
  totalAmount: number
  breakdown: string
}
const fitrahApiResult = ref<FitrahApiResult | null>(null)

const fitrahRateData = ref<FitrahRate | null>(null)
const isLoadingRates = ref(false)

const selectedRateType = ref(0)
const count = ref(1)

const { open } = useAppKit()
const account = useAppKitAccount()
const { walletProvider } = useAppKitProvider<any>('eip155')
const { handleError } = useSwal()

onMounted(async () => {
  isLoadingRates.value = true
  try {
    fitrahRateData.value = await getFitrahRate()
  } catch (e) {
    console.error(e)
  } finally {
    isLoadingRates.value = false
  }
})

const selectedRateInfo = computed(() => RATE_TYPES[selectedRateType.value])

const ratePerPerson = computed(() => {
  if (!fitrahRateData.value || !selectedRateInfo.value) return 0
  return fitrahRateData.value[selectedRateInfo.value.key] as number
})

const totalAmount = computed(() => ratePerPerson.value * count.value)

const fmtRM = (v: number) =>
  `RM ${v.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const handleCalculate = async () => {
  if (!fitrahRateData.value || !selectedRateInfo.value) return
  isCalculating.value = true
  try {
    const response = await apiService.apiCall('POST', '/zakat/fitrah/calculate', {
      numberOfPersons: count.value,
      ratePerPerson: ratePerPerson.value,
    })
    fitrahApiResult.value = response.data
    currentStep.value = 'RESULT'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error: any) {
    handleError(error.response?.data?.message || error, 'Calculation Failed')
  } finally {
    isCalculating.value = false
  }
}

const handlePayment = async () => {
  if (!account.value.isConnected) {
    open()
    return
  }

  try {
    isLoading.value = true
    currentStep.value = 'PROCESSING'

    const signer = await getSigner(walletProvider?.value)
    const payAmount = fitrahApiResult.value?.totalAmount ?? totalAmount.value
    const tx = await payFitrahZakat(signer, selectedRateType.value, count.value, payAmount)
    txHash.value = tx.hash
    await tx.wait()

    currentStep.value = 'SUCCESS'
  } catch (error: any) {
    currentStep.value = 'FORM'
    handleError(error, 'Payment Failed')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-background text-foreground !py-12 !px-4 sm:!px-6 lg:!px-8 flex flex-col items-center justify-center">
    <div class="w-full max-w-xl mx-auto">

      <!-- Stepper Indicator -->
      <div v-if="currentStep !== 'SUCCESS'" class="flex items-center justify-center gap-4 !mb-12 animate-in fade-in duration-500">
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all', currentStep === 'FORM' ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' : 'bg-white/10 text-muted-foreground']">1</div>
        <div class="w-12 h-0.5 bg-white/10"></div>
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all', currentStep === 'RESULT' ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' : 'bg-white/10 text-muted-foreground']">2</div>
        <div class="w-12 h-0.5 bg-white/10"></div>
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all', currentStep === 'NIYYAH' ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' : 'bg-white/10 text-muted-foreground']">3</div>
        <div class="w-12 h-0.5 bg-white/10"></div>
        <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all', currentStep === 'PROCESSING' ? 'bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20' : 'bg-white/10 text-muted-foreground']">4</div>
      </div>

      <!-- Step: FORM -->
      <div v-if="currentStep === 'FORM'" class="animate-in fade-in slide-in-from-bottom-8 duration-700">

        <!-- Back button -->
        <div class="flex justify-end !mb-4">
          <RouterLink to="/pay-zakat" class="flex items-center gap-2 !px-5 !py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 text-sm font-bold transition-all">
            <ChevronLeft class="w-4 h-4" /> Back
          </RouterLink>
        </div>

        <!-- Header -->
        <div class="text-center !mb-10">
          <Badge variant="outline" class="!mb-4 border-primary/50 text-primary !px-4 !py-1 rounded-full">
            Fitrah Zakat
          </Badge>
          <h1 class="text-4xl font-extrabold tracking-tight !mb-3">
            Pay <span class="text-primary">Fitrah</span>
          </h1>
          <p class="text-muted-foreground">Select your rice category and number of people.</p>
        </div>

        <Card class="bg-card/50 backdrop-blur-xl border-white/5 shadow-2xl">
          <CardContent class="!p-8 flex flex-col gap-6">

            <!-- Rate type selector -->
            <div class="flex flex-col gap-3">
              <label class="block text-sm font-medium text-muted-foreground">Rice Category</label>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="rt in RATE_TYPES"
                  :key="rt.value"
                  @click="selectedRateType = rt.value"
                  :class="[
                    '!p-4 rounded-2xl border text-sm font-bold transition-all text-center',
                    selectedRateType === rt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/10 bg-white/5 text-muted-foreground hover:border-white/20'
                  ]"
                >
                  {{ rt.label }}
                  <div v-if="fitrahRateData" class="text-xs font-mono !mt-1 opacity-80">
                    {{ fmtRM(fitrahRateData[rt.key] as number) }}
                  </div>
                  <div v-else class="text-xs font-mono !mt-1 opacity-40">—</div>
                </button>
              </div>
            </div>

            <!-- People count -->
            <div class="flex flex-col gap-3">
              <label class="block text-sm font-medium text-muted-foreground">Number of People</label>
              <div class="flex items-center justify-between !p-4 bg-black/20 border border-white/10 rounded-2xl">
                <button @click="count = Math.max(1, count - 1)" class="text-muted-foreground hover:text-primary transition-colors">
                  <MinusCircle class="w-6 h-6" />
                </button>
                <span class="text-3xl font-black font-mono text-primary">{{ count }}</span>
                <button @click="count++" class="text-muted-foreground hover:text-primary transition-colors">
                  <PlusCircle class="w-6 h-6" />
                </button>
              </div>
            </div>

            <!-- Total -->
            <div class="!p-6 bg-primary/5 border border-primary/20 rounded-2xl text-center space-y-1">
              <p class="text-xs font-bold uppercase tracking-widest opacity-50">Total Amount</p>
              <p :class="['text-4xl font-black font-mono text-primary', isLoadingRates ? 'opacity-30' : '']">
                {{ fmtRM(totalAmount) }}
              </p>
              <p class="text-xs text-muted-foreground">{{ fmtRM(ratePerPerson) }} × {{ count }} person(s)</p>
            </div>

            <Button
              @click="handleCalculate"
              :disabled="!fitrahRateData || totalAmount <= 0 || isCalculating"
              class="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20 rounded-2xl"
            >
              <RefreshCw v-if="isCalculating" class="w-5 h-5 !mr-2 animate-spin" />
              <HandCoins v-else class="w-5 h-5 !mr-2" />
              {{ isCalculating ? 'Calculating...' : 'Calculate' }}
            </Button>

          </CardContent>
        </Card>
      </div>

      <!-- Step: RESULT -->
      <div v-if="currentStep === 'RESULT'" class="animate-in fade-in slide-in-from-right-8 duration-700">
        <button @click="currentStep = 'FORM'" class="flex items-center gap-2 text-muted-foreground hover:text-primary !mb-8 transition-colors">
          <ChevronLeft class="w-5 h-5" /> Back to Edit
        </button>

        <div class="text-center !mb-10">
          <Badge variant="outline" class="!mb-4 border-primary/50 text-primary !px-4 !py-1 rounded-full">
            Step 2: Confirmation
          </Badge>
          <h1 class="text-4xl font-extrabold tracking-tight !mb-3">
            Review <span class="text-primary">Summary</span>
          </h1>
          <p class="text-muted-foreground">Confirm your Fitrah details before paying.</p>
        </div>

        <Card class="bg-card/50 backdrop-blur-xl border-white/5 shadow-2xl">
          <CardContent class="!p-8 flex flex-col gap-6">

            <!-- Summary rows -->
            <div class="space-y-3">
              <div class="flex justify-between items-center text-sm !py-3 border-b border-white/5">
                <span class="text-muted-foreground">Rice Category</span>
                <span class="font-bold">{{ RATE_TYPES[selectedRateType]?.label }}</span>
              </div>
              <div class="flex justify-between items-center text-sm !py-3 border-b border-white/5">
                <span class="text-muted-foreground">Rate per Person</span>
                <span class="font-bold font-mono">{{ fmtRM(ratePerPerson) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm !py-3 border-b border-white/5">
                <span class="text-muted-foreground">Number of People</span>
                <span class="font-bold">{{ count }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="!p-6 bg-primary/5 border border-primary/20 rounded-2xl text-center space-y-1">
              <p class="text-xs font-bold uppercase tracking-widest opacity-50">Total Amount</p>
              <p class="text-5xl font-black font-mono text-primary">{{ fmtRM(fitrahApiResult?.totalAmount ?? totalAmount) }}</p>
              <p v-if="fitrahApiResult?.breakdown" class="text-xs text-muted-foreground !mt-1">{{ fitrahApiResult.breakdown }}</p>
            </div>

            <Button
              @click="account.isConnected ? (currentStep = 'NIYYAH') : open()"
              :disabled="isLoading"
              class="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20 rounded-2xl"
            >
              <component :is="account.isConnected ? ArrowRight : ShieldCheck" class="w-5 h-5 !mr-2" />
              {{ account.isConnected ? 'Proceed to Niyyah' : 'Connect to Pay' }}
            </Button>

          </CardContent>
        </Card>
      </div>

      <!-- Step: NIYYAH -->
      <div v-if="currentStep === 'NIYYAH'" class="animate-in fade-in slide-in-from-right-8 duration-700">
        <button @click="currentStep = 'RESULT'" class="flex items-center gap-2 text-muted-foreground hover:text-primary !mb-8 transition-colors">
          <ChevronLeft class="w-5 h-5" /> Back to Summary
        </button>

        <div class="text-center !mb-10">
          <Badge variant="outline" class="!mb-4 border-primary/50 text-primary !px-4 !py-1 rounded-full">
            Step 3: Niyyah
          </Badge>
          <h1 class="text-4xl font-extrabold tracking-tight !mb-3">
            Recite <span class="text-primary">Niyyah</span>
          </h1>
          <p class="text-muted-foreground">Read the intention for your Fitrah Zakat before confirming payment.</p>
        </div>

        <div class="space-y-6 !mb-8">

          <!-- Niyyah for yourself -->
          <Card class="!mb-10 bg-card/50 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
            <div class="h-1 w-full bg-primary/50"></div>
            <CardContent class="!p-8 flex flex-col gap-4">
              <p class="text-xs font-black uppercase tracking-widest text-primary opacity-70">For Yourself Only</p>
              <p class="text-2xl font-bold text-right leading-loose" dir="rtl">
                نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِيْ فَرْضًا لِلّٰهِ تَعَالَى
              </p>
              <p class="text-sm text-primary font-medium italic">
                "Nawaitu an ukhrija zakatal fitri 'an nafsi fardhan lillahi ta'ala"
              </p>
              <p class="text-sm text-muted-foreground leading-relaxed">
                "I intend to pay Zakat al-Fitr for myself, as an obligation to Allah the Almighty."
              </p>
            </CardContent>
          </Card>

          <!-- Niyyah for yourself and family -->
          <Card class="bg-card/50 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
            <div class="h-1 w-full bg-primary"></div>
            <CardContent class="!p-8 flex flex-col gap-4">
              <p class="text-xs font-black uppercase tracking-widest text-primary opacity-70">For Yourself &amp; Family</p>
              <p class="text-2xl font-bold text-right leading-loose" dir="rtl">
                نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنِّيْ وَعَنْ جَمِيْعِ مَا يَلْزَمُنِيْ نَفَقَاتُهُمْ شَرْعًا فَرْضًا لِلّٰهِ تَعَالَى
              </p>
              <p class="text-sm text-primary font-medium italic">
                "Nawaitu an ukhrija zakatal fitri 'anni wa 'an jami'i ma talzamuni nafaqatuhum syar'an fardhan lillahi ta'ala"
              </p>
              <p class="text-sm text-muted-foreground leading-relaxed">
                "I intend to pay the Zakat al-Fitr for myself and for all those whom I am responsible for, as an obligation to Allah the Almighty."
              </p>
            </CardContent>
          </Card>

        </div>

        <Button
          @click="handlePayment"
          :disabled="isLoading"
          class="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20 rounded-2xl"
        >
          <Wallet class="w-5 h-5 !mr-2" />
          Confirm &amp; Pay
        </Button>
      </div>

      <!-- Step: PROCESSING -->
      <div v-if="currentStep === 'PROCESSING'" class="flex flex-col items-center justify-center !py-20 text-center animate-in fade-in zoom-in duration-500">
        <div class="relative w-32 h-32 !mb-10">
          <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <HandCoins class="absolute inset-0 !m-auto w-12 h-12 text-primary animate-pulse" />
        </div>
        <h2 class="text-3xl font-black !mb-4">Confirming Transaction</h2>
        <p class="text-muted-foreground max-w-sm">Please approve the transaction in your wallet and wait for blockchain confirmation.</p>
      </div>

      <!-- Step: SUCCESS -->
      <div v-if="currentStep === 'SUCCESS'" class="animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div class="flex flex-col items-center text-center">
          <div class="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center !mb-8 shadow-2xl shadow-primary/40 animate-bounce">
            <Receipt class="w-12 h-12" />
          </div>
          <h1 class="text-5xl font-black !mb-4 leading-tight">Mabrur! <br/><span class="text-primary font-mono">Payment Successful</span></h1>
          <p class="text-muted-foreground text-lg !mb-12">Your Fitrah Zakat has been processed and verified on the blockchain.</p>

          <Card class="w-full bg-gradient-to-br from-card to-background border-white/10 overflow-hidden shadow-2xl">
            <div class="h-2 w-full bg-primary"></div>
            <CardHeader class="border-b border-white/5 !p-5">
              <div class="flex justify-between items-start">
                <div class="text-left">
                  <CardTitle class="text-xl font-black opacity-50 uppercase tracking-tighter">Official Receipt</CardTitle>
                  <p class="text-xs text-muted-foreground font-mono">ID: {{ txHash.slice(0, 16) }}...</p>
                </div>
                <Badge class="bg-primary/20 text-primary border-primary/20 !p-2">VERIFIED</Badge>
              </div>
            </CardHeader>
            <CardContent class="!p-8 space-y-6">
              <div class="grid grid-cols-2 gap-6 text-left">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest opacity-40 !mb-1">Payment Type</p>
                  <p class="font-bold">Fitrah Zakat</p>
                </div>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest opacity-40 !mb-1">Category</p>
                  <p class="font-bold">{{ RATE_TYPES[selectedRateType]?.label }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest opacity-40 !mb-1">No. of People</p>
                  <p class="font-bold">{{ count }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest opacity-40 !mb-1">Payer</p>
                  <p class="text-xs font-mono break-all opacity-80">{{ account?.address }}</p>
                </div>
              </div>

              <div class="!p-6 !mt-10 !mb-5 bg-primary/5 rounded-2xl border border-primary/10 text-center">
                <p class="text-[10px] font-black uppercase tracking-widest opacity-40 !mb-2">Total Paid</p>
                <p class="text-4xl font-black text-primary font-mono">{{ fmtRM(fitrahApiResult?.totalAmount ?? totalAmount) }}</p>
              </div>

              <div class="flex justify-between items-center opacity-60">
                <div class="flex items-center gap-2">
                  <CheckCircle2 class="w-4 h-4 text-primary" />
                  <span class="text-[10px] font-bold uppercase tracking-widest">Secured by BSC Testnet</span>
                </div>
                <a :href="'https://testnet.bscscan.com/tx/' + txHash" target="_blank" class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                  View on BscScan <ExternalLink class="w-3 h-3" />
                </a>
              </div>
            </CardContent>
            <CardFooter class="bg-black/40 !p-6">
              <RouterLink to="/" class="w-full">
                <Button variant="outline" class="w-full h-12 rounded-xl font-bold uppercase tracking-widest">Back to Home</Button>
              </RouterLink>
            </CardFooter>
          </Card>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
