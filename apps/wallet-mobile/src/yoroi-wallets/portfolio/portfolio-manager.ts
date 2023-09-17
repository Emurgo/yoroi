import {Balance} from '@yoroi/types'
import {difference, Observer, observerMaker} from '@yoroi/wallets'
import _ from 'lodash'

import {RawUtxo} from '../types'
import {Amounts, Quantities} from '../utils'
import {calcLockedDeposit, cardanoFallbackTokenAsBalanceToken} from './adapters/cardano-helpers'
import {rawUtxosAsAmounts} from './adapters/transformers'
import {PortfolioManager, PortfolioManagerOptions, PortfolioManagerState} from './types'

export const portfolioManagerMaker = (
  {storage, api}: PortfolioManagerOptions,
  observer: Observer<PortfolioManagerState> = observerMaker<PortfolioManagerState>(),
): PortfolioManager => {
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
  let knownTokenIds = new Set<Balance.Token['info']['id']>()
  let portfolio: PortfolioManagerState = portfolioDefaultState

  // API
  const getTokens = async (
    ids: ReadonlyArray<Balance.Token['info']['id']>,
    avoidCache = false,
  ): Promise<Readonly<Balance.TokenRecords> | undefined> => {
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

  const updatePortfolio = async (utxos: ReadonlyArray<RawUtxo>, primaryToken: Readonly<Balance.Token>) => {
    const task = async () => {
      const allAmounts = rawUtxosAsAmounts(utxos, primaryToken.info.id)

      // PRIMARY
      // primary token balance on cardano is scattered across utxo and account balances
      // + 2 ADA deposit certificate (when registered to delegate) - returns only when deregistering
      // + ?? ADA rewards (when delegating) - returns only when withdrawing (can be used if added in the tx)
      // + ?? ADA deposit (when filing a proposal) - returns only when the next epoch starts
      // + ?? ADA collateral - locked to be able to submit script txs
      // + ?? ADA locked (to hold data) - min-ada (can change if the utxos get reorganized / params change)
      // + ?? ---- register as a drep ---- (to updated)
      const primaryAmount = {[primaryToken.info.id]: allAmounts[primaryToken.info.id] ?? Quantities.zero}
      const locked = await calcLockedDeposit(utxos)
      const primaryTokenRecord = {[primaryToken.info.id]: primaryToken}

      // SECONDARY
      const secondaryAmounts = Amounts.remove(allAmounts, [primaryToken.info.id])
      const secondaryIds = Amounts.ids(secondaryAmounts)
      const fts: Balance.Amounts = {}
      const nfts: Balance.Amounts = {}

      const cachedSecondaryTokens = (await getTokens(secondaryIds)) ?? {}

      const secondaryTokenRecords: Balance.TokenRecords = {}

      // there are 2 places that decide the kind of token
      // during the api.tokens call and here if the token is missing
      // it will fallback to fts
      secondaryIds.forEach((tokenId) => {
        const token = cachedSecondaryTokens[tokenId]
        if (token?.info?.kind === 'ft') {
          fts[tokenId] = secondaryAmounts[tokenId]
        } else if (token?.info?.kind === 'nft') {
          nfts[tokenId] = secondaryAmounts[tokenId]
        } else {
          fts[tokenId] = secondaryAmounts[tokenId]
        }
        // when token has no metadata - it should branch the flavor of token in the transformation
        // falling back to unknown cardano token
        secondaryTokenRecords[tokenId] = token ?? cardanoFallbackTokenAsBalanceToken(tokenId)
      })

      portfolio = {
        primary: {
          fts: primaryAmount,
          locked: {[primaryToken.info.id]: locked},
          tokens: primaryTokenRecord,
        },
        secondary: {
          fts,
          nfts,
          tokens: secondaryTokenRecords,
        },
        all: {
          fts: {...primaryAmount, ...fts},
          nfts,
          tokens: {...primaryTokenRecord, ...secondaryTokenRecords},
        },
      } as const
    }

    // updates need to be processed in the arrived order
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
    portfolio = portfolioDefaultState
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

export const portfolioDefaultState: PortfolioManagerState = {
  primary: {
    fts: {},
    locked: {},

    tokens: {},
  },
  secondary: {
    fts: {},
    nfts: {},

    tokens: {},
  },
  all: {
    fts: {},
    nfts: {},

    tokens: {},
  },
} as const
