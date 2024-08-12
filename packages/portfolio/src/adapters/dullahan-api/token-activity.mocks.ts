import {tokenInfoMocks} from '../token-info.mocks'
import {DullahanApiTokenActivityUpdatesResponse} from './types'

const primaryETH = {
  price24h: {
    ts: 1722849529169,
    open: '1000000',
    close: '500000',
    low: '500000',
    high: '1000000',
    change: -50,
  },
}

const rnftWhatever = {
  price24h: {
    ts: 1722849529169,
    open: '500000',
    close: '1000000',
    low: '500000',
    high: '1000000',
    change: 100,
  },
}

const ftNoTicker = {
  price24h: {
    ts: 1722849529169,
    open: '1000000',
    close: '500000',
    low: '500000',
    high: '1000000',
    change: -50,
  },
}

const ftNameless = {
  price24h: {
    ts: 1722849529169,
    open: '500000',
    close: '1000000',
    low: '500000',
    high: '1000000',
    change: 100,
  },
}

const apiResponseSuccessDataOnly: Readonly<DullahanApiTokenActivityUpdatesResponse> =
  {
    [tokenInfoMocks.primaryETH.id]: primaryETH,
    [tokenInfoMocks.rnftWhatever.id]: rnftWhatever,
    [tokenInfoMocks.ftNoTicker.id]: ftNoTicker,
    [tokenInfoMocks.ftNameless.id]: ftNameless,
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
