<template>
  <CustomDialog
    v-model:visible="dialogVisible"
    :header="header"
    :header-tip="tip"
  >
    <template #body>
      <div class="custom-dialog__filter">
        <Dropdown
          v-model="statusFilter"
          :options="filterOptions"
          option-label="label"
          option-value="value"
          @change="onFilter"
        />
        <InputText
          v-model="search"
          :placeholder="t('Search Models...')"
          @change="onSearch"
        />
      </div>
      <div class="custom-dialog__data">
        <DataTable
          :value="customModelsData"
          :loading="loading || freeze"
          :loading-props="{
            text: freeze ? t('Executing...') : t('Loading...'),
            delay: 300,
          }"
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
      <span />
      <Button class="close" severity="secondary" @click="close">
        {{ t('Close') }}
      </Button>
    </template>
  </CustomDialog>
</template>

<script setup lang="tsx">
// @ts-ignore
import { api } from '/scripts/api.js'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import RenderFunc from '@/utils/render-func'
import { useDebounceFn } from '@vueuse/core'

enum ACTION {
  INSTALL = 'install',
  UNINSTALL = 'uninstall',
}

const props = defineProps<{
  dataSrcMode: string
  skipUpdateCheck: boolean
}>()
const t = _t
const visible = defineModel<boolean>('visible')
const dialogVisible = ref(false)
const header = _t('Install Models')

const current = ref<{
  action: ACTION | null
  model: ICustomModel | null
}>({
  action: null,
  model: null,
})

const filterOptions = shallowRef([
  { label: _t('All'), value: 'All' },
  { label: _t('Installed'), value: 'True' },
  { label: _t('Not Install'), value: 'False' },
])

const tip = computed(() => {
  if (!current.value.model || !current.value.action) return ''
  const currentModel = current.value.model

  switch (current.value.action) {
    case ACTION.INSTALL:
      return _t('Installing model {name}...', {
        name: currentModel.name,
      })
    case ACTION.UNINSTALL:
      return _t('Uninstalling model {name}...', {
        name: currentModel.name,
      })
    default:
      return ''
  }
})

const loading = ref(false)
const freeze = computed(() => !!current.value.action)

const data = ref<{ models: ICustomModel[] }>()

const search = ref('')
const statusFilter = ref('All')
const onSearch = useDebounceFn(onFilter, 300)

function onFilter() {
  const str = search.value.trim().toLowerCase()
  if (str) {
    if (statusFilter.value == 'All') {
      customModelsData.value = customModels.value.filter((model) =>
        model.name.toLowerCase().includes(str)
      )
    } else {
      customModelsData.value = customModels.value.filter(
        (model) =>
          model.name.toLowerCase().includes(str) &&
          model.installed === statusFilter.value
      )
    }
  } else {
    if (statusFilter.value == 'All') {
      customModelsData.value = customModels.value
    } else {
      customModelsData.value = customModels.value.filter(
        (model) => model.installed === statusFilter.value
      )
    }
  }
}

const customModelsData = ref<ICustomModel[]>([])
const customModels = computed(() => data.value?.models || [])

async function getCustomModels() {
  loading.value = true
  let skip_update = ''
  if (props.skipUpdateCheck) {
    skip_update = '&skip_update=true'
  }

  const response = await api.fetchApi(
    `/externalmodel/getlist?mode=${props.dataSrcMode}${skip_update}`
  )

  data.value = await response.json()
  loading.value = false
}

function close() {
  dialogVisible.value = false
}

watch(dialogVisible, (v) => {
  if (!v) {
    setTimeout(() => {
      visible.value = false
    }, 200)
  }
})

onMounted(async () => {
  setTimeout(() => {
    dialogVisible.value = !!visible.value
  }, 10)

  await getCustomModels()
  customModelsData.value = customModels.value
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
      colKey: 'name',
      title: _t('Name'),
      width: 140,
      cell(p) {
        return (
          <a style="text-decoration:none;" href={p.data.reference}>
            {p.data.name}
          </a>
        )
      },
    },
    {
      colKey: 'type',
      title: _t('Type'),
      width: 120,
    },
    {
      colKey: 'description',
      title: _t('Description'),
      cell(p) {
        return (
          <div
            class="custom-node-manager__table__description"
            v-html={p.data.description}
          />
        )
      },
    },

    {
      colKey: 'base',
      title: _t('Base'),
      width: 110,
    },
    {
      colKey: 'operation',
      title: _t('Operation'),
      width: 160,
      cell(p) {
        const model = p.data
        const installed = model.installed
        const installButton = (
          <Button
            size="small"
            severity="secondary"
            onClick={() => onPostModel(ACTION.INSTALL, model)}
          >
            {_t('Install')}
          </Button>
        )
        const uninstallButton = (
          <Button
            size="small"
            severity="danger"
            onClick={() => onPostModel(ACTION.UNINSTALL, model)}
          >
            {_t('Uninstall')}
          </Button>
        )
        const undefinedButton = (
          <Button disabled size="small" severity="secondary">
            {_t('Unknown')}
          </Button>
        )

        let btns = null
        switch (installed) {
          case 'Fail':
          case 'True':
            btns = uninstallButton
            break
          case 'False':
            btns = installButton
            break
          default:
            btns = undefinedButton
        }

        return btns
      },
    },
  ]

  return t
})

const toast = useToast()
async function onPostModel(action: ACTION, model: any) {
  current.value = { action, model }

  const actionText = {
    [ACTION.INSTALL]: 'Install',
    [ACTION.UNINSTALL]: 'Uninstall',
  }

  try {
    const response = await api.fetchApi('/model/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(model),
    })

    if (response.status === 400) {
      installError(action, model.name)
      return
    }
    await response.json()

    switch (action) {
      case ACTION.INSTALL:
        model.installed = 'True'
        break
      case ACTION.UNINSTALL:
        model.installed = 'False'
        break
    }
    toast.add({
      severity: 'success',
      summary: _t('Success'),
      detail: _t('Successfully {action} model: {name}', {
        action: _t(actionText[action]),
        name: model.name,
      }),
      life: 3000,
    })
  } catch (error) {
    installError(actionText[action], model.name)
    return
  } finally {
    current.value = { action: null, model: null }
  }
}

function installError(action: string, name: string) {
  toast.add({
    severity: 'error',
    summary: _t('Error'),
    detail: _t('Failed to {action} model: {name}', {
      action: _t(action),
      name,
    }),
    life: 3000,
  })
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
