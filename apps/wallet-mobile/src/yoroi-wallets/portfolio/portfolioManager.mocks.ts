import {Balance, Nullable} from '@yoroi/types'

import {mockDelayedResponse, mockLoading, mockMaker, mockMakerMutation, mockUnknownError} from '../utils/mockHelpers'
import {PortfolioManagerOptions} from './types'

// DATA
const tokensResponse: Readonly<Balance.TokenRecords> = {
  // TODO: fill later
}
const allKeysResponse: string[] = ['9d88eef1d822a708cad279fc7c79c3936733b236011544f8567f4842.6d616e795265636f726473']
const emptyTokensResponse: Readonly<Balance.TokenRecords> = {}

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
const readAll = mockMaker<[string, Nullable<Balance.Token>][]>([], [])
const readMany = mockMaker<[string, Nullable<Balance.Token>][]>([], [])

// OPTIONS
const mockPortfolioManagerOptions: PortfolioManagerOptions = {
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

const mockPortfolioManagerOptionsEmpty: PortfolioManagerOptions = {
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

const mockPortfolioManagerOptionsError: PortfolioManagerOptions = {
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

// MOCKS
export const mockPortolioManager = {
  tokensResponse,
  emptyTokensResponse,

  allKeysResponse,

  tokens,
  getAllKeys,
  saveMany,
  readAll,
  readMany,
  clear,

  mockPortfolioManagerOptions,
  mockPortfolioManagerOptionsEmpty,
  mockPortfolioManagerOptionsError,
}
