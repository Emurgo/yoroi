import {Chain} from '@yoroi/types'
import React from 'react'
import {FlatList, StyleSheet} from 'react-native'

import {NetworkLabel} from '../../WalletManager/common/constants'
import {useSelectedNetwork} from '../../WalletManager/common/hooks/useSelectedNetwork'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {ThemePickerItem} from './NetworkPickerItem'

export const NetworkPickerList = () => {
  const {network} = useSelectedNetwork()
  const {walletManager} = useWalletManager()
  const {wallet} = useSelectedWallet()
  const [_, setLocalNetwork] = React.useState<Chain.SupportedNetworks>(network)

  console.log('wallet', wallet.networkManager.network)

  const onSelectNetwork = (network: Chain.SupportedNetworks) => {
    setLocalNetwork(network)
    walletManager.setSelectedNetwork(network)
  }

  const data = Object.entries(NetworkLabel) as Array<[Chain.SupportedNetworks, string]>

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={data}
      keyExtractor={([networkKey]) => networkKey}
      renderItem={({item: [network, networkLabel]}) => {
        return (
          <ThemePickerItem
            label={networkLabel}
            itemNetwork={network}
            onSelectNetwork={() => onSelectNetwork(network)}
          />
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
})
