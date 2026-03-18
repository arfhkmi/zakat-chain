<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Lock, User, ArrowRight } from 'lucide-vue-next'
import { useSwal } from '../../../utils/useSwal'
import apiService from '../../../utils/api'

const router = useRouter()
const username = ref('')
const password = ref('')
const isLoading = ref(false)
const { handleError } = useSwal()

const handleLogin = async () => {
  if (!username.value || !password.value) {
    handleError('Please enter both username and password.', 'Missing Credentials')
    return
  }

  isLoading.value = true

  try {
    const response = await apiService.apiCall<{ token: string }>('POST', '/auth/login', {
      username: username.value,
      password: password.value,
    })
    localStorage.setItem('admin_token', response.data.token)
    router.push('/admin/dashboard')
  } catch (err: any) {
    const message = err.response?.data?.message || 'Invalid username or password'
    handleError(message, 'Access Denied')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center relative overflow-hidden">
    <!-- Abstract Background Elements -->
    <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="w-full max-w-md !px-4 z-10 animate-in fade-in zoom-in duration-700">
      <div class="flex flex-col items-center !mb-8 text-center">
        <div class="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center !mb-4 border border-primary/30 shadow-lg shadow-primary/10">
          <ShieldCheck class="w-10 h-10 text-primary" />
        </div>
        <h1 class="text-3xl font-extrabold text-white tracking-tight">Admin Portal</h1>
        <p class="text-slate-400 !mt-2">Secure access to Zakat Chain management</p>
      </div>

      <Card class="!p-5 bg-slate-900/50 backdrop-blur-xl border-slate-800 shadow-2xl">
        <CardHeader>
          <CardTitle class="text-xl text-white">Login</CardTitle>
          <CardDescription class="text-slate-400">Enter your administrative credentials to continue</CardDescription>
        </CardHeader>
        <CardContent class="!space-y-4">
          <div class="!space-y-2">
            <Label for="username" class="text-slate-300">Username</Label>
            <div class="relative">
              <User class="absolute !left-3 !top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="username"
                v-model="username"
                type="text"
                placeholder="Admin username"
                class="bg-slate-950/50 border-slate-700 text-white !pl-10 h-12 focus-visible:ring-primary/50"
                @keyup.enter="handleLogin"
              />
            </div>
          </div>
          <div class="!space-y-2">
            <Label for="password" class="text-slate-300">Password</Label>
            <div class="relative">
              <Lock class="absolute !left-3 !top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="password"
                v-model="password"
                type="password"
                placeholder="••••••••"
                class="bg-slate-950/50 border-slate-700 text-white !pl-10 h-12 focus-visible:ring-primary/50"
                @keyup.enter="handleLogin"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            class="w-full h-12 text-lg font-semibold rounded-xl transition-all active:scale-[0.98]"
            :disabled="isLoading"
            @click="handleLogin"
          >
            <span v-if="isLoading" class="flex items-center !gap-2">
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Authenticating...
            </span>
            <span v-else class="flex items-center !gap-2">
              Enter Dashboard
              <ArrowRight class="w-5 h-5" />
            </span>
          </Button>
        </CardFooter>
      </Card>

      <p class="text-center !mt-8 text-slate-500 text-sm">
        Authorized personnel only. All activities are logged.
      </p>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-fill-mode: both;
}
</style>
