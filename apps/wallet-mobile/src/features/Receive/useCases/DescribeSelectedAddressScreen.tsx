import {useFocusEffect} from '@react-navigation/native'
import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import * as React from 'react'
import {ScrollView, StyleSheet, Text, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import Icon from '../../../assets/img/copy.png'
import {Button, Spacer, useModal} from '../../../components'
import {useStatusBar} from '../../../components/hooks/useStatusBar'
import {useCopy} from '../../../legacy/useCopy'
import {useMetrics} from '../../../metrics/metricsManager'
import {isEmptyString} from '../../../utils'
import {useAddressModeManager} from '../../../wallet-manager/useAddressModeManager'
import {AddressDetailCard} from '../common/AddressDetailCard/AddressDetailCard'
import {useReceive} from '../common/ReceiveProvider'
import {SkeletonAdressDetail} from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import {useMultipleAddressesInfo} from '../common/useMultipleAddressesInfo'
import {useNavigateTo} from '../common/useNavigateTo'
import {useReceiveAddressesStatus} from '../common/useReceiveAddressesStatus'
import {useStrings} from '../common/useStrings'
import {QRs} from '../illustrations/QRs'

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
      openModal(strings.singleOrMultiple, <Modal />, modalHeight)
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
          color: colors.buttonBackgroundBlue,
        }}
        onPress={navigate.specificAmount}
        disabled={!hasAddress}
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

const modalHeight = 520
const Modal = () => {
  const {styles, colors} = useStyles()
  const strings = useStrings()
  const {enableMultipleMode} = useAddressModeManager()

  const {hideMultipleAddressesInfo} = useMultipleAddressesInfo()

  const {closeModal} = useModal()

  const handleOnMultiple = () => {
    enableMultipleMode()
    handleOnSingle()
  }

  const handleOnSingle = () => {
    hideMultipleAddressesInfo()
    closeModal()
  }

  return (
    <View style={styles.modal}>
      <QRs />

      <Text style={[styles.details, {color: colors.details}]}>{strings.singleOrMultipleDetails}</Text>

      <Spacer fill height={24} />

      <View style={styles.buttonContainer}>
        <Button
          outline
          title={strings.selectMultiple}
          textStyles={{
            color: colors.details,
          }}
          onPress={handleOnMultiple}
        />

        <Spacer height={6} />

        <Button shelleyTheme title={strings.singleAddressWallet} onPress={handleOnSingle} style={styles.button} />
      </View>

      <Spacer height={24} />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  useStatusBar()

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: theme.color.gray.min,
      padding: 16,
    },
    modal: {
      flex: 1,
      backgroundColor: theme.color['bottom-sheet-background'],
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    buttonContainer: {
      alignSelf: 'stretch',
      backgroundColor: theme.color.gray.min,
    },
    details: {
      ...theme.typography['body-1-l-regular'],
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
    buttonBackgroundBlue: theme.color.primary[600],
    details: theme.color.gray[900],
  }

  return {styles, colors} as const
}
