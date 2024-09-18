import * as React from 'react'

import {ClaimContext} from '../provider/ClaimProvider'

export const useClaim = () => React.useContext(ClaimContext)
