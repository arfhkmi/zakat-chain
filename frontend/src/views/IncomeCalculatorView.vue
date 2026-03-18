<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useSwal } from '../../utils/useSwal'
import apiService from '../../utils/api'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  Coins, 
  User, 
  Heart, 
  GraduationCap, 
  Home, 
  Wallet,
  ArrowRight,
  Info,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MinusCircle,
  PlusCircle,
  ShieldCheck,
  Receipt,
  ExternalLink,
  ChevronLeft
} from 'lucide-vue-next'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/vue'
import { getSigner, payIncomeZakat, getIncomeInfo, type IncomePayParams, type IncomeInfo } from '../../utils/zakatInteraction'

// --- Enums and Types ---
enum CalculationType {
  WITHOUT_DEDUCTIONS = 'WITHOUT_DEDUCTIONS',
  WITH_DEDUCTIONS = 'WITH_DEDUCTIONS',
}

enum IncomeType {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
}

type Step = 'FORM' | 'RESULT' | 'NIYYAH' | 'PROCESSING' | 'SUCCESS'

interface DeductionBreakdown {
  selfAllowance: number;
  wives: number;
  childrenUnder18: number;
  childrenAbove18Studying: number;
  parentExpenses: number;
  epf: number;
  selfEducation: number;
  total: number;
}

interface ZakatResult {
  nisab: number;
  totalAnnualIncome: number;
  totalDeductions?: number;
  eligibleIncome: number;
  zakatContribution: number;
  amountAfterContribution: number;
  isEligible: boolean;
  zakatPerYear: number;
  zakatPerMonth: number;
  deductionBreakdown?: DeductionBreakdown;
}

// --- State ---
const currentStep = ref<Step>('FORM')
const calculationType = ref<CalculationType>(CalculationType.WITHOUT_DEDUCTIONS)
const incomeType = ref<IncomeType>(IncomeType.MONTHLY)
const isLoading = ref(false)
const result = ref<ZakatResult | null>(null)
const txHash = ref('')
const incomeInfoData = ref<IncomeInfo | null>(null)

const { open } = useAppKit()
const account = useAppKitAccount()
const { walletProvider } = useAppKitProvider<any>('eip155')
const { handleError } = useSwal()

onMounted(async () => {
  try {
    incomeInfoData.value = await getIncomeInfo()
  } catch (e) {
    console.error('Failed to load income info from contract:', e)
  }
})

const form = reactive({
  monthlyIncome: 0,
  annualIncome: 0,
  otherIncome: 0,
  zakatContribution: 0,
  deductions: {
    numberOfWives: 0,
    numberOfChildrenUnder18: 0,
    numberOfChildrenAbove18Studying: 0,
    parentExpenses: 0,
    epfPercentage: 11,
    selfEducationExpenses: 0,
  }
})

