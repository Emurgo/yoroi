import {Api} from '@yoroi/types'
import {tokenInfoMocks} from '../token-info.mocks'
import {DullahanApiTokenActivityResponse} from './types'

const primaryETH = {
  price: {
    ts: 1722849529169,
    open: '1000000',
    close: '500000',
    low: '500000',
    high: '1000000',
    change: -50,
  },
}

const rnftWhatever = {
  price: {
    ts: 1722849529169,
    open: '500000',
    close: '1000000',
    low: '500000',
    high: '1000000',
    change: 100,
  },
}

const ftNoTicker = {
  price: {
    ts: 1722849529169,
    open: '1000000',
    close: '500000',
    low: '500000',
    high: '1000000',
    change: -50,
  },
}

const ftNameless = {
  price: {
    ts: 1722849529169,
    open: '500000',
    close: '1000000',
    low: '500000',
    high: '1000000',
    change: 100,
  },
}

const apiResponseSuccessDataOnly: Readonly<DullahanApiTokenActivityResponse> = {
  [tokenInfoMocks.primaryETH.id]: [Api.HttpStatusCode.Ok, primaryETH],
  [tokenInfoMocks.rnftWhatever.id]: [Api.HttpStatusCode.Ok, rnftWhatever],
  [tokenInfoMocks.ftNoTicker.id]: [Api.HttpStatusCode.Ok, ftNoTicker],
  [tokenInfoMocks.ftNameless.id]: [Api.HttpStatusCode.Ok, ftNameless],
}

export const duallahanTokenActivityUpdatesMocks = {
  primaryETH,
  rnftWhatever,
  ftNoTicker,
  ftNameless,

  api: {
    responseSuccessDataOnly: apiResponseSuccessDataOnly,
  },
}
