<script setup>
import { open } from '@tauri-apps/api/dialog'
import { createDir, readDir, renameFile } from '@tauri-apps/api/fs'
import { documentDir, join } from '@tauri-apps/api/path'

const { data: documentDirInit } = await useAsyncData(() => documentDir())

const pattern = ref('')
const regexPattern = computed(() => {
  try {
    return new RegExp(`^${pattern.value}$`)
  }
  catch (e) {
    return null
  }
})

const input = ref(documentDirInit.value)

const files = ref([])
const isValid = computed(() => pattern.value.length > 0 && files.value.length > 0)

const selectInput = async () => {
  input.value = await open({ directory: true })
}

const getFiles = async () => {
  if (pattern.value.length === 0 || regexPattern.value === null)
    return []

  return await readDir(input.value, { recursive: false })
    .then(entries => entries.filter(entrie => !entrie.children))
    .then(entries => entries.filter(entrie => regexPattern.value.test(entrie.name)))
}

watch([regexPattern, input], async () => files.value = await getFiles())

const sort = async () => {
  const filesArray = files.value
  const basePath = input.value
  const re = regexPattern.value

  for (const f of filesArray) {
    const newDirPath = await join(basePath, ...re.exec(f.name).slice(1))
    await createDir(newDirPath, { recursive: true })
    await renameFile(f.path, await join(newDirPath, f.name))
  }
  files.value = []
}
</script>

<template>
  <div class="flex flex-col flex-gap-y-1 items-center justify-center h-screen w-screen px-2 py-4 bg-gray-800 text-white">
    <div class="w-full flex border-2 h-12 items-center border-white">
      <div class="w-32 text-center">
        Pattern
      </div>
      <input v-model="pattern" class="w-full h-full pl-2 border-l-2 border-white bg-gray-700" :class="{ 'bg-red-400': pattern.length === 0 || regexPattern === null }">
    </div>
    <div class="w-full flex border-2 border-white h-12 items-center">
      <div class="w-32 text-center">
        Input
      </div>
      <button class="border-l-2 bg-gray-700 border-white w-full h-full pl-2 text-left" @click="selectInput">
        {{ input }}
      </button>
    </div>
    <button :disabled="!isValid" class="disabled:bg-gray-200 disabled:text-red-600 disabled:cursor-not-allowed mt-4 py-2 px-3 border-2 border-white bg-gray-700" @click="sort">
      sort {{ files.length }} {{ files.length > 1 ? "files" : "file" }}
    </button>
  </div>
</template>

