import * as React from 'react'

import {WalletSetupCtx} from '../provider/WalletSetupProvider'

export const useWalletSetup = () => React.useContext(WalletSetupCtx)
