import {Links} from '@yoroi/types'
import {freeze} from 'immer'

import {LinksCardanoClaimV1, LinksCardanoLegacyTransfer} from './types'

export const cardanoScheme: Links.WebCardanoUriConfig['scheme'] = 'web+cardano'
export const configCardanoClaimV1: Readonly<LinksCardanoClaimV1> = freeze(
  {
    scheme: cardanoScheme,
    authority: 'claim',
    version: 'v1',
    rules: {
      requiredParams: ['code', 'faucet_url'],
      optionalParams: [],
      forbiddenParams: ['address'],
      extraParams: 'include',
    },
  },
  true,
)

export const configCardanoLegacyTransfer: Readonly<LinksCardanoLegacyTransfer> =
  freeze(
    {
      scheme: cardanoScheme,
      authority: '',
      version: '',
      rules: {
        requiredParams: ['address'],
        optionalParams: ['amount', 'memo', 'message'],
        forbiddenParams: [],
        extraParams: 'drop',
      },
    },
    true,
  )
