import {networkConfigs} from '@yoroi/blockchains'
import {atoms as a} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import {freeze} from 'immer'
import * as React from 'react'
import {FlatList} from 'react-native'

import {useMetrics} from '../../../../../kernel/metrics/metricsManager'
import {availableNetworks} from '../../../../WalletManager/common/constants'
import {useAutomaticWalletOpener} from '../../../../WalletManager/context/AutomaticWalletOpeningProvider'
import {useWalletManager} from '../../../../WalletManager/context/WalletManagerProvider'
import {useSelectedNetwork} from '../../../../WalletManager/hooks/useSelectedNetwork'
import {useNavigateTo} from '../../../common/navigation'
import {NetworkPickerItem} from './NetworkPickerItem'

export const NetworkPickerList = () => {
  const {walletManager} = useWalletManager()
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
      contentContainerStyle={a.p_lg}
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
