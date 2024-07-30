import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import React from 'react'
import {FlatList, StyleSheet} from 'react-native'

import {isDev} from '../../../kernel/env'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {useSelectedNetwork} from '../../WalletManager/common/hooks/useSelectedNetwork'
import {useAutomaticWalletOpener} from '../../WalletManager/context/AutomaticWalletOpeningProvider'
import {useWalletManager} from '../../WalletManager/context/WalletManagerProvider'
import {networkConfigs} from '../../WalletManager/network-manager/network-manager'
import {useNavigateTo} from '../common/navigation'
import {NetworkPickerItem} from './NetworkPickerItem'

export const NetworkPickerList = () => {
  const {walletManager} = useWalletManager()
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()
  const {network: selectedNetwork} = useSelectedNetwork()
  const {setShouldOpen: setShouldAutomaticWalletOpen} = useAutomaticWalletOpener()
  const {track} = useMetrics()

  // to improve UX
  const [localSelectedNetwork, setLocalSelectedNetwork] = React.useState(selectedNetwork)
  React.useEffect(() => {
    setLocalSelectedNetwork(selectedNetwork)
  }, [selectedNetwork])

  const onSelectNetwork = (network: Chain.SupportedNetworks) => {
    track.networkSelected({from_network: selectedNetwork, to_network: network})
    setLocalSelectedNetwork(network)
    setShouldAutomaticWalletOpen(true)
    walletManager.setSelectedNetwork(network)
    navigateTo.preparingNetworks(network)
  }

  const data = Object.values(networkConfigs).filter(({network}) => !(network === Chain.Network.Sancho && !isDev))

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={data}
      keyExtractor={(item) => item.network}
      renderItem={({item}) => (
        <NetworkPickerItem
          name={item.name}
          selectedNetwork={localSelectedNetwork}
          itemNetwork={item.network}
          onSelectNetwork={onSelectNetwork}
        />
      )}
    />
  )
}

const useStyles = () => {
  const {atoms} = useTheme()

  const styles = StyleSheet.create({
    contentContainer: {
      ...atoms.p_lg,
    },
  })

  return {styles}
}
