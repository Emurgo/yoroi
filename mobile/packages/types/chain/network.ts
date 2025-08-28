export enum ChainNetwork {
  Mainnet = 'mainnet',
  Testnet = 'testnet',
  Preview = 'preview',
  Preprod = 'preprod',
}

export type ChainSupportedNetworks =
  | ChainNetwork.Mainnet
  | ChainNetwork.Preprod
  | ChainNetwork.Preview
