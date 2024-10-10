import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import {Wallet} from '@yoroi/types'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import Icon from '../../../assets/img/copy.png'
import {Button} from '../../../components/Button/Button'
import {useModal} from '../../../components/Modal/ModalContext'
import {useCopy} from '../../../hooks/useCopy'
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
  const {styles, colors} = useStyles()
  const navigateTo = useNavigateTo()
  const {selectedAddress} = useReceive()
  const {isSingle, addressMode} = useAddressMode()
  const addresses = useReceiveAddressesStatus(addressMode)
  const isMultipleAddressesUsed = addresses.used.length > 1
  const {isShowingMultipleAddressInfo} = useMultipleAddressesInfo()
  const {openModal} = useModal()

  const {track} = useMetrics()

  const [isCopying, copy] = useCopy()
  const hasAddress = !isEmptyString(selectedAddress)

  const handleOnPressCopy = () => {
    track.receiveCopyAddressClicked({copy_address_location: 'CTA Copy Address'})
    copy(selectedAddress)
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

      <Button
        withoutBackground
        title={strings.requestSpecificAmountButton}
        textStyles={{
          color: colors.requestSpecificAmountTextColor,
        }}
        onPress={navigateTo.requestSpecificAmount}
        disabled={!hasAddress}
        testID="receive:request-specific-amount-link"
      />

      <Button
        shelleyTheme
        onPress={handleOnPressCopy}
        disabled={!hasAddress}
        title={strings.copyAddressButton}
        iconImage={Icon}
        isCopying={isCopying}
        copiedText={strings.addressCopiedMsg}
      />
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
  })

  const colors = {
    requestSpecificAmountTextColor: color.text_primary_medium,
  }

  return {styles, colors} as const
}
