import * as React from 'react'
import {ExchangeCtx} from '../ExchangeProvider'

export const useExchange = () => React.useContext(ExchangeCtx)
