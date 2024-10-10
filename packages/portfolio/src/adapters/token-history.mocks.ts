import {Api, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'
import {BigNumber} from 'bignumber.js'

const ftNamelessRaw = {
  prices: [
    {
      ts: 1722849529169,
      open: '500000',
      close: '1000000',
      low: '500000',
      high: '1000000',
      change: 100,
    },
    {
      ts: 1722949529169,
      open: '500000',
      close: '1000000',
      low: '500000',
      high: '1000000',
      change: 100,
    },
  ],
}

const ftNameless: Portfolio.Token.History = {
  prices: [
    {
      ts: 1722849529169,
      open: new BigNumber(500_000),
      low: new BigNumber(500_000),
      close: new BigNumber(1_000_000),
      high: new BigNumber(1_000_000),
      change: 100,
    },
    {
      ts: 1722949529169,
      open: new BigNumber(500_000),
      low: new BigNumber(500_000),
      close: new BigNumber(1_000_000),
      high: new BigNumber(1_000_000),
      change: 100,
    },
  ],
}

const apiResponseTokenHistory: Readonly<
  Record<'success' | 'error', Api.Response<typeof ftNamelessRaw>>
> = {
  success: {
    tag: 'right',
    value: {
      status: 200,
      data: ftNamelessRaw,
    },
  },
  error: {
    tag: 'left',
    error: {
      status: 500,
      responseData: null,
      message: 'Internal Server Error',
    },
  },
}

const apiRequestTokenHistoryArgs: Readonly<{
  tokenId: Portfolio.Token.Id
  period: Portfolio.Token.HistoryPeriod
}> = {
  tokenId: 'ft.nameless',
  period: Portfolio.Token.HistoryPeriod.OneDay,
}

export const tokenHistoryMocks = freeze({
  ftNameless,
  ftNamelessRaw,
  api: {
    responses: apiResponseTokenHistory,
    request: apiRequestTokenHistoryArgs,
    responseDataOnly: ftNameless,
  },
})
