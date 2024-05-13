import {Portfolio} from '@yoroi/types'
import {freeze} from 'immer'

function negate(
  amounts: Readonly<Portfolio.Token.AmountRecords>,
): Readonly<Portfolio.Token.AmountRecords> {
  return freeze(
    Object.fromEntries(
      Object.entries(amounts).map(([tokenId, amount]) => [
        tokenId,
        {
          ...amount,
          quantity: -amount.quantity,
        },
      ]),
    ),
    true,
  )
}

function drop(
  amounts: Readonly<Portfolio.Token.AmountRecords>,
  removeTokenIds: ReadonlyArray<Portfolio.Token.Id>,
): Portfolio.Token.AmountRecords {
  return freeze(
    Object.fromEntries(
      Object.entries(amounts).filter(
        ([tokenId]) => !removeTokenIds.includes(tokenId as Portfolio.Token.Id),
      ),
    ),
    true,
  )
}

function plus(
  amounts: ReadonlyArray<Portfolio.Token.AmountRecords>,
): Readonly<Portfolio.Token.AmountRecords> {
  const entries = amounts.map((amount) => Object.entries(amount)).flat()

  return freeze(
    entries.reduce((result, [id, {info, quantity}]) => {
      const tokenId = id as Portfolio.Token.Id
      result[tokenId] = {
        info,
        quantity: (result[tokenId]?.quantity ?? 0n) + quantity,
      }
      return result
    }, {} as Portfolio.Token.AmountRecords),
    true,
  )
}

function minus(
  amounts1: Readonly<Portfolio.Token.AmountRecords>,
  amounts2: Readonly<Portfolio.Token.AmountRecords>,
): Readonly<Portfolio.Token.AmountRecords> {
  const negatedAmounts2 = negate(amounts2)
  return freeze(plus([amounts1, negatedAmounts2]), true)
}

export const AmountsCalcultor = (
  initialAmounts: Readonly<Portfolio.Token.AmountRecords> = {},
) => {
  let amounts = {...initialAmounts}

  const builder = {
    negate: () => {
      amounts = negate(amounts)
      return builder
    },
    drop: (removeTokenIds: ReadonlyArray<Portfolio.Token.Id>) => {
      amounts = drop(amounts, removeTokenIds)
      return builder
    },
    plus: (newAmounts: Readonly<Portfolio.Token.AmountRecords>) => {
      amounts = plus([amounts, newAmounts])
      return builder
    },
    minus: (newAmounts: Readonly<Portfolio.Token.AmountRecords>) => {
      amounts = minus(amounts, newAmounts)
      return builder
    },
    build: () => amounts,
  }

  return builder
}
