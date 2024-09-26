import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {GestureResponderEvent, ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, ButtonType} from '../../../components/Button/NewButton'
import {useCopy} from '../../../components/Clipboard/ClipboardProvider'
import {Icon} from '../../../components/Icon'
import {useModal} from '../../../components/Modal/ModalContext'
import {useMetrics} from '../../../kernel/metrics/metricsManager'
import {isEmptyString} from '../../../kernel/utils'
import {useAddressMode} from '../../WalletManager/common/hooks/useAddressMode'
import {AddressDetailCard} from '../common/AddressDetailCard/AddressDetailCard'
import {useReceive} from '../common/ReceiveProvider'
import {
  SingleOrMultipleAddressesModal,
  singleOrMultipleAddressesModalHeight,
} from '../common/SingleOrMultipleAddressesModal/SingleOrMultipleAddressesModal'
import {SkeletonAdressDetail} from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import {useMultipleAddressesInfo} from '../common/useMultipleAddressesInfo'
import {useNavigateTo} from '../common/useNavigateTo'
import {useReceiveAddressesStatus} from '../common/useReceiveAddressesStatus'
import {useStrings} from '../common/useStrings'

export const DescribeSelectedAddressScreen = () => {
  const strings = useStrings()
  const {styles} = useStyles()
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
      openModal(
        strings.singleOrMultiple,
        <SingleOrMultipleAddressesModal onConfirm={handleOnModalConfirm} />,
        singleOrMultipleAddressesModalHeight,
      )
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
    <SafeAreaView style={[styles.root, styles.flex]} edges={['left', 'right', 'bottom']}>
      <ScrollView style={styles.flex}>
        <View style={[styles.address, styles.flex]}>
          {hasAddress ? <AddressDetailCard title={strings.addresscardTitle} /> : <SkeletonAdressDetail />}
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

        <Button onPress={onCopy} disabled={!hasAddress} title={strings.copyAddressButton} icon={Icon.Copy} />
      </View>
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {color, atoms} = useTheme()

  const styles = StyleSheet.create({
    root: {
      backgroundColor: color.bg_color_max,
      ...atoms.p_lg,
    },
    flex: {
      ...atoms.flex_1,
    },
    address: {
      ...atoms.align_center,
    },
    actions: {
      ...atoms.flex_col,
      ...atoms.gap_sm,
    },
  })

  const colors = {
    requestSpecificAmountTextColor: color.text_primary_medium,
  }

  return {styles, colors} as const
}
