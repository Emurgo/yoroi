import {BigNumber} from 'bignumber.js'
import {Token, TokenEntry} from './index'

export class MultiToken {
  // this could be a map, but the # of elements is small enough the perf difference is trivial
  values: Array<TokenEntry>
  defaults: Token

  constructor(values: Array<TokenEntry>, defaults: Token) {
    this.values = []

    // things are just easier if we enforce the default entry to be part of the list of tokens
    this.defaults = defaults
    this.add({
      identifier: defaults.identifier,
      amount: new BigNumber(0)
    })
    values.forEach((value) => this.add(value))
  }

  get(identifier: string): BigNumber | undefined {
    return this.values.find((value) => value.identifier === identifier)?.amount
  }

  add(entry: TokenEntry): MultiToken {
    const existingEntry = this.values.find(
      (value) => value.identifier === entry.identifier
    )
    if (existingEntry == null) {
      this.values.push(entry)
      return this
    }
    existingEntry.amount = existingEntry.amount.plus(entry.amount)
    this._removeIfZero(entry.identifier)
    return this
  }

  _removeIfZero(identifier: string): void {
    // if after modifying a token value we end up with a value of 0,
    // we should just remove the token from the list
    // However, we must keep a value of 0 for the default entry
    if (identifier === this.defaults.identifier) {
      return
    }
    const existingValue = this.get(identifier)
    if (existingValue != null && existingValue.eq(0)) {
      this.values = this.values.filter(
        (value) => value.identifier !== identifier
      )
    }
  }

  subtract(entry: TokenEntry): MultiToken {
    return this.add({
      identifier: entry.identifier,
      amount: entry.amount.negated()
    })
  }

  joinAddMutable(target: MultiToken): MultiToken {
    for (const entry of target.values) {
      this.add(entry)
    }
    return this
  }
  joinSubtractMutable(target: MultiToken): MultiToken {
    for (const entry of target.values) {
      this.subtract(entry)
    }
    return this
  }
  joinAddCopy(target: MultiToken): MultiToken {
    const copy = new MultiToken(this.values, this.defaults)
    return copy.joinAddMutable(target)
  }
  joinSubtractCopy(target: MultiToken): MultiToken {
    const copy = new MultiToken(this.values, this.defaults)
    return copy.joinSubtractMutable(target)
  }

  absCopy(): MultiToken {
    return new MultiToken(
      this.values.map((token) => ({
        ...token,
        amount: token.amount.absoluteValue()
      })),
      this.defaults
    )
  }

  negatedCopy(): MultiToken {
    return new MultiToken(
      this.values.map((token) => ({
        ...token,
        amount: token.amount.negated()
      })),
      this.defaults
    )
  }

  getDefault(): BigNumber {
    return this.getDefaultEntry().amount
  }

  getDefaultEntry(): TokenEntry {
    return this.values.filter(
      (value) => value.identifier === this.defaults.identifier
    )[0]
  }

  nonDefaultEntries(): Array<TokenEntry> {
    return this.values.filter(
      (value) => !(value.identifier === this.defaults.identifier)
    )
  }

  asMap(): Map<string, BigNumber> {
    return new Map(
      this.values.map((value) => [value.identifier, value.amount])
    )
  }

  isEqualTo(tokens: MultiToken): boolean {
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

  size(): number {
    return this.values.length
  }

  isEmpty(): boolean {
    return this.values.filter((token) => token.amount.gt(0)).length === 0
  }
}

