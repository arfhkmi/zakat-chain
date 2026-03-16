<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'
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
  CheckCircle2
} from 'lucide-vue-next'
import zakatAbi from '../../../utils/abi/zakatAbi.json'
import { useSwal } from '../../../utils/useSwal'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/vue'

const router = useRouter()
const contractAddress = import.meta.env.VITE_ZAKAT_CONTRACT_ADDRESS

// State
const isLoading = ref(true)
const isUpdating = ref(false)
const adminAuth = ref(localStorage.getItem('admin_auth') === 'true')

const { handleSuccess, handleError, handleLoading, close } = useSwal()
const { open } = useAppKit()
const account = useAppKitAccount()
const { walletProvider } = useAppKitProvider<any>('eip155')

// Contract Data
const contractData = ref({
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

// Form States
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
  if (!adminAuth.value) {
    router.push('/admin/login')
  }
}

const formatWei = (val: any) => {
  try {
    return ethers.formatEther(val.toString())
  } catch (e) {
    return '0'
  }
}

const fetchData = async () => {
  if (!account.value.isConnected) {
    // Only show error if they haven't connected yet and we need to fetch
    // But for fetching stats, maybe we want a public provider? 
    // For now, let's keep it consistent and require connection or use window.ethereum if available
    if (!window.ethereum && !walletProvider.value) {
      handleError('Wallet connection required to read contract data', 'Connection Required')
      return
    }
  }

  try {
    isLoading.value = true
    const currentProvider = walletProvider.value || window.ethereum
    const provider = new ethers.BrowserProvider(currentProvider as any)
    const contract = new ethers.Contract(contractAddress, zakatAbi, provider) as any

    const [
      collector, 
      paymentToken, 
      fRate, 
      fSummary, 
      iInfo, 
      iSummary
    ] = await Promise.all([
      contract.collector(),
      contract.paymentToken(),
      contract.fitrahRate(),
      contract.fitrahSummary(),
      contract.incomeInfo(),
      contract.incomeSummary()
    ])

    contractData.value = {
      collector,
      paymentToken,
      fitrahRate: { 
        localRate: fRate.localRate, 
        importRate: fRate.importRate, 
        basmathiRate: fRate.basmathiRate 
      },
      fitrahSummary: { 
        count: fSummary.count, 
        balance: fSummary.balance, 
        total: fSummary.total 
      },
      incomeInfo: {
        rate: iInfo.rate,
        threshold: iInfo.threshold,
        selfDeduction: iInfo.selfDeduction,
        wifeDeduction: iInfo.wifeDeduction,
        childMinorDeduction: iInfo.childMinorDeduction,
        childStudyDeduction: iInfo.childStudyDeduction,
        studyMaxDeduction: iInfo.studyMaxDeduction
      },
      incomeSummary: {
        count: iSummary.count,
        balance: iSummary.balance,
        total: iSummary.total
      }
    }

    newCollector.value = collector
    newFitrahRates.value = {
      localRate: ethers.formatEther(fRate.localRate),
      importRate: ethers.formatEther(fRate.importRate),
      basmathiRate: ethers.formatEther(fRate.basmathiRate)
    }
    newIncomeInfo.value = {
      rate: iInfo.rate.toString(),
      threshold: ethers.formatEther(iInfo.threshold),
      selfDeduction: ethers.formatEther(iInfo.selfDeduction),
      wifeDeduction: ethers.formatEther(iInfo.wifeDeduction),
      childMinorDeduction: ethers.formatEther(iInfo.childMinorDeduction),
      childStudyDeduction: ethers.formatEther(iInfo.childStudyDeduction),
      studyMaxDeduction: ethers.formatEther(iInfo.studyMaxDeduction)
    }

  } catch (error) {
    handleError(error, 'Fetch Error')
  } finally {
    isLoading.value = false
  }
}

// Write Operations
async function getSigner() {
  const currentProvider = walletProvider.value || window.ethereum
  if (!currentProvider) {
    open()
    throw new Error('Please connect your wallet')
  }
  const provider = new ethers.BrowserProvider(currentProvider as any)
  return await provider.getSigner()
}

const updateCollector = async () => {
  try {
    isUpdating.value = true
    const signer = await getSigner()
    const contract = new ethers.Contract(contractAddress, zakatAbi, signer) as any
    const tx = await contract.changeCollector(newCollector.value)
    handleLoading('Transferring Role', 'Please confirm the transaction in your wallet')
    await tx.wait()
    handleSuccess('Role Transferred', 'Collector updated successfully')
    fetchData()
  } catch (e: any) {
    handleError(e)
  } finally {
    isUpdating.value = false
  }
}

const collectFunds = async (isFitrah: boolean) => {
  try {
    isUpdating.value = true
    const signer = await getSigner()
    const contract = new ethers.Contract(contractAddress, zakatAbi, signer) as any
    const tx = await contract.collect(isFitrah)
    handleLoading('Collecting Funds', 'Please wait for blockchain confirmation')
    await tx.wait()
    handleSuccess('Funds Collected', 'Zakat funds have been transferred to the collector')
    fetchData()
  } catch (e: any) {
    handleError(e)
  } finally {
    isUpdating.value = false
  }
}

const saveFitrahRates = async () => {
  try {
    isUpdating.value = true
    const signer = await getSigner()
    const contract = new ethers.Contract(contractAddress, zakatAbi, signer) as any
    const rates = {
      localRate: ethers.parseEther(newFitrahRates.value.localRate),
      importRate: ethers.parseEther(newFitrahRates.value.importRate),
      basmathiRate: ethers.parseEther(newFitrahRates.value.basmathiRate)
    }
    const tx = await contract.updateFitrahRates(rates)
    handleLoading('Updating Rates', 'Applying new fitrah rates to the contract')
    await tx.wait()
    handleSuccess('Rates Updated', 'Fitrah rates have been successfully updated')
    fetchData()
  } catch (e: any) {
    handleError(e)
  } finally {
    isUpdating.value = false
  }
}

const saveIncomeInfo = async () => {
  try {
    isUpdating.value = true
    const signer = await getSigner()
    const contract = new ethers.Contract(contractAddress, zakatAbi, signer) as any
    const info = {
      rate: BigInt(newIncomeInfo.value.rate),
      threshold: ethers.parseEther(newIncomeInfo.value.threshold),
      selfDeduction: ethers.parseEther(newIncomeInfo.value.selfDeduction),
      wifeDeduction: ethers.parseEther(newIncomeInfo.value.wifeDeduction),
      childMinorDeduction: ethers.parseEther(newIncomeInfo.value.childMinorDeduction),
      childStudyDeduction: ethers.parseEther(newIncomeInfo.value.childStudyDeduction),
      studyMaxDeduction: ethers.parseEther(newIncomeInfo.value.studyMaxDeduction)
    }
    const tx = await contract.updateIncomeInfo(info)
    handleLoading('Updating Matrix', 'Applying new income zakat parameters')
    await tx.wait()
    handleSuccess('Matrix Updated', 'Income zakat parameters have been updated')
    fetchData()
  } catch (e: any) {
    handleError(e)
  } finally {
    isUpdating.value = false
  }
}

// Global refresh listener
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
  <AdminLayout>
    <div class="!space-y-6">
    <!-- Top Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 !gap-6 !mb-8">
      <Card class="bg-slate-900/40 border-slate-800 backdrop-blur">
        <CardContent class="!pt-6">
          <div class="flex items-center justify-between !mb-4">
            <div class="!p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <Coins class="w-5 h-5 text-emerald-500" />
            </div>
            <Badge variant="outline" class="text-emerald-500 border-emerald-500/20 bg-emerald-500/5">Fitrah</Badge>
          </div>
          <div class="!space-y-1">
            <p class="text-sm text-slate-500">Contract Balance</p>
            <h3 class="text-2xl font-bold text-white">{{ formatWei(contractData.fitrahSummary.balance) }} <span class="text-sm font-normal text-slate-500">MYRC</span></h3>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-slate-900/40 border-slate-800 backdrop-blur">
        <CardContent class="!pt-6">
          <div class="flex items-center justify-between !mb-4">
            <div class="!p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <TrendingUp class="w-5 h-5 text-blue-500" />
            </div>
            <Badge variant="outline" class="text-blue-500 border-blue-500/20 bg-blue-500/5">Income</Badge>
          </div>
          <div class="!space-y-1">
            <p class="text-sm text-slate-500">Contract Balance</p>
            <h3 class="text-2xl font-bold text-white">{{ formatWei(contractData.incomeSummary.balance) }} <span class="text-sm font-normal text-slate-500">MYRC</span></h3>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-slate-900/40 border-slate-800 backdrop-blur">
        <CardContent class="!pt-6">
          <div class="flex items-center justify-between !mb-4">
            <div class="!p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Users class="w-5 h-5 text-amber-500" />
            </div>
            <Badge variant="outline" class="text-amber-500 border-amber-500/20 bg-amber-500/5">Total Payers</Badge>
          </div>
          <div class="!space-y-1">
            <p class="text-sm text-slate-500">Cumulative Count</p>
            <h3 class="text-2xl font-bold text-white">{{ Number(contractData.fitrahSummary.count) + Number(contractData.incomeSummary.count) }}</h3>
          </div>
        </CardContent>
      </Card>

      <Card class="bg-slate-900/40 border-slate-800 backdrop-blur">
        <CardContent class="!pt-6">
          <div class="flex items-center justify-between !mb-4">
            <div class="!p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Wallet class="w-5 h-5 text-primary" />
            </div>
            <Badge variant="outline" class="text-primary border-primary/20 bg-primary/5">Collected</Badge>
          </div>
          <div class="!space-y-1">
            <p class="text-sm text-slate-500">Total Distributed</p>
            <h3 class="text-2xl font-bold text-white">
              {{ formatWei(contractData.fitrahSummary.total + contractData.incomeSummary.total) }}
            </h3>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Tabs -->
    <Tabs defaultValue="overview" class="w-full !space-y-6">
      <TabsList class="bg-slate-900/60 border border-slate-800 !p-1">
        <TabsTrigger value="overview" class="!gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
          <LayoutDashboard class="w-4 h-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="fitrah" class="!gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
          <Coins class="w-4 h-4" />
          Fitrah Settings
        </TabsTrigger>
        <TabsTrigger value="income" class="!gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
          <TrendingUp class="w-4 h-4" />
          Income Settings
        </TabsTrigger>
        <TabsTrigger value="system" class="!gap-2 data-[state=active]:bg-primary data-[state=active]:text-white">
          <Settings class="w-4 h-4" />
          System
        </TabsTrigger>
      </TabsList>

      <!-- Overview Tab -->
      <TabsContent value="overview" class="!space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 !gap-6">
          <Card class="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle>Fitrah Summary</CardTitle>
              <CardDescription>All-time statistics for Fitrah donations</CardDescription>
            </CardHeader>
            <CardContent class="!space-y-4">
              <div class="flex justify-between items-center !py-3 border-b border-white/5">
                <span class="text-slate-400">Total Count</span>
                <span class="font-mono text-white">{{ contractData.fitrahSummary.count }}</span>
              </div>
              <div class="flex justify-between items-center !py-3 border-b border-white/5">
                <span class="text-slate-400">Current Balance</span>
                <span class="font-mono text-white text-lg">{{ formatWei(contractData.fitrahSummary.balance) }} MYRC</span>
              </div>
              <div class="flex justify-between items-center !py-3">
                <span class="text-slate-400">Total Collected Ever</span>
                <span class="font-mono text-white">{{ formatWei(contractData.fitrahSummary.total) }} MYRC</span>
              </div>
              <Button class="w-full !mt-4 !gap-2 border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10" variant="outline" @click="collectFunds(true)" :disabled="isUpdating">
                <ArrowLeftRight class="w-4 h-4" />
                Collect Fitrah Funds
              </Button>
            </CardContent>
          </Card>

          <Card class="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle>Income Summary</CardTitle>
              <CardDescription>All-time statistics for Income Zakat</CardDescription>
            </CardHeader>
            <CardContent class="!space-y-4">
              <div class="flex justify-between items-center !py-3 border-b border-white/5">
                <span class="text-slate-400">Total Count</span>
                <span class="font-mono text-white">{{ contractData.incomeSummary.count }}</span>
              </div>
              <div class="flex justify-between items-center !py-3 border-b border-white/5">
                <span class="text-slate-400">Current Balance</span>
                <span class="font-mono text-white text-lg">{{ formatWei(contractData.incomeSummary.balance) }} MYRC</span>
              </div>
              <div class="flex justify-between items-center !py-3">
                <span class="text-slate-400">Total Collected Ever</span>
                <span class="font-mono text-white">{{ formatWei(contractData.incomeSummary.total) }} MYRC</span>
              </div>
              <Button class="w-full !mt-4 !gap-2 border-blue-500/50 text-blue-500 hover:bg-blue-500/10" variant="outline" @click="collectFunds(false)" :disabled="isUpdating">
                <ArrowLeftRight class="w-4 h-4" />
                Collect Income Funds
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <!-- Fitrah Settings Tab -->
      <TabsContent value="fitrah" class="!space-y-6">
        <Card class="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle>Update Fitrah Rates</CardTitle>
            <CardDescription>Set the cost of zakat per person for different rice grades (in MYRC)</CardDescription>
          </CardHeader>
          <CardContent class="!space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 !gap-6">
              <div class="!space-y-2">
                <Label>Local Rice Rate</Label>
                <Input v-model="newFitrahRates.localRate" placeholder="e.g. 7.00" class="bg-slate-950 border-slate-700" />
              </div>
              <div class="!space-y-2">
                <Label>Import Rice Rate</Label>
                <Input v-model="newFitrahRates.importRate" placeholder="e.g. 14.00" class="bg-slate-950 border-slate-700" />
              </div>
              <div class="!space-y-2">
                <Label>Basmathi Rice Rate</Label>
                <Input v-model="newFitrahRates.basmathiRate" placeholder="e.g. 21.00" class="bg-slate-950 border-slate-700" />
              </div>
            </div>
            <div class="flex justify-end">
              <Button @click="saveFitrahRates" :disabled="isUpdating" class="!gap-2">
                <Save class="w-4 h-4" />
                Save Rates
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Income Settings Tab -->
      <TabsContent value="income" class="!space-y-6">
        <Card class="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle>Update Income Zakat Matrix</CardTitle>
            <CardDescription>Configure the calculation parameters for income-based zakat</CardDescription>
          </CardHeader>
          <CardContent class="!space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 !gap-6">
              <div class="!space-y-2">
                <Label>Zakat Rate (%) - Base 10000 (2.5% = 250)</Label>
                <Input v-model="newIncomeInfo.rate" placeholder="250" class="bg-slate-950 border-slate-700" />
              </div>
              <div class="!space-y-2">
                <Label>Nisab Threshold (Annual)</Label>
                <Input v-model="newIncomeInfo.threshold" placeholder="e.g. 25000" class="bg-slate-950 border-slate-700" />
              </div>
            </div>
            
            <div class="!p-4 rounded-xl border border-white/5 bg-white/5 !space-y-4">
              <h4 class="font-bold text-sm uppercase tracking-wider text-slate-500">Deduction Rules (Annual)</h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 !gap-6">
                <div class="!space-y-2">
                  <Label>Self Deduction</Label>
                  <Input v-model="newIncomeInfo.selfDeduction" class="bg-slate-950 border-slate-700" />
                </div>
                <div class="!space-y-2">
                  <Label>Wife Deduction (Per Wife)</Label>
                  <Input v-model="newIncomeInfo.wifeDeduction" class="bg-slate-950 border-slate-700" />
                </div>
                <div class="!space-y-2">
                  <Label>Child Minor Deduction</Label>
                  <Input v-model="newIncomeInfo.childMinorDeduction" class="bg-slate-950 border-slate-700" />
                </div>
                <div class="!space-y-2">
                  <Label>Child Study Deduction</Label>
                  <Input v-model="newIncomeInfo.childStudyDeduction" class="bg-slate-950 border-slate-700" />
                </div>
                <div class="!space-y-2">
                  <Label>Max Study Deduction</Label>
                  <Input v-model="newIncomeInfo.studyMaxDeduction" class="bg-slate-950 border-slate-700" />
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <Button @click="saveIncomeInfo" :disabled="isUpdating" class="!gap-2">
                <Save class="w-4 h-4" />
                Apply Parameters
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- System Tab -->
      <TabsContent value="system" class="!space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 !gap-6">
          <Card class="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle>Collector Management</CardTitle>
              <CardDescription>The address authorized to receive collected zakat funds</CardDescription>
            </CardHeader>
            <CardContent class="!space-y-4">
              <div class="!space-y-2">
                <Label>Current Collector</Label>
                <div class="!p-3 bg-slate-950 rounded border border-slate-800 font-mono text-xs break-all text-emerald-400">
                  {{ contractData.collector }}
                </div>
              </div>
              <div class="!space-y-2">
                <Label>New Collector Address</Label>
                <Input v-model="newCollector" placeholder="0x..." class="bg-slate-950 border-slate-700" />
              </div>
              <Button class="w-full !gap-2" @click="updateCollector" :disabled="isUpdating">
                <CheckCircle2 class="w-4 h-4" />
                Transfer Role
              </Button>
            </CardContent>
          </Card>

          <Card class="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Core contract parameters</CardDescription>
            </CardHeader>
            <CardContent class="!space-y-4">
              <div class="!space-y-1">
                <p class="text-[10px] text-slate-500 uppercase font-bold">Contract Address</p>
                <p class="font-mono text-sm text-slate-300 break-all">{{ contractAddress }}</p>
              </div>
              <div class="!space-y-1">
                <p class="text-[10px] text-slate-500 uppercase font-bold">Payment Token (ERC20)</p>
                <p class="font-mono text-sm text-slate-300 break-all">{{ contractData.paymentToken }}</p>
              </div>
              <div class="!p-4 rounded-lg bg-primary/5 border border-primary/20 !mt-4">
                <p class="text-[10px] text-primary font-bold !mb-1 uppercase">Security Tip</p>
                <p class="text-xs text-slate-400">Always verify the collector address before triggering a collection. Funds are sent directly to this address.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
    
    <div v-if="isLoading" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50">
      <div class="flex flex-col items-center !gap-4">
        <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p class="text-primary font-medium animate-pulse">Reading Smart Contract...</p>
      </div>
    </div>
    </div>
  </AdminLayout>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
