<template>
  <div class="manager-block">
    <span class="manager-block__title">{{ t('Install') }}</span>
    <div class="manager-block__content">
      <div class="manager-item">
        <Button
          block
          size="small"
          severity="secondary"
          @click="onOpenInstallNodesDialog(CUSTOM_NODE_MODE.NORMAL)"
        >
          {{ t('Install Custom Nodes') }}
        </Button>
      </div>
      <div class="manager-item">
        <Button
          block
          size="small"
          severity="secondary"
          @click="onOpenGitNodesDialog"
        >
          {{ t('Install via Git URL') }}
        </Button>
      </div>
      <div class="manager-item">
        <Button
          block
          size="small"
          severity="secondary"
          @click="onOpenInstallNodesDialog(CUSTOM_NODE_MODE.MISSING_NODES)"
        >
          {{ t('Install Missing Custom Nodes') }}
        </Button>
      </div>
      <div class="manager-item">
        <Button
          block
          size="small"
          severity="secondary"
          @click="onOpenInstallModelDialog"
        >
          {{ t('Install Models') }}
        </Button>
      </div>
      <div class="manager-item">
        <Button
          block
          size="small"
          severity="secondary"
          @click="onOpenInstallNodesDialog(CUSTOM_NODE_MODE.A1111)"
        >
          {{ t('Alternatives of A1111') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventBus } from '@vueuse/core'
import { CUSTOM_NODE_MODE } from '@/utils/constants'

const t = _t

function onOpenInstallNodesDialog(mode: CUSTOM_NODE_MODE) {
  useEventBus('InstallNodesDialog::Show').emit(mode)
}

function onOpenInstallModelDialog() {
  useEventBus('InstallModelDialog::Show').emit()
}

function onOpenGitNodesDialog() {
  useEventBus('GitNodesDialog::Show').emit()
}
</script>

<style lang="scss"></style>
