import {useTheme} from '@yoroi/theme'
import _ from 'lodash'
import * as React from 'react'
import {Keyboard, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, useWindowDimensions, View} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'

import {Button, KeyboardAvoidingView, Spacer, TextInput, useModal} from '../../../components'
import {useCopy} from '../../../legacy/useCopy'
import {useSelectedWallet} from '../../../SelectedWallet'
import {useReceiveAddresses} from '../../../yoroi-wallets/hooks'
import {mocks} from '../common/mocks'
import {ShareQRCodeCard} from '../common/ShareQRCodeCard/ShareQRCodeCard'
import {SkeletonAdressDetail} from '../common/SkeletonAddressDetail/SkeletonAddressDetail'
import {useStrings} from '../common/useStrings'

export const EnterAmountScreen = () => {
  const strings = useStrings()
  const wallet = useSelectedWallet()
  const receiveAddresses = useReceiveAddresses(wallet)

  const HEIGHT_SCREEN = useWindowDimensions().height
  const HEIGHT_MODAL = (HEIGHT_SCREEN / 100) * 80

  const [amount, setAmount] = React.useState<string>('')

  const {openModal} = useModal()

  const {colors, styles} = useStyles()

  const currentAddress = _.last(receiveAddresses)

  const generateLink = React.useCallback(() => {
    Keyboard.dismiss()

    openModal(strings.multipleAdress, <Modal amount={amount} />, HEIGHT_MODAL)
  }, [HEIGHT_MODAL, amount, openModal, strings.multipleAdress])

  return (
    <SafeAreaView style={styles.root} edges={['left', 'right', 'bottom']}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAvoidingView style={styles.root}>
          <Spacer height={24} />

          <View style={styles.content}>
            <View style={styles.screen}>
              <Text style={styles.textAddressDetails}>{strings.specificAmountDescription}</Text>

              <TextInput label={strings.ADALabel} keyboardType="number-pad" onChangeText={setAmount} maxLength={4} />

              <View style={styles.textSection}>
                <Text style={[styles.textAddressDetails, {color: colors.gray}]}>{strings.address}</Text>

                <Text style={styles.textAddressDetails}>{currentAddress}</Text>
              </View>
            </View>

            <Button
              shelleyTheme
              onPress={generateLink}
              disabled={amount === ''}
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

const Modal = ({amount}: {amount: string}) => {
  const strings = useStrings()
  const {styles} = useStyles()
  const wallet = useSelectedWallet()
  const [isCopying, copy] = useCopy()

  return (
    <View style={styles.root}>
      <ScrollView>
        {mocks.specificAddressAmount !== null ? (
          <ShareQRCodeCard
            title={`${amount} ${wallet.primaryTokenInfo.ticker?.toUpperCase()}`}
            address={mocks.specificAddressAmount}
            onLongPress={() => copy(mocks.specificAddressAmount)}
          />
        ) : (
          <View style={styles.root}>
            <SkeletonAdressDetail />
          </View>
        )}

        <Spacer height={32} />
      </ScrollView>

      <Button
        shelleyTheme
        onPress={() => {
          copy(mocks.specificAddressAmount)
        }}
        disabled={amount === '' ? true : false}
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