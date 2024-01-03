<template>
  <Dialog
    v-model:visible="visible"
    :draggable="true"
    :style="{ width: '800px' }"
  >
    <template #header> {{ managerHeader }} </template>
    <template #default>
      <div class="manager-dialog__content">
        <ManagerLeft />
        <ManagerRight />
      </div>
    </template>
    <template #footer>
      <Button block @click="visible = false">{{ closeBtn }}</Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
// @ts-ignore
import { api } from '/scripts/api.js'
import { useEventBus } from '@vueuse/core'

const visible = defineModel<boolean>('visible')
const managerHeader = _t('Manager')
const closeBtn = _t('Close')

function onRestart() {
  if (confirm(_t("Are you sure you'd like to reboot the server?"))) {
    try {
      api.fetchApi('/manager/reboot')
    } catch (exception) {}
    return true
  }

  return false
}

useEventBus('ComfyUI::Restart').on(onRestart)
</script>

<style lang="scss">
.manager-dialog__content {
  display: flex;
  justify-content: space-between;
  gap: 40px;
}
.manager-left,
.manager-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: calc((100% - 40px) / 2);
  flex-shrink: 0;
}
.manager-block {
  display: flex;
  flex-direction: column;
  gap: 3px;

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--input-text);
    opacity: 0.35;
    margin-bottom: 8px;
    text-align: left;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
}
.manager-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.p-dialog-content {
  overflow-y: visible;
}
</style>
