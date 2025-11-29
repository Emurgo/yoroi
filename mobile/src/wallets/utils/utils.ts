import {RawUtxo} from '@yoroi/api'
import {parseNumberFromText} from '@yoroi/common'
import {TransactionOutput} from '@yoroi/tx'
import {Balance, Branded, Numbers, Portfolio} from '@yoroi/types'

import BigNumber from 'bignumber.js'

export const Entries = {
  first: (entries: TransactionOutput[]): TransactionOutput => {
    if (entries.length === 0) throw new Error('invalid entries')
    return entries[0]!
  },
  remove: (
    entries: TransactionOutput[],
    removeAddresses: Array<string>,
  ): TransactionOutput[] => {
    return entries.filter((e) => !removeAddresses.includes(e.address))
  },
  toAddresses: (entries: TransactionOutput[]): Array<string> => {
    return entries.map((e) => e.address)
  },
  toAmounts: (entries: TransactionOutput[]): Balance.Amounts => {
    const amounts = entries.map((e) => e.amounts)
    return Amounts.sum(amounts)
  },
}

export const Amounts = {
  sum: (amounts: Array<Balance.Amounts>): Balance.Amounts => {
    const entries = amounts.map((amounts) => Object.entries(amounts)).flat()

    return entries.reduce((result, [tokenId, quantity]) => {
      const tid = tokenId as Portfolio.Token.Id
      const newResult: Balance.Amounts = {
        ...result,
        [tid]: (result[tid]
          ? Quantities.sum([result[tid]!, quantity])
          : quantity) as Balance.Quantity,
      }
      return newResult
    }, {} as Balance.Amounts)
  },
  diff: (
    amounts1: Balance.Amounts,
    amounts2: Balance.Amounts,
  ): Balance.Amounts => {
    return Amounts.sum([amounts1, Amounts.negated(amounts2)])
  },
  includes: (amounts: Balance.Amounts, tokenId: string): boolean => {
    return Object.keys(amounts).includes(tokenId)
  },
  negated: (amounts: Balance.Amounts): Balance.Amounts => {
    const entries = Object.entries(amounts)
    const negatedEntries = entries.map(([tokenId, amount]) => [
      tokenId,
      Quantities.negated(amount),
    ])

    return Object.fromEntries(negatedEntries)
  },
  remove: (
    amounts: Balance.Amounts,
    removeTokenIds: Array<Portfolio.Token.Id>,
  ): Balance.Amounts => {
    const filteredEntries = Object.entries(amounts).filter(
      ([tokenId]) => !removeTokenIds.includes(tokenId as Portfolio.Token.Id),
    )

    return Object.fromEntries(filteredEntries)
  },
  getAmount: (amounts: Balance.Amounts, tokenId: string): Balance.Amount => {
    return {
      tokenId: tokenId as Portfolio.Token.Id,
      quantity: amounts[tokenId as Portfolio.Token.Id] || Quantities.zero,
    }
  },
  getAmountsFromEntries: (entries: TransactionOutput[]): Balance.Amounts => {
    return Amounts.sum(entries.map((e) => e.amounts))
  },
  getAmountFromEntries: (
    entries: TransactionOutput[],
    tokenId: string,
  ): Balance.Amount => {
    return Amounts.getAmount(Amounts.getAmountsFromEntries(entries), tokenId)
  },
  save: (amounts: Balance.Amounts, amount: Balance.Amount): Balance.Amounts => {
    const {tokenId, quantity} = amount

    return {
      ...amounts,
      [tokenId]: quantity,
    }
  },
  map: (
    amounts: Balance.Amounts,
    fn: (amount: Balance.Amount) => Balance.Amount,
  ): Balance.Amounts => Amounts.fromArray(Amounts.toArray(amounts).map(fn)),
  toArray: (amounts: Balance.Amounts) =>
    Object.keys(amounts).reduce(
      (result, current) => [...result, Amounts.getAmount(amounts, current)],
      [] as Array<Balance.Amount>,
    ),
  fromArray: (amounts: Array<Balance.Amount>) =>
    Object.fromEntries(
      amounts.map((amount) => [amount.tokenId, amount.quantity]),
    ),
}

