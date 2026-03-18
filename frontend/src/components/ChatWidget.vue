<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-vue-next'
import apiService from '../../utils/api'

interface Message {
  role: 'user' | 'bot'
  text: string
}

const isOpen = ref(false)
const messages = ref<Message[]>([
  { role: 'bot', text: 'Assalamualaikum! I\'m ZakatChain\'s assistant. Ask me anything about Zakat Pendapatan, Zakat Fitrah or Our Zakat crypto payment' }
])
const input = ref('')
const isLoading = ref(false)
const sessionId = ref<string | null>(null)
const messagesEl = ref<HTMLElement | null>(null)
const hasUnread = ref(false)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

watch(isOpen, (val) => {
  if (val) {
    hasUnread.value = false
    scrollToBottom()
  }
})

const send = async () => {
  const text = input.value.trim()
  if (!text || isLoading.value) return

  messages.value.push({ role: 'user', text })
  input.value = ''
  isLoading.value = true
  scrollToBottom()

  try {
    const res = await apiService.apiCall<{ sessionId: string; reply: string }>(
      'POST',
      '/zakat/chat',
      { message: text, ...(sessionId.value ? { sessionId: sessionId.value } : {}) }
    )
    sessionId.value = res.data.sessionId
    messages.value.push({ role: 'bot', text: res.data.reply })
    if (!isOpen.value) hasUnread.value = true
  } catch {
    messages.value.push({ role: 'bot', text: 'Sorry, I\'m having trouble connecting. Please try again.' })
  } finally {
    isLoading.value = false
    scrollToBottom()
  }
}

const handleKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}
</script>

<template>
  <!-- Floating Button -->
  <div class="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

    <!-- Chat Panel -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 translate-y-4 scale-95"
    >
      <div
        v-if="isOpen"
        class="w-[340px] sm:w-[380px] h-[520px] bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 flex flex-col overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between !px-4 !py-3 bg-slate-950/80 border-b border-slate-800">
          <div class="flex items-center !gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Bot class="w-4 h-4 text-primary" />
            </div>
            <div>
              <p class="text-sm font-bold text-white leading-tight">ZakatChain Assistant</p>
              <p class="text-[10px] text-emerald-400 flex items-center !gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                Online
              </p>
            </div>
          </div>
          <button
            @click="isOpen = false"
            class="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X class="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <!-- Messages -->
        <div ref="messagesEl" class="flex-1 overflow-y-auto !p-4 !space-y-3 scrollbar-thin">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            :class="['flex !gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start']"
          >
            <!-- Bot avatar -->
            <div v-if="msg.role === 'bot'" class="w-6 h-6 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0 !mt-0.5">
              <Bot class="w-3.5 h-3.5 text-primary" />
            </div>

            <div
              :class="[
                'max-w-[80%] !px-3 !py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap break-words',
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700/50'
              ]"
            >
              {{ msg.text }}
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isLoading" class="flex items-center !gap-2">
            <div class="w-6 h-6 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0">
              <Bot class="w-3.5 h-3.5 text-primary" />
            </div>
            <div class="bg-slate-800 border border-slate-700/50 !px-3 !py-2.5 rounded-xl rounded-bl-sm flex items-center !gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]"></span>
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]"></span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="!p-3 bg-slate-950/60 border-t border-slate-800">
          <div class="flex items-end !gap-2">
            <textarea
              v-model="input"
              @keydown="handleKey"
              placeholder="Ask about zakat chain..."
              rows="1"
              class="flex-1 bg-slate-800 border border-slate-700 rounded-xl !px-3 !py-2.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-primary/50 transition-colors leading-relaxed"
              style="max-height: 80px; field-sizing: content;"
            />
            <button
              @click="send"
              :disabled="!input.trim() || isLoading"
              class="w-9 h-9 rounded-xl bg-primary hover:bg-primary/80 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-95 shrink-0"
            >
              <Loader2 v-if="isLoading" class="w-4 h-4 text-white animate-spin" />
              <Send v-else class="w-4 h-4 text-white" />
            </button>
          </div>
          <p class="text-[10px] text-slate-600 !mt-1.5 text-center">Zakat Chain FAQ • Powered by Mudaar Tech</p>
        </div>
      </div>
    </Transition>

    <!-- Toggle Button -->
    <button
      @click="isOpen = !isOpen"
      class="w-14 h-14 rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-primary/50 flex items-center justify-center transition-all duration-200 active:scale-95 hover:scale-105 relative"
    >
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 rotate-90 scale-50"
        enter-to-class="opacity-100 rotate-0 scale-100"
        leave-active-class="transition-all duration-200"
        leave-from-class="opacity-100 rotate-0 scale-100"
        leave-to-class="opacity-0 -rotate-90 scale-50"
        mode="out-in"
      >
        <X v-if="isOpen" class="w-6 h-6 text-white" />
        <MessageSquare v-else class="w-6 h-6 text-white" />
      </Transition>

      <!-- Unread badge -->
      <span
        v-if="hasUnread && !isOpen"
        class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-slate-900 text-[9px] text-white font-bold flex items-center justify-center"
      >!</span>
    </button>

  </div>
</template>
