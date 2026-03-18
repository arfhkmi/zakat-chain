<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { ShieldCheck, LogOut, Wallet } from 'lucide-vue-next'
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/vue'

const router = useRouter()

const { open } = useAppKit()
const account = useAppKitAccount()
const { walletProvider } = useAppKitProvider<any>('eip155')

const BSC_TESTNET = {
  chainId: '0x61',
  chainName: 'BNB Smart Chain Testnet',
  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
  rpcUrls: [
    import.meta.env.VITE_BNB_RPC_NODE_1,
    import.meta.env.VITE_BNB_RPC_NODE_2,
    import.meta.env.VITE_BNB_RPC_NODE_3,
  ].filter(Boolean),
  blockExplorerUrls: ['https://testnet.bscscan.com'],
}

watch(
  () => account.value?.isConnected,
  async (isConnected) => {
    const provider = walletProvider?.value as any
    if (isConnected && provider) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [BSC_TESTNET],
        })
      } catch (err: any) {
        console.warn('Could not switch to BSC Testnet:', err?.message)
      }
    }
  }
)

const handleLogout = () => {
  localStorage.removeItem('admin_auth')
  router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#020617] text-slate-200 selection:bg-primary/30">
    <!-- Navbar -->
    <header class="sticky top-0 z-30 w-full border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
      <div class="container !mx-auto !px-4 h-16 flex items-center justify-between">
        <div class="flex items-center !gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/10">
            <ShieldCheck class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 class="text-lg font-bold text-white leading-tight">Zakat Admin</h1>
            <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Control Panel</p>
          </div>
        </div>
        
        <div class="flex items-center !gap-3">
          <button
            @click="open()"
            class="flex items-center gap-2 !px-3 !py-2 bg-primary/10 border border-primary/30 text-primary font-bold text-sm rounded-lg hover:bg-primary/20 hover:border-primary/50 transition-all active:scale-95"
          >
            <Wallet class="w-4 h-4 shrink-0" />
            <span>
              {{ account?.isConnected ? (account.address ? account.address.slice(0, 6) + '...' + account.address.slice(-4) : 'Connected') : 'Connect Wallet' }}
            </span>
          </button>
          <Button variant="destructive" size="sm" class="!px-2 !gap-2" @click="handleLogout">
            <LogOut class="w-4 h-4" />
            <span class="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>

    <main class="container !mx-auto !px-4 !py-8 max-w-7xl">
      <slot />
    </main>
    
    <footer class="!mt-20 !py-8 border-t border-white/5">
      <div class="container !mx-auto !px-4 text-center">
        <p class="text-slate-500 text-sm italic">"Truly, Allah knows what you do."</p>
        <p class="text-slate-600 text-xs !mt-2">Zakat Chain Backend Admin Interface • Powering Transparency</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
