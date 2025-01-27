export const Disclaimer = {
  Swap: 'swap',
  Exchange: 'exchange',
  Dapps: 'dapps',
  Bring: 'bring',
} as const

export type Disclaimer = (typeof Disclaimer)[keyof typeof Disclaimer]
