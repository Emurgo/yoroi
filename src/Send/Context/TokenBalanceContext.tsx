import {isEqual} from 'lodash'
import React, {MutableRefObject, useRef} from 'react'
import {useQuery} from 'react-query'

import {useUTXOs} from '../../hooks'
import {Logger} from '../../legacy/logging'
import {multiTokenFromRemote, RemoteValue} from '../../legacy/utils'
import {useSelectedWallet} from '../../SelectedWallet'
import {
  getDefaultNetworkTokenEntry,
  getLatestYoroiTransaction,
  LastYoroiTransaction,
  MultiToken,
  YoroiWallet,
} from '../../yoroi-wallets'

const TokenBalanceContext = React.createContext<undefined | TokenBalanceContext>(undefined)
export const TokenBalanceProvider: React.FC = ({children}) => {
  const wallet = useSelectedWallet()
  const tx = getLatestYoroiTransaction(Object.values(wallet.transactions))
  const tokenBalanceRef = useRef<TokenBalanceRef>({wallet, tx, isStale: false})

  const tokenBalance = useTokenBalance(tokenBalanceRef.current.wallet)
  useIsStale(wallet, tokenBalanceRef)

  return (
    <TokenBalanceContext.Provider
      value={{
        tokenBalance,
        isStale: tokenBalanceRef.current.isStale,
      }}
    >
      {children}
    </TokenBalanceContext.Provider>
  )
}

export const useTokenBalanceContext = () => React.useContext(TokenBalanceContext) || missingProvider()

const missingProvider = () => {
  throw new Error('TokenBalanceProvider is missing')
}

const useTokenBalance = (wallet: YoroiWallet): MultiToken => {
  const utxos = useUTXOs(wallet)
  const defaultMultiToken = new MultiToken([], getDefaultNetworkTokenEntry(wallet.networkId))

  const tokenBalance = (utxos || []).reduce(
    (acc: MultiToken, remoteValue: RemoteValue) =>
      acc.joinAddMutable(multiTokenFromRemote(remoteValue, wallet.networkId)),
    defaultMultiToken,
  )

  return tokenBalance
}

const useIsStale = (wallet: YoroiWallet, tokenBalanceRef: MutableRefObject<TokenBalanceRef>) => {
  const query = useQuery({
    queryKey: [wallet.id],
    queryFn: async () => {
      let lastTx: LastYoroiTransaction | null = null

      try {
        await wallet.doFullSync()
        lastTx = getLatestYoroiTransaction(Object.values(wallet.transactions))
      } catch (e) {
        Logger.error('Send screen isStale check failed', e)
      }

      return !isEqual(lastTx, tokenBalanceRef.current.tx)
    },
    refetchInterval: 5000,
    enabled: !tokenBalanceRef.current.isStale,
  })

  tokenBalanceRef.current.isStale = query.data || false
}

type TokenBalanceContext = {
  tokenBalance: MultiToken
  isStale: TokenBalanceRef['isStale']
}

type TokenBalanceRef = {
  wallet: YoroiWallet
  tx: LastYoroiTransaction
  isStale: boolean
}
