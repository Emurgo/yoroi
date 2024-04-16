import {Chain, Portfolio} from '@yoroi/types'

type ApiEndpoints = Readonly<{
  [K in keyof Portfolio.Api.Api]: string
}>

export type ApiConfig = Readonly<{
  [K in Chain.Network]: ApiEndpoints
}>

export type TokenInfoAndDiscovery = Readonly<{
  info: Portfolio.Token.Info
  discovery: Portfolio.Token.Discovery
}>
