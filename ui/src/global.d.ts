declare const LiteGraph: any
declare const _t: (key: string, ...args: any[]) => string
declare const api: {
  fetchApi: (url: string, options?: any) => Promise<Response>
}

declare interface ICustomNode {
  author: string
  description: string
  files: string[]
  install_type: string
  reference: string
  title: string
  installed: string
  nodename_pattern?: string
}

declare interface ICustomModel {
  name: string
  type: string
  base: string
  save_path: string
  description: string
  reference: string
  filename: string
  url: string
  installed: string
}
