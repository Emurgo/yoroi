export type ExchangeManagerOptions = {
  /** Partner name, e.g., emurgo. */
  partner: string
  /** Indicates that is running on production enviroment, otherwise will fallback to the sandbox */
  isProduction?: boolean
}
