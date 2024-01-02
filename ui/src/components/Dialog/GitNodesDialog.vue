<template>
  <CustomDialog
    v-model:visible="visible"
    :header="t('Install via Git URL')"
    :header-tip="tip"
  >
    <template #body>
      <InputText
        :style="{ width: '580px' }"
        v-model="gitUrl"
        :placeholder="
          t('Please enter the URL of the Git repository to install')
        "
      />
    </template>
    <template #footer>
      <span class="custom-dialog__footer__tip">
        {{
          t(
            'To apply the installed custom node, please RESTART ComfyUI. And refresh browser.'
          )
        }}
      </span>
      <Button
        class="restart"
        v-if="status === 'ready' || status === 'installing'"
        :disabled="status === 'installing' || !gitUrl"
        @click="onInstall"
      >
        {{ status === 'installing' ? t('Installing') : t('Install') }}
      </Button>
      <Button v-else-if="status === 'done'" class="restart" @click="onRestart">
        {{ t('Restart ComfyUI') }}
      </Button>
      <Button class="close" theme="default" @click="visible = false">
        {{ t('Close') }}
      </Button>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
// @ts-ignore
import { api } from '/scripts/api.js'
import { useEventBus } from '@vueuse/core'
import { useToast } from 'primevue/usetoast'

const t = _t
const visible = defineModel<boolean>('visible')
const tip = ref('')
const gitUrl = ref('')
const toast = useToast()

const status = ref<'ready' | 'installing' | 'done'>('ready')

watch(visible, (value) => {
  if (value) {
    tip.value = ''
    status.value = 'ready'
    gitUrl.value = ''
  }
})

async function onInstall() {
  if (!gitUrl.value) {
    return
  }

  if (!isValidURL(gitUrl.value)) {
    toast.add({
      severity: 'warn',
      group: 'message',
      detail: t('Invalid Git url'),
      life: 3000,
    })
    return
  }

  status.value = 'installing'
  try {
    const res = await api.fetchApi(
      `/customnode/install/git_url?url=${gitUrl.value}`
    )

    if (res.status == 200) {
      status.value = 'done'
    } else {
      status.value = 'ready'
      toast.add({
        severity: 'error',
        group: 'message',
        detail: t('Failed to install custom nodes from Git url'),
        life: 3000,
      })
    }
  } catch (e) {
    status.value = 'ready'
    console.error(e)
    toast.add({
      severity: 'error',
      group: 'message',
      detail: t('Failed to install custom nodes from Git url'),
      life: 3000,
    })
  }
}

function onRestart() {
  useEventBus('ComfyUI::Restart').emit()
}

function isValidURL(url: string) {
  const pattern = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/
  return pattern.test(url)
}
</script>

<style lang="scss"></style>
