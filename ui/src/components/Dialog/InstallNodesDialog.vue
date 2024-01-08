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
          :placeholder="t('Search custom nodes..')"
          @change="onSearch"
        />
      </div>
      <div class="custom-dialog__data">
        <DataTable
          :value="customNodesData"
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
      <span class="custom-dialog__footer__tip">
        {{
          t(
            'To apply the installed/updated/disabled/enabled custom node, please RESTART ComfyUI. And refresh browser.'
          )
        }}
      </span>
      <Button class="restart" @click="onRestart">
        {{ t('Restart ComfyUI') }}
      </Button>
      <Button class="close" severity="secondary" @click="close">
        {{ t('Close') }}
      </Button>
    </template>
  </CustomDialog>
</template>

<script setup lang="tsx">
// @ts-ignore
import { api } from '/scripts/api.js'
// @ts-ignore
import { app } from '/scripts/app.js'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import RenderFunc from '@/utils/render-func'
import { CUSTOM_NODE_MODE } from '@/utils/constants'
import { useDebounceFn, useEventBus } from '@vueuse/core'

enum ACTION {
  INSTALL = 'install',
  UPDATE = 'update',
  UNINSTALL = 'uninstall',
  TOGGLE = 'toggle_active',
}

const props = defineProps<{
  mode: CUSTOM_NODE_MODE
  dataSrcMode: string
  skipUpdateCheck: boolean
}>()
const t = _t
const visible = defineModel<boolean>('visible')
const dialogVisible = ref(false)
const header = computed(() => {
  switch (props.mode) {
    case CUSTOM_NODE_MODE.MISSING_NODES:
      return _t('Install Missing Custom Nodes')
    case CUSTOM_NODE_MODE.UPDATE:
      return _t('Update Nodes')
    case CUSTOM_NODE_MODE.A1111:
      return _t('Alternatives of A1111')
    default:
      return _t('Install Custom Nodes')
  }
})

const isA1111 = computed(() => props.mode === CUSTOM_NODE_MODE.A1111)

const current = ref<{
  action: ACTION | null
  node: ICustomNode | null
}>({
  action: null,
  node: null,
})

const filterOptions = shallowRef([
  { label: _t('All'), value: 'All' },
  { label: _t('Installed'), value: 'True' },
  { label: _t('Not Install'), value: 'False' },
  { label: _t('Update'), value: 'Update' },
  { label: _t('Disabled'), value: 'Disabled' },
])

const tip = computed(() => {
  if (!current.value.node || !current.value.action) return ''
  const currentNode = current.value.node

  switch (current.value.action) {
    case ACTION.INSTALL:
      return _t('Installing custom nodes {name}...', {
        name: currentNode.title,
      })
    case ACTION.UPDATE:
      return _t('Updating custom nodes {name}...', { name: currentNode.title })
    case ACTION.UNINSTALL:
      return _t('Uninstalling custom nodes {name}...', {
        name: currentNode.title,
      })
    default:
      return ''
  }
})

const loading = ref(false)
const freeze = computed(() => !!current.value.action)

const data = ref<{
  channel: string
  custom_nodes?: ICustomNode[]
  items?: ICustomNode[]
}>()

const search = ref('')
const statusFilter = ref('All')
const onSearch = useDebounceFn(onFilter, 300)

function onFilter() {
  const str = search.value.trim().toLowerCase()
  if (str) {
    if (statusFilter.value == 'All') {
      customNodesData.value = customNodes.value.filter((node) =>
        node.title.toLowerCase().includes(str)
      )
    } else {
      customNodesData.value = customNodes.value.filter(
        (node) =>
          node.title.toLowerCase().includes(str) &&
          node.installed === statusFilter.value
      )
    }
  } else {
    if (statusFilter.value == 'All') {
      customNodesData.value = customNodes.value
    } else {
      customNodesData.value = customNodes.value.filter(
        (node) => node.installed === statusFilter.value
      )
    }
  }
}

