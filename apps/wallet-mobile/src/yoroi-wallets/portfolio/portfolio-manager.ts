import {Portfolio} from '@yoroi/types'
import {difference, Observer, observerMaker} from '@yoroi/wallets'
import _ from 'lodash'

import {RawUtxo} from '../types'
import {Amounts, Quantities} from '../utils'
import {calcLockedDeposit, cardanoFallbackTokenAsBalanceToken} from './adapters/cardano-helpers'
import {rawUtxosAsAmounts} from './adapters/transformers'
import {Tokens} from './helpers/tokens'
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
  let knownTokenIds = new Set<Portfolio.Token['info']['id']>()
  let portfolio: PortfolioManagerState = portfolioDefaultState

  // API
  const getTokens = async (
    ids: ReadonlyArray<Portfolio.Token['info']['id']>,
    avoidCache = false,
  ): Promise<Readonly<Portfolio.TokenRecords> | undefined> => {
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

  const updatePortfolio = async (utxos: ReadonlyArray<RawUtxo>, initialPrimaryToken: Readonly<Portfolio.Token>) => {
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
      const primaryTokenBalance: Portfolio.Token = {
        ...initialPrimaryToken,
        balance: primaryAmount[primaryTokenId],
        isPrimary: true,
      }
      const primaryTokenRecord = {[primaryTokenId]: primaryToken} as const
      const locked = await calcLockedDeposit(utxos)

      // SECONDARY
      const secondaryAmounts = Amounts.remove(allAmounts, [primaryTokenId])
      const secondaryIds = Amounts.ids(secondaryAmounts)
      const fts: Portfolio.Amounts = {}
      const nfts: Portfolio.Amounts = {}

      const secondaryTokens = (await getTokens(secondaryIds)) ?? {}

      const secondaryTokenRecords: Portfolio.TokenRecords = {}

      // there are 2 places that decide the kind of token
      // during the api.tokens call and here if the token is missing
      // it will fallback to fts
      secondaryIds.forEach((tokenId) => {
        // when token has no metadata - it should branch the flavor of token in the transformation
        // falling back to unknown cardano token
        const token = secondaryTokens[tokenId] ?? cardanoFallbackTokenAsBalanceToken(tokenId)
        const secondaryToken = {...token, balance: secondaryAmounts[tokenId], isPrimary: false} as const

        if (token.info.kind === 'ft') {
          fts[tokenId] = secondaryAmounts[tokenId]
        } else if (token.info.kind === 'nft') {
          nfts[tokenId] = secondaryAmounts[tokenId]
        } else {
          fts[tokenId] = secondaryAmounts[tokenId]
        }

        secondaryTokenRecords[tokenId] = secondaryToken
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
} as const
