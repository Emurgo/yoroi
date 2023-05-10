export type InitOptions = {
  apiKey: string
  identity: string
}

export type MetricsAdapter = {
  track(): void
  init(options: InitOptions): void
}
