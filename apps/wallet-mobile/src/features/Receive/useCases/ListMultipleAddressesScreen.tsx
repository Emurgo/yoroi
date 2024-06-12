import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {
  InteractionManager,
  LayoutAnimation,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
  ViewToken,
} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer} from '../../../components'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {useAddressModeManager} from '../../WalletManager/common/hooks/useAddressMode'
import {useSelectedWallet} from '../../WalletManager/common/hooks/useSelectedWallet'
import {BIP32_HD_GAP_LIMIT} from '../common/contants'
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
  const inView = React.useRef(Number.MAX_SAFE_INTEGER)
  const strings = useStrings()
  const {styles} = useStyles()
  const wallet = useSelectedWallet()
  const navigate = useNavigateTo()
  const {track} = useMetrics()

  const {addressMode} = useAddressModeManager()
  const addresses = useReceiveAddressesStatus(addressMode)
  const {selectedAddressChanged} = useReceive()

  React.useEffect(() => {
    wallet.generateNewReceiveAddressIfNeeded()
  }, [wallet])

  const addressInfos = toAddressInfos(addresses)
  const hasReachedGapLimit = addresses.unused.length >= BIP32_HD_GAP_LIMIT

  const onViewableItemsChanged = React.useCallback(({viewableItems}: {viewableItems: ViewToken[]}) => {
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

  const [showAddressLimitInfo, setShowAddressLimitInfo] = React.useState(true)
  const scrollViewRef = React.useRef<ScrollView>(null)

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
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

            <Spacer height={16} />
          </>
        )}

        <ScrollView
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <Animated.FlatList
            data={addressInfos}
            keyExtractor={(addressInfo) => addressInfo.address}
            renderItem={renderAddressInfo}
            layout={Layout}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
          />
        </ScrollView>
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
          style={styles.button}
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
      flex: 1,
      backgroundColor: color.gray_cmin,
      ...atoms.pt_lg,
    },
    content: {
      flex: 1,
      ...atoms.px_lg,
    },
    footer: {
      backgroundColor: color.gray_cmin,
      borderColor: color.gray_c200,
      ...atoms.p_lg,
    },
    button: {
      backgroundColor: color.primary_c500,
    },
  })

  const colors = {
    buttonBackgroundBlue: color.primary_c600,
    learnMore: color.primary_c500,
    details: color.gray_c900,
  }

  return {styles, colors} as const
}
