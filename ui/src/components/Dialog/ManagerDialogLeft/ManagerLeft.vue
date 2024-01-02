<template>
  <div class="manager-left">
    <div class="manager-block">
      <span class="manager-block__title">{{ t('Options') }}</span>
      <div class="manager-block__content">
        <div class="manager-item">
          <span class="manager-item__title">{{ t('Skip update check') }}</span>
          <InputSwitch v-model="skipUpdateCheck" size="small" />
        </div>

        <div class="manager-item">
          <Dropdown
            v-model="dbSelected"
            :options="dbOptions"
            option-label="text"
            option-value="value"
            :style="{ width: '100%' }"
          />
        </div>

        <div class="manager-item">
          <Dropdown
            v-model="previewMethod"
            @change="onPreviewChange"
            :options="previewMethods"
            option-label="text"
            option-value="value"
            :style="{ width: '100%' }"
          />
        </div>
      </div>
    </div>
    <ManagerInstall />
    <ManagerUpdate :dataSrcMode="dbSelected" />

    <InstallNodesDialog
      :mode="installNodesDialogMode"
      :dataSrcMode="dbSelected"
      :skipUpdateCheck="skipUpdateCheck"
      v-model:visible="installNodesDialogVisible"
      v-if="installNodesDialogVisible"
    />
    <InstallModelDialog
      :dataSrcMode="dbSelected"
      :skipUpdateCheck="skipUpdateCheck"
      v-model:visible="installModelDialogVisible"
      v-if="installModelDialogVisible"
    />
    <GitNodesDialog v-model:visible="gitNodesDialogVisible" />
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { api } from '/scripts/api.js'
import { useEventBus } from '@vueuse/core'
import { CUSTOM_NODE_MODE } from '@/utils/constants'

const t = _t
const skipUpdateCheck = ref(true)

// Database mode
const dbSelected = ref('cache')
const dbOptions = shallowRef([
  { value: 'cache', text: _t('DB: Channel (1day cache)') },
  { value: 'local', text: _t('DB: Local') },
  { value: 'url', text: _t('DB: Channel (remote)') },
])

// Preview method
const previewMethod = ref('auto')
const previewMethods = shallowRef([
  { value: 'auto', text: _t('Preview method: Auto') },
  { value: 'taesd', text: _t('Preview method: TAESD (slow)') },
  { value: 'latent2rgb', text: _t('Preview method: Latent2RGB (fast)') },
  { value: 'none', text: _t('Preview method: None (very fast)') },
])
onMounted(() => {
  api
    .fetchApi('/manager/preview_method')
    .then((res: Response) => res.text())
    .then((data: any) => {
      previewMethod.value = data
    })
})
function onPreviewChange(val: any) {
  api.fetchApi(`/manager/preview_method?value=${val.value}`)
}

// Install Nodes Dialog
const installNodesDialogVisible = ref(false)
const installNodesDialogMode = ref(CUSTOM_NODE_MODE.NORMAL)

useEventBus<CUSTOM_NODE_MODE>('InstallNodesDialog::Show').on((mode) => {
  installNodesDialogMode.value = mode
  installNodesDialogVisible.value = true
})

// Install Model Dialog
const installModelDialogVisible = ref(false)
useEventBus('InstallModelDialog::Show').on(() => {
  installModelDialogVisible.value = true
})

// Git Nodes Dialog
const gitNodesDialogVisible = ref(false)
useEventBus('GitNodesDialog::Show').on(() => {
  gitNodesDialogVisible.value = true
})
</script>

<style lang="scss"></style>
