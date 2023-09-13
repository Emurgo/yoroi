import * as React from 'react'
import {SwapContext} from '../provider/SwapProvider'

export const useSwap = () => React.useContext(SwapContext)
