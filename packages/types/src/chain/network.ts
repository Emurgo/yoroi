export enum ChainNetwork {
  Main = 'main',
  Test = 'test',
  Preview = 'preview',
  Preprod = 'preprod',
  Sancho = 'sancho',
}

export type ChainSupportedNetworks =
  | ChainNetwork.Main
  | ChainNetwork.Preprod
  | ChainNetwork.Sancho
