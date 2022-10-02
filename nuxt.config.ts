// https://v3.nuxtjs.org/api/configuration/nuxt.config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  ssr: false,
  target: 'static',

  css: [
    '@unocss/reset/tailwind.css',
  ],
  modules: [
    '@vueuse/nuxt',
    '@unocss/nuxt',
  ],

  unocss: {
    uno: true,
    icons: true,
    shortcuts: [],
    rules: [],
  },
})
