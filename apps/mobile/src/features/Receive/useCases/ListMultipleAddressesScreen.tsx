import {useFocusEffect} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  InteractionManager,
  LayoutAnimation,
  NativeScrollEvent,
  NativeSyntheticEvent,
  View,
  ViewToken,
} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {useAddressMode} from '~/features/WalletManager/hooks/useAddressMode'
import {useSelectedWallet} from '~/features/WalletManager/hooks/useSelectedWallet'
import {useStrings} from '~/kernel/i18n/useStrings'
import {useMetrics} from '~/kernel/metrics/metricsManager'
import {Button} from '~/ui/Button/Button'
import {ShowAddressLimitInfo} from '~/ui/ShowAddressLimitInfo/ShowAddressLimitInfo'
import {SmallAddressCard} from '~/ui/SmallAddressCard/SmallAddressCard'
import {Space} from '~/ui/Space/Space'
import {useReceive} from '../common/ReceiveProvider'
import {useNavigateTo} from '../common/useNavigateTo'
import {useReceiveAddressesStatus} from '../common/useReceiveAddressesStatus'

type AddressInfo = {
  isUsed?: boolean
  address: string
}

export const ListMultipleAddressesScreen = () => {
  const strings = useStrings()
  const {palette: p, atoms: ta} = useTheme()
  const navigate = useNavigateTo()
  const {track} = useMetrics()
  const {wallet} = useSelectedWallet()
  const inView = React.useRef(Number.MAX_SAFE_INTEGER)

  const {selectedAddressChanged} = useReceive()
  const {addressMode} = useAddressMode()
  const addresses = useReceiveAddressesStatus(addressMode)
  const [showAddressLimitInfo, setShowAddressLimitInfo] = React.useState(true)

  const addressInfos = toAddressInfos(addresses)
  const hasReachedGapLimit = !addresses.canIncrease

  const handleOnViewableItemsChanged = React.useCallback(
    ({viewableItems}: {viewableItems: ViewToken[]}) => {
      inView.current = viewableItems.length
    },
    [],
  )

  const renderAddressInfo = React.useCallback(
    ({item, index}: {item: AddressInfo; index: number}) => (
      <SmallAddressCard
        address={item.address}
        isUsed={item.isUsed}
        onPress={() => {
          selectedAddressChanged(item.address)
          navigate.showAddressDetails()
        }}
        testID={`receive:small-address-card-${index + 1}`} // Add index + 1 to include count
        // date={}  // TODO define with project
      />
    ),
    [navigate, selectedAddressChanged],
  )

  const handleOnGenerateNewReceiveAddress = () => {
    track.receiveGenerateNewAddressClicked()
    wallet.generateNewReceiveAddress()
  }

  useFocusEffect(
    React.useCallback(() => {
      track.receivePageListViewed()
    }, [track]),
  )

  const handleOnScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (event.nativeEvent.contentOffset.y <= 0) {
      InteractionManager.runAfterInteractions(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setShowAddressLimitInfo(true)
      })
    } else if (showAddressLimitInfo && event.nativeEvent.contentOffset.y > 0) {
      setShowAddressLimitInfo(false)
    }
  }
  React.useEffect(() => {
    if (hasReachedGapLimit) {
      InteractionManager.runAfterInteractions(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)
        setShowAddressLimitInfo(true)
      })
    }
  }, [hasReachedGapLimit])

  return (
    <SafeAreaView
      style={[a.flex_1, a.py_lg, ta.bg_color_max]}
      edges={['left', 'right', 'bottom']}
    >
      <View style={[a.flex_1, a.px_lg]}>
        {showAddressLimitInfo && hasReachedGapLimit && (
          <>
            <ShowAddressLimitInfo />

            <Space.Height.lg />
          </>
        )}

        <Animated.FlatList
          onScroll={handleOnScroll}
          scrollEventThrottle={16}
          data={addressInfos}
          keyExtractor={(addressInfo) => addressInfo.address}
          renderItem={renderAddressInfo}
          layout={Layout}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={handleOnViewableItemsChanged}
        />
      </View>

      <Animated.View
        style={[
          a.pt_lg,
          a.px_lg,
          ta.bg_color_max,
          {borderColor: p.gray_200},
          {
            display: hasReachedGapLimit ? 'none' : 'flex',
            borderTopWidth: inView.current < addressInfos.length ? 1 : 0,
          },
        ]}
        layout={Layout}
      >
        <Button
          title={strings.receive.generateButton}
          disabled={hasReachedGapLimit}
          onPress={handleOnGenerateNewReceiveAddress}
        />
      </Animated.View>
    </SafeAreaView>
  )
}

const toAddressInfos = (addresses: {
  unused: string[]
  used: string[]
}): AddressInfo[] => {
  const unusedAddresses = addresses.unused.map((address) => ({
    address,
    isUsed: false,
  }))

  const usedAddresses = addresses.used.map((address) => ({
    address,
    isUsed: true,
  }))

  return [...unusedAddresses, ...usedAddresses]
}
