import {useFocusEffect} from '@react-navigation/native'
import {atoms as a, useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {GestureResponderEvent, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button} from '../../../ui/Button/Button'
import {useCopy} from '../../../kernel/utils/clipboard'
import {Icon} from '../../../ui/Icon'
import {useModal} from '../../../ui/Modal/ModalContext'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {isEmptyString} from '../../../kernel/utils'
import {useAddressMode} from '../../WalletManager/common/hooks/useAddressMode'
import {AddressDetailCard} from '../../../ui/AddressDetailCard/AddressDetailCard'
import {useReceive} from '../common/ReceiveProvider'
import {
  SingleOrMultipleAddressesModal,
  singleOrMultipleAddressesModalHeight,
} from '../../../ui/SingleOrMultipleAddressesModal/SingleOrMultipleAddressesModal'
import {SkeletonAdressDetail} from '../../../ui/SkeletonAddressDetail/SkeletonAddressDetail'
import {useMultipleAddressesInfo} from '../common/useMultipleAddressesInfo'
import {useNavigateTo} from '../common/useNavigateTo'
import {useReceiveAddressesStatus} from '../common/useReceiveAddressesStatus'
import {useStrings} from '../common/useStrings'

export const DescribeSelectedAddressScreen = () => {
  const strings = useStrings()
  const {color} = useTheme()
  const navigateTo = useNavigateTo()
  const {selectedAddress} = useReceive()
  const {isSingle, addressMode} = useAddressMode()
  const addresses = useReceiveAddressesStatus(addressMode)
  const isMultipleAddressesUsed = addresses.used.length > 1
  const {isShowingMultipleAddressInfo} = useMultipleAddressesInfo()
  const {openModal} = useModal()

  const {track} = useMetrics()

  const {copy} = useCopy()
  const hasAddress = !isEmptyString(selectedAddress)

  const onCopy = (event: GestureResponderEvent) => {
    track.receiveCopyAddressClicked({copy_address_location: 'CTA Copy Address'})
    copy({text: selectedAddress, feedback: strings.addressCopiedMsg, event})
  }

  const handleOnModalConfirm = React.useCallback(
    (method: Wallet.AddressMode) => {
      if (method === 'multiple') {
        navigateTo.multipleAddress()
      }
    },
    [navigateTo],
  )
  React.useEffect(() => {
    isShowingMultipleAddressInfo &&
      openModal({
        title: strings.singleOrMultiple,
        content: (
          <SingleOrMultipleAddressesModal onConfirm={handleOnModalConfirm} />
        ),
        height: singleOrMultipleAddressesModalHeight,
      })
  }, [
    isShowingMultipleAddressInfo,
    isSingle,
    isMultipleAddressesUsed,
    openModal,
    strings.singleOrMultiple,
    handleOnModalConfirm,
  ])

  useFocusEffect(
    React.useCallback(() => {
      track.receivePageViewed()
    }, [track]),
  )

  return (
    <SafeAreaView
      style={[styles.root, styles.flex, {backgroundColor: color.bg_color_max}]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView style={styles.flex}>
        <View style={[styles.address, styles.flex]}>
          {hasAddress ? (
            <AddressDetailCard title={strings.addresscardTitle} />
          ) : (
            <SkeletonAdressDetail />
          )}
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <Button
          type={ButtonType.Text}
          title={strings.requestSpecificAmountButton}
          onPress={navigateTo.requestSpecificAmount}
          disabled={!hasAddress}
          testID="receive:request-specific-amount-link"
        />

        <Button
          onPress={onCopy}
          disabled={!hasAddress}
          title={strings.copyAddressButton}
          icon={Icon.Copy}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    ...a.p_lg,
  },
  flex: {
    ...a.flex_1,
  },
  address: {
    ...a.align_center,
  },
  actions: {
    ...a.flex_col,
    ...a.gap_sm,
  },
})