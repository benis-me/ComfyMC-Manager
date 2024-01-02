<template>
  <div class="manager-block">
    <span class="manager-block__title">{{ t('Update') }}</span>
    <div class="manager-block__content">
      <div class="manager-item">
        <Button
          block
          size="small"
          severity="secondary"
          :disabled="isUpdatingComfyUI"
          @click="onUpdateComfyUI"
        >
          {{
            isUpdatingComfyUI ? t('Updating ComfyUI...') : t('Update ComfyUI')
          }}
        </Button>
      </div>
      <div class="manager-item">
        <Button block size="small" severity="secondary" @click="onFetchUpdates">
          {{ t('Fetch Updates') }}
        </Button>
      </div>
      <div class="manager-item">
        <Button
          block
          size="small"
          severity="secondary"
          :disabled="isUpdatingAll"
          @click="onUpdateAll"
        >
          {{ isUpdatingAll ? t('Updating all...') : t('Update all') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { api } from '/scripts/api.js'
import { useEventBus } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'
import { CUSTOM_NODE_MODE } from '@/utils/constants'

const t = _t
const toast = useToast()
const props = defineProps<{
  dataSrcMode: string
}>()

function onFetchUpdates() {
  useEventBus('InstallNodesDialog::Show').emit(CUSTOM_NODE_MODE.UPDATE)
}

const isUpdatingComfyUI = ref(false)
async function onUpdateComfyUI() {
  if (isUpdatingComfyUI.value) {
    return
  }

  isUpdatingComfyUI.value = true
  try {
    const response = await api.fetchApi('/comfyui_manager/update_comfyui')

    if (response.status == 400) {
      toast.add({
        severity: 'error',
        group: 'message',
        detail: _t('Failed to update ComfyUI'),
        life: 3000,
      })
      return false
    }

    if (response.status == 201) {
      toast.add({
        severity: 'success',
        group: 'message',
        detail: _t('ComfyUI has been successfully updated'),
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'success',
        group: 'message',
        detail: _t('ComfyUI is already up to date with the latest version'),
        life: 3000,
      })
    }

    return true
  } catch (e) {
    toast.add({
      severity: 'error',
      group: 'message',
      detail: _t('Failed to update ComfyUI'),
      life: 3000,
    })
    return false
  } finally {
    isUpdatingComfyUI.value = false
  }
}

const isUpdatingAll = ref(false)
async function onUpdateAll() {
  if (isUpdatingAll.value) {
    return
  }

  isUpdatingAll.value = true
  try {
    const response1 = await api.fetchApi('/comfyui_manager/update_comfyui')
    const response2 = await api.fetchApi(
      `/customnode/update_all?mode=${props.dataSrcMode}`
    )

    if (response1.status != 200 && response2.status != 201) {
      toast.add({
        severity: 'error',
        group: 'message',
        detail: _t('Failed to update ComfyUI or several extensions'),
        life: 3000,
      })
      return false
    }
    if (response1.status == 201 || response2.status == 201) {
      toast.add({
        severity: 'success',
        group: 'message',
        detail: _t('ComfyUI and all extensions have been updated'),
        life: 3000,
      })
    } else {
      toast.add({
        severity: 'success',
        group: 'message',
        detail: _t(
          'ComfyUI and all extensions are already up-to-date with the latest versions'
        ),
        life: 3000,
      })
    }

    return true
  } catch (e) {
    toast.add({
      severity: 'error',
      group: 'message',
      detail: _t('Failed to update ComfyUI or several extensions'),
      life: 3000,
    })
    return false
  } finally {
    isUpdatingAll.value = false
  }
}
</script>

<style lang="scss"></style>
