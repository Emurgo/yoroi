/* eslint-disable @typescript-eslint/no-explicit-any */
import AssetFingerprint from '@emurgo/cip14-js'
import {isTokenInfo as isPortfolioTokenInfo} from '@yoroi/portfolio'
import {Balance, Portfolio} from '@yoroi/types'
import {BigNumber} from 'bignumber.js'
import type {FormatDateOptions, IntlShape} from 'react-intl'
import {defineMessages} from 'react-intl'

import {isTokenInfo} from '../cardano/utils'
import {DefaultAsset, Token} from '../types'

export const getTokenFingerprint = ({policyId, assetNameHex}: {policyId: string; assetNameHex: string}) => {
  const assetFingerprint = AssetFingerprint.fromParts(Buffer.from(policyId, 'hex'), Buffer.from(assetNameHex, 'hex'))
  return assetFingerprint.fingerprint()
}

export const getAssetFingerprint = (policyId: string, assetNameHex: string) => {
  return getTokenFingerprint({policyId, assetNameHex})
}

export const decodeHexAscii = (text: string) => {
  const bytes = [...Buffer.from(text, 'hex')]
  const isAscii = bytes.every((byte) => byte > 32 && byte < 127)
  return isAscii ? String.fromCharCode(...bytes) : undefined
}

const getTicker = (token: Balance.TokenInfo | DefaultAsset) => {
  if (isTokenInfo(token)) {
    return token.kind === 'ft' ? token.ticker : undefined
  }
  return token.metadata.ticker
}
const getSymbol = (token: Balance.TokenInfo | DefaultAsset) => {
  const ticker = getTicker(token)
  return ticker
}

const getName = (token: Balance.TokenInfo | DefaultAsset | Portfolio.Token.Info) => {
  if ('kind' in token || 'type' in token) {
    return token.name || token.ticker || token.fingerprint || ''
  }

  if ('metadata' in token && 'ticker' in token.metadata) {
    return token.metadata.ticker
  }

  return (
    token.metadata.longName ||
    decodeHexAscii(token.metadata.assetName) ||
    getTokenFingerprint({
      policyId: token.metadata.policyId,
      assetNameHex: token.metadata.assetName,
    }) ||
    ''
  )
}

export const getDecimals = (token: Balance.TokenInfo | DefaultAsset | Portfolio.Token.Info) => {
  if ('kind' in token && token.kind === 'nft') return token.kind === 'nft' ? 0 : token.decimals

  if ('type' in token && 'decimals' in token) return token.decimals

  if ('metadata' in token && 'numberOfDecimals' in token.metadata) return token.metadata.numberOfDecimals

  return 0
}

export const normalizeTokenAmount = (
  quantity: Balance.Quantity | bigint,
  token: Balance.TokenInfo | DefaultAsset | Portfolio.Token.Info,
): BigNumber => {
  const decimals = getDecimals(token) ?? 0
  const normalizationFactor = Math.pow(10, decimals)
  return new BigNumber(quantity.toString()).dividedBy(normalizationFactor).decimalPlaces(decimals)
}

export const formatTokenAmount = (
  quantity: Balance.Quantity | bigint,
  token: Balance.TokenInfo | DefaultAsset | Portfolio.Token.Info,
): string => {
  const decimals = getDecimals(token)
  const normalized = normalizeTokenAmount(quantity, token)
  return normalized.toFormat(decimals)
}

const getTokenV2Fingerprint = (token: Balance.TokenInfo | DefaultAsset): string => {
  if (isTokenInfo(token)) {
    return token.fingerprint
  }
  return getTokenFingerprint({
    policyId: token.metadata.policyId,
    assetNameHex: token.metadata.assetName,
  })
}

export const formatTokenWithSymbol = (
  quantity: Balance.Quantity,
  token: Balance.TokenInfo | DefaultAsset | Portfolio.Token.Info,
): string => {
  if (isPortfolioTokenInfo(token)) {
    return `${formatTokenAmount(quantity, token)} ${token.ticker || token.fingerprint}`
  }
  const denomination = getSymbol(token) ?? getTokenV2Fingerprint(token)
  return `${formatTokenAmount(quantity, token)} ${denomination}`
}
// We assume that tickers are non-localized. If ticker doesn't exist, default
// to identifier

