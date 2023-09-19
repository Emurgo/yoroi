import {Portfolio, Writable} from '@yoroi/types'
import {difference, Observer, observerMaker} from '@yoroi/wallets'
import _ from 'lodash'

import {RawUtxo} from '../types'
import {Amounts, Quantities} from '../utils'
import {calcLockedDeposit, cardanoFallbackTokenAsBalanceToken} from './adapters/cardano-helpers'
import {rawUtxosAsAmounts} from './adapters/transformers'
import {PortfolioManager, PortfolioManagerOptions, PortfolioManagerState} from './types'

export const portfolioManagerMaker = <T extends Portfolio.Token>(
  {storage, api}: PortfolioManagerOptions<T>,
  observer: Observer<PortfolioManagerState<T>> = observerMaker<PortfolioManagerState<T>>(),
): PortfolioManager<T> => {
  const {tokens} = storage
  const {notify, subscribe, destroy} = observer

  // QUEUE
  const updatePortfolioQueue: Array<() => Promise<void>> = []
  const processQueue = async () => {
    while (updatePortfolioQueue.length > 0) {
      const task = updatePortfolioQueue[0]
      await task()
      updatePortfolioQueue.shift()
    }
  }

  // STATE
  let knownTokenIds = new Set<Portfolio.TokenInfo['id']>()
  let portfolio = portfolioManagerInitialState<T>()

  // API
  const getTokens = async (
    ids: ReadonlyArray<Portfolio.TokenInfo['id']>,
    avoidCache = false,
  ): Promise<Readonly<Portfolio.TokenRecords<T>> | undefined> => {
    if (avoidCache) {
      const refreshedTokens = await api.tokens(ids)
      await tokens.saveMany(Object.values(refreshedTokens))
      await hydrate()
      return refreshedTokens
    } else {
      const idsNotCached = difference(ids, Array.from(knownTokenIds))
      if (idsNotCached.length > 0) {
        const fetchedTokens = await api.tokens(idsNotCached)
        await tokens.saveMany(Object.values(fetchedTokens))
        await hydrate()
        return fetchedTokens
      }
    }
  }

  const updatePortfolio = async (utxos: ReadonlyArray<RawUtxo>, initialPrimaryToken: T) => {
    const task = async () => {
      const primaryTokenId = initialPrimaryToken.info.id
      const allAmounts = rawUtxosAsAmounts(utxos, primaryTokenId)

      // PRIMARY
      // primary token balance on cardano is scattered across utxo and account balances
      // + 2 ADA deposit certificate (when registered to delegate) - returns only when deregistering
      // + ?? ADA rewards (when delegating) - returns only when withdrawing (can be used if added in the tx)
      // + ?? ADA deposit (when filing a proposal) - returns only when the next epoch starts
      // + ?? ADA collateral - locked to be able to submit script txs
      // + ?? ADA locked (to hold data) - min-ada (can change if the utxos get reorganized / params change)
      // + ?? ---- register as a drep ---- (to updated)
      const primaryAmount = {[primaryTokenId]: allAmounts[primaryTokenId] ?? Quantities.zero}
      const primaryBalance: Portfolio.TokenBalance<T> = {
        ...initialPrimaryToken,
        balance: primaryAmount[primaryTokenId],
        isPrimary: true,
      }
      const primaryBalanceRecords: Portfolio.TokenBalanceRecords<T> = {[primaryTokenId]: primaryBalance} as const
      const primaryLockedBalance: Portfolio.TokenBalance<T> = {
        ...initialPrimaryToken,
        balance: await calcLockedDeposit(utxos),
        isPrimary: true,
      }
      const primaryLockRecords = {[primaryTokenId]: primaryLockedBalance} as const

      // SECONDARY
      const secondaryAmounts = Amounts.remove(allAmounts, [primaryTokenId])
      const secondaryIds = Amounts.ids(secondaryAmounts)
      const secondaryTokens = (await getTokens(secondaryIds)) ?? {}
      const secondaryBalanceRecords: Writable<Portfolio.TokenBalanceRecords<T>> = {}

      // there are 2 places that decide the kind of token
      // during the api.tokens call and here if the token is missing
      // it will fallback to ft
      secondaryIds.forEach((tokenId) => {
        // when token has no metadata - it should branch the flavor of token in the transformation
        // falling back to unknown cardano token
        const token = secondaryTokens[tokenId] ?? cardanoFallbackTokenAsBalanceToken<T>(tokenId)
        const secondaryBalance = {...token, balance: secondaryAmounts[tokenId], isPrimary: false} as const

        secondaryBalanceRecords[tokenId] = secondaryBalance
      })

      portfolio = {
        primary: {
          locks: primaryLockRecords,
          balances: primaryBalanceRecords,
        },
        secondary: {
          balances: {...secondaryBalanceRecords} as const,
        },
      } as const
    }

    // updates need to be processed in the arrival order
    // otherwise if the previous request was hanging the new one would be processed first
    // most importantly the state should reflect the latest request
    updatePortfolioQueue.push(task)
    await processQueue()

    // notify after queue waiting so it avoid notifying with stale state
    notify(portfolio)
  }

  const getPortfolio = () => _.cloneDeep(portfolio)

  const clear = async () => {
    await tokens.clear()
    knownTokenIds = new Set()
    portfolio = portfolioManagerInitialState<T>()
  }

  const hydrate = () =>
    tokens.getAllKeys().then((keys) => {
      knownTokenIds = new Set(keys)
    })

  return {
    updatePortfolio,
    getPortfolio,
    getTokens,
    hydrate,

    clear,

    subscribe,
    destroy,
  } as const
}

export function portfolioManagerInitialState<T extends Portfolio.Token>(): PortfolioManagerState<T> {
  return {
    primary: {
      locks: {},
      balances: {},
    },
    secondary: {
      balances: {},
    },
  } as const
}
