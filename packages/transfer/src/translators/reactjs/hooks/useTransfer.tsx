import * as React from 'react'
import {TransferContext} from '../provider/TransferProvider'

export const useTransfer = () => React.useContext(TransferContext)
