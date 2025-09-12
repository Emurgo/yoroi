import {networkConfigs} from '@yoroi/blockchains'
import {atoms as a} from '@yoroi/theme'
import {Chain} from '@yoroi/types'

import {freeze} from 'immer'
import * as React from 'react'
import {FlatList} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useHasShowNetworkNotice} from '~/features/Settings/hooks/useHasShowNetworkNotice'
import {useOpenNetworkNoticeModal} from '~/features/Settings/hooks/useOpenNetworkNoticeModal'
import {availableNetworks} from '~/features/WalletManager/common/constants'
import {useAutomaticWalletOpener} from '~/features/WalletManager/context/AutomaticWalletOpeningProvider'
import {useWalletManager} from '~/features/WalletManager/context/WalletManagerProvider'
import {useSelectedNetwork} from '~/features/WalletManager/hooks/useSelectedNetwork'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Hr} from '~/ui/Hr/Hr'

import {useNavigateTo} from '../../../../hooks/useNavigateTo'
import {NetworkItem} from './NetworkItem'

export const SelectNetworkScreen = () => {
  const {walletManager} = useWalletManager()
  const navigateTo = useNavigateTo()
  const {network: selectedNetwork} = useSelectedNetwork()
  const {setShouldOpen: setShouldAutomaticWalletOpen} =
    useAutomaticWalletOpener()
  const {track} = useMetrics()
  const {hasShownNetworkNotice, setHasShownNetworkNotice} =
    useHasShowNetworkNotice()

  const handleOnSelectNetwork = (network: Chain.SupportedNetworks) => {
    track.networkSelected({from_network: selectedNetwork, to_network: network})
    setShouldAutomaticWalletOpen(true)
    walletManager.setSelectedNetwork(network)
    navigateTo.preparingNetworks(network)
  }

  const openNetworkNoticeModal = useOpenNetworkNoticeModal()
  const openNetworkNoticeModalRef = React.useRef(openNetworkNoticeModal)

  React.useEffect(() => {
    if (!hasShownNetworkNotice) {
      openNetworkNoticeModalRef.current(() => {
        setHasShownNetworkNotice(true)
      })
    }
  }, [hasShownNetworkNotice, setHasShownNetworkNotice])

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[a.flex_1, a.pt_lg]}
    >
      <FlatList
        contentContainerStyle={a.px_lg}
        data={networks}
        keyExtractor={({network}) => network}
        ItemSeparatorComponent={Hr}
        renderItem={({item: {name, network}}) => (
          <NetworkItem
            networkName={name}
            network={network}
            isSelected={selectedNetwork === network}
            onSelectNetwork={handleOnSelectNetwork}
          />
        )}
      />
    </SafeAreaView>
  )
}

const networks = freeze(
  Object.values(networkConfigs).filter(({network}) =>
    availableNetworks.includes(network),
  ),
)
