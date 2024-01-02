<template>
  <ManagerDialog v-model:visible="dialogVisible" />
  <button class="manager-button" @click="dialogVisible = true">
    {{ buttonText }}
  </button>
</template>

<script setup lang="ts">
const buttonText = _t('Manager')
const dialogVisible = ref(false)
</script>

<style lang="scss">
.manager-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: black;
  padding: 10px 12px;
  background-image: linear-gradient(90deg, #00c9ff 0%, #92fe9d 100%);
}
</style>