const customNodesData = ref<ICustomNode[]>([])
const customNodes = computed(() =>
  !data.value
    ? []
    : (isA1111.value ? data.value.items : data.value.custom_nodes) ?? []
)

async function getCustomNodes() {
  loading.value = true

  let skip_update = ''
  if (props.skipUpdateCheck) {
    skip_update = '&skip_update=true'
  }

  const path = isA1111.value ? 'alternatives' : 'customnode'

  const response = await api.fetchApi(
    `/${path}/getlist?mode=${props.dataSrcMode}${skip_update}`
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

  await getCustomNodes()
  customNodesData.value =
    props.mode === CUSTOM_NODE_MODE.MISSING_NODES
      ? await filterMissingNode()
      : customNodes.value

  if (props.mode === CUSTOM_NODE_MODE.UPDATE) {
    statusFilter.value = 'Update'
    onFilter()
  }
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
      colKey: 'title',
      title: _t('Title'),
      width: 120,
      cell: (p) => (isA1111.value ? p.data.custom_node.title : p.data.title),
    },
    {
      colKey: 'author',
      title: _t('Author'),
      width: 120,
      cell: (p) => (isA1111.value ? p.data.custom_node.author : p.data.author),
    },
    {
      colKey: 'description',
      title: _t('Description'),
      cell(p) {
        return (
          <div
            class="custom-node-manager__table__description"
            v-html={
              isA1111.value
                ? p.data.custom_node.description
                : p.data.description
            }
          />
        )
      },
    },
    {
      colKey: 'operation',
      title: _t('Operation'),
      width: 200,
      cell(p) {
        const node = isA1111.value ? p.data.custom_node : p.data
        const installed = node.installed
        const installButton = (
          <Button
            size="small"
            severity="secondary"
            onClick={() => onPostNode(ACTION.INSTALL, node)}
          >
            {_t('Install')}
          </Button>
        )
        const updateButton = (
          <Button
            size="small"
            severity="info"
            onClick={() => onPostNode(ACTION.UPDATE, node)}
          >
            {_t('Update')}
          </Button>
        )
        const enableButton = (
          <Button
            size="small"
            severity="success"
            onClick={() => onPostNode(ACTION.TOGGLE, node)}
          >
            {_t('Enable')}
          </Button>
        )
        const disableButton = (
          <Button
            size="small"
            severity="warning"
            onClick={() => onPostNode(ACTION.TOGGLE, node)}
          >
            {_t('Disable')}
          </Button>
        )
        const uninstallButton = (
          <Button
            size="small"
            severity="danger"
            onClick={() => onPostNode(ACTION.UNINSTALL, node)}
          >
            {_t('Uninstall')}
          </Button>
        )
        const undefinedButton = (
          <Button disabled size="small" severity="secondary">
            {_t('Unknown')}
          </Button>
        )

        let btns: any = null
        switch (installed) {
          case 'Fail':
          case 'True':
            btns = (
              <>
                {disableButton} {uninstallButton}
              </>
            )
            break
          case 'False':
            btns = installButton
            break
          case 'Update':
            btns = (
              <>
                {updateButton} {disableButton} {uninstallButton}{' '}
              </>
            )
            break
          case 'Disabled':
            btns = (
              <>
                {enableButton} {uninstallButton}
              </>
            )
            break
          default:
            btns = undefinedButton
        }

        return btns
      },
    },
  ]

  if (isA1111.value) {
    t.splice(t.length - 1, 0, {
      colKey: 'tags',
      title: _t('Tags'),
      filter: {
        type: 'multiple',
        list: [],
      },
      cell(p) {
        const tags: string[] = p.data.tags.split(',')
        return tags.map((tag) => (
          <t-tag key={tag} type="primary" style="margin: 0 4px 4px 0;">
            {tag.trim()}
          </t-tag>
        ))
      },
    })
  }

  return t
})

