import {configCardanoLegacyTransfer, linksCardanoModuleMaker} from '@yoroi/links'
import {useTheme} from '@yoroi/theme'
import * as React from 'react'
import {Keyboard, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, useWindowDimensions, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, Spacer, TextInput, useModal} from '../../../components'
import {useCopy} from '../../../legacy/useCopy'
import {useSelectedWallet} from '../../../SelectedWallet'
import {isEmptyString} from '../../../utils'
import {editedFormatter} from '../../../yoroi-wallets/utils'
import {useReceive} from '../common/ReceiveProvider'
import {ShareQRCodeCard} from '../common/ShareQRCodeCard/ShareQRCodeCard'
import {SkeletonAdressDetail} from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import {useAddressDerivationManager} from '../common/useAddressDerivationManager'
import {useStrings} from '../common/useStrings'

export const RequestSpecificAmountScreen = () => {
  const strings = useStrings()
  const {colors, styles} = useStyles()
  const [amount, setAmount] = React.useState('')
  const hasAmount = !isEmptyString(amount)

  const {selectedAddress} = useReceive()
  const {isSingle} = useAddressDerivationManager()

  const screenHeight = useWindowDimensions().height
  const modalHeight = (screenHeight / 100) * 80
  const {openModal} = useModal()
  const modalTitle = isSingle ? strings.singleAddress : strings.multipleAdress

  const generateLink = React.useCallback(() => {
    Keyboard.dismiss()

    openModal(modalTitle, <Modal amount={amount} address={selectedAddress} />, modalHeight)
  }, [openModal, modalTitle, amount, selectedAddress, modalHeight])

  const handleOnChangeAmount = (amount: string) => {
    setAmount(editedFormatter(amount))
  }

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView style={styles.root}>
          <Spacer height={24} />

          <View style={styles.content}>
            <View style={styles.screen}>
              <Text style={styles.textAddressDetails}>{strings.specificAmountDescription}</Text>

              <TextInput
                label={strings.ADALabel}
                keyboardType="numeric"
                onChangeText={handleOnChangeAmount}
                value={amount}
              />

              <View style={styles.textSection}>
                <Text style={[styles.textAddressDetails, {color: colors.gray}]}>{strings.address}</Text>

                <Text style={styles.textAddressDetails}>{selectedAddress}</Text>
              </View>
            </View>

            <Button
              shelleyTheme
              onPress={generateLink}
              disabled={!hasAmount}
              title={strings.generateLink}
              style={styles.button}
            />

            <Spacer height={24} />
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

const Modal = ({amount, address}: {amount: string; address: string}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const wallet = useSelectedWallet()
  const [isCopying, copy] = useCopy()
  const cardanoLinks = linksCardanoModuleMaker()

  const requestData = cardanoLinks.create({
    config: configCardanoLegacyTransfer,
    params: {
      address: address,
      amount: Number(amount),
    },
  })

  const hasAmount = amount.length > 0
  const content = hasAmount ? requestData.link : address
  const title = hasAmount ? `${amount} ${wallet.primaryTokenInfo.ticker?.toLocaleUpperCase()}` : ''

  const handOnCopy = () => copy(content)

  return (
    <View style={styles.root}>
      <ScrollView>
        {address.length > 0 ? (
          <ShareQRCodeCard title={title} content={content} onLongPress={handOnCopy} />
        ) : (
          <View style={styles.root}>
            <SkeletonAdressDetail />
          </View>
        )}

        <Spacer height={32} />
      </ScrollView>

      <Button
        shelleyTheme
        onPress={handOnCopy}
        disabled={amount === ''}
        title={strings.copyLinkBtn}
        iconImage={require('../../../assets/img/copy.png')}
        isCopying={isCopying}
        copiedText={strings.copyLinkMsg}
        style={styles.button}
      />

      <Spacer height={16} />
    </View>
  )
}

const useStyles = () => {
  const {theme} = useTheme()
  const {color, typography} = theme

  const styles = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: color.gray.min,
    },
    content: {
      paddingHorizontal: 16,
      flex: 1,
    },
    textAddressDetails: {
      ...typography['body-1-l-regular'],
      color: color.gray[900],
    },
    textSection: {
      gap: 4,
      width: '100%',
    },
    screen: {
      gap: 16,
      flex: 2,
    },
    button: {
      backgroundColor: color.primary[500],
    },
  })

  const colors = {
    gray: color.gray[600],
  }

  return {styles, colors} as const
}
