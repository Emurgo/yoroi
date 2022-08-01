import {isEqual} from 'lodash'
import React, {useRef} from 'react'
import {useQuery} from 'react-query'

import {useFetchUTXOs} from '../../hooks'
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
  const lastTx = useLastTx(wallet)
  const tokenBalanceRef = useRef<tokenBalanceRef>({wallet, lastTx})

  const tokenBalance = useTokenBalance(tokenBalanceRef.current.wallet)
  const isStale = useIsStale(wallet, tokenBalanceRef.current.lastTx) // wallet is synchronized

  return (
    <TokenBalanceContext.Provider
      value={{
        tokenBalance,
        isStale,
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
  const utxos = useFetchUTXOs(wallet)
  const defaultMultiToken = new MultiToken([], getDefaultNetworkTokenEntry(wallet.networkId))

  const tokenBalance = (utxos || []).reduce(
    (acc: MultiToken, remoteValue: RemoteValue) =>
      acc.joinAddMutable(multiTokenFromRemote(remoteValue, wallet.networkId)),
    defaultMultiToken,
  )

  return tokenBalance
}

const useLastTx = (wallet: YoroiWallet, refetchInterval: number | false = false): LastTx => {
  const query = useQuery({
    queryKey: ['lastTx'],
    queryFn: async () => {
      let lastTx: LastTx = null
      try {
        await wallet.doFullSync()
        lastTx = getLatestYoroiTransaction(Object.values(wallet.transactions))
      } catch (e) {
        Logger.error('Last TX fetch error', e)
      }
      return lastTx
    },
    refetchInterval,
  })

  return query.data
}

const useIsStale = (wallet: YoroiWallet, initaltLastTx: LastTx) => {
  const lastTx = useLastTx(wallet, 5000)
  const isStale = !isEqual(lastTx, initaltLastTx)

  return isStale
}

type TokenBalanceContext = {
  tokenBalance: MultiToken
  isStale: boolean
}

type LastTx = LastYoroiTransaction | null
type tokenBalanceRef = {
  wallet: YoroiWallet
  lastTx: LastTx
}
