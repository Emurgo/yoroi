import {ChainWarning} from '../../../components/ChainWarning/ChainWarning'
import * as React from 'react'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {Chain} from '@yoroi/types'
import {useStrings} from './useStrings'

export const ChainDAppsWarning = () => {
  const strings = useStrings()
  const {
    selected: {network},
  } = useWalletManager()
  const isMainnet = network === Chain.Network.Mainnet

  if (isMainnet) return null
  return (
    <ChainWarning
      title={'Testnet DApps 🚧'}
      description={
        'This is a list of DApps designed for testnet use. Note that it may be limited, as not all DApps are deployed in the testnet environment.'
      }
    />
  )
}
