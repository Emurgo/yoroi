import {networkConfigs} from '@yoroi/blockchains'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Chain} from '@yoroi/types'
import {availableNetworks} from '@yoroi/wallet-manager/common/constants'
import {useAutomaticWalletOpener} from '@yoroi/wallet-manager/context/AutomaticWalletOpeningProvider'
import {useWalletManager} from '@yoroi/wallet-manager/context/WalletManagerProvider'
import {useSelectedNetwork} from '@yoroi/wallet-manager/hooks/useSelectedNetwork'

import {useFocusEffect} from '@react-navigation/native'
import {freeze} from 'immer'
import * as React from 'react'
import {FlatList} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useHasShowNetworkNotice} from '~/features/Settings/hooks/useHasShowNetworkNotice'
import {useOpenNetworkNoticeModal} from '~/features/Settings/hooks/useOpenNetworkNoticeModal'
import {Hr} from '~/ui/Hr/Hr'

import {useNavigateTo} from '../../../../hooks/useNavigateTo'
import {NetworkItem} from './NetworkItem'

export const SelectNetworkScreen = () => {
  const {atoms: ta} = useTheme()
  const {walletManager} = useWalletManager()
  const navigateTo = useNavigateTo()
  const {network: selectedNetwork} = useSelectedNetwork()
  const {setShouldOpen: setShouldAutomaticWalletOpen} =
    useAutomaticWalletOpener()
  const {hasShownNetworkNotice, setHasShownNetworkNotice} =
    useHasShowNetworkNotice()

  const handleOnSelectNetwork = (network: Chain.SupportedNetworks) => {
    setShouldAutomaticWalletOpen(true)
    walletManager.setSelectedNetwork(network)
    navigateTo.preparingNetworks(network)
  }

  const openNetworkNoticeModal = useOpenNetworkNoticeModal()
  const openNetworkNoticeModalRef = React.useRef(openNetworkNoticeModal)

  useFocusEffect(
    React.useCallback(() => {
      if (!hasShownNetworkNotice) {
        openNetworkNoticeModalRef.current(() => {
          setHasShownNetworkNotice(true)
        })
      }
    }, [hasShownNetworkNotice, setHasShownNetworkNotice]),
  )

  return (
    <SafeAreaView
      edges={['bottom', 'right', 'left']}
      style={[a.flex_1, a.pt_lg, ta.bg_color_max]}
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