export const Quantities = {
  sum: (quantities: Array<Balance.Quantity>) => {
    return quantities
      .reduce((result, current) => result.plus(current), new BigNumber(0))
      .toString(10) as Balance.Quantity
  },
  max: (...quantities: Array<Balance.Quantity>) => {
    return BigNumber.max(...quantities).toString(10) as Balance.Quantity
  },
  diff: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1)
      .minus(new BigNumber(quantity2))
      .toString(10) as Balance.Quantity
  },
  negated: (quantity: Balance.Quantity) => {
    return new BigNumber(quantity).negated().toString(10) as Balance.Quantity
  },
  product: (quantities: Array<Balance.Quantity>) => {
    return quantities.reduce((result, quantity) => {
      const x = new BigNumber(result).times(new BigNumber(quantity))

      return x.toString(10) as Balance.Quantity
    }, '1' as Balance.Quantity)
  },
  quotient: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1)
      .dividedBy(new BigNumber(quantity2))
      .toString(10) as Balance.Quantity
  },
  isGreaterThan: (quantity1: Balance.Quantity, quantity2: Balance.Quantity) => {
    return new BigNumber(quantity1).isGreaterThan(new BigNumber(quantity2))
  },
  decimalPlaces: (quantity: Balance.Quantity, precision: number) => {
    return new BigNumber(quantity)
      .decimalPlaces(precision)
      .toString(10) as Balance.Quantity
  },
  denominated: (quantity: Balance.Quantity, denomination: number) => {
    return Quantities.quotient(
      quantity,
      new BigNumber(10).pow(denomination).toString(10) as Balance.Quantity,
    )
  },
  integer: (quantity: Balance.Quantity, denomination: number) => {
    return new BigNumber(quantity)
      .decimalPlaces(denomination)
      .shiftedBy(denomination)
      .toString(10) as Balance.Quantity
  },
  zero: '0' as Balance.Quantity,
  isZero: (quantity: Balance.Quantity) => new BigNumber(quantity).isZero(),
  isAtomic: (quantity: Balance.Quantity, denomination: number) => {
    const absoluteQuantity = new BigNumber(quantity)
      .decimalPlaces(denomination)
      .abs()
    const minimalFractionalPart = new BigNumber(10).pow(
      new BigNumber(denomination).negated(),
    )

    return absoluteQuantity.isEqualTo(minimalFractionalPart)
  },
  parseFromText: (
    text: string,
    denomination: number,
    format: Numbers.Locale,
    precision = denomination,
  ): [string, Balance.Quantity] => {
    const result = parseNumberFromText({
      text,
      denomination,
      format,
      precision,
    })
    return [
      result.sanitizedInput,
      (result.quantity ?? Branded.ZERO_QUANTITY) as Balance.Quantity,
    ]
  },
  format: (
    quantity: Balance.Quantity,
    denomination: number,
    precision?: number,
  ) => {
    if (precision === undefined)
      return new BigNumber(
        Quantities.denominated(quantity, denomination),
      ).toFormat()
    return new BigNumber(Quantities.denominated(quantity, denomination))
      .decimalPlaces(precision)
      .toFormat()
  },
}

export const asQuantity = (value: BigNumber | number | string) => {
  const bn = new BigNumber(value)
  if (bn.isNaN() || !bn.isFinite()) {
    throw new Error('Invalid quantity')
  }
  return bn.toString(10) as Balance.Quantity
}

export const Utxos = {
  toAmounts: (
    utxos: RawUtxo[],
    primaryTokenId: Portfolio.Token.Id,
  ): Balance.Amounts => {
    const result: Balance.Amounts = utxos.reduce(
      (previousAmounts, currentUtxo) => {
        const amounts: Balance.Amounts = {
          ...previousAmounts,
        }
        // Quantities.sum already returns Balance.Quantity
        amounts[primaryTokenId] = Quantities.sum([
          previousAmounts[primaryTokenId] ?? Branded.ZERO_QUANTITY,
          currentUtxo.amount as Balance.Quantity,
        ])

        if (currentUtxo.assets) {
          currentUtxo.assets.forEach((currentAsset) => {
            const tokenId = currentAsset.tokenId as Portfolio.Token.Id
            // Quantities.sum already returns Balance.Quantity
            amounts[tokenId] = Quantities.sum([
              Amounts.getAmount(amounts, currentAsset.tokenId).quantity,
              currentAsset.amount as Balance.Quantity,
            ])
          })
        }

        return amounts
      },
      {[primaryTokenId]: Quantities.zero} as Balance.Amounts,
    )
    return result
  },
}

export const compareArrays = <T>(array1: Array<T>, array2: Array<T>) => {
  if (array1.length !== array2.length) return false
  return array1.every((item, index) => item === array2[index])
}

export const splitStringInto64CharArray = (inputString: string): string[] => {
  const maxLength = 64
  const resultArray: string[] = []

  for (let i = 0; i < inputString.length; i += maxLength) {
    const substring = inputString.slice(i, i + maxLength)
    resultArray.push(substring)
  }

  return resultArray
}
