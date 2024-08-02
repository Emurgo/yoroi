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
  return <ChainWarning title={strings.testnetWarningTitle} description={strings.testnetWarningDescription} />
}
