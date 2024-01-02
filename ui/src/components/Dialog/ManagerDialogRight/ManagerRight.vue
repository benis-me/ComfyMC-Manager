<template>
  <div class="manager-right">
    <div class="manager-block">
      <span class="manager-block__title">{{ t('EXPERIMENTAL') }}</span>
      <div class="manager-block__content">
        <div class="manager-item">
          <Button
            block
            size="small"
            severity="secondary"
            @click="snapshotDialogVisible = true"
          >
            {{ t('Snapshot Manager') }}
          </Button>
        </div>
      </div>
    </div>
    <ManagerOthers />

    <SnapshotDialog
      v-model:visible="snapshotDialogVisible"
      v-if="snapshotDialogVisible"
    />
  </div>
</template>

<script setup lang="ts">
const t = _t

const snapshotDialogVisible = ref(false)
</script>

<style lang="scss">
.manager-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>
