<template>
  <div class="manager-block" style="height: 100%">
    <span class="manager-block__title">{{ t('Others') }}</span>
    <div class="manager-block__content" style="height: 100%">
      <div class="manager-item">
        <Button
          block
          size="small"
          severity="secondary"
          @click="communityMenuRef.toggle($event)"
        >
          {{ t('Community Resources') }}
        </Button>
        <Menu ref="communityMenuRef" :model="communityOptions" popup />
      </div>
      <div class="manager-item">
        <Button
          block
          size="small"
          severity="secondary"
          @click="workflowMenuRef.toggle($event)"
        >
          {{ t('Workflow Gallery') }}
        </Button>
        <Menu ref="workflowMenuRef" :model="galleryOptions" popup />
      </div>
      <div class="manager-item" style="height: 100%">
        <div
          class="manager-notice"
          v-if="!noticeLoading && !noticeError"
          v-html="noticeHTML"
        />
        <div class="manager-notice void" v-else>
          {{ noticeError ? t('Failed to load notice') : t('Loading..') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import { api } from '/scripts/api.js'

const t = _t

const communityMenuRef = ref()
const workflowMenuRef = ref()

const communityOptions = [
  {
    label: t('Community Manual'),
    command() {
      window.open('https://blenderneko.github.io/ComfyUI-docs/', '_blank')
    },
  },
  {
    label: _t('ComfyUI Examples'),
    command() {
      window.open('https://comfyanonymous.github.io/ComfyUI_examples', '_blank')
    },
  },
  {
    label: _t('Nodes Info'),
    command() {
      window.open('https://ltdrdata.github.io/', '_blank')
    },
  },
]

const galleryOptions = [
  {
    label: 'ComfyWorkflows',
    command: () => {
      window.open('https://comfyworkflows.com/', '_blank')
    },
  },
  // {
  //   label: _t('Share your art'),
  //   command: () => {},
  // },
]

const noticeHTML = ref(``)
const noticeLoading = ref(false)
const noticeError = ref(false)
function fetchNotice() {
  noticeLoading.value = true
  noticeError.value = false
  api
    .fetchApi('/manager/notice')
    .then((response: Response) => response.text())
    .then((data: string) => {
      noticeError.value = false
      noticeHTML.value = data
    })
    .catch(() => {
      noticeError.value = true
    })
    .finally(() => {
      noticeLoading.value = false
    })
}

onMounted(() => {
  fetchNotice()
})
</script>

<style lang="scss">
.manager-notice {
  width: 100%;
  height: 100%;
  overflow: auto;
  background: rgb(0 0 0 / 8%);
  border: 1px solid rgb(255 255 255 / 8%);
  border-radius: 6px;
  box-sizing: border-box;
  padding: 0 20px;
  padding-bottom: 10px;
  word-wrap: break-word;

  hr {
    margin: 10px 0;
    border: 0;
    border-top: 1px solid rgb(255 255 255 / 8%);
  }

  &.void {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    color: var(--input-text);
  }
}
</style>
