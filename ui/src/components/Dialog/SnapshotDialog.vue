<template>
  <CustomDialog width="1000px" v-model:visible="dialogVisible" :header="header">
    <template #body>
      <div class="custom-dialog__data">
        <DataTable
          :value="customData"
          size="small"
          stripe
          bordered
          table-layout="fixed"
          scrollHeight="100%"
          scrollable
        >
          <template #empty> {{ t('No data found') }} </template>
          <Column
            v-for="item in tableColums"
            :key="item.title"
            :header="item.title"
            :field="item.colKey"
            :style="{ width: item.width + 'px' }"
          >
            <template v-if="!!item.cell" #body="p">
              <RenderFunc :render="item.cell(p)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </template>
    <template #footer>
      <Button class="save" @click="onSave">
        {{ t('Save') }}
      </Button>
      <Button class="close" severity="secondary" @click="onClose">
        {{ t('Close') }}
      </Button>
    </template>
  </CustomDialog>
</template>

<script setup lang="tsx">
// @ts-ignore
import { api } from '/scripts/api.js'
import Button from 'primevue/button'
import RenderFunc from '@/utils/render-func'
import { useToast } from 'primevue/usetoast'

const t = _t
const visible = defineModel<boolean>('visible')
const dialogVisible = ref(false)
const header = _t('Snapshot Manager')

const data = ref<{ items: string[] }>()
const customData = computed(() =>
  data.value ? data.value.items.map((item, i) => ({ id: i, title: item })) : []
)

async function getSnapshotList() {
  const response = await api.fetchApi(`/snapshot/getlist`)
  data.value = await response.json()
}

function onClose() {
  dialogVisible.value = false
  setTimeout(() => {
    visible.value = false
  }, 200)
}

onMounted(async () => {
  await getSnapshotList()

  setTimeout(() => {
    dialogVisible.value = !!visible.value
  }, 100)
})

const tableColums = computed(() => {
  if (!data.value) return []

  const t: {
    colKey: string
    title: string
    filter?: any
    width?: number
    cell?: (p: any) => any
  }[] = [
    {
      colKey: 'id',
      title: _t('ID'),
      width: 140,
    },
    {
      colKey: 'title',
      title: _t('Title'),
    },
    {
      colKey: 'operation',
      title: _t('Operation'),
      width: 200,
      cell(p) {
        const restoreButton = (
          <Button
            style="margin: 0 4px 4px 0;"
            severity="secondary"
            size="small"
            onClick={() => onRestore(p.data)}
          >
            {_t('Restore')}
          </Button>
        )
        const removeButton = (
          <Button
            style="margin: 0 4px 4px 0;"
            severity="danger"
            size="small"
            onClick={() => onRemove(p.data)}
          >
            {_t('Remove')}
          </Button>
        )

        return [restoreButton, removeButton]
      },
    },
  ]

  return t
})

const toast = useToast()
async function onRestore(snapshot: any) {
  try {
    const response = await api.fetchApi(
      `/snapshot/restore?target=${snapshot.title}`,
      { cache: 'no-store' }
    )
    if (response.status == 400) {
      toast.add({
        severity: 'error',
        summary: _t('Error'),
        detail: _t('Restore snapshot failed: {snapshot}', {
          snapshot: snapshot.title,
        }),
        life: 3000,
      })
    }
    return true
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: _t('Error'),
      detail: _t('Restore snapshot failed: {snapshot}', {
        snapshot: snapshot.title,
      }),
      life: 3000,
    })
    return false
  } finally {
    toast.add({
      severity: 'info',
      summary: _t('Info'),
      detail: () => (
        <>
          {_t(
            'To apply the snapshot, please Restart ComfyUI. And refresh browser.'
          )}{' '}
          <Button>{_t('Restart ComfyUI')}</Button>
        </>
      ),
      life: 0,
    })
  }
}

async function onRemove(snapshot: any) {
  try {
    const response = await api.fetchApi(
      `/snapshot/remove?target=${snapshot.title}`,
      { cache: 'no-store' }
    )
    if (response.status == 400) {
      toast.add({
        severity: 'error',
        summary: _t('Error'),
        detail: _t('Remove snapshot failed: {snapshot}', {
          snapshot: snapshot.title,
        }),
        life: 3000,
      })
    }
    return true
  } catch (exception) {
    toast.add({
      severity: 'error',
      summary: _t('Error'),
      detail: _t('Remove snapshot failed: {snapshot}', {
        snapshot: snapshot.title,
      }),
      life: 3000,
    })
    return false
  } finally {
    await getSnapshotList()
  }
}

async function onSave() {
  try {
    await api.fetchApi('/snapshot/save', { cache: 'no-store' })
    return true
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: _t('Error'),
      detail: _t('Backup snapshot failed'),
      life: 3000,
    })
    return false
  } finally {
    await getSnapshotList()
    toast.add({
      severity: 'success',
      summary: _t('Success'),
      detail: _t('Current snapshot saved'),
      life: 3000,
    })
  }
}
</script>

<style lang="scss">
.custom-dialog {
  &__filter {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
}
</style>
