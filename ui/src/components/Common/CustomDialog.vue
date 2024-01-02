<template>
  <Dialog v-model:visible="visible" v-bind="attrs">
    <template #header>
      <div class="custom-dialog__header">
        <slot name="header">
          <span>{{ header }}</span>
          <span class="custom-dialog__header__tips">{{ headerTip }}</span>
        </slot>
      </div>
    </template>
    <template #default>
      <div class="custom-dialog__body">
        <slot name="body"></slot>
      </div>
    </template>
    <template #footer>
      <div class="custom-dialog__footer">
        <slot name="footer">
          <span class="custom-dialog__footer__tip">
            {{ footerTip }}
          </span>
          <Button class="close" severity="secondary" @click="visible = false">
            {{ t('Close') }}
          </Button>
        </slot>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
const attrs = useAttrs()
defineProps<{
  header?: string
  headerTip?: string
  footerTip?: string
}>()

const visible = defineModel<boolean>('visible')

const t = _t
</script>

<style lang="scss">
.custom-dialog {
  &__header {
    display: flex;
    align-items: center;
    gap: 20px;

    &__tips {
      font-size: 13px;
      color: var(--input-text);
      opacity: 0.35;
      font-weight: normal;
    }
  }
  &__body {
    display: flex;
    flex-direction: column;
    width: 100%;

    .Dropdown__wrap {
      width: 20%;
    }

    .t-loading__overlay {
      backdrop-filter: brightness(0.4);
    }
  }
  &__data {
    min-width: 1000px;
    width: 90vw;
    height: calc(100vh - 330px);
    .p-datatable {
      height: 100%;
      border-radius: 4px;
      border: 1px solid #4e4e4e;
      overflow: hidden;

      a {
        color: var(--comfy-primary-color);
        filter: brightness(1.2);
      }

      .p-datatable-thead > tr > th {
        background: #1f1f1f;
      }
      .p-datatable-tbody > tr {
        background: #171717;
      }
    }
  }
  &__footer {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    &__tip {
      position: absolute;
      left: 220px;
      font-size: 12px;
      color: var(--input-text);
      opacity: 0.35;
      width: calc(100% - 580px);
      min-width: 180px;
      text-align: left;
      user-select: none;
      -webkit-user-select: none;
    }

    .restart {
      width: 200px;
    }
    .close {
      width: 120px;
    }
  }
}
</style>
