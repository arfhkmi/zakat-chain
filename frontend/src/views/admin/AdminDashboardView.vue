<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useRouter } from 'vue-router'
import { formatUnits } from 'ethers'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Wallet,
  Settings,
  ArrowLeftRight,
  TrendingUp,
  Users,
  Coins,
  Save,
  CheckCircle2,
  Crown,
  CircleDollarSign,
  Percent
} from 'lucide-vue-next'
import { useSwal } from '../../../utils/useSwal'
import { useAppKitProvider } from '@reown/appkit/vue'
import {
  getSigner,
  getAdminContractData,
  getTokenInfo,
  adminChangeCollector,
  adminCollectFunds,
  adminUpdateFitrahRates,
  adminUpdateIncomeInfo,
} from '../../../utils/zakatInteraction'

const router = useRouter()
const contractAddress = import.meta.env.VITE_ZAKAT_CONTRACT_ADDRESS

const isLoading = ref(true)
const isUpdating = ref(false)
const adminAuth = ref(!!localStorage.getItem('admin_token'))

const { handleSuccess, handleError, handleLoading } = useSwal()
const { walletProvider } = useAppKitProvider<any>('eip155')

const tokenInfo = ref({ symbol: '...', decimals: 18 })

const contractData = ref({
  owner: '',
  collector: '',
  paymentToken: '',
  fitrahRate: { localRate: 0n, importRate: 0n, basmathiRate: 0n },
  fitrahSummary: { count: 0n, balance: 0n, total: 0n },
  incomeInfo: {
    rate: 0n,
    threshold: 0n,
    selfDeduction: 0n,
    wifeDeduction: 0n,
    childMinorDeduction: 0n,
    childStudyDeduction: 0n,
    studyMaxDeduction: 0n
  },
  incomeSummary: { count: 0n, balance: 0n, total: 0n }
})

const newCollector = ref('')
const newFitrahRates = ref({ localRate: '', importRate: '', basmathiRate: '' })
const newIncomeInfo = ref({
  rate: '',
  threshold: '',
  selfDeduction: '',
  wifeDeduction: '',
  childMinorDeduction: '',
  childStudyDeduction: '',
  studyMaxDeduction: ''
})

const checkAuth = () => {
  if (!adminAuth.value) router.push('/admin/login')
}

const formatToken = (val: any) => {
  try {
    const num = parseFloat(formatUnits(val.toString(), tokenInfo.value.decimals))
    return num.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  } catch {
    return '0'
  }
}

const formatCount = (val: any) => {
  try {
    return Number(val.toString()).toLocaleString('en-MY')
  } catch {
    return '0'
  }
}

const formatRate = (val: any) => {
  try {
    return (Number(val.toString()) / 100).toFixed(2) + '%'
  } catch {
    return '0%'
  }
}

const fetchData = async () => {
  try {
    isLoading.value = true
    const data = await getAdminContractData()
    const token = await getTokenInfo(data.paymentToken)
    tokenInfo.value = token
    contractData.value = data

    const dec = token.decimals
    newFitrahRates.value = {
      localRate: formatUnits(data.fitrahRate.localRate, dec),
      importRate: formatUnits(data.fitrahRate.importRate, dec),
      basmathiRate: formatUnits(data.fitrahRate.basmathiRate, dec),
    }
    newIncomeInfo.value = {
      rate: (Number(data.incomeInfo.rate) / 100).toString(),
      threshold: formatUnits(data.incomeInfo.threshold, dec),
      selfDeduction: formatUnits(data.incomeInfo.selfDeduction, dec),
      wifeDeduction: formatUnits(data.incomeInfo.wifeDeduction, dec),
      childMinorDeduction: formatUnits(data.incomeInfo.childMinorDeduction, dec),
      childStudyDeduction: formatUnits(data.incomeInfo.childStudyDeduction, dec),
      studyMaxDeduction: formatUnits(data.incomeInfo.studyMaxDeduction, dec),
    }
  } catch (error) {
    handleError(error, 'Fetch Error')
  } finally {
    isLoading.value = false
  }
}

