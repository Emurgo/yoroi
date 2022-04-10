// taken from Yoroi Frontend's MultiToken class
import {BigNumber} from 'bignumber.js'

import {getDefaultAssetByNetworkId} from '../../legacy/config'
import type {NetworkId} from '../../legacy/types'
export type TokenLookupKey = {
  identifier: string

  /**
   * note: avoid putting asset metadata here directly
   * since it can update over time so best not to cache it here
   */
  networkId: number
}
export type TokenEntry = TokenLookupKey & {
  amount: BigNumber
}
export type TokenEntryPlain = TokenLookupKey & {
  amount: string
  isDefault: boolean
}
export type DefaultTokenEntry = {
  defaultNetworkId: number
  defaultIdentifier: string
}
export class MultiToken {
  // this could be a map, but the # of elements is small enough the perf difference is trivial
  values: Array<TokenEntry>
  defaults: DefaultTokenEntry

  constructor(values: Array<TokenEntry>, defaults: DefaultTokenEntry) {
    this.values = []
    // things are just easier if we enforce the default entry to be part of the list of tokens
    this.defaults = defaults
    this.add({
      identifier: defaults.defaultIdentifier,
      networkId: defaults.defaultNetworkId,
      amount: new BigNumber(0),
    })
    values.forEach((value) => this.add(value))
  }

  _checkNetworkId: (arg0: number) => void = (networkId) => {
    const ownNetworkId = this.defaults.defaultNetworkId

    if (ownNetworkId !== networkId) {
      throw new Error(`MultiToken:: network mismatch ${ownNetworkId} - ${networkId}`)
    }
  }

  get: (arg0: string) => BigNumber | void = (identifier) => {
    return this.values.find((value) => value.identifier === identifier)?.amount
  }

  add: (arg0: TokenEntry) => MultiToken = (entry) => {
    this._checkNetworkId(entry.networkId)

    const existingEntry = this.values.find((value) => value.identifier === entry.identifier)

    if (existingEntry == null) {
      this.values.push(entry)
      return this
    }

    existingEntry.amount = existingEntry.amount.plus(entry.amount)
    return this
  }

  subtract: (arg0: TokenEntry) => MultiToken = (entry) => {
    return this.add({
      identifier: entry.identifier,
      amount: entry.amount.negated(),
      networkId: entry.networkId,
    })
  }

  joinAddMutable: (arg0: MultiToken) => MultiToken = (target) => {
    for (const entry of target.values) {
      this.add(entry)
    }

    return this
  }

  joinSubtractMutable: (arg0: MultiToken) => MultiToken = (target) => {
    for (const entry of target.values) {
      this.subtract(entry)
    }

    return this
  }

  joinAddCopy: (arg0: MultiToken) => MultiToken = (target) => {
    const copy = new MultiToken(this.values, this.defaults)
    return copy.joinAddMutable(target)
  }

  joinSubtractCopy: (arg0: MultiToken) => MultiToken = (target) => {
    const copy = new MultiToken(this.values, this.defaults)
    return copy.joinSubtractMutable(target)
  }

  absCopy: (arg0: void) => MultiToken = () => {
    return new MultiToken(
      this.values.map((token) => ({
        ...token,
        amount: token.amount.absoluteValue(),
      })),
      this.defaults,
    )
  }

  negatedCopy: (arg0: void) => MultiToken = () => {
    return new MultiToken(
      this.values.map((token) => ({
        ...token,
        amount: token.amount.negated(),
      })),
      this.defaults,
    )
  }

  getDefault: (arg0: void) => BigNumber = () => {
    return this.getDefaultEntry().amount
  }

  getDefaultEntry: (arg0: void) => TokenEntry = () => {
    return this.values.filter(
      (value) =>
        value.networkId === this.defaults.defaultNetworkId && value.identifier === this.defaults.defaultIdentifier,
    )[0]
  }

  getDefaultId: (arg0: void) => string = () => this.defaults.defaultIdentifier

  nonDefaultEntries: (arg0: void) => Array<TokenEntry> = () => {
    return this.values.filter(
      (value) =>
        !(value.networkId === this.defaults.defaultNetworkId && value.identifier === this.defaults.defaultIdentifier),
    )
  }

  asMap: (arg0: void) => Map<string, BigNumber> = () => {
    return new Map(this.values.map((value) => [value.identifier, value.amount]))
  }

  isEqualTo: (arg0: MultiToken) => boolean = (tokens) => {
    const remainingTokens = this.asMap()

    // remove tokens that match <identifier, amount> one at a time
    // if by the end there are no tokens left, it means we had a perfect match
    for (const token of tokens.values) {
      const value = remainingTokens.get(token.identifier)
      if (value == null) return false
      if (!value.isEqualTo(token.amount)) return false
      remainingTokens.delete(token.identifier)
    }

    if (remainingTokens.size > 0) return false
    return true
  }

  size: (arg0: void) => number = () => this.values.length
  isEmpty: (arg0: void) => boolean = () => {
    return this.values.filter((token) => token.amount.gt(0)).length === 0
  }

  asArray: (arg0: void) => Array<TokenEntryPlain> = () =>
    this.values.map((value) => ({
      identifier: value.identifier,
      networkId: value.networkId,
      amount: value.amount.toString(),
      isDefault:
        value.networkId === this.defaults.defaultNetworkId && value.identifier === this.defaults.defaultIdentifier,
    }))

  static fromArray(entries: Array<TokenEntryPlain>): MultiToken {
    const _asTokenEntry = (value) => ({
      identifier: value.identifier,
      networkId: value.networkId,
      amount: new BigNumber(value.amount),
    })

    const values = entries.map(_asTokenEntry)
    const defaults = entries
      .filter((value) => value.isDefault)
      .map((value) => ({
        defaultNetworkId: value.networkId,
        defaultIdentifier: value.identifier,
      }))[0]
    return new MultiToken(values, defaults)
  }
}

/**
 * Utility functions
 */
export const getDefaultNetworkTokenEntry = (networkId: NetworkId): DefaultTokenEntry => {
  const defaultAsset = getDefaultAssetByNetworkId(networkId)
  return {
    defaultNetworkId: defaultAsset.networkId,
    defaultIdentifier: defaultAsset.identifier,
  }
}
export const strToDefaultMultiAsset = (amount: string, networkId: NetworkId) => {
  const defaultTokenEntry = getDefaultNetworkTokenEntry(networkId)
  return new MultiToken(
    [
      {
        identifier: defaultTokenEntry.defaultIdentifier,
        networkId,
        amount: new BigNumber(amount),
      },
    ],
    defaultTokenEntry,
  )
}