export const formatTokenWithText = (
  quantity: Balance.Quantity | bigint,
  token: Balance.TokenInfo | Portfolio.Token.Info | DefaultAsset,
  maxLength = 128,
) => {
  if (('kind' in token && token.kind === 'nft') || ('type' in token && token.type === 'nft')) {
    return `${formatTokenAmount(quantity, token)} ${truncateWithEllipsis(token.name || token.fingerprint, maxLength)}`
  }

  if ('kind' in token || 'type' in token) {
    return `${formatTokenAmount(quantity, token)} ${truncateWithEllipsis(
      token.ticker || token.name || token.fingerprint,
      maxLength,
    )}`
  }

  if ('metadata' in token && 'ticker' in token.metadata) {
    return `${formatTokenAmount(quantity, token)} ${truncateWithEllipsis(token.metadata.ticker, maxLength)}`
  }

  return `${formatTokenAmount(quantity, token)} ${truncateWithEllipsis(getName(token), maxLength)}`
}

export const formatTokenInteger = (
  amount: Balance.Quantity,
  token: Token | DefaultAsset | Portfolio.Token.Info,
  withPositiveSign = false,
) => {
  const decimals = 'metadata' in token ? token.metadata.numberOfDecimals : token.decimals
  const normalizationFactor = Math.pow(10, decimals)
  const bigNumber = new BigNumber(amount)
  const num = bigNumber.dividedToIntegerBy(normalizationFactor)

  if (bigNumber.lt(0) && bigNumber.gt(-normalizationFactor)) {
    // -0 needs special handling
    return '-0'
  } else {
    return withPositiveSign && num.isPositive() ? `+${num.toFormat(0)}` : num.toFormat(0)
  }
}

export const formatTokenFractional = (
  quantity: Balance.Quantity,
  token: Token | DefaultAsset | Portfolio.Token.Info,
) => {
  const decimals = 'metadata' in token ? token.metadata.numberOfDecimals : token.decimals
  const normalizationFactor = Math.pow(10, decimals)
  const fractional = new BigNumber(quantity).abs().modulo(normalizationFactor).dividedBy(normalizationFactor)
  // remove leading '0'
  return fractional.toFormat(decimals).substring(1)
}

export const truncateWithEllipsis = (s: string, n: number) => {
  if (s.length > n) {
    return `${s.substr(0, Math.floor(n / 2))}...${s.substr(s.length - Math.floor(n / 2))}`
  }

  return s
}

// TODO(multi-asset): consider removing these

const formatAda = (quantity: Balance.Quantity, primaryTokenInfo: Portfolio.Token.Info) => {
  const normalizationFactor = Math.pow(10, primaryTokenInfo.decimals)
  const num = new BigNumber(quantity).dividedBy(normalizationFactor)
  return num.toFormat(primaryTokenInfo.decimals)
}

export const formatAdaWithText = (quantity: Balance.Quantity, primaryTokenInfo: Portfolio.Token.Info) => {
  return `${formatAda(quantity, primaryTokenInfo)} ${primaryTokenInfo.ticker}`
}

export const formatTime = (timestamp: string, intl: IntlShape) => {
  if (timestamp.length === 0) {
    return ''
  }
  return intl.formatTime(new Date(timestamp), {
    timeStyle: 'medium',
  })
}

export const formatDateAndTime = (timestamp: string, intl: IntlShape) => {
  if (timestamp.length === 0) {
    return ''
  }
  return intl.formatDate(new Date(timestamp), {
    dateStyle: 'long',
    timeStyle: 'medium',
  })
}

export const formatDateRelative = (
  timestamp: string,
  intl: IntlShape,
  opts = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  } as FormatDateOptions,
) => {
  if (timestamp.length === 0) {
    return ''
  }
  const inputDateString = getDateString(new Date(timestamp))
  const today = getToday()
  const yesterday = getYesterday()

  if (inputDateString === today) {
    return intl.formatMessage(messages.today)
  }

  if (inputDateString === yesterday) {
    return intl.formatMessage(messages.yesterday)
  }

  return intl.formatDate(new Date(timestamp), opts)
}

function getDateString(date: Date) {
  return date.toISOString().split('T')[0]
}

function getYesterday() {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return getDateString(date)
}

function getToday() {
  return getDateString(new Date())
}

const messages = defineMessages({
  today: {
    id: 'utils.format.today',
    defaultMessage: '!!!Today',
  },
  yesterday: {
    id: 'utils.format.yesterday',
    defaultMessage: '!!!Yesterday',
  },
  unknownAssetName: {
    id: 'utils.format.unknownAssetName',
    defaultMessage: '!!![Unknown asset name]',
  },
})
