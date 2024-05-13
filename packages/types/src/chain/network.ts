export enum ChainNetwork {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  Preview = 'preview',
  Preprod = 'preprod',
  Sancho = 'sancho',
}

export type ChainSupportedNetworks =
  | ChainNetwork.Mainnet
  | ChainNetwork.Preprod
  | ChainNetwork.Sancho
