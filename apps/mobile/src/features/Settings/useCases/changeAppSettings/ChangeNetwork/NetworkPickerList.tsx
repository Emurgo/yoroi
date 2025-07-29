import {networkConfigs} from '@yoroi/blockchains'
import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import {freeze} from 'immer'
import React from 'react'
import {FlatList, StyleSheet} from 'react-native'

import {availableNetworks} from '~/features/WalletManager/common/constants'
import {useAutomaticWalletOpener} from '~/features/WalletManager/context/AutomaticWalletOpeningProvider'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {useNavigateTo} from '../../common/navigation'
import {NetworkPickerItem} from './NetworkPickerItem'

export const NetworkPickerList = () => {
  const {walletManager} = useWalletManager()
  const {styles} = useStyles()
  const navigateTo = useNavigateTo()
  const {network: selectedNetwork} = useSelectedNetwork()
  const {setShouldOpen: setShouldAutomaticWalletOpen} =
    useAutomaticWalletOpener()
  const {track} = useMetrics()

  // to improve UX
  const [localSelectedNetwork, setLocalSelectedNetwork] =
    React.useState(selectedNetwork)
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

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={networks}
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

const networks = freeze(
  Object.values(networkConfigs).filter(({network}) =>
    availableNetworks.includes(network),
  ),
)

const useStyles = () => {
  const {atoms} = useTheme()

  const styles = StyleSheet.create({
    contentContainer: {
      ...atoms.p_lg,
    },
  })

  return {styles}
}
