import {atomicToDecimal, truncateString} from '@yoroi/common'
import {isTokenInfo as isPortfolioTokenInfo} from '@yoroi/portfolio'
import {Balance, Portfolio} from '@yoroi/types'

import AssetFingerprint from '@emurgo/cip14-js'
import {BigNumber} from 'bignumber.js'
import type {FormatDateOptions, IntlShape} from 'react-intl'

import {isTokenInfo} from '../cardano/utils'
import {TransactionToken} from '../types/tokens'

export const getTokenFingerprint = ({
  policyId,
  assetNameHex,
}: {
  policyId: string
  assetNameHex: string
}) => {
  const assetFingerprint = AssetFingerprint.fromParts(
    Buffer.from(policyId, 'hex'),
    Buffer.from(assetNameHex, 'hex'),
  )
  return assetFingerprint.fingerprint()
}

export const getAssetFingerprint = (policyId: string, assetNameHex: string) => {
  return getTokenFingerprint({policyId, assetNameHex})
}

const getTicker = (token: Balance.TokenInfo | Portfolio.Token.Info) => {
  if (isTokenInfo(token)) {
    return token.kind === 'ft' ? token.ticker : undefined
  }
  return token.ticker
}
const getSymbol = (token: Balance.TokenInfo | Portfolio.Token.Info) => {
  const ticker = getTicker(token)
  return ticker
}

const getDecimals = (token: Balance.TokenInfo | Portfolio.Token.Info) => {
  if ('kind' in token && token.kind === 'nft')
    return token.kind === 'nft' ? 0 : token.decimals

  if ('type' in token && 'decimals' in token) return token.decimals

  return 0
}

const normalizeTokenAmount = (
  quantity: Balance.Quantity | bigint,
  token: Balance.TokenInfo | Portfolio.Token.Info,
): BigNumber => {
  const decimals = getDecimals(token) ?? 0
  return atomicToDecimal({
    value: quantity,
    decimals,
  })
}

export const formatTokenAmount = (
  quantity: Balance.Quantity | bigint,
  token: Balance.TokenInfo | Portfolio.Token.Info,
): string => {
  const decimals = getDecimals(token)
  const normalized = normalizeTokenAmount(quantity, token)
  return normalized.toFormat(decimals)
}

const getTokenV2Fingerprint = (
  token: Balance.TokenInfo | Portfolio.Token.Info,
): string => {
  if (isTokenInfo(token)) {
    return token.fingerprint
  }
  // For Portfolio.Token.Info, use fingerprint directly
  return token.fingerprint
}

export const formatTokenWithSymbol = (
  quantity: Balance.Quantity,
  token: Balance.TokenInfo | Portfolio.Token.Info,
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
  token: Balance.TokenInfo | Portfolio.Token.Info,
  maxLength = 128,
) => {
  if (
    ('kind' in token && token.kind === 'nft') ||
    ('type' in token && token.type === 'nft')
  ) {
    return `${formatTokenAmount(quantity, token)} ${truncateString({
      value: token.name || token.fingerprint,
      maxLength,
    })}`
  }

  return `${formatTokenAmount(quantity, token)} ${truncateString({
    value: token.ticker || token.name || token.fingerprint,
    maxLength,
  })}`
}

export const formatTokenInteger = (
  amount: Balance.Quantity,
  token: Balance.TokenInfo | Portfolio.Token.Info | TransactionToken,
  withPositiveSign = false,
) => {
  const decimals =
    ('numberOfDecimals' in token ? token.numberOfDecimals : token.decimals) ?? 0
  const normalizationFactor = Math.pow(10, decimals)
  const bigNumber = new BigNumber(amount)
  const num = bigNumber.dividedToIntegerBy(normalizationFactor)

  if (bigNumber.lt(0) && bigNumber.gt(-normalizationFactor)) {
    // -0 needs special handling
    return '-0'
  } else {
    return withPositiveSign && num.isPositive()
      ? `+${num.toFormat(0)}`
      : num.toFormat(0)
  }
}

export const formatTokenFractional = (
  quantity: Balance.Quantity,
  token: Balance.TokenInfo | Portfolio.Token.Info | TransactionToken,
) => {
  const decimals =
    ('numberOfDecimals' in token ? token.numberOfDecimals : token.decimals) ?? 0
  const normalizationFactor = Math.pow(10, decimals)
  const fractional = new BigNumber(quantity)
    .abs()
    .modulo(normalizationFactor)
    .dividedBy(normalizationFactor)
  // remove leading '0', and trailing '0's
  return fractional
    .toFormat(decimals)
    .substring(1)
    .replace(/[.|,]?0+$/, '')
}


// TODO(multi-asset): consider removing these

const formatAda = (
  quantity: Balance.Quantity,
  primaryTokenInfo: Portfolio.Token.Info,
) => {
  const num = atomicToDecimal({
    value: quantity,
    decimals: primaryTokenInfo.decimals,
  })
  return num.toFormat(primaryTokenInfo.decimals)
}

export const formatAdaWithText = (
  quantity: Balance.Quantity,
  primaryTokenInfo: Portfolio.Token.Info,
) => {
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
  strings?: {today: string; yesterday: string},
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
    return (
      strings?.today ??
      intl.formatMessage({id: 'global.today', defaultMessage: '!!!Today'})
    )
  }

  if (inputDateString === yesterday) {
    return (
      strings?.yesterday ??
      intl.formatMessage({
        id: 'global.yesterday',
        defaultMessage: '!!!Yesterday',
      })
    )
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
