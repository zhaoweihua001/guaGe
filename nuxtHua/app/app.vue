<script setup lang="ts">
const { data } = await useFetch('/api/data')

async function handleFormSubmit() {
  const res = await $fetch('/api/submit', {
    method: 'POST',
    body: {
      // 我的表单数据
    }
  })
}
</script>

<template>
  <div v-if="data == undefined">
    无数据
  </div>
  <div v-else>
    <form @submit="handleFormSubmit">
      <!-- 表单输入标签 -->
    </form>
  </div>
</template>
