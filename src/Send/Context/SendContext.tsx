import React, {useEffect, useState} from 'react'
import {createContext, useContext} from 'react'

import {getDefaultAssetByNetworkId} from '../../legacy/config'
import {YoroiWallet} from '../../yoroi-wallets'
import {TokenId, YoroiAmounts} from '../../yoroi-wallets/types'

const SendContext = createContext<undefined | SendContext>(undefined)
export const SendProvider: React.FC<SendContextProvider> = ({children, balance, wallet}) => {
  const defaultTokenId = getDefaultAssetByNetworkId(wallet.networkId).identifier

  const [selectedTokenIdentifier, setSelectedTokenIdentifier] = useState<TokenId>(defaultTokenId)
  const [sendAll, setSendAll] = useState(false)
  const [receiver, setReceiver] = useState('')
  const [amount, setAmount] = useState('')

  const clear = () => {
    setSendAll(false)
    setReceiver('')
    setAmount('')
  }

  if (defaultTokenId !== selectedTokenIdentifier && !balance[selectedTokenIdentifier]) {
    setSelectedTokenIdentifier(defaultTokenId)
    clear()
  }

  useEffect(() => {
    clear()
  }, [wallet])

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

export const useSendContext = () => useContext(SendContext) || missingProvider()

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
  balance: YoroiAmounts
  wallet: YoroiWallet
}