const updateCollector = async () => {
  try {
    isUpdating.value = true
    const signer = await getSigner(walletProvider?.value)
    const tx = await adminChangeCollector(signer, newCollector.value)
    handleLoading('Transferring Role', 'Please confirm in your wallet')
    await tx.wait()
    handleSuccess('Role Transferred', 'Collector updated successfully')
    fetchData()
  } catch (e: any) { handleError(e) } finally { isUpdating.value = false }
}

const collectFunds = async (isFitrah: boolean) => {
  try {
    isUpdating.value = true
    const signer = await getSigner(walletProvider?.value)
    const tx = await adminCollectFunds(signer, isFitrah)
    handleLoading('Collecting Funds', 'Waiting for confirmation')
    await tx.wait()
    handleSuccess('Funds Collected', 'Zakat transferred to the collector')
    fetchData()
  } catch (e: any) { handleError(e) } finally { isUpdating.value = false }
}

const saveFitrahRates = async () => {
  try {
    isUpdating.value = true
    const signer = await getSigner(walletProvider?.value)
    const tx = await adminUpdateFitrahRates(signer, newFitrahRates.value, tokenInfo.value.decimals)
    handleLoading('Updating Rates', 'Applying to contract')
    await tx.wait()
    handleSuccess('Rates Updated', 'Fitrah rates have been updated')
    fetchData()
  } catch (e: any) { handleError(e) } finally { isUpdating.value = false }
}

const saveIncomeInfo = async () => {
  try {
    isUpdating.value = true
    const signer = await getSigner(walletProvider?.value)
    const tx = await adminUpdateIncomeInfo(signer, newIncomeInfo.value, tokenInfo.value.decimals)
    handleLoading('Updating Matrix', 'Applying income parameters')
    await tx.wait()
    handleSuccess('Matrix Updated', 'Income zakat parameters updated')
    fetchData()
  } catch (e: any) { handleError(e) } finally { isUpdating.value = false }
}

const handleRefresh = () => fetchData()

onMounted(() => {
  checkAuth()
  fetchData()
  window.addEventListener('admin-refresh-data', handleRefresh)
})
onUnmounted(() => {
  window.removeEventListener('admin-refresh-data', handleRefresh)
})
</script>

