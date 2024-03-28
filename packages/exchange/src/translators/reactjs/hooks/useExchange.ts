import * as React from 'react'
import {ExchangeCtx} from '../provider/ExchangeProvider'

export const useExchange = () => React.useContext(ExchangeCtx)
