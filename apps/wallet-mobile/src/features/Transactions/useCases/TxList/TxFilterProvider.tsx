import {Portfolio} from '@yoroi/types'
import React from 'react'

const TxFilterContext = React.createContext<undefined | TxFilterContext>(undefined)

type Props = {
  children: React.ReactNode
} & TxFilterContext

export const TxFilter = ({tokenId, children}: Props) => {
  return <TxFilterContext.Provider value={{tokenId}}>{children}</TxFilterContext.Provider>
}

export const useTxFilter = () => React.useContext(TxFilterContext) ?? {}

type TxFilterContext = {
  tokenId?: Portfolio.Token.Info['id']
}
