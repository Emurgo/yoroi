export type MetricsStorage = {
  enabled: {
    read(): Promise<boolean>
    remove(): Promise<void>
    save(enabled: boolean): Promise<void>
  }
}
