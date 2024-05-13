import {Chain, Portfolio} from '@yoroi/types'

type ApiEndpoints = Readonly<{
  [K in keyof Portfolio.Api.Api]: string
}>

export type ApiConfig = Readonly<{
  [K in Chain.SupportedNetworks]: ApiEndpoints
}>
