import {Api, Portfolio} from '@yoroi/types'
import {freeze} from 'immer'
import {BigNumber} from 'bignumber.js'
import {tokenInfoMocks} from './token-info.mocks'
import {duallahanTokenActivityMocks} from './dullahan-api/token-activity.mocks'

const primaryETH: Portfolio.Token.Activity = {
  price: {
    ts: 1722849529169,
    open: new BigNumber(1_000_000),
    close: new BigNumber(500_000),
    low: new BigNumber(500_000),
    high: new BigNumber(1_000_000),
    change: -50,
  },
}

const rnftWhatever: Portfolio.Token.Activity = {
  price: {
    ts: 1722849529169,
    open: new BigNumber(500_000),
    low: new BigNumber(500_000),
    close: new BigNumber(1_000_000),
    high: new BigNumber(1_000_000),
    change: 100,
  },
}

const ftNoTicker: Portfolio.Token.Activity = {
  price: {
    ts: 1722849529169,
    open: new BigNumber(1_000_000),
    close: new BigNumber(500_000),
    low: new BigNumber(500_000),
    high: new BigNumber(1_000_000),
    change: -50,
  },
}

const ftNameless: Portfolio.Token.Activity = {
  price: {
    ts: 1722849529169,
    open: new BigNumber(500_000),
    low: new BigNumber(500_000),
    close: new BigNumber(1_000_000),
    high: new BigNumber(1_000_000),
    change: 100,
  },
}

const apiResponseSuccessDataOnly = {
  [tokenInfoMocks.primaryETH.id]: primaryETH,
  [tokenInfoMocks.rnftWhatever.id]: rnftWhatever,
  [tokenInfoMocks.ftNoTicker.id]: ftNoTicker,
  [tokenInfoMocks.ftNameless.id]: ftNameless,
}

const apiResponseTokenActivity: Readonly<
  Record<
    'success' | 'error',
    Api.Response<typeof duallahanTokenActivityMocks.api.responseSuccessDataOnly>
  >
> = {
  success: {
    tag: 'right',
    value: {
      status: 200,
      data: duallahanTokenActivityMocks.api.responseSuccessDataOnly,
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

const apiRequestTokenActivityArgs: ReadonlyArray<Portfolio.Token.Id> = [
  tokenInfoMocks.primaryETH.id,
  tokenInfoMocks.rnftWhatever.id,
  tokenInfoMocks.ftNoTicker.id,
  tokenInfoMocks.ftNameless.id,
]

export const tokenActivityMocks = freeze({
  primaryETH,
  rnftWhatever,
  ftNoTicker,
  ftNameless,

  api: {
    responses: apiResponseTokenActivity,
    request: apiRequestTokenActivityArgs,
    responseDataOnly: apiResponseSuccessDataOnly,
  },
})
