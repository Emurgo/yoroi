import * as React from 'react'

import {SetupWalletCtx} from '../provider/SetupWalletProvider'

export const useSetupWallet = () => React.useContext(SetupWalletCtx)
