<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// アプリケーション全体の設定
useHead({
  titleTemplate: '%s - 大阪大学研究マッチングシステム',
  meta: [
    { name: 'description', content: 'AI技術を活用した研究者マッチングシステム' }
  ]
})

// ブラウザ拡張機能のエラーを抑制
if (process.client) {
  window.addEventListener('error', (event) => {
    if (event.message && event.message.includes('runtime.lastError')) {
      event.preventDefault()
    }
  })
}
</script>