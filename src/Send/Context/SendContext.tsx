import * as React from 'react'
import {createContext, useContext} from 'react'

import {getPrimaryAssetByNetworkId} from '../../legacy/config'
import {YoroiWallet} from '../../yoroi-wallets'
import {TokenId, YoroiAmounts} from '../../yoroi-wallets/types'

const SendContext = createContext<undefined | SendContext>(undefined)
export const SendProvider: React.FC<SendContextProvider> = ({children, balances, wallet}) => {
  const primaryTokenId = getPrimaryAssetByNetworkId(wallet.networkId).identifier

  const [selectedTokenIdentifier, setSelectedTokenIdentifier] = React.useState<TokenId>(primaryTokenId)
  const [sendAll, setSendAll] = React.useState(false)
  const [receiver, setReceiver] = React.useState('')
  const [amount, setAmount] = React.useState('')

  const clear = () => {
    setSendAll(false)
    setReceiver('')
    setAmount('')
  }

  if (
    primaryTokenId !== selectedTokenIdentifier &&
    typeof balances[selectedTokenIdentifier] !== 'string' &&
    balances[selectedTokenIdentifier] !== undefined
  ) {
    setSelectedTokenIdentifier(primaryTokenId)
    clear()
  }

  return (
    <SendContext.Provider
      value={{
        selectedTokenIdentifier,
        setSelectedTokenIdentifier,
        sendAll,
        setSendAll,
        receiver,
        setReceiver,
        amount,
        setAmount,
        clear,
      }}
    >
      {children}
    </SendContext.Provider>
  )
}

export const useSend = () => useContext(SendContext) || missingProvider()

const missingProvider = () => {
  throw new Error('SendProvider is missing')
}

type SendContext = {
  selectedTokenIdentifier: TokenId
  setSelectedTokenIdentifier: (tokenId: TokenId) => void
  sendAll: boolean
  setSendAll: (sendAll: boolean) => void
  receiver: string
  setReceiver: (receiver: string) => void
  amount: string
  setAmount: (amount: string) => void
  clear: () => void
}

type SendContextProvider = {
  balances: YoroiAmounts
  wallet: YoroiWallet
}
