import * as React from 'react'

import {SwapContext} from './SwapProvider'

export const useSwap = () => React.useContext(SwapContext)
