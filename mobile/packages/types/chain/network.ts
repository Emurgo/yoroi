export const ChainNetwork = {
  Mainnet: 'mainnet',
  Testnet: 'testnet',
  Preview: 'preview',
  Preprod: 'preprod',
} as const

export type ChainNetwork = (typeof ChainNetwork)[keyof typeof ChainNetwork]

export type ChainSupportedNetworks =
  | typeof ChainNetwork.Mainnet
  | typeof ChainNetwork.Preprod
