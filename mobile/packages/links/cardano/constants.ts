import {Links} from '@yoroi/types'

import {freeze} from 'immer'

import {
  LinksCardanoAddressV1,
  LinksCardanoBlockV1,
  LinksCardanoBrowseV1,
  LinksCardanoClaimV1,
  LinksCardanoConnectV1,
  LinksCardanoLegacyTransfer,
  LinksCardanoPayV1,
  LinksCardanoPaymentV1,
  LinksCardanoStakeV1,
  LinksCardanoTransactionV1,
} from './types'

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

// @deprecated Use configCardanoPayV1 instead
// LEGACY COMPATIBILITY: Kept for backward compatibility
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

export const configCardanoBrowseV1: Readonly<LinksCardanoBrowseV1> = freeze(
  {
    scheme: cardanoScheme,
    authority: 'browse',
    version: 'v1',
    rules: {
      requiredParams: ['scheme', 'namespaced_domain'],
      optionalParams: ['app_path', 'url'],
      forbiddenParams: [],
      extraParams: 'include',
    },
  },
  true,
)

export const configCardanoPayV1: Readonly<LinksCardanoPayV1> = freeze(
  {
    scheme: cardanoScheme,
    authority: 'pay',
    version: 'v1',
    rules: {
      requiredParams: ['address'],
      optionalParams: ['amount', 'asset', 'memo'],
      forbiddenParams: [],
      extraParams: 'drop',
    },
  },
  true,
)

export const configCardanoPaymentV1: Readonly<LinksCardanoPaymentV1> = freeze(
  {
    scheme: cardanoScheme,
    authority: 'payment',
    version: 'v1',
    rules: {
      requiredParams: ['address'],
      optionalParams: ['amount', 'asset', 'memo'],
      forbiddenParams: [],
      extraParams: 'drop',
    },
  },
  true,
)

export const configCardanoStakeV1: Readonly<LinksCardanoStakeV1> = freeze(
  {
    scheme: cardanoScheme,
    authority: 'stake',
    version: 'v1',
    rules: {
      requiredParams: ['pool'],
      optionalParams: [],
      forbiddenParams: [],
      extraParams: 'drop',
    },
  },
  true,
)

export const configCardanoTransactionV1: Readonly<LinksCardanoTransactionV1> =
  freeze(
    {
      scheme: cardanoScheme,
      authority: 'transaction',
      version: 'v1',
      rules: {
        requiredParams: ['hash'],
        optionalParams: [],
        forbiddenParams: [],
        extraParams: 'drop',
      },
    },
    true,
  )

export const configCardanoBlockV1: Readonly<LinksCardanoBlockV1> = freeze(
  {
    scheme: cardanoScheme,
    authority: 'block',
    version: 'v1',
    rules: {
      requiredParams: [],
      optionalParams: ['hash', 'height'],
      forbiddenParams: [],
      extraParams: 'drop',
    },
  },
  true,
)

export const configCardanoAddressV1: Readonly<LinksCardanoAddressV1> = freeze(
  {
    scheme: cardanoScheme,
    authority: 'address',
    version: 'v1',
    rules: {
      requiredParams: ['address'],
      optionalParams: [],
      forbiddenParams: [],
      extraParams: 'drop',
    },
  },
  true,
)

export const configCardanoConnectV1: Readonly<LinksCardanoConnectV1> = freeze(
  {
    scheme: cardanoScheme,
    authority: 'connect',
    version: 'v1',
    rules: {
      requiredParams: ['peerId'],
      optionalParams: ['signalingUrl'],
      forbiddenParams: [],
      extraParams: 'drop',
    },
  },
  true,
)
