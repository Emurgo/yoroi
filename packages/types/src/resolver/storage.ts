export type ResolverStorage = Readonly<{
  showNotice: {
    read(): Promise<boolean>
    remove(): Promise<void>
    save(noticed: boolean): Promise<void>
    key: string
  }

  clear(): Promise<void>
}>
