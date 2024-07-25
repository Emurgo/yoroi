import {useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import React from 'react'
import {FlatList, StyleSheet} from 'react-native'

import {isNightly} from '../../../kernel/env'
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
  const {setActive: setAutomaticWalletOpenerActive} = useAutomaticWalletOpener()

  // to improve UX
  const [localSelectedNetwork, setLocalSelectedNetwork] = React.useState(selectedNetwork)
  React.useEffect(() => {
    setLocalSelectedNetwork(selectedNetwork)
  }, [selectedNetwork])

  const onSelectNetwork = (network: Chain.SupportedNetworks) => {
    setLocalSelectedNetwork(network)
    setAutomaticWalletOpenerActive(true)
    walletManager.setSelectedNetwork(network)
    navigateTo.preparingNetworks(network)
  }

  const data = entriesFromObject(networkConfigs).filter(([network]) => filter(network as Chain.SupportedNetworks))

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={data}
      keyExtractor={([networkKey]) => networkKey}
      renderItem={({item: [networkKey, {name}]}) => (
        <NetworkPickerItem
          name={name}
          selectedNetwork={localSelectedNetwork}
          itemNetwork={networkKey}
          onSelectNetwork={onSelectNetwork}
        />
      )}
    />
  )
}

const filter = (network: Chain.SupportedNetworks) => {
  return !(network === Chain.Network.Sancho && !isNightly)
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

type Entries<T> = {
  [K in keyof T]: [K, T[K]]
}[keyof T][]

function entriesFromObject<T extends object>(object: T): Entries<T> {
  return Object.entries(object) as Entries<T>
}
