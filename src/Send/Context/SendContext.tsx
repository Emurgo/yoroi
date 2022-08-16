import * as React from 'react'
import {createContext, useContext} from 'react'

import {getDefaultAssetByNetworkId} from '../../legacy/config'
import {YoroiWallet} from '../../yoroi-wallets'
import {TokenId, YoroiAmounts} from '../../yoroi-wallets/types'

type SendContextProvider = {
  balances: YoroiAmounts
  wallet: YoroiWallet
}

const SendContext = createContext<undefined | SendContext>(undefined)
export const SendProvider: React.FC<SendContextProvider> = ({children, balances, wallet}) => {
  const defaultTokenId = getDefaultAssetByNetworkId(wallet.networkId).identifier

  const [selectedTokenIdentifier, setSelectedTokenIdentifier] = React.useState<TokenId>(defaultTokenId)
  const [sendAll, setSendAll] = React.useState(false)
  const [receiver, setReceiver] = React.useState('')
  const [amount, setAmount] = React.useState('')

  const clear = React.useCallback(() => {
    setSendAll(false)
    setReceiver('')
    setAmount('')
  }, [setSendAll, setReceiver, setAmount])

  React.useEffect(() => {
    if (
      defaultTokenId !== selectedTokenIdentifier &&
      typeof balances[selectedTokenIdentifier] !== 'string' &&
      balances[selectedTokenIdentifier] !== undefined
    ) {
      setSelectedTokenIdentifier(defaultTokenId)
      clear()
    }
  }, [setSelectedTokenIdentifier, clear, defaultTokenId, selectedTokenIdentifier, balances])

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

export const useSend = () => useContext(SendContext) || missingProvider()

const missingProvider = () => {
  throw new Error('SendProvider is missing')
}
