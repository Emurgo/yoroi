import * as React from 'react'

import {SwapContextInstance} from './SwapProvider'

export const useSwap = () => React.useContext(SwapContextInstance)