const toast = useToast()
async function onPostNode(action: ACTION, node: any) {
  current.value = { action, node }

  const actionText = {
    [ACTION.INSTALL]: 'Install',
    [ACTION.UPDATE]: 'Update',
    [ACTION.UNINSTALL]: 'Uninstall',
    [ACTION.TOGGLE]: node.installed === 'Disabled' ? 'Enable' : 'Disable',
  }

  try {
    const response = await api.fetchApi(`/customnode/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(node),
    })

    if (response.status === 400) {
      installError(action, node.title)
      return
    }
    await response.json()

    switch (action) {
      case ACTION.INSTALL:
      case ACTION.UPDATE:
        node.installed = 'True'
        break
      case ACTION.UNINSTALL:
        node.installed = 'False'
        break
      case ACTION.TOGGLE:
        node.installed = node.installed === 'Disabled' ? 'True' : 'Disabled'
        break
    }
    toast.add({
      severity: 'success',
      summary: _t('Success'),
      detail: _t('Successfully {action} custom node: {title}', {
        action: _t(actionText[action]),
        title: node.title,
      }),
      life: 3000,
    })
  } catch (error) {
    installError(actionText[action], node.title)
    return
  } finally {
    current.value = { action: null, node: null }
  }
}

function installError(action: string, title: string) {
  toast.add({
    severity: 'error',
    summary: _t('Error'),
    detail: _t('Failed to {action} custom node: {title}', {
      action: _t(action),
      title,
    }),
    life: 3000,
  })
}

function onRestart() {
  useEventBus('ComfyUI::Restart').emit()
}

async function filterMissingNode() {
  const mappings = await getCustomnodeMappings()

  // build regex->url map
  const regex_to_url: {
    regex: RegExp
    url: string
  }[] = []
  for (const i in customNodes.value) {
    const node = customNodes.value[i]
    if (node['nodename_pattern']) {
      let item = {
        regex: new RegExp(node.nodename_pattern),
        url: node.files[0],
      }
      regex_to_url.push(item)
    }
  }

  // build name->url map
  const name_to_url: any = {}
  for (const url in mappings) {
    const names = mappings[url]
    for (const name in names[0]) {
      name_to_url[names[0][name]] = url
    }
  }

  const registered_nodes = new Set()
  for (let i in LiteGraph.registered_node_types) {
    registered_nodes.add(LiteGraph.registered_node_types[i].type)
  }

  const missing_nodes: Set<string> = new Set()
  const workflow = app.graph.serialize()
  const group_nodes =
    workflow.extra && workflow.extra.groupNodes ? workflow.extra.groupNodes : []
  let nodes = workflow.nodes

  for (let i in group_nodes) {
    let group_node = group_nodes[i]
    nodes = nodes.concat(group_node.nodes)
  }

  for (let i in nodes) {
    const node_type = nodes[i].type
    if (node_type.startsWith('workflow/')) continue

    if (!registered_nodes.has(node_type)) {
      const url = name_to_url[node_type.trim()]
      if (url) missing_nodes.add(url)
      else {
        for (let j in regex_to_url) {
          if (regex_to_url[j].regex.test(node_type)) {
            missing_nodes.add(regex_to_url[j].url)
          }
        }
      }
    }
  }

  let unresolved_nodes = await getUnresolvedNodesInComponent()
  for (let i in unresolved_nodes) {
    let node_type = unresolved_nodes[i]
    const url = name_to_url[node_type]
    if (url) missing_nodes.add(url)
  }

  return customNodes.value.filter((node) =>
    node.files.some((file) => missing_nodes.has(file))
  )
}

async function getCustomnodeMappings() {
  const response = await api.fetchApi(
    `/customnode/getmappings?mode=${props.dataSrcMode}`
  )
  const data = await response.json()
  return data
}

async function getUnresolvedNodesInComponent() {
  try {
    const response = await api.fetchApi(`/component/get_unresolved`)

    const data = await response.json()
    return data.nodes
  } catch {
    return []
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
