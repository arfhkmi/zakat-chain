import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { createAppKit } from '@reown/appkit/vue'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'
import { bscTestnet, mainnet } from '@reown/appkit/networks'

const projectId = import.meta.env.VITE_REOWN_ID || ''

if (projectId) {
  const metadata = {
    name: 'Zakat Chain',
    description: 'Zakat Chain Web3 App',
    url: 'http://localhost:5173',
    icons: ['https://avatars.githubusercontent.com/u/37784886']
  }

  createAppKit({
    adapters: [new EthersAdapter()],
    networks: [mainnet, bscTestnet],
    defaultNetwork: bscTestnet,
    metadata,
    projectId,
    features: {
      analytics: false,
      email: false, // default to true
      socials: [],
      swaps: false,
      onramp: false,
      legalCheckbox: false,
    },
    themeMode: 'dark',
    themeVariables: {
      "--apkt-accent": "#00BB7F",
    },
    includeWalletIds: [
      "c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96",
    ],
  })
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
