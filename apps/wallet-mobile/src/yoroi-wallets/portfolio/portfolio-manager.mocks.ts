/* eslint-disable @typescript-eslint/no-explicit-any */
import {Nullable, Portfolio} from '@yoroi/types'
import {Cardano} from '@yoroi/wallets'

import {mockDelayedResponse, mockLoading, mockMaker, mockMakerMutation, mockUnknownError} from '../utils/mockHelpers'
import {portfolioManagerInitialState} from './portfolio-manager'
import {PortfolioManager, PortfolioManagerOptions} from './types'

// DATA
const tokensResponse: Readonly<Portfolio.TokenRecords<Cardano.Yoroi.PortfolioToken>> = {
  // TODO: fill later
}
const allKeysResponse: string[] = ['9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6d616e795265636f726473']
const emptyTokensResponse: Readonly<Portfolio.TokenRecords<Cardano.Yoroi.PortfolioToken>> = {}

// API
const tokens = {
  success: () => Promise.resolve(tokensResponse),
  empty: () => Promise.resolve(emptyTokensResponse),
  error: {
    unknown: mockUnknownError,
  },
  loading: mockLoading,
  delayed: mockDelayedResponse,
}

// STORAGE
const getAllKeys = mockMaker<readonly string[]>(allKeysResponse, [])
const clear = mockMakerMutation()
const saveMany = mockMakerMutation()
// TODO: fill data later
const readAll = mockMaker<[string, Nullable<Cardano.Yoroi.PortfolioToken>][]>([], [])
const readMany = mockMaker<[string, Nullable<Cardano.Yoroi.PortfolioToken>][]>([], [])

// OPTIONS
const mockPortfolioManagerOptions: PortfolioManagerOptions<Cardano.Yoroi.PortfolioToken> = {
  api: {
    tokens: tokens.success,
  },
  storage: {
    tokens: {
      getAllKeys: getAllKeys.success,
      saveMany: saveMany.success,
      readAll: readAll.success,
      readMany: readMany.success,
      clear: clear.success,
    },
  },
}

const mockPortfolioManagerOptionsEmpty: PortfolioManagerOptions<Cardano.Yoroi.PortfolioToken> = {
  api: {
    tokens: tokens.empty,
  },
  storage: {
    tokens: {
      getAllKeys: getAllKeys.empty,
      saveMany: saveMany.success,
      readAll: readAll.empty,
      readMany: readMany.empty,
      clear: clear.success,
    },
  },
}

const mockPortfolioManagerOptionsError: PortfolioManagerOptions<Cardano.Yoroi.PortfolioToken> = {
  api: {
    tokens: tokens.error.unknown,
  },
  storage: {
    tokens: {
      getAllKeys: getAllKeys.error.unknown,
      saveMany: saveMany.error.unknown,
      readAll: readAll.error.unknown,
      readMany: readMany.error.unknown,
      clear: clear.error.unknown,
    },
  },
}

// MANAGER
const hydrate = mockMakerMutation()
const updatePortfolio = mockMakerMutation()
const subscribe = () => () => undefined
const destroy = () => undefined
// TODO: fill data later
const getTokens = mockMaker<Readonly<Portfolio.TokenRecords<Cardano.Yoroi.PortfolioToken>> | undefined>({}, undefined)

const mockPortfolioManager: PortfolioManager<any> = {
  hydrate: hydrate.success,
  getTokens: getTokens.success,
  updatePortfolio: updatePortfolio.success,
  getPortfolio: () => portfolioManagerInitialState<any>(),
  subscribe,
  clear: clear.success,
  destroy,
}

// MOCKS
export const mocksPortolioManager = {
  emptyTokensResponse,
  tokensResponse,

  allKeysResponse,

  getAllKeys,
  saveMany,
  readMany,
  readAll,
  tokens,
  clear,

  mockPortfolioManagerOptionsEmpty,
  mockPortfolioManagerOptionsError,
  mockPortfolioManagerOptions,

  updatePortfolio,
  getTokens,
  hydrate,

  subscribe,
  destroy,

  mockPortfolioManager,
}