// --- Methods ---
const handleCalculate = async () => {
  if (!incomeInfoData.value) {
    handleError('Contract rates not loaded yet. Please wait and try again.', 'Not Ready')
    return
  }
  isLoading.value = true

  const { rate, threshold, selfDeduction, wifeDeduction, childMinorDeduction, childStudyDeduction, studyMaxDeduction } = incomeInfoData.value
  const payload: any = {
    calculationType: calculationType.value,
    rates: { rate, threshold, selfDeduction, wifeDeduction, childMinorDeduction, childStudyDeduction, studyMaxDeduction },
  }

  if (calculationType.value === CalculationType.WITHOUT_DEDUCTIONS) {
    payload.withoutDeductions = {
      incomeType: incomeType.value,
      monthlyIncome: incomeType.value === IncomeType.MONTHLY ? form.monthlyIncome : undefined,
      annualIncome: incomeType.value === IncomeType.ANNUAL ? form.annualIncome : undefined,
      otherIncome: form.otherIncome,
      zakatContribution: form.zakatContribution,
    }
  } else {
    payload.withDeductions = {
      incomeType: incomeType.value,
      monthlyIncome: incomeType.value === IncomeType.MONTHLY ? form.monthlyIncome : undefined,
      annualIncome: incomeType.value === IncomeType.ANNUAL ? form.annualIncome : undefined,
      otherIncome: form.otherIncome,
      zakatContribution: form.zakatContribution,
      deductions: { ...form.deductions },
    }
  }

  try {
    const response = await apiService.apiCall('POST', '/zakat/income/calculate', payload)
    result.value = response.data
    currentStep.value = 'RESULT'
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (error: any) {
    handleError(error.response?.data?.message || error, 'Calculation Failed')
  } finally {
    isLoading.value = false
  }
}

const handlePayment = async () => {
  if (!account.value.isConnected) {
    open()
    return
  }

  if (!result.value || result.value.zakatPerYear <= 0) return

  try {
    isLoading.value = true
    currentStep.value = 'PROCESSING'

    const signer = await getSigner(walletProvider?.value)

    const annualIncome = incomeType.value === IncomeType.MONTHLY
      ? form.monthlyIncome * 12 + form.otherIncome
      : form.annualIncome + form.otherIncome
    const epfDeduction = (annualIncome * form.deductions.epfPercentage) / 100

    const params: IncomePayParams = {
      isWithDeduction: calculationType.value === CalculationType.WITH_DEDUCTIONS,
      payType: 0,
      annualIncome: annualIncome.toFixed(6),
      contribution: form.zakatContribution.toFixed(6),
      customAmount: '0',
      deductions: {
        wifeCount: form.deductions.numberOfWives,
        childMinorCount: form.deductions.numberOfChildrenUnder18,
        childStudyCount: form.deductions.numberOfChildrenAbove18Studying,
        parentDeduction: form.deductions.parentExpenses.toFixed(6),
        epfDeduction: epfDeduction.toFixed(6),
        studyDeduction: form.deductions.selfEducationExpenses.toFixed(6),
      },
    }

    const tx = await payIncomeZakat(signer, params, result.value.zakatPerYear)
    txHash.value = tx.hash
    await tx.wait()

    currentStep.value = 'SUCCESS'
  } catch (error: any) {
    currentStep.value = 'RESULT'
    handleError(error, 'Payment Failed')
  } finally {
    isLoading.value = false
  }
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(value)
}

const resetForm = () => {
  currentStep.value = 'FORM'
  result.value = null
  txHash.value = ''
  form.monthlyIncome = 0
  form.annualIncome = 0
  form.otherIncome = 0
  form.zakatContribution = 0
  form.deductions = {
    numberOfWives: 0,
    numberOfChildrenUnder18: 0,
    numberOfChildrenAbove18Studying: 0,
    parentExpenses: 0,
    epfPercentage: 11,
    selfEducationExpenses: 0,
  }
}

const goBack = () => {
  if (currentStep.value === 'RESULT') currentStep.value = 'FORM'
}

// --- Watchers ---
watch(() => account.value.isConnected, (connected) => {
  if (connected && currentStep.value === 'RESULT') {
    // If user connects while on result page, they might want to pay immediately
    // but we'll let them click the button again for safety
  }
})
</script>

<template>
  <div class="min-h-screen bg-background text-foreground !py-12 !px-4 sm:!px-6 lg:!px-8 flex flex-col items-center justify-center">
    <div class="max-w-4xl mx-auto !mb-50">

      <!-- Back Button (Step 1 only) -->
      <div v-if="currentStep === 'FORM'" class="flex justify-end !mb-4">
        <RouterLink to="/pay-zakat" class="flex items-center gap-2 !px-5 !py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/40 text-sm font-bold transition-all">
          <ChevronLeft class="w-4 h-4" /> Back
        </RouterLink>
      </div>

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

      <!-- Step 1: Form -->
      <div v-if="currentStep === 'FORM'" class="animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div class="text-center !mb-12">
          <Badge variant="outline" class="!mb-4 border-primary/50 text-primary !px-4 !py-1 rounded-full">
            Step 1: Evaluation
          </Badge>
          <h1 class="text-4xl font-extrabold tracking-tight sm:text-5xl !mb-4">
            Calculate <span class="text-primary">Income Zakat</span>
          </h1>
          <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fill in your income details to determine your obligation.
          </p>
        </div>

        <Card class="bg-card/50 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden">
          <CardHeader class="border-b border-white/5 bg-primary/5 !py-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 !px-5">
              <div>
                <CardTitle class="text-2xl font-bold flex items-center gap-2">
                  <Calculator class="w-6 h-6 text-primary " />
                  Calculation Settings
                </CardTitle>
                <CardDescription class="!mt-1">
                  Select your preferred calculation method
                </CardDescription>
              </div>
              
              <div class="flex bg-black/40 !p-1 rounded-xl border border-white/10">
                <button 
                  @click="calculationType = CalculationType.WITHOUT_DEDUCTIONS"
                  :class="[
                    '!px-4 !py-2 rounded-lg text-sm font-bold transition-all',
                    calculationType === CalculationType.WITHOUT_DEDUCTIONS 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'text-muted-foreground hover:text-foreground'
                  ]"
                >
                  No Deductions
                </button>
                <button 
                  @click="calculationType = CalculationType.WITH_DEDUCTIONS"
                  :class="[
                    '!px-4 !py-2 rounded-lg text-sm font-bold transition-all',
                    calculationType === CalculationType.WITH_DEDUCTIONS 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'text-muted-foreground hover:text-foreground'
                  ]"
                >
                  With Deductions
                </button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent class="!p-8 space-y-10">
            <!-- Income Selection -->
            <div class="space-y-6">
              <h3 class="text-lg font-bold flex items-center gap-2 text-primary">
                <Coins class="w-5 h-5" />
                Income Details
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-3">
                  <label class="text-sm font-medium text-muted-foreground">Income Period</label>
                  <div class="flex bg-black/40 !p-1 rounded-xl border border-white/5">
                    <button 
                      @click="incomeType = IncomeType.MONTHLY"
                      :class="['flex-1 !py-2 rounded-lg text-xs font-bold transition-all', incomeType === IncomeType.MONTHLY ? 'bg-white/10 text-primary' : 'text-muted-foreground']"
                    >
                      Monthly
                    </button>
                    <button 
                      @click="incomeType = IncomeType.ANNUAL"
                      :class="['flex-1 !py-2 rounded-lg text-xs font-bold transition-all', incomeType === IncomeType.ANNUAL ? 'bg-white/10 text-primary' : 'text-muted-foreground']"
                    >
                      Annual
                    </button>
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="text-sm font-medium text-muted-foreground">
                    {{ incomeType === IncomeType.MONTHLY ? 'Monthly Salary' : 'Annual Salary' }} (RM)
                  </label>
                  <div class="relative group">
                    <div class="absolute inset-y-0 left-0 !pl-4 flex items-center pointer-events-none">
                      <span class="text-muted-foreground font-mono">RM</span>
                    </div>
                    <input 
                      v-if="incomeType === IncomeType.MONTHLY"
                      type="number" 
                      v-model="form.monthlyIncome"
                      class="block w-full !pl-12 !pr-4 !py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-mono"
                      placeholder="0.00"
                    />
                    <input 
                      v-else
                      type="number" 
                      v-model="form.annualIncome"
                      class="block w-full !pl-12 !pr-4 !py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-mono"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-3">
                  <label class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Other Income (Annual RM)
                    <Info class="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 !pl-4 flex items-center pointer-events-none">
                      <span class="text-muted-foreground font-mono">RM</span>
                    </div>
                    <input 
                      type="number" 
                      v-model="form.otherIncome"
                      class="block w-full !pl-12 !pr-4 !py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-mono"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div class="space-y-3">
                  <label class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    Pre-paid Zakat (Annual RM)
                    <Info class="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </label>
                  <div class="relative">
                    <div class="absolute inset-y-0 left-0 !pl-4 flex items-center pointer-events-none">
                      <span class="text-muted-foreground font-mono">RM</span>
                    </div>
                    <input 
                      type="number" 
                      v-model="form.zakatContribution"
                      class="block w-full !pl-12 !pr-4 !py-3 bg-black/20 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all font-mono"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Deductions -->
            <div v-if="calculationType === CalculationType.WITH_DEDUCTIONS" class="space-y-8 !pt-6 border-t border-white/5 animate-in fade-in duration-500">
              <h3 class="text-lg font-bold flex items-center gap-2 text-primary">
                <Heart class="w-5 h-5" />
                Deductions (Had Kifayah)
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Family, Expenses, Retirement inputs keep same from previous version -->
                <div class="space-y-4 !p-5 bg-white/5 rounded-2xl border border-white/5">
                  <div class="flex items-center gap-2 !mb-2">
                    <User class="w-4 h-4 text-primary" />
                    <span class="text-xs font-black tracking-widest opacity-60 uppercase">Family</span>
                  </div>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold">Wives</label>
                      <div class="flex items-center gap-2">
                        <button @click="form.deductions.numberOfWives = Math.max(0, form.deductions.numberOfWives - 1)"><MinusCircle class="w-4 h-4" /></button>
                        <span class="text-xs font-bold">{{ form.deductions.numberOfWives }}</span>
                        <button @click="form.deductions.numberOfWives = Math.min(4, form.deductions.numberOfWives + 1)"><PlusCircle class="w-4 h-4" /></button>
                      </div>
                    </div>
                    <div class="flex items-center justify-between">
                      <label class="text-xs font-semibold">Children < 18</label>
                      <div class="flex items-center gap-2">
                        <button @click="form.deductions.numberOfChildrenUnder18 = Math.max(0, form.deductions.numberOfChildrenUnder18 - 1)"><MinusCircle class="w-4 h-4" /></button>
                        <span class="text-xs font-bold">{{ form.deductions.numberOfChildrenUnder18 }}</span>
                        <button @click="form.deductions.numberOfChildrenUnder18++"><PlusCircle class="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                </div>

                 <div class="space-y-4 !p-5 bg-white/5 rounded-2xl border border-white/5">
                  <div class="flex items-center gap-2 !mb-2">
                    <Home class="w-4 h-4 text-primary" />
                    <span class="text-xs font-black tracking-widest opacity-60 uppercase">Expenses</span>
                  </div>
                  <div class="space-y-3">
                    <label class="text-[10px] opacity-60">Parents (RM/yr)</label>
                    <input type="number" v-model="form.deductions.parentExpenses" class="w-full bg-black/40 border border-white/10 rounded !px-2 !py-1 text-xs" />
                    <label class="text-[10px] opacity-60">Education (RM/yr)</label>
                    <input type="number" v-model="form.deductions.selfEducationExpenses" class="w-full bg-black/40 border border-white/10 rounded !px-2 !py-1 text-xs" />
                  </div>
                </div>

                <div class="space-y-4 !p-5 bg-white/5 rounded-2xl border border-white/5">
                  <div class="flex items-center gap-2 !mb-2">
                    <GraduationCap class="w-4 h-4 text-primary" />
                    <span class="text-xs font-black tracking-widest opacity-60 uppercase">EPF</span>
                  </div>
                  <div class="space-y-2">
                     <input type="range" v-model="form.deductions.epfPercentage" min="0" max="20" class="w-full accent-primary" />
                     <p class="text-center font-bold text-primary">{{ form.deductions.epfPercentage }}%</p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              @click="handleCalculate" 
              :disabled="isLoading"
              class="w-full h-14 !mt-5 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20 rounded-2xl"
            >
              <RefreshCw v-if="isLoading" class="w-6 h-6 !mr-2 animate-spin" />
              <Calculator v-else class="w-6 h-6 !mr-2" />
              Calculate & Proceed
            </Button>
          </CardContent>
        </Card>
      </div>

      <!-- Step 2: Result -->
      <div v-if="currentStep === 'RESULT' && result" class="animate-in fade-in slide-in-from-right-8 duration-700">
         <button @click="goBack" class="flex items-center gap-2 text-muted-foreground hover:text-primary !mb-8 transition-colors">
            <ChevronLeft class="w-5 h-5" /> Back to Editor
         </button>

         <div class="text-center !mb-12">
            <Badge variant="outline" class="!mb-4 border-primary/50 text-primary !px-4 !py-1 rounded-full">
              Step 2: Verification
            </Badge>
            <h1 class="text-4xl font-extrabold tracking-tight">Requirement <span class="text-primary">Summary</span></h1>
         </div>

         <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card :class="['md:col-span-2 overflow-hidden border-2', result.isEligible ? 'border-primary/50 bg-primary/5' : 'border-destructive/50 bg-destructive/5']">
               <CardContent class="!p-10 text-center md:text-left">
                  <div class="flex flex-col md:flex-row items-center gap-6 !mb-10">
                    <div :class="['!p-4 rounded-3xl', result.isEligible ? 'bg-primary/20 text-primary' : 'bg-destructive/20 text-destructive']">
                      <CheckCircle2 v-if="result.isEligible" class="w-12 h-12" />
                      <XCircle v-else class="w-12 h-12" />
                    </div>
                    <div>
                       <h2 class="text-3xl font-black">{{ result.isEligible ? 'Zakat Obligatory' : 'Exempted' }}</h2>
                       <p class="text-muted-foreground">{{ result.isEligible ? 'Your eligible wealth meets the Nisab threshold of ' + formatCurrency(result.nisab) : 'Your wealth is below the Nisab threshold.' }}</p>
                    </div>
                  </div>

                  <div v-if="result.isEligible" class="space-y-8">
                     <div class="!p-8 bg-black/40 rounded-3xl border border-white/5">
                        <p class="text-xs font-bold uppercase tracking-[0.2em] opacity-50 !mb-4">Total Amount to Pay</p>
                        <div class="flex items-baseline gap-4">
                           <span class="text-6xl font-black text-primary font-mono ">{{ formatCurrency(result.zakatPerYear) }}</span>
                           <span class="text-xl text-muted-foreground font-medium">/ year</span>
                        </div>
                     </div>

                     <div class="flex items-center gap-4 !mt-5">
                        <div class="w-3 h-3 rounded-full bg-primary animate-pulse"></div>
                        <p class="text-sm font-medium ">Secure Blockchain Payment Available</p>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div class="space-y-6">
               <Card class="bg-card/50 border-white/5 !mb-2">
                  <CardHeader><CardTitle class="text-sm font-black uppercase opacity-50 !p-2">Data Breakdown</CardTitle></CardHeader>
                  <CardContent class="space-y-4 !p-2">
                     <div class="flex justify-between text-xs">
                        <span class="opacity-60">Gross Income</span>
                        <span class="font-bold">{{ formatCurrency(result.totalAnnualIncome) }}</span>
                     </div>
                     <div v-if="result.totalDeductions" class="flex justify-between text-xs">
                        <span class="opacity-60">Total Deductions</span>
                        <span class="font-bold text-destructive">-{{ formatCurrency(result.totalDeductions) }}</span>
                     </div>
                     <div class="border-t border-white/5 !pt-4 flex justify-between">
                        <span class="text-xs font-bold text-primary italic">Taxable Wealth</span>
                        <span class="text-sm font-black">{{ formatCurrency(result.eligibleIncome) }}</span>
                     </div>
                  </CardContent>
               </Card>

               <Button
                  v-if="result.isEligible"
                  @click="account.isConnected ? (currentStep = 'NIYYAH') : open()"
                  class="w-full h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest shadow-xl shadow-primary/30 rounded-sm group transition-all"
               >
                  <component :is="account.isConnected ? ArrowRight : ShieldCheck" class="w-6 h-6 !mr-3 group-hover:scale-110 transition-transform" />
                  {{ account.isConnected ? 'Proceed to Niyyah' : 'Connect to Pay' }}
               </Button>
               <Button v-else variant="outline" @click="resetForm" class="w-full h-8 rounded-sm font-bold uppercase tracking-widest">Back to Start</Button>
            </div>
         </div>
      </div>

      <!-- Step 3: Niyyah -->
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
          <p class="text-muted-foreground">Read the intention for your Income Zakat before confirming payment.</p>
        </div>

        <Card class="bg-card/50 backdrop-blur-xl border-white/5 shadow-2xl overflow-hidden !mb-8">
          <div class="h-1 w-full bg-primary"></div>
          <CardContent class="!p-8 flex flex-col gap-4">
            <p class="text-xs font-black uppercase tracking-widest text-primary opacity-70">Niyyah — Zakat Al-Mal (Pendapatan)</p>
            <p class="text-2xl font-bold text-right leading-loose" dir="rtl">
              نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْمَالِ فَرْضًا لِلّٰهِ تَعَالَى
            </p>
            <p class="text-sm text-primary font-medium italic">
              "Nawaitu an ukhrija zakatadz maali fardhan lillahi taala"
            </p>
            <p class="text-sm text-muted-foreground leading-relaxed">
              "I intend to give zakat on my wealth, as an obligation to Allah, the Almighty."
            </p>
          </CardContent>
        </Card>

        <Button
          @click="handlePayment"
          :disabled="isLoading"
          class="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20 rounded-2xl"
        >
          <Wallet class="w-5 h-5 !mr-2" />
          Confirm &amp; Pay
        </Button>
      </div>

      <!-- Step 4: Processing -->
      <div v-if="currentStep === 'PROCESSING'" class="animate-in fade-in zoom-in duration-500 flex flex-col items-center justify-center !py-20 text-center">
         <div class="relative w-32 h-32 !mb-10">
            <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div class="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <Wallet class="absolute inset-0 !m-auto w-12 h-12 text-primary animate-pulse" />
         </div>
         <h2 class="text-3xl font-black !mb-4">Confirming Transaction</h2>
         <p class="text-muted-foreground max-w-sm">Please approve the transaction in your wallet and wait for blockchain confirmation.</p>
         
         <Card class="!mt-12 bg-white/5 border-white/10 w-full max-w-md">
            <CardContent class="!p-6">
                <div class="flex justify-between items-center text-sm">
                   <span class="opacity-50">Estimated Amount</span>
                   <span class="font-bold text-primary font-mono">{{ formatCurrency(result?.zakatPerYear || 0) }}</span>
                </div>
            </CardContent>
         </Card>
      </div>

      <!-- Step 4: Success / Receipt -->
      <div v-if="currentStep === 'SUCCESS'" class="animate-in fade-in slide-in-from-bottom-12 duration-1000">
         <div class="flex flex-col items-center text-center">
            <div class="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center !mb-8 shadow-2xl shadow-primary/40 animate-bounce">
               <Receipt class="w-12 h-12" />
            </div>
            <h1 class="text-5xl font-black !mb-4 leading-tight">Mabrur! <br/> <span class="text-primary font-mono">Payment Successful</span></h1>
            <p class="text-muted-foreground text-lg !mb-12">Your Zakat has been processed and verified on the blockchain.</p>

            <Card class="w-full max-w-2xl bg-gradient-to-br from-card to-background border-white/10 overflow-hidden relative shadow-2xl">
               <!-- Decorative elements -->
               <div class="absolute top-0 left-0 w-full h-2 bg-primary"></div>
               <CardHeader class="border-b border-white/5 !pb-5 !p-5">
                  <div class="flex justify-between items-start">
                     <div class="text-left">
                        <CardTitle class="text-2xl font-black opacity-50 uppercase tracking-tighter">Official Receipt</CardTitle>
                        <p class="text-xs text-muted-foreground font-mono">ID: {{ txHash.slice(0, 16) }}...</p>
                     </div>
                     <Badge class="bg-primary/20 text-primary border-primary/20 !p-2">VERIFIED</Badge>
                  </div>
               </CardHeader>
               
               <CardContent class="!py-10 !px-12 space-y-10">
                  <div class="grid grid-cols-2 gap-12 !mb-5">
                     <div class="text-left space-y-2">
                        <p class="text-[10px] font-black uppercase tracking-widest opacity-40">Payment Type</p>
                        <p class="text-lg font-bold">Income Zakat (Pendapatan)</p>
                     </div>
                     <div class="text-left space-y-2">
                        <p class="text-[10px] font-black uppercase tracking-widest opacity-40">Payer Address</p>
                        <p class="text-xs font-mono break-all opacity-80">{{ account.address }}</p>
                     </div>
                  </div>

                  <div class="!p-8 bg-primary/5 rounded-[2rem] border border-primary/10 flex flex-col items-center">
                     <p class="text-[10px] font-black uppercase tracking-widest opacity-40 !mb-2">Total Contribution (MYR)</p>
                     <p class="text-5xl font-black text-primary font-mono">{{ formatCurrency(result?.zakatPerYear || 0) }}</p>
                  </div>

                  <div class="flex flex-col sm:flex-row justify-between items-center gap-6 !pt-6 opacity-60">
                     <div class="flex items-center gap-2">
                        <ShieldCheck class="w-4 h-4 text-primary" />
                        <span class="text-[10px] font-bold uppercase tracking-widest">Secured by BSC Testnet</span>
                     </div>
                     <a :href="'https://testnet.bscscan.com/tx/' + txHash" target="_blank" class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                        View on BscScan <ExternalLink class="w-3 h-3" />
                     </a>
                  </div>
               </CardContent>
               
               <CardFooter class="bg-black/40 !p-8 flex flex-col sm:flex-row gap-4">
                  <RouterLink to="/" class="flex-1">
                    <Button variant="outline" class="w-full h-14 rounded-xl font-bold uppercase tracking-widest ">Back to Dashboard</Button>
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

input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button { 
  -webkit-appearance: none; 
  appearance: none;
  margin: 0; 
}

input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.font-mono {
  letter-spacing: -0.05em;
}
</style>
