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
  const [receivers, setReceivers] = useState<Array<string>>([])
  const [amount, setAmount] = useState('')

  const addReceiver = (receiver) => setReceivers([...receivers, receiver])

  const clear = () => {
    setSendAll(false)
    setReceivers([])
    setAmount('')
  }

  if (!balance[selectedTokenIdentifier]) {
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
        receivers,
        setReceivers,
        amount,
        setAmount,
        clear,
        addReceiver,
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
  receivers: Array<string>
  setReceivers: (receivers: Array<string>) => void
  amount: string
  setAmount: (amount: string) => void
  clear: () => void
  addReceiver: (receiver: string) => void
}

type SendContextProvider = {
  balance: YoroiAmounts
  wallet: YoroiWallet
}
