import {Portfolio} from '@yoroi/types'

import * as React from 'react'

const TxFilterContext = React.createContext<undefined | TxFilterContext>(
  undefined,
)

type Props = {
  children: React.ReactNode
} & TxFilterContext

export const TxFilter = ({
  tokenId,
  selectedOperations,
  metadataMemoSearch,
  minAdaMoved,
  maxAdaMoved,
  children,
}: Props) => {
  return (
    <TxFilterContext.Provider
      value={{
        tokenId,
        selectedOperations,
        metadataMemoSearch,
        minAdaMoved,
        maxAdaMoved,
      }}
    >
      {children}
    </TxFilterContext.Provider>
  )
}

export const useTxFilter = () => React.useContext(TxFilterContext) ?? {}

type TxFilterContext = {
  tokenId?: Portfolio.Token.Id
  selectedOperations?: string[]
  metadataMemoSearch?: string
  minAdaMoved?: string
  maxAdaMoved?: string
}
