import {Chain, Portfolio} from '@yoroi/types'

export type NetworkTokenManagers = Readonly<
  Record<Chain.SupportedNetworks, Portfolio.Manager.Token>
>