<template>
    <div class="!space-y-8">

      <!-- Page Header -->
      <div class="!pt-20 flex items-start justify-between">
        <div>
          <div class="flex items-center !gap-3 !mb-1">
            <h2 class=" text-2xl font-bold text-white tracking-tight">Contract Dashboard</h2>
           
          </div>
          <p class="text-slate-500 text-sm">Monitor balances, configure rates, and manage zakat operations</p>
        </div>
        <div class="hidden sm:flex flex-col items-end !gap-0.5">
          <p class="text-[10px] text-slate-600 uppercase font-bold tracking-wider">Payment Token</p>
          <p class="text-lg font-extrabold text-primary leading-none">{{ tokenInfo.symbol }}</p>
          <p class="text-[10px] text-slate-600">{{ tokenInfo.decimals }} decimals</p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 !gap-4">
        <Card class="!px-5 bg-slate-900/40 border-slate-800 overflow-hidden relative transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 group">
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
          <CardContent class="!pt-5 !pb-5">
            <div class="flex items-start justify-between !mb-3">
              <div class="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                <Coins class="w-4 h-4 text-emerald-400" />
              </div>
              <Badge class="!px-2 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border-emerald-500/20">FITRAH</Badge>
            </div>
            <p class="text-xs text-slate-500 !mb-1">Contract Balance</p>
            <p class="text-xl font-bold text-white leading-none">{{ formatToken(contractData.fitrahSummary.balance) }}</p>
            <p class="text-xs text-slate-600 !mt-1">{{ tokenInfo.symbol }}</p>
          </CardContent>
        </Card>

        <Card class="!px-5 bg-slate-900/40 border-slate-800 overflow-hidden relative transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 group">
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          <CardContent class="!pt-5 !pb-5">
            <div class="flex items-start justify-between !mb-3">
              <div class="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
                <TrendingUp class="w-4 h-4 text-blue-400" />
              </div>
              <Badge class="!px-2 text-[10px] font-bold bg-blue-500/10 text-blue-400 border-blue-500/20">INCOME</Badge>
            </div>
            <p class="text-xs text-slate-500 !mb-1">Contract Balance</p>
            <p class="text-xl font-bold text-white leading-none">{{ formatToken(contractData.incomeSummary.balance) }}</p>
            <p class="text-xs text-slate-600 !mt-1">{{ tokenInfo.symbol }}</p>
          </CardContent>
        </Card>

        <Card class="!px-5 bg-slate-900/40 border-slate-800 overflow-hidden relative transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 group">
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
          <CardContent class="!pt-5 !pb-5">
            <div class="flex items-start justify-between !mb-3">
              <div class="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
                <Users class="w-4 h-4 text-amber-400" />
              </div>
              <Badge class="!px-2 text-[10px] font-bold bg-amber-500/10 text-amber-400 border-amber-500/20">PAYERS</Badge>
            </div>
            <p class="text-xs text-slate-500 !mb-1">All-time Transactions</p>
            <p class="text-xl font-bold text-white leading-none">{{ formatCount(contractData.fitrahSummary.count + contractData.incomeSummary.count) }}</p>
            <p class="text-xs text-slate-600 !mt-1">Total transactions</p>
          </CardContent>
        </Card>

        <Card class="!px-5 bg-slate-900/40 border-slate-800 overflow-hidden relative transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group">
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          <CardContent class="!pt-5 !pb-5">
            <div class="flex items-start justify-between !mb-3">
              <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Wallet class="w-4 h-4 text-primary" />
              </div>
              <Badge class="!px-2 text-[10px] font-bold bg-primary/10 text-primary border-primary/20">COLLECTED</Badge>
            </div>
            <p class="text-xs text-slate-500 !mb-1">Total Distributed</p>
            <p class="text-xl font-bold text-white leading-none">{{ formatToken(contractData.fitrahSummary.total + contractData.incomeSummary.total) }}</p>
            <p class="text-xs text-slate-600 !mt-1">{{ tokenInfo.symbol }}</p>
          </CardContent>
        </Card>
      </div>

      <!-- Tabs -->
      <Tabs defaultValue="overview" class="w-full  !space-y-6">
        <TabsList class="bg-slate-900/60 border border-slate-800 !p-1 h-auto">
          <TabsTrigger value="overview" class="!px-5 !gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <LayoutDashboard class="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="fitrah" class="!px-5 !gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Coins class="w-4 h-4" />
            Fitrah Settings
          </TabsTrigger>
          <TabsTrigger value="income" class="!px-5 !gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <TrendingUp class="w-4 h-4" />
            Income Settings
          </TabsTrigger>
          <TabsTrigger value="system" class="!px-5 !gap-2 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md">
            <Settings class="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        <!-- ── Overview ─────────────────────────────────────────────────── -->
        <TabsContent value="overview" class="!space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 !gap-6">

            <!-- Fitrah Summary -->
            <Card class=" bg-slate-900/40 border-slate-800 overflow-hidden flex flex-col">
              <div class="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400/60 to-transparent"></div>
              <CardHeader class="!px-5 !pb-3">
                <div class="flex items-center justify-between">
                  <CardTitle class="flex items-center !gap-2 text-base">
                    <Coins class="w-4 h-4 text-emerald-400" />
                    Fitrah Summary
                  </CardTitle>
                </div>
                <CardDescription class="text-xs">All-time fitrah donation statistics</CardDescription>
              </CardHeader>
              <CardContent class="!space-y-1 flex-1">
                <div class="flex justify-between items-center !px-3 !py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span class="text-sm text-slate-400">Transaction Count</span>
                  <span class="font-mono text-sm font-semibold text-white">{{ formatCount(contractData.fitrahSummary.count) }}</span>
                </div>
                <div class="flex justify-between items-center !px-3 !py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <span class="text-sm font-medium text-emerald-300">Live Balance</span>
                  <div class="text-right">
                    <span class="font-mono font-bold text-emerald-300 text-lg">{{ formatToken(contractData.fitrahSummary.balance) }}</span>
                    <span class="text-emerald-600 text-xs !ml-1">{{ tokenInfo.symbol }}</span>
                  </div>
                </div>
                <div class="flex justify-between items-center !px-3 !py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span class="text-sm text-slate-400">All-time Total</span>
                  <span class="font-mono text-sm text-slate-300">{{ formatToken(contractData.fitrahSummary.total) }} <span class="text-slate-600 text-xs">{{ tokenInfo.symbol }}</span></span>
                </div>
              </CardContent>
              <div class="!px-6 !pb-5">
                <Button class="w-full !gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all" variant="outline" @click="collectFunds(true)" :disabled="isUpdating">
                  <ArrowLeftRight class="w-4 h-4" />
                  Collect Fitrah Funds
                </Button>
              </div>
            </Card>

            <!-- Income Summary -->
            <Card class="bg-slate-900/40 border-slate-800 overflow-hidden flex flex-col">
              <div class="h-0.5 bg-gradient-to-r from-blue-500 via-blue-400/60 to-transparent"></div>
              <CardHeader class="!px-5 !pb-3">
                <div class="flex items-center justify-between">
                  <CardTitle class="flex items-center !gap-2 text-base">
                    <TrendingUp class="w-4 h-4 text-blue-400" />
                    Income Summary
                  </CardTitle>
                </div>
                <CardDescription class="text-xs">All-time income zakat statistics</CardDescription>
              </CardHeader>
              <CardContent class="!space-y-1 flex-1">
                <div class="flex justify-between items-center !px-3 !py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span class="text-sm text-slate-400">Transaction Count</span>
                  <span class="font-mono text-sm font-semibold text-white">{{ formatCount(contractData.incomeSummary.count) }}</span>
                </div>
                <div class="flex justify-between items-center !px-3 !py-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                  <span class="text-sm font-medium text-blue-300">Live Balance</span>
                  <div class="text-right">
                    <span class="font-mono font-bold text-blue-300 text-lg">{{ formatToken(contractData.incomeSummary.balance) }}</span>
                    <span class="text-blue-600 text-xs !ml-1">{{ tokenInfo.symbol }}</span>
                  </div>
                </div>
                <div class="flex justify-between items-center !px-3 !py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span class="text-sm text-slate-400">All-time Total</span>
                  <span class="font-mono text-sm text-slate-300">{{ formatToken(contractData.incomeSummary.total) }} <span class="text-slate-600 text-xs">{{ tokenInfo.symbol }}</span></span>
                </div>
              </CardContent>
              <div class="!px-6 !pb-5">
                <Button class="w-full !gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/50 transition-all" variant="outline" @click="collectFunds(false)" :disabled="isUpdating">
                  <ArrowLeftRight class="w-4 h-4" />
                  Collect Income Funds
                </Button>
              </div>
            </Card>

            <!-- Fitrah Rates (read-only) -->
            <Card class="bg-slate-900/40 border-slate-800">
              <CardHeader class="!px-5 !pt-5 ">
                <div class="flex items-center !gap-3">
                  <div class="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Coins class="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle class="text-base">Current Fitrah Rates</CardTitle>
                    <CardDescription class="text-xs">Per-person cost by rice grade</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent class="!space-y-1.5">
                <div class="flex justify-between items-center !px-3 !py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span class="text-sm text-slate-400">Local Rice</span>
                  <div class="flex items-center !gap-1.5">
                    <span class="font-mono text-sm font-semibold text-emerald-400">{{ formatToken(contractData.fitrahRate.localRate) }}</span>
                    <span class="text-[10px] text-slate-600 font-bold bg-slate-800 !px-1.5 !py-0.5 rounded-md">{{ tokenInfo.symbol }}</span>
                  </div>
                </div>
                <div class="flex justify-between items-center !px-3 !py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span class="text-sm text-slate-400">Import Rice</span>
                  <div class="flex items-center !gap-1.5">
                    <span class="font-mono text-sm font-semibold text-emerald-400">{{ formatToken(contractData.fitrahRate.importRate) }}</span>
                    <span class="text-[10px] text-slate-600 font-bold bg-slate-800 !px-1.5 !py-0.5 rounded-md">{{ tokenInfo.symbol }}</span>
                  </div>
                </div>
                <div class="flex justify-between items-center !px-3 !py-2.5 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span class="text-sm text-slate-400">Basmathi Rice</span>
                  <div class="flex items-center !gap-1.5">
                    <span class="font-mono text-sm font-semibold text-emerald-400">{{ formatToken(contractData.fitrahRate.basmathiRate) }}</span>
                    <span class="text-[10px] text-slate-600 font-bold bg-slate-800 !px-1.5 !py-0.5 rounded-md">{{ tokenInfo.symbol }}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <!-- Income Parameters (read-only) -->
            <Card class="bg-slate-900/40 border-slate-800">
              <CardHeader class="!px-5 !py-5 !pb-3">
                <div class="flex items-center !gap-3">
                  <div class="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Percent class="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle class="text-base">Current Income Parameters</CardTitle>
                    <CardDescription class="text-xs">Active zakat calculation matrix</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent class="!space-y-1">
                <!-- Rate highlight -->
                <div class="flex justify-between items-center !px-3 !py-3 rounded-lg bg-blue-500/5 border border-blue-500/10 !mb-2">
                  <span class="text-sm font-medium text-blue-300">Zakat Rate</span>
                  <Badge class="!px-2 bg-blue-500/20 text-blue-300 border-blue-500/30 font-bold text-sm">{{ formatRate(contractData.incomeInfo.rate) }}</Badge>
                </div>
                <div class="flex justify-between items-center !px-3 !py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                  <span class="text-sm text-slate-400">Nisab Threshold</span>
                  <span class="font-mono text-sm text-white">{{ formatToken(contractData.incomeInfo.threshold) }} <span class="text-slate-600 text-xs">{{ tokenInfo.symbol }}</span></span>
                </div>
                <!-- Deductions sub-section -->
                <div class="!pt-2">
                  <p class="text-[10px] text-slate-600 uppercase font-bold tracking-wider !px-3 !mb-1.5">Deductions</p>
                  <div class="!space-y-0.5">
                    <div class="flex justify-between items-center !px-3 !py-1.5 rounded hover:bg-white/[0.03] transition-colors">
                      <span class="text-xs text-slate-500">Self</span>
                      <span class="font-mono text-xs text-slate-400">{{ formatToken(contractData.incomeInfo.selfDeduction) }} <span class="text-slate-600">{{ tokenInfo.symbol }}</span></span>
                    </div>
                    <div class="flex justify-between items-center !px-3 !py-1.5 rounded hover:bg-white/[0.03] transition-colors">
                      <span class="text-xs text-slate-500">Wife (per wife)</span>
                      <span class="font-mono text-xs text-slate-400">{{ formatToken(contractData.incomeInfo.wifeDeduction) }} <span class="text-slate-600">{{ tokenInfo.symbol }}</span></span>
                    </div>
                    <div class="flex justify-between items-center !px-3 !py-1.5 rounded hover:bg-white/[0.03] transition-colors">
                      <span class="text-xs text-slate-500">Child (Minor)</span>
                      <span class="font-mono text-xs text-slate-400">{{ formatToken(contractData.incomeInfo.childMinorDeduction) }} <span class="text-slate-600">{{ tokenInfo.symbol }}</span></span>
                    </div>
                    <div class="flex justify-between items-center !px-3 !py-1.5 rounded hover:bg-white/[0.03] transition-colors">
                      <span class="text-xs text-slate-500">Child (Studying)</span>
                      <span class="font-mono text-xs text-slate-400">{{ formatToken(contractData.incomeInfo.childStudyDeduction) }} <span class="text-slate-600">{{ tokenInfo.symbol }}</span></span>
                    </div>
                    <div class="flex justify-between items-center !px-3 !py-1.5 rounded hover:bg-white/[0.03] transition-colors">
                      <span class="text-xs text-slate-500">Max Study</span>
                      <span class="font-mono text-xs text-slate-400">{{ formatToken(contractData.incomeInfo.studyMaxDeduction) }} <span class="text-slate-600">{{ tokenInfo.symbol }}</span></span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <!-- ── Fitrah Settings ──────────────────────────────────────────── -->
        <TabsContent value="fitrah" class=" !space-y-6">
          <Card class="bg-slate-900/40 border-slate-800 overflow-hidden">
            <div class="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400/60 to-transparent"></div>
            <CardHeader>
              <div class="!px-5 flex items-center !gap-3">
                <div class="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Coins class="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <CardTitle>Update Fitrah Rates</CardTitle>
                  <CardDescription>Cost per person by rice grade, denominated in {{ tokenInfo.symbol }}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="!px-5 !pb-5 !space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-3 !gap-5">
                <div class="!space-y-2">
                  <Label class="text-slate-300 text-sm">Local Rice Rate</Label>
                  <div class="relative">
                    <Input v-model="newFitrahRates.localRate" placeholder="e.g. 7.00" class="!px-5 bg-slate-950 border-slate-700 focus-visible:border-emerald-500/50 !pr-16" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-mono font-bold pointer-events-none select-none">{{ tokenInfo.symbol }}</span>
                  </div>
                </div>
                <div class="!space-y-2">
                  <Label class="text-slate-300 text-sm">Import Rice Rate</Label>
                  <div class="relative">
                    <Input v-model="newFitrahRates.importRate" placeholder="e.g. 14.00" class="!px-5 bg-slate-950 border-slate-700 focus-visible:border-emerald-500/50 !pr-16" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-mono font-bold pointer-events-none select-none">{{ tokenInfo.symbol }}</span>
                  </div>
                </div>
                <div class="!space-y-2">
                  <Label class="text-slate-300 text-sm">Basmathi Rice Rate</Label>
                  <div class="relative">
                    <Input v-model="newFitrahRates.basmathiRate" placeholder="e.g. 21.00" class="!px-5 bg-slate-950 border-slate-700 focus-visible:border-emerald-500/50 !pr-16" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-mono font-bold pointer-events-none select-none">{{ tokenInfo.symbol }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between !pt-4 border-t border-white/5">
                <p class="text-xs text-slate-600">Requires a signed on-chain transaction to apply</p>
                <Button @click="saveFitrahRates" :disabled="isUpdating" class="!px-5 !gap-2 bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                  <Save class="w-4 h-4" />
                  Save Rates
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- ── Income Settings ─────────────────────────────────────────── -->
        <TabsContent value="income" class="!space-y-6">
          <Card class="bg-slate-900/40 border-slate-800 overflow-hidden">
            <div class="h-0.5 bg-gradient-to-r from-blue-500 via-blue-400/60 to-transparent"></div>
            <CardHeader>
              <div class="!px-5 flex items-center !gap-3">
                <div class="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Percent class="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle>Update Income Zakat Matrix</CardTitle>
                  <CardDescription>Configure calculation parameters for income-based zakat</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="!px-5 !pb-5 !space-y-6">
              <!-- Core params -->
              <div class="grid grid-cols-1 md:grid-cols-2 !gap-5">
                <div class="!space-y-1.5">
                  <Label class="text-slate-300 text-sm">Zakat Rate</Label>
                  <p class="text-[11px] text-slate-600">Enter as a percentage — e.g. 2.5 for 2.5%</p>
                  <Input v-model="newIncomeInfo.rate" placeholder="2.5" class="!px-5 bg-slate-950 border-slate-700 focus-visible:border-blue-500/50" />
                </div>
                <div class="!space-y-1.5">
                  <Label class="text-slate-300 text-sm">Nisab Threshold (Annual)</Label>
                  <p class="text-[11px] text-slate-600">Minimum annual income to be liable for zakat</p>
                  <div class="relative">
                    <Input v-model="newIncomeInfo.threshold" placeholder="e.g. 25000" class="!px-5 bg-slate-950 border-slate-700 focus-visible:border-blue-500/50 !pr-16" />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 font-mono font-bold pointer-events-none select-none">{{ tokenInfo.symbol }}</span>
                  </div>
                </div>
              </div>

              <!-- Deductions panel -->
              <div class="rounded-xl border border-slate-800 overflow-hidden">
                <div class="!px-4 !py-3 bg-slate-950/60 border-b border-slate-800 flex items-center !gap-2">
                  <div class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></div>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Annual Deduction Rules</h4>
                  <span class="text-xs text-slate-600">— values in {{ tokenInfo.symbol }}</span>
                </div>
                <div class="!p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 !gap-4 bg-slate-900/20">
                  <div class="!space-y-1.5">
                    <Label class="text-slate-400 text-xs">Self</Label>
                    <div class="relative">
                      <Input v-model="newIncomeInfo.selfDeduction" class="!px-5 bg-slate-950 border-slate-700 text-sm !pr-14" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-bold pointer-events-none select-none">{{ tokenInfo.symbol }}</span>
                    </div>
                  </div>
                  <div class="!space-y-1.5">
                    <Label class="text-slate-400 text-xs">Wife (per wife)</Label>
                    <div class="relative">
                      <Input v-model="newIncomeInfo.wifeDeduction" class="!px-5 bg-slate-950 border-slate-700 text-sm !pr-14" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-bold pointer-events-none select-none">{{ tokenInfo.symbol }}</span>
                    </div>
                  </div>
                  <div class="!space-y-1.5">
                    <Label class="text-slate-400 text-xs">Child (Minor)</Label>
                    <div class="relative">
                      <Input v-model="newIncomeInfo.childMinorDeduction" class="!px-5 bg-slate-950 border-slate-700 text-sm !pr-14" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-bold pointer-events-none select-none">{{ tokenInfo.symbol }}</span>
                    </div>
                  </div>
                  <div class="!space-y-1.5">
                    <Label class="text-slate-400 text-xs">Child (Studying)</Label>
                    <div class="relative">
                      <Input v-model="newIncomeInfo.childStudyDeduction" class="!px-5 bg-slate-950 border-slate-700 text-sm !pr-14" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-bold pointer-events-none select-none">{{ tokenInfo.symbol }}</span>
                    </div>
                  </div>
                  <div class="!space-y-1.5">
                    <Label class="text-slate-400 text-xs">Max Study Deduction</Label>
                    <div class="relative">
                      <Input v-model="newIncomeInfo.studyMaxDeduction" class="!px-5 bg-slate-950 border-slate-700 text-sm !pr-14" />
                      <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-bold pointer-events-none select-none">{{ tokenInfo.symbol }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between !pt-4 border-t border-white/5">
                <p class="text-xs text-slate-600">Requires a signed on-chain transaction to apply</p>
                <Button @click="saveIncomeInfo" :disabled="isUpdating" class="!px-5 !gap-2 bg-blue-600 hover:bg-blue-500 text-white border-0">
                  <Save class="w-4 h-4" />
                  Apply Parameters
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- ── System ──────────────────────────────────────────────────── -->
        <TabsContent value="system" class="!space-y-6">
          <!-- Owner + Collector -->
          <div class="grid grid-cols-1 lg:grid-cols-2 !gap-6">

            <!-- Owner -->
            <Card class="bg-slate-900/40 border-slate-800 overflow-hidden relative">
              <div class="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none"></div>
              <div class="h-0.5 bg-gradient-to-r from-violet-500 via-violet-400/60 to-transparent"></div>
              <CardHeader class="!px-5 !pb-3">
                <div class="flex items-center !gap-3">
                  <div class="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <Crown class="w-4 h-4 text-violet-400" />
                  </div>
                  <div class="flex-1">
                    <CardTitle class="text-base">Contract Owner</CardTitle>
                    <CardDescription class="text-xs">Full administrative control</CardDescription>
                  </div>
                  <Badge class="!px-5 !py-1 bg-violet-500/10 text-violet-400 border-violet-500/20 text-[10px] shrink-0">ADMIN</Badge>
                </div>
              </CardHeader>
              <CardContent class="!px-5 !space-y-3">
                <div class="!p-3 bg-slate-950/80 rounded-lg border border-violet-500/15 font-mono text-xs break-all text-violet-300 leading-relaxed">
                  {{ contractData.owner || 'Loading...' }}
                </div>
                <div class="!p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-xs text-slate-500 leading-relaxed">
                  Can update rates, change collector, and transfer ownership. Has the highest permission level.
                </div>
              </CardContent>
            </Card>

            <!-- Collector -->
            <Card class="bg-slate-900/40 border-slate-800 overflow-hidden relative">
              <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/3 via-transparent to-transparent pointer-events-none"></div>
              <div class="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400/60 to-transparent"></div>
              <CardHeader class="!px-5 !pb-3">
                <div class="flex items-center !gap-3">
                  <div class="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Wallet class="w-4 h-4 text-emerald-400" />
                  </div>
                  <div class="flex-1">
                    <CardTitle class="text-base">Collector</CardTitle>
                    <CardDescription class="text-xs">Receives zakat when funds are collected</CardDescription>
                  </div>
                  <Badge class="!px-5 !py-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] shrink-0">RECEIVER</Badge>
                </div>
              </CardHeader>
              <CardContent class="!px-5 !pb-5 !space-y-3">
                <div class="!p-3 bg-slate-950/80 rounded-lg border border-emerald-500/15 font-mono text-xs break-all text-emerald-300 leading-relaxed">
                  {{ contractData.collector || 'Loading...' }}
                </div>
                <div class="!space-y-1.5">
                  <Label class="text-slate-400 text-xs">Transfer to new address</Label>
                  <Input v-model="newCollector" placeholder="0x..." class="!px-2 bg-slate-950 border-slate-700 text-sm font-mono" />
                </div>
                <Button class="w-full !gap-2 border border-emerald-500/30 text-emerald-400 bg-emerald-600/10 hover:bg-emerald-600/20 transition-colors" variant="ghost" @click="updateCollector" :disabled="isUpdating">
                  <CheckCircle2 class="w-4 h-4" />
                  Transfer Collector Role
                </Button>
              </CardContent>
            </Card>
          </div>

          <!-- Payment Token Info -->
          <Card class="bg-slate-900/40 border-slate-800">
            <CardHeader class="!px-5 !pt-5">
              <div class="flex items-center !gap-3">
                <div class="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <CircleDollarSign class="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Payment Token Info</CardTitle>
                  <CardDescription>The ERC-20 token used for all zakat transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="!px-5 !pb-10 grid grid-cols-1 md:grid-cols-3 !gap-6">
                <!-- Symbol + Decimals chips -->
                <div class="grid grid-cols-2 !gap-3 md:col-span-1">
                  <div class="!p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <p class="text-[10px] text-slate-600 uppercase font-bold !mb-2">Symbol</p>
                    <p class="text-2xl font-extrabold text-primary">{{ tokenInfo.symbol }}</p>
                  </div>
                  <div class="!p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <p class="text-[10px] text-slate-600 uppercase font-bold !mb-2">Decimals</p>
                    <p class="text-2xl font-extrabold text-primary">{{ tokenInfo.decimals }}</p>
                  </div>
                </div>
                <!-- Contract addresses + warning -->
                <div class="md:col-span-2 !space-y-3">
                  <div class="!space-y-1">
                    <p class="text-[10px] text-slate-600 uppercase font-bold">Zakat Contract</p>
                    <p class="font-mono text-xs text-slate-400 break-all bg-slate-950 !px-3 !py-2.5 rounded-lg border border-slate-800">{{ contractAddress }}</p>
                  </div>
                  <div class="!space-y-1">
                    <p class="text-[10px] text-slate-600 uppercase font-bold">Token Contract (ERC-20)</p>
                    <p class="font-mono text-xs text-slate-400 break-all bg-slate-950 !px-3 !py-2.5 rounded-lg border border-slate-800">{{ contractData.paymentToken }}</p>
                  </div>
                  <div class="flex items-start !gap-2.5 !p-3 rounded-lg bg-amber-500/5 border border-amber-500/15">
                    <div class="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 !mt-1.5"></div>
                    <p class="text-xs text-slate-400 leading-relaxed">Always verify the collector address before triggering a collection. Funds are sent directly to this address with no reversals possible on-chain.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <!-- Loading Overlay -->
      <div v-if="isLoading" class="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50">
        <div class="flex flex-col items-center !gap-5">
          <div class="relative w-14 h-14">
            <div class="absolute inset-0 rounded-full border-4 border-slate-800"></div>
            <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
          </div>
          <div class="text-center">
            <p class="text-white font-semibold">Loading Contract Data</p>
            <p class="text-slate-500 text-sm !mt-1">Reading from the blockchain...</p>
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
