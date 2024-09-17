import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  InteractionManager,
  LayoutAnimation,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  View,
  ViewToken,
} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../components/Button/Button'
import {Space} from '../../../components/Space/Space'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {useAddressMode} from '../../WalletManager/common/hooks/useAddressMode'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {useReceive} from '../common/ReceiveProvider'
import {ShowAddressLimitInfo} from '../common/ShowAddressLimitInfo/ShowAddressLimitInfo'
import {SmallAddressCard} from '../common/SmallAddressCard/SmallAddressCard'
import {useNavigateTo} from '../common/useNavigateTo'
import {useReceiveAddressesStatus} from '../common/useReceiveAddressesStatus'
import {useStrings} from '../common/useStrings'

type AddressInfo = {
  isUsed?: boolean
  address: string
}

export const ListMultipleAddressesScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
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

  const handleOnViewableItemsChanged = React.useCallback(({viewableItems}: {viewableItems: ViewToken[]}) => {
    inView.current = viewableItems.length
  }, [])

  const renderAddressInfo = React.useCallback(
    ({item, index}: {item: AddressInfo; index: number}) => (
      <SmallAddressCard
        address={item.address}
        isUsed={item.isUsed}
        onPress={() => {
          selectedAddressChanged(item.address)
          navigate.showAddressDetails()
        }}
        testId={`receive:small-address-card-${index + 1}`} // Add index + 1 to include count
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
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        {showAddressLimitInfo && hasReachedGapLimit && (
          <>
            <ShowAddressLimitInfo />

            <Space height="lg" />
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
          styles.footer,
          {display: hasReachedGapLimit ? 'none' : 'flex', borderTopWidth: inView.current < addressInfos.length ? 1 : 0},
        ]}
        layout={Layout}
      >
        <Button
          shelleyTheme
          title={strings.generateButton}
          disabled={hasReachedGapLimit}
          onPress={handleOnGenerateNewReceiveAddress}
        />
      </Animated.View>
    </SafeAreaView>
  )
}

const toAddressInfos = (addresses: {unused: string[]; used: string[]}): AddressInfo[] => {
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

const useStyles = () => {
  const {atoms, color} = useTheme()
  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.flex_1,
      ...atoms.py_lg,
    },
    content: {
      ...atoms.flex_1,
      ...atoms.px_lg,
    },
    footer: {
      backgroundColor: color.bg_color_max,
      borderColor: color.gray_200,
      ...atoms.pt_lg,
      ...atoms.px_lg,
    },
  })

  return {styles} as const
}
