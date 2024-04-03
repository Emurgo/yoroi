import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {ScrollView, StyleSheet, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import Icon from '../../../assets/img/copy.png'
import {Button, Spacer, useModal} from '../../../components'
import {useCopy} from '../../../legacy/useCopy'
import {useMetrics} from '../../../metrics/metricsManager'
import {isEmptyString} from '../../../utils'
import {useAddressModeManager} from '../../../wallet-manager/useAddressModeManager'
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
  const navigate = useNavigateTo()
  const {selectedAddress} = useReceive()
  const {isSingle, addressMode} = useAddressModeManager()
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

  React.useEffect(() => {
    isSingle &&
      isMultipleAddressesUsed &&
      isShowingMultipleAddressInfo &&
      openModal(strings.singleOrMultiple, <SingleOrMultipleAddressesModal />, singleOrMultipleAddressesModalHeight)
  }, [isShowingMultipleAddressInfo, isSingle, isMultipleAddressesUsed, openModal, strings.singleOrMultiple])

  useFocusEffect(
    React.useCallback(() => {
      track.receivePageViewed()
    }, [track]),
  )

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <ScrollView style={{flex: 1}}>
        <View style={styles.address}>
          {hasAddress ? <AddressDetailCard title={strings.addresscardTitle} /> : <SkeletonAdressDetail />}
        </View>
      </ScrollView>

      <Button
        outline
        title={strings.requestSpecificAmountButton}
        textStyles={{
          color: colors.requestSpecificAmountTextColor,
        }}
        onPress={navigate.specificAmount}
        disabled={!hasAddress}
        testID="receive:request-specific-amount-link"
      />

      <Spacer height={6} />

      <Button
        shelleyTheme
        onPress={handleOnPressCopy}
        disabled={!hasAddress}
        title={strings.copyAddressButton}
        iconImage={Icon}
        isCopying={isCopying}
        copiedText={strings.addressCopiedMsg}
        style={styles.button}
      />

      <Spacer height={6} />
    </SafeAreaView>
  )
}

const useStyles = () => {
  const {theme} = useTheme()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray.min,
      padding: 16,
    },
    address: {
      flex: 1,
      alignItems: 'center',
    },
    button: {
      backgroundColor: theme.color.primary[500],
    },
  })

  const colors = {
    requestSpecificAmountTextColor: theme.color.primary[500],
  }

  return {styles, colors} as const
}
