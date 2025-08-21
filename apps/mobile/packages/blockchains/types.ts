import {Chain, Portfolio} from '@yoroi/types'

export type TokenManagerByNetwork = Readonly<
  Record<Chain.SupportedNetworks, Portfolio.Manager.Token>
>
