<script setup lang="ts">
import Toast from 'primevue/toast'
import ManagerButton from './components/ManagerButton.vue'
</script>

<template>
  <Teleport to="body">
    <Toast position="bottom-right" />
    <Toast position="top-center" group="message" />
  </Teleport>
  <ManagerButton />
</template>

<style scoped>
:global(.t-dialog__ctx) {
  position: relative;
  z-index: 99;
}

:global(.t-dialog) {
  color: var(--input-text);
  border: 1px solid var(--comfy-menu-border);
  background-color: var(--comfy-menu-bg);
  padding-top: 88px;
}

:global(.t-dialog__header) {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  color: var(--input-text);
  padding: var(--td-comp-paddingLR-xxl);
  pointer-events: none;
}

:global(.t-dialog__content) {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 40px;
  color: var(--input-text);
}

:global(.t-dialog__body) {
  display: flex;
  flex-direction: row;
  gap: 40px;
  overflow: visible !important;
  padding-top: 0;
}

:global(.t-switch) {
  border: 1px solid var(--border-color);
  background-color: var(--comfy-input-bg);
  box-sizing: content-box;
}

:global(.t-switch.t-is-checked) {
  border: 1px solid var(--td-brand-color);
}

:global(.t-switch:hover) {
  background-color: var(--comfy-input-bg);
}

:global(.t-select-option.t-is-selected) {
  color: var(--td-brand-color-10);
}

:global(.p-button[block]) {
  width: 100%;
}
</style>

<style>
@layer comfyui, primevue;
#comfyui-manager {
  width: 100%;
}

input[type='text'].t-input__inner {
  border: unset;
  box-shadow: unset;
  background-color: unset;
}
</style>
