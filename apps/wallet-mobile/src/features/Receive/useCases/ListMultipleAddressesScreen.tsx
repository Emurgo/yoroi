import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {StyleSheet, Text, View, ViewToken} from 'react-native'
import Animated, {Layout} from 'react-native-reanimated'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, Spacer, useModal} from '../../../components'
import {useMetrics} from '../../../metrics/metricsManager'
import {useSelectedWallet} from '../../../SelectedWallet'
import {useStatusBar} from '../../../theme/hooks'
import {useAddressModeManager} from '../../../wallet-manager/useAddressModeManager'
import {BIP32_HD_GAP_LIMIT} from '../common/contants'
import {useReceive} from '../common/ReceiveProvider'
import {ShowAddressLimitInfo} from '../common/ShowAddressLimitInfo/ShowAddressLimitInfo'
import {SmallAddressCard} from '../common/SmallAddressCard/SmallAddressCard'
import {useMultipleAddressesInfo} from '../common/useMultipleAddressesInfo'
import {useNavigateTo} from '../common/useNavigateTo'
import {useReceiveAddressesStatus} from '../common/useReceiveAddressesStatus'
import {useStrings} from '../common/useStrings'
import {QRs} from '../illustrations/QRs'

type AddressInfo = {
  isUsed?: boolean
  address: string
}

export const ListMultipleAddressesScreen = () => {
  const inView = React.useRef(Number.MAX_SAFE_INTEGER)
  const strings = useStrings()
  const {styles} = useStyles()
  useStatusBar()
  const wallet = useSelectedWallet()
  const navigate = useNavigateTo()
  const {track} = useMetrics()

  const {addressMode} = useAddressModeManager()
  const addresses = useReceiveAddressesStatus(addressMode)
  const {selectedAddressChanged} = useReceive()

  React.useEffect(() => {
    wallet.generateNewReceiveAddressIfNeeded()
  }, [wallet])

  const {openModal} = useModal()
  const {isShowingMultipleAddressInfo} = useMultipleAddressesInfo()

  React.useEffect(() => {
    isShowingMultipleAddressInfo && openModal(strings.multiplePresentation, <Modal />, modalHeight)
  }, [isShowingMultipleAddressInfo, openModal, strings.multiplePresentation])

  const addressInfos = toAddressInfos(addresses)
  const hasReachedGapLimit = addresses.unused.length >= BIP32_HD_GAP_LIMIT

  const onViewableItemsChanged = React.useCallback(({viewableItems}: {viewableItems: ViewToken[]}) => {
    inView.current = viewableItems.length
  }, [])

  const renderAddressInfo = React.useCallback(
    ({item}: {item: AddressInfo}) => (
      <SmallAddressCard
        address={item.address}
        isUsed={item.isUsed}
        onPress={() => {
          selectedAddressChanged(item.address)
          navigate.receiveDetails()
        }}
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

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <View style={styles.content}>
        {hasReachedGapLimit && (
          <>
            <ShowAddressLimitInfo />

            <Spacer height={16} />
          </>
        )}

        <Animated.FlatList
          data={addressInfos}
          keyExtractor={(addressInfo) => addressInfo.address}
          renderItem={renderAddressInfo}
          layout={Layout}
          showsVerticalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
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
          style={styles.button}
        />
      </Animated.View>
    </SafeAreaView>
  )
}

const modalHeight = 520
const Modal = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()

  const {hideMultipleAddressesInfo} = useMultipleAddressesInfo()

  const {closeModal} = useModal()
  const handleOnCloseModal = () => {
    hideMultipleAddressesInfo()
    closeModal()
  }

  return (
    <View style={styles.modal}>
      <QRs />

      <Text style={[styles.details, {color: colors.details}]}>{strings.multiplePresentationDetails}</Text>

      <Spacer fill height={24} />

      <View style={styles.buttonContainer}>
        <Button shelleyTheme title={strings.ok} onPress={handleOnCloseModal} style={styles.button} />
      </View>

      <Spacer height={24} />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray.min,
      ...theme.padding['t-l'],
    },
    content: {
      flex: 1,
      ...theme.padding['x-l'],
    },
    modal: {
      flex: 1,
      backgroundColor: theme.color['bottom-sheet-background'],
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    footer: {
      backgroundColor: theme.color.gray.min,
      borderColor: theme.color.gray[200],
      ...theme.padding['l'],
    },
    details: {
      ...theme.typography['body-1-l-regular'],
    },
    buttonContainer: {
      alignSelf: 'stretch',
      backgroundColor: theme.color.gray.min,
    },
    button: {
      backgroundColor: theme.color.primary[500],
    },
  })

  const colors = {
    buttonBackgroundBlue: theme.color.primary[600],
    learnMore: theme.color.primary[500],
    details: theme.color.gray[900],
  }

  return {styles, colors} as const
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
