import React, {useState} from 'react'
import {createContext, useContext} from 'react'

import {TokenId} from '../../yoroi-wallets/types'

const SendContext = createContext<undefined | SendContext>(undefined)
export const SendProvider: React.FC = ({children}) => {
  const [selectedTokenIdentifier, setSelectedTokenIdentifier] = useState<TokenId>('default')
  const [sendAll, setSendAll] = useState(false)
  const [receivers, setReceivers] = useState<Array<string>>([])
  const [amount, setAmount] = useState('')

  const clear = () => {
    setSendAll(false)
    setReceivers([])
    setAmount('')
  }

  const addReceiver = (receiver) => [...receivers, receiver]

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
  addReceiver: (receiver: string) => Array<string>
}
