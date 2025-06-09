<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// ブラウザ拡張機能のエラーを抑制
if (process.client) {
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('runtime.lastError')) {
      event.preventDefault()
    }
  })
}
</script>